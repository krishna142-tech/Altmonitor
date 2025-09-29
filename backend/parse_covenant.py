import re
import os
import json
from urllib import request as urlrequest
from urllib.error import URLError, HTTPError
from datetime import datetime
from typing import List, Tuple, Dict, Optional
import logging

try:
    import pdfplumber  # type: ignore
except Exception:  # pragma: no cover
    pdfplumber = None

try:
    import PyPDF2  # type: ignore
except Exception:  # pragma: no cover
    PyPDF2 = None

# OCR fallback
try:
    from pdf2image import convert_from_path  # type: ignore
    import pytesseract  # type: ignore
except Exception:  # pragma: no cover
    convert_from_path = None
    pytesseract = None


def extract_pages_from_pdf(path: str) -> List[Tuple[int, str]]:
    # 1) Try native text extraction
    if pdfplumber is not None:
        with pdfplumber.open(path) as pdf:
            pages = []
            for idx, page in enumerate(pdf.pages):
                pages.append((idx + 1, page.extract_text() or ""))
            if any(t.strip() for _, t in pages):
                return pages
    if PyPDF2 is not None:
        with open(path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            pages = []
            for idx, page in enumerate(reader.pages):
                pages.append((idx + 1, page.extract_text() or ""))
            if any(t.strip() for _, t in pages):
                return pages
    # 2) OCR fallback for scanned PDFs
    if convert_from_path is not None and pytesseract is not None:
        try:
            images = convert_from_path(path)
            pages = []
            for idx, image in enumerate(images):
                pages.append((idx + 1, pytesseract.image_to_string(image)))
            if any(t.strip() for _, t in pages):
                return pages
        except Exception:
            pass
    raise RuntimeError("No text could be extracted. Install pdfplumber/PyPDF2 or OCR (pdf2image+pytesseract).")


def parse_calc_date(text: str):
    # Try formats like 31-12-2025, 31/12/2025, 31 Dec 2025
    patterns = [
        (r"(\b\d{2}-\d{2}-\d{4}\b)", "%d-%m-%Y"),
        (r"(\b\d{2}/\d{2}/\d{4}\b)", "%d/%m/%Y"),
        (r"(\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b)", "%d %B %Y"),
    ]
    for pattern, fmt in patterns:
        m = re.search(pattern, text)
        if m:
            s = m.group(1)
            try:
                return datetime.strptime(s, fmt).date()
            except Exception:
                # Try abbreviated month name
                if "%B" in fmt:
                    try:
                        return datetime.strptime(s, "%d %b %Y").date()
                    except Exception:
                        pass
    return None


def parse_key_value_pairs(text: str):
    # Capture pairs like "Senior Net Debt: 123" or "EBITDA 45.6" or "Ratio 2.00x"
    pairs = {}
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for line in lines:
        # key: value
        m = re.match(r"^([A-Za-z][A-Za-z0-9 \-/()]+)\s*[:\-]\s*([0-9.,xX%]+)", line)
        if m:
            key = m.group(1).strip()
            val = m.group(2).strip()
            pairs[key] = val
            continue
        # key value
        m2 = re.match(r"^([A-Za-z][A-Za-z0-9 \-/()]+)\s+([0-9][0-9.,xX%]*)$", line)
        if m2:
            key = m2.group(1).strip()
            val = m2.group(2).strip()
            pairs[key] = val
    return pairs


def parse_we_confirm_section(text: str) -> dict:
    # Find section starting with "We confirm that:"
    section_match = re.search(r"We\s+confirm\s+that\s*:\s*(.+?)(?:\n\s*Schedule\s*2|\Z)", text, re.IGNORECASE | re.DOTALL)
    if not section_match:
        return {}
    section = section_match.group(1)
    return parse_key_value_pairs(section)


def _extract_number_pair(s: str) -> Tuple[Optional[float], Optional[float]]:
    # Extract patterns like "981,775 / 900,000" or "981,775/900,000"
    m = re.search(r"([0-9][0-9,]*\.?[0-9]*)\s*/\s*([0-9][0-9,]*\.?[0-9]*)", s)
    if not m:
        return None, None
    def conv(x: str) -> Optional[float]:
        try:
            return float(x.replace(",", ""))
        except Exception:
            return None
    return conv(m.group(1)), conv(m.group(2))


def parse_schedule_2(text: str) -> dict:
    sched_match = re.search(r"Schedule\s*2(.*?)(?:Schedule\s*3|\Z)", text, re.IGNORECASE | re.DOTALL)
    if not sched_match:
        return {}
    section = sched_match.group(1)
    values = parse_key_value_pairs(section)
    # Try to extract actual/projected pairs from lines themselves
    pairs: Dict[str, Dict[str, Optional[float]]] = {}
    pair_targets = {
        "Senior Net Debt": r"senior\s+net\s+debt[^\n]*",
        "EBITDA for Test Period": r"ebitda\s+for\s+test\s+period[^\n]*|\bebitda\b[^\n]*",
        "Cash Flow": r"cash\s*flow[^\n]*",
        "Debt Service": r"debt\s*service[^\n]*",
        "Net Interest Payable": r"net\s*interest[^\n]*",
    }
    for key, pat in pair_targets.items():
        m = re.search(pat, section, re.IGNORECASE)
        if m:
            line = m.group(0)
            a, b = _extract_number_pair(line)
            if a is not None or b is not None:
                pairs[key] = {"actual": a, "projected": b}

    # Also try to extract lock-up thresholds near ratio names
    threshold_map: Dict[str, str] = {}
    lines = [l.strip() for l in section.splitlines() if l.strip()]
    for i, line in enumerate(lines):
        # e.g., "Senior Net Debt to EBITDA ... Threshold 6.50" or "Lock-up Threshold: 1.10"
        if re.search(r"net\s*debt.*ebitda", line, re.IGNORECASE):
            m = re.search(r"(lock[- ]?up\s*)?threshold\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)", line, re.IGNORECASE)
            if m:
                threshold_map["Senior Net Debt to EBITDA"] = m.group(2)
        if re.search(r"cash\s*flow.*dscr|debt\s*service\s*coverage", line, re.IGNORECASE):
            m = re.search(r"(lock[- ]?up\s*)?threshold\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)", line, re.IGNORECASE)
            if m:
                threshold_map["Senior Cashflow DSCR"] = m.group(2)
        if re.search(r"interest\s*cover|\bicr\b", line, re.IGNORECASE):
            m = re.search(r"(lock[- ]?up\s*)?threshold\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)", line, re.IGNORECASE)
            if m:
                threshold_map["Senior Cashflow ICR"] = m.group(2)
    if threshold_map:
        values["__thresholds__"] = threshold_map
    if pairs:
        values["__pairs__"] = pairs
    return values


def normalize_number(s: str):
    if s is None:
        return None
    s = s.replace(",", "").replace("x", "").replace("X", "").strip()
    try:
        return float(s)
    except Exception:
        return None


def compute_compliance(rows):
    # Apply sample logic rules to rows in-place
    for row in rows:
        name = (row.get("covenant_name") or "").lower()
        threshold = normalize_number(row.get("threshold"))
        borrower_ratio = normalize_number(row.get("borrower_calc"))
        compliance = "Unknown"
        consequence = row.get("consequence")

        if "senior net debt" in name and "ebitda" in name:
            if threshold is not None and borrower_ratio is not None:
                compliance = "Event of Default" if borrower_ratio > threshold else "Compliant"
        elif "dscr" in name or "debt service" in name:
            # If < threshold -> EoD
            if threshold is not None and borrower_ratio is not None:
                compliance = "Event of Default" if borrower_ratio < threshold else "Compliant"
        elif "interest cover" in name or "icr" in name:
            if borrower_ratio is not None:
                compliance = "Event of Default" if borrower_ratio < 2.0 else "Compliant"

        row["compliance_check"] = row.get("compliance_check") or compliance
        if not consequence and compliance == "Event of Default":
            row["consequence"] = "Event of Default"


def extract_text_from_pdf(path: str) -> str:
    pages = extract_pages_from_pdf(path)
    return "\n".join(t for _, t in pages)


def parse_borrower_lender(text: str) -> Tuple[str, str]:
    borrower = ""
    lender = ""
    # Borrower/Issuer
    m = re.search(r"\b(Borrower|Issuer|Company)\s*[:\-]\s*([A-Za-z0-9 .,&()'-]+)", text, re.IGNORECASE)
    if m:
        borrower = m.group(2).strip()
    # Lender/Facility Agent
    m2 = re.search(r"\b(Lender|Bank|Facility Agent)\s*[:\-]\s*([A-Za-z0-9 .,&()'-]+)", text, re.IGNORECASE)
    if m2:
        lender = m2.group(2).strip()
    return borrower, lender


def parse_threshold_near(name: str, context: str) -> str:
    # Look for numbers like 2.0, 1.25x, 2x, 75%, <= 2.0 etc.
    patterns = [
        r"\b(?:not to exceed|shall not exceed|<=|less than|below|cap[:\-]?)\s*([0-9]+(?:\.[0-9]+)?x?)",
        r"\bthreshold\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?x?)",
        r"\b([0-9]+(?:\.[0-9]+)?x?)\b",
        r"\b([0-9]+(?:\.[0-9]+)?%)\b",
    ]
    # Narrow context to few lines around the name
    lines = context.splitlines()
    window = []
    for i, line in enumerate(lines):
        if name.lower() in line.lower():
            start = max(0, i - 3)
            end = min(len(lines), i + 4)
            window = lines[start:end]
            break
    for pat in patterns:
        for w in window or lines[:10]:
            m = re.search(pat, w, re.IGNORECASE)
            if m:
                return m.group(1).strip()
    return ""


def parse_compliance_text(context: str) -> str:
    # Detect compliance phrases
    if re.search(r"in\s+compliance|compliant|meets\s+requirement|satisfied", context, re.IGNORECASE):
        return "Yes"
    if re.search(r"not\s+in\s+compliance|non-?compliant|breach|event\s+of\s+default|failed", context, re.IGNORECASE):
        return "No"
    return ""


def parse_consequence_text(context: str) -> str:
    m = re.search(r"(Event of Default|Lock[- ]?Up|Breach|Penalty|Waiver required)[^\n]*", context, re.IGNORECASE)
    return m.group(0).strip() if m else ""


def parse_compliance_certificate(pdf_path: str):
    pages = extract_pages_from_pdf(pdf_path)
    text = "\n".join(t for _, t in pages)
    calc_date = parse_calc_date(text)
    we_confirm = parse_we_confirm_section(text)
    schedule2 = parse_schedule_2(text)
    # Optional: try to refine Schedule 2 numerators/denominators using Camelot if available
    try:
        import camelot  # type: ignore
        tables = camelot.read_pdf(pdf_path, pages="all")
        # Attempt to find rows of interest and extract pairs A/B
        interest_keys = [
            ("Senior Net Debt", ["senior", "net", "debt"]),
            ("EBITDA for Test Period", ["ebitda", "test", "period"]),
            ("Cash Flow", ["cash", "flow"]),
            ("Debt Service", ["debt", "service"]),
            ("Net Interest Payable", ["net", "interest"]),
        ]
        for t in tables:
            try:
                df = t.df
            except Exception:
                continue
            for _, row in df.iterrows():
                line = " ".join([str(x) for x in row.tolist() if str(x).strip()])
                low = line.lower()
                for key, tokens in interest_keys:
                    if all(tok in low for tok in tokens):
                        a, b = _extract_number_pair(line)
                        if a is not None or b is not None:
                            schedule2.setdefault("__pairs__", {})
                            schedule2["__pairs__"][key] = {"actual": a, "projected": b}
    except Exception:
        # Camelot not available or PDF structure incompatible; ignore
        pass
    borrower, lender = parse_borrower_lender(text)

    # Build rows combining keys that likely represent covenants
    covenant_rows = []
    # Map borrower ratios from multiple possible labels (Historic/Projected aliases)
    def first_present(d: dict, keys: List[str]) -> Optional[str]:
        for k in keys:
            if d.get(k) is not None:
                return d.get(k)
        return None

    borrowers = {
        "Senior Net Debt to EBITDA": first_present(we_confirm, [
            "Senior Net Debt to EBITDA",
            "Historic Net Debt to EBITDA",
            "Projected Net Debt to EBITDA",
        ]),
        "Senior Cashflow DSCR": first_present(we_confirm, [
            "Senior Cashflow DSCR",
            "Historic Cashflow DSCR",
            "Projected Cashflow DSCR",
        ]),
        "Senior Cashflow ICR": first_present(we_confirm, [
            "Senior Cashflow ICR",
            "Historic Cashflow ICR",
            "Projected Cashflow ICR",
            "Senior Cashflow Interest Cover Ratio",
            "Historic Cashflow Interest Cover Ratio",
            "Projected Cashflow Interest Cover Ratio",
        ]),
    }

    # thresholds from the text if present (look for nearby 'threshold' words)
    # As a simple heuristic, use the same value where only one number found; these can be edited manually later.
    thresholds = schedule2.get("__thresholds__", {}) if isinstance(schedule2, dict) else {}
    # Extract base numerics (actuals) from Schedule 2 for lender recompute
    pairs = schedule2.get("__pairs__", {}) if isinstance(schedule2, dict) else {}
    net_debt = pairs.get("Senior Net Debt", {}).get("actual") if isinstance(pairs, dict) else None
    ebitda = pairs.get("EBITDA for Test Period", {}).get("actual") if isinstance(pairs, dict) else None
    cash_flow = pairs.get("Cash Flow", {}).get("actual") if isinstance(pairs, dict) else None
    debt_service = pairs.get("Debt Service", {}).get("actual") if isinstance(pairs, dict) else None
    net_interest = pairs.get("Net Interest Payable", {}).get("actual") if isinstance(pairs, dict) else None

    filename = pdf_path.split("/")[-1].split("\\")[-1]

    for name, val in borrowers.items():
        if val is None:
            # try compute from components
            if name == "Senior Net Debt to EBITDA" and net_debt is not None and ebitda is not None and ebitda != 0:
                val = f"{net_debt / ebitda:.2f}x"
            elif name == "Senior Cashflow DSCR" and cash_flow is not None and debt_service is not None and debt_service != 0:
                val = f"{cash_flow / debt_service:.2f}x"
            elif name == "Senior Cashflow ICR" and cash_flow is not None and net_interest is not None and net_interest != 0:
                val = f"{cash_flow / net_interest:.2f}x"

        borrower_ratio = val
        borrower_ratio_num = normalize_number(borrower_ratio) if borrower_ratio is not None else None

        # lender recompute
        lender_ratio_num: Optional[float] = None
        if name == "Senior Net Debt to EBITDA" and net_debt is not None and ebitda is not None and ebitda != 0:
            lender_ratio_num = round(net_debt / ebitda, 2)
        elif name == "Senior Cashflow DSCR" and cash_flow is not None and debt_service is not None and debt_service != 0:
            lender_ratio_num = round(cash_flow / debt_service, 2)
        elif name == "Senior Cashflow ICR" and cash_flow is not None and net_interest is not None and net_interest != 0:
            lender_ratio_num = round(cash_flow / net_interest, 2)

        threshold_val = thresholds.get(name) if isinstance(thresholds, dict) else None
        threshold_num = normalize_number(threshold_val)

        compliance: Optional[str] = None
        consequence: Optional[str] = None
        if threshold_num is not None and borrower_ratio_num is not None:
            if name == "Senior Net Debt to EBITDA":
                compliant = borrower_ratio_num <= threshold_num
            else:
                compliant = borrower_ratio_num >= threshold_num
            compliance = "Compliant" if compliant else "Breach"
            consequence = None if compliant else ("Lock-up Breach" if re.search(r"lock[- ]?up", text, re.IGNORECASE) else "Event of Default")

        row = {
            "calc_date": calc_date.isoformat() if calc_date else None,
            "covenant_name": name,
            "threshold": threshold_val,
            "borrower_calc": borrower_ratio if borrower_ratio is not None else None,
            "lender_calc": (f"{lender_ratio_num:.2f}" if isinstance(lender_ratio_num, float) else None),
            "consequence": consequence,
            "compliance_check": compliance,
            "comment": None,
            "source_file": filename,
            "reference_file": None,
        }
        covenant_rows.append(row)

    # Also add base metrics from schedule 2 if available
    base_metrics = [
        "Senior Net Debt",
        "EBITDA",
        "Cash Flow",
        "Debt Service",
        "Net Interest Payable",
    ]
    for metric in base_metrics:
        val = schedule2.get(metric)
        if val is not None:
            covenant_rows.append({
                "calc_date": calc_date.isoformat() if calc_date else None,
                "covenant_name": metric,
                "threshold": None,
                "borrower_calc": val,
                "lender_calc": None,
                "consequence": None,
                "compliance_check": None,
                "comment": None,
                "source_file": None,
                "reference_file": None,
            })

    # Compute compliance for known ratio rows
    compute_compliance(covenant_rows)

    # Fallback: if nothing parsed, return placeholder rows for manual entry
    if not covenant_rows:
        placeholder_names = [
            "Senior Net Debt to EBITDA",
            "Senior Cashflow DSCR",
            "Senior Cashflow Interest Cover Ratio",
        ]
        for name in placeholder_names:
            covenant_rows.append({
                "calc_date": calc_date.isoformat() if calc_date else None,
                "covenant_name": name,
                "threshold": None,
                "borrower_calc": None,
                "lender_calc": None,
                "consequence": None,
                "compliance_check": None,
                "comment": None,
                "source_file": None,
                "reference_file": None,
            })

    # Also produce normalized API items for the new JSON shape with references
    items = []
    covenants_json = []
    filename = pdf_path.split("/")[-1].split("\\")[-1]
    for r in covenant_rows:
        name = r.get("covenant_name") or ""
        # find page reference and enrich fields around first match
        page_ref = ""
        thresh = r.get("threshold") or ""
        compliance = r.get("compliance_check") or ""
        consequence = r.get("consequence") or ""
        for pg, pg_text in pages:
            if name and name.lower() in pg_text.lower():
                page_ref = f"Page {pg}"
                if not thresh:
                    thresh = parse_threshold_near(name, pg_text)
                if not compliance:
                    compliance = parse_compliance_text(pg_text)
                if not consequence:
                    consequence = parse_consequence_text(pg_text)
                break
        items.append({
            "name": name,
            "threshold": thresh,
            "consequence": consequence,
            "borrower": borrower,
            "lender": lender,
            "compliance": compliance,
            "documentSource": filename,
            "reference": page_ref or "",
        })

        # Build covenants schema entry if this is one of the three target ratios
        if name in ("Senior Net Debt to EBITDA", "Senior Cashflow DSCR", "Senior Cashflow ICR"):
            # Determine numerator/denominator from pairs
            num = None
            den = None
            if name == "Senior Net Debt to EBITDA":
                num = net_debt
                den = ebitda
            elif name == "Senior Cashflow DSCR":
                num = cash_flow
                den = debt_service
            elif name == "Senior Cashflow ICR":
                num = cash_flow
                den = net_interest

            covenants_json.append({
                "name": name,
                "ratio": normalize_number(r.get("borrower_calc")) if r.get("borrower_calc") else None,
                "numerator": num,
                "denominator": den,
                "threshold": normalize_number(thresh) if thresh else None,
                "consequence": consequence,
                "compliance": r.get("compliance_check") or compliance,
                "sourceFile": filename,
            })

    # AI fallback: if key ratios missing, query LLM to extract
    def needs_ai(covs):
        # Use Gemini as the primary extractor: always attempt AI
        return True

    if needs_ai(covenants_json):
        # Prefer Gemini (Google Generative Language API) if available
        google_key = os.getenv("GOOGLE_API_KEY")
        if google_key:
            try:
                schema_example = {"covenants":[{"name":"string","ratio":0.0,"numerator":0.0,"denominator":0.0,"threshold":0.0,"consequence":"string","compliance":"string","sourceFile":"string"}]}
                schema_str = json.dumps(schema_example)
                prompt = (
                    "Extract covenant ratios (Net Debt to EBITDA, Cashflow DSCR, Cashflow ICR), their numerators and denominators, thresholds, and compliance status from this Compliance Certificate. "
                    f"Return ONLY JSON with schema {schema_str} .\n\n"
                    f"PDF Text:\n{text[:15000]}"
                )
                body = json.dumps({
                    "contents": [
                        {"role": "user", "parts": [{"text": prompt}]}
                    ]
                }).encode("utf-8")
                req = urlrequest.Request(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={google_key}",
                    data=body,
                    headers={
                        "Content-Type": "application/json",
                    },
                )
                with urlrequest.urlopen(req, timeout=30) as resp:
                    payload = json.loads(resp.read().decode("utf-8"))
                    text_parts = (
                        payload.get("candidates", [{}])[0]
                        .get("content", {})
                        .get("parts", [{}])
                    )
                    content_text = "\n".join([p.get("text", "") for p in text_parts])
                    if content_text:
                        # Some models return markdown fencing; strip if present
                        cleaned = content_text.strip()
                        if cleaned.startswith("```"):
                            cleaned = cleaned.strip("`\n ")
                        ai_obj = json.loads(cleaned)
                        ai_covs = ai_obj.get("covenants")
                        if isinstance(ai_covs, list) and ai_covs:
                            covenants_json = ai_covs
            except (URLError, HTTPError, json.JSONDecodeError, Exception):
                pass
        # Fallback to OpenAI if configured
        if not covenants_json:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                try:
                    schema_example = {"covenants":[{"name":"string","ratio":0.0,"numerator":0.0,"denominator":0.0,"threshold":0.0,"consequence":"string","compliance":"string","sourceFile":"string"}]}
                    schema_str = json.dumps(schema_example)
                    prompt = (
                        "Extract covenant ratios (Net Debt to EBITDA, Cashflow DSCR, Cashflow ICR), their numerators and denominators, thresholds, and compliance status from this Compliance Certificate. "
                        f"Return ONLY JSON with schema {schema_str} .\n\n"
                        f"PDF Text:\n{text[:15000]}"
                    )
                    body = json.dumps({
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": "You are a precise information extractor."},
                            {"role": "user", "content": prompt},
                        ],
                        "response_format": {"type": "json_object"}
                    }).encode("utf-8")
                    req = urlrequest.Request(
                        "https://api.openai.com/v1/chat/completions",
                        data=body,
                        headers={
                            "Authorization": f"Bearer {api_key}",
                            "Content-Type": "application/json",
                        },
                    )
                    with urlrequest.urlopen(req, timeout=30) as resp:
                        payload = json.loads(resp.read().decode("utf-8"))
                        content = payload.get("choices", [{}])[0].get("message", {}).get("content")
                        if content:
                            ai_obj = json.loads(content)
                            ai_covs = ai_obj.get("covenants")
                            if isinstance(ai_covs, list) and ai_covs:
                                covenants_json = ai_covs
                except (URLError, HTTPError, json.JSONDecodeError, Exception):
                    pass

    return {
        "calc_date": calc_date.isoformat() if calc_date else None,
        "rows": covenant_rows,
        "items": items,
        "covenants": covenants_json,
        "raw_keys": {"we_confirm": we_confirm, "schedule2": schedule2},
    }


