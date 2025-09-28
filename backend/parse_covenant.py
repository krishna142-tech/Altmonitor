import re
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


def parse_schedule_2(text: str) -> dict:
    sched_match = re.search(r"Schedule\s*2(.*?)(?:Schedule\s*3|\Z)", text, re.IGNORECASE | re.DOTALL)
    if not sched_match:
        return {}
    section = sched_match.group(1)
    values = parse_key_value_pairs(section)
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
        if re.search(r"interest\s*cover", line, re.IGNORECASE):
            m = re.search(r"(lock[- ]?up\s*)?threshold\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)", line, re.IGNORECASE)
            if m:
                threshold_map["Senior Cashflow Interest Cover Ratio"] = m.group(2)
    if threshold_map:
        values["__thresholds__"] = threshold_map
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
        elif "interest cover" in name:
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
    borrower, lender = parse_borrower_lender(text)

    # Build rows combining keys that likely represent covenants
    covenant_rows = []
    candidates = {
        "Senior Net Debt to EBITDA": (we_confirm.get("Senior Net Debt to EBITDA") or schedule2.get("Senior Net Debt to EBITDA")),
        "Senior Cashflow DSCR": (we_confirm.get("Senior Cashflow DSCR") or schedule2.get("Senior Cashflow DSCR")),
        "Senior Cashflow Interest Cover Ratio": (we_confirm.get("Senior Cashflow Interest Cover Ratio") or schedule2.get("Senior Cashflow Interest Cover Ratio")),
    }

    # thresholds from the text if present (look for nearby 'threshold' words)
    # As a simple heuristic, use the same value where only one number found; these can be edited manually later.
    thresholds = schedule2.get("__thresholds__", {}) if isinstance(schedule2, dict) else {}
    # Extract base numerics from Schedule 2 for lender recompute
    net_debt = normalize_number(schedule2.get("Senior Net Debt")) if isinstance(schedule2, dict) else None
    ebitda = normalize_number(schedule2.get("EBITDA")) if isinstance(schedule2, dict) else None
    cash_flow = normalize_number(schedule2.get("Cash Flow")) if isinstance(schedule2, dict) else None
    debt_service = normalize_number(schedule2.get("Debt Service")) if isinstance(schedule2, dict) else None
    net_interest = normalize_number(schedule2.get("Net Interest")) if isinstance(schedule2, dict) else None

    for name, val in candidates.items():
        if val is None:
            # try compute from components
            if name == "Senior Net Debt to EBITDA" and net_debt is not None and ebitda is not None and ebitda != 0:
                val = f"{net_debt / ebitda:.2f}x"
            elif name == "Senior Cashflow DSCR" and cash_flow is not None and debt_service is not None and debt_service != 0:
                val = f"{cash_flow / debt_service:.2f}x"
            elif name == "Senior Cashflow Interest Cover Ratio" and cash_flow is not None and net_interest is not None and net_interest != 0:
                val = f"{cash_flow / net_interest:.2f}x"

        borrower_ratio = val
        borrower_ratio_num = normalize_number(borrower_ratio) if borrower_ratio is not None else None

        # lender recompute
        lender_ratio_num: Optional[float] = None
        if name == "Senior Net Debt to EBITDA" and net_debt is not None and ebitda is not None and ebitda != 0:
            lender_ratio_num = round(net_debt / ebitda, 2)
        elif name == "Senior Cashflow DSCR" and cash_flow is not None and debt_service is not None and debt_service != 0:
            lender_ratio_num = round(cash_flow / debt_service, 2)
        elif name == "Senior Cashflow Interest Cover Ratio" and cash_flow is not None and net_interest is not None and net_interest != 0:
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
            "source_file": None,
            "reference_file": None,
        }
        covenant_rows.append(row)

    # Also add base metrics from schedule 2 if available
    base_metrics = [
        "Senior Net Debt",
        "EBITDA",
        "Cash Flow",
        "Debt Service",
        "Net Interest",
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

    return {
        "calc_date": calc_date.isoformat() if calc_date else None,
        "rows": covenant_rows,
        "items": items,
        "raw_keys": {"we_confirm": we_confirm, "schedule2": schedule2},
    }


