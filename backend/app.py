from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import logging
 

from backend.db import init_db, db_session
from backend.models import CovenantEntry, CovenantPeriod, CovenantEntryV2, Document
from backend.parse_covenant import parse_compliance_certificate, parse_xlsx


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = uploads_dir

    # Swagger / OpenAPI setup removed

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()

    @app.route("/api/health", methods=["GET"])
    def health():
        logger.info("Health check endpoint called")
        return jsonify({"status": "ok", "message": "Backend is running"})

    # Simple ingestion endpoint for facility general terms
    @app.route("/api/reporting", methods=["POST"])
    def save_general_terms():
        try:
            payload = request.get_json(force=True)
        except Exception:
            return jsonify({"error": "Invalid JSON"}), 400
        # Persist as NDJSON for simplicity
        try:
            ndjson_path = os.path.join(app.config["UPLOAD_FOLDER"], "general_terms.ndjson")
            with open(ndjson_path, "a", encoding="utf-8") as f:
                import json
                f.write(json.dumps({
                    "received_at": datetime.utcnow().isoformat(),
                    **(payload or {})
                }) + "\n")
            return jsonify({"status": "ok"}), 201
        except Exception as ex:
            return jsonify({"error": f"Failed to persist: {ex}"}), 500

    @app.route("/api/reporting", methods=["GET"])
    def list_reporting():
        facility_id = request.args.get("facility_id")
        investment_name = request.args.get("investment_name")
        ndjson_path = os.path.join(app.config["UPLOAD_FOLDER"], "general_terms.ndjson")
        items = []
        if not os.path.exists(ndjson_path):
            return jsonify(items)
        import json
        try:
            with open(ndjson_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        obj = json.loads(line)
                        items.append(obj)
                    except Exception:
                        continue
        except Exception as ex:
            return jsonify({"error": f"Failed to read: {ex}"}), 500

        def match(o):
            if facility_id and str(o.get("facilityId")) != str(facility_id):
                return False
            if investment_name and str(o.get("investmentName", "")).strip() != str(investment_name).strip():
                return False
            return True

        filtered = [o for o in items if match(o)] if (facility_id or investment_name) else items
        # return newest first
        filtered.sort(key=lambda o: o.get("received_at", ""), reverse=True)
        return jsonify(filtered)

    # Docs routes removed

    @app.route("/api/covenants", methods=["GET"])
    def list_covenants():
        calc_date = request.args.get("calc_date")
        query = db_session.query(CovenantEntry)
        if calc_date:
            try:
                # Support formats like 31-12-2025 or 2025-12-31
                if "-" in calc_date:
                    if len(calc_date.split("-")[-1]) == 4:
                        date_obj = datetime.strptime(calc_date, "%d-%m-%Y").date()
                    else:
                        date_obj = datetime.strptime(calc_date, "%Y-%m-%d").date()
                else:
                    date_obj = datetime.fromisoformat(calc_date).date()
            except Exception:
                return jsonify({"error": "Invalid calc_date format"}), 400
            entries = query.filter(CovenantEntry.calc_date == date_obj).all()
        else:
            entries = query.order_by(CovenantEntry.calc_date.desc()).all()
        return jsonify([e.to_dict() for e in entries])

    @app.route("/api/covenants", methods=["POST"])
    def save_covenants():
        data = request.get_json(force=True)
        if not isinstance(data, list):
            return jsonify({"error": "Expected a list of covenant entries"}), 400

        saved = []
        skipped = 0
        for item in data:
            try:
                # Skip rows without a covenant name
                if not (item.get("covenant_name") and str(item.get("covenant_name")).strip()):
                    skipped += 1
                    continue
                calc_date_raw = item.get("calc_date")
                if isinstance(calc_date_raw, str):
                    try:
                        calc_date = datetime.strptime(calc_date_raw, "%Y-%m-%d").date()
                    except ValueError:
                        calc_date = datetime.strptime(calc_date_raw, "%d-%m-%Y").date()
                else:
                    calc_date = datetime.utcnow().date()

                entry = CovenantEntry(
                    calc_date=calc_date,
                    covenant_name=item.get("covenant_name"),
                    threshold=item.get("threshold"),
                    borrower_calc=item.get("borrower_calc"),
                    lender_calc=item.get("lender_calc"),
                    consequence=item.get("consequence"),
                    compliance_check=item.get("compliance_check"),
                    comment=item.get("comment"),
                    source_file=item.get("source_file"),
                    reference_file=item.get("reference_file"),
                    pdf_path=item.get("pdf_path"),
                )
                db_session.add(entry)
                saved.append(entry)
            except Exception as ex:
                return jsonify({"error": f"Failed to save entry: {ex}"}), 400

        db_session.commit()
        result = [e.to_dict() for e in saved]
        # Include metadata if some rows were skipped
        if skipped:
            return jsonify({"saved": result, "skipped": skipped}), 201
        return jsonify(result), 201

    @app.route("/api/covenants/upload", methods=["POST"])
    def upload_and_parse():
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(save_path)

        try:
            parse_result = parse_compliance_certificate(save_path)
        except Exception as ex:
            return jsonify({"error": f"Parsing failed: {ex}"}), 500

        # Attach pdf_path to each row
        for row in parse_result.get("rows", []):
            row["pdf_path"] = save_path
            # default files: source_file/reference_file can be set manually later

        return jsonify(parse_result)

    # New: portfolio-scoped endpoints and Excel upload placeholder

    @app.route("/api/portfolio/<portfolio_id>/covenants", methods=["GET"])
    def get_portfolio_periods(portfolio_id: str):
        date_qs = request.args.get("date")
        q = db_session.query(CovenantPeriod).filter(CovenantPeriod.portfolio_id == portfolio_id)
        if date_qs:
            try:
                # Accept YYYY-MM-DD
                date_obj = datetime.strptime(date_qs, "%Y-%m-%d").date()
                q = q.filter(CovenantPeriod.ipd_date == date_obj)
            except Exception:
                return jsonify({"error": "Invalid date format"}), 400
        periods = q.order_by(CovenantPeriod.ipd_date.desc()).all()
        # include entries for date-specific request
        result = [p.to_dict() for p in periods]
        if date_qs and len(periods) == 1:
            p = periods[0]
            entries = db_session.query(CovenantEntryV2).filter(CovenantEntryV2.period_id == p.id).all()
            return jsonify({"period": p.to_dict(), "entries": [e.to_dict() for e in entries]})
        return jsonify(result)

    @app.route("/api/portfolio/<portfolio_id>/covenants/upload-excel", methods=["POST"])
    def upload_covenants_excel(portfolio_id: str):
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(save_path)

        # Store document record
        doc = Document(portfolio_id=portfolio_id, filename=filename, path=save_path, doc_type="excel")
        db_session.add(doc)
        db_session.commit()

        # Parse spreadsheet: support .xlsx via parse_xlsx and .csv via DictReader
        try:
            if filename.lower().endswith(".xlsx"):
                parsed = parse_xlsx(save_path)
            elif filename.lower().endswith(".csv"):
                import csv
                covenants = []
                with open(save_path, newline="", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for r in reader:
                        covenants.append({
                            "Covenant Name": r.get("Covenant Name") or r.get("covenant_name") or r.get("Covenant") or "",
                            "Threshold": r.get("Threshold") or r.get("threshold") or "",
                            "Borrower Calculation": r.get("Borrower Calculation") or r.get("borrower_calc") or r.get("Borrower") or "",
                            "Lender Calculation": r.get("Lender Calculation") or r.get("lender_calc") or r.get("Lender") or "",
                            "Consequence": r.get("Consequence") or r.get("consequence") or "",
                            "Compliance Check": r.get("Compliance Check") or r.get("compliance_check") or r.get("Compliance") or "",
                            "Comment": r.get("Comment") or r.get("comment") or "",
                            "Source File": filename,
                            "Reference File": r.get("Reference File") or r.get("reference_file") or r.get("Reference") or "",
                        })
                parsed = [{"Calculation Date": None, "Show in Report": None, "SNO": None, "Covenants": covenants}]
            else:
                return jsonify({"error": "Unsupported file type. Upload .xlsx or .csv"}), 400
        except Exception as ex:
            return jsonify({"error": f"Failed to parse file: {ex}"}), 400

        # Determine period ipd_date
        ipd_date_qs = request.args.get("ipd_date")
        display_name = request.args.get("display_name")
        ipd_date = None
        if ipd_date_qs:
            try:
                ipd_date = datetime.strptime(ipd_date_qs, "%Y-%m-%d").date()
            except Exception:
                return jsonify({"error": "Invalid ipd_date"}), 400
        else:
            # Fallback to first Calculation Date from sheet
            try:
                first_calc_date = next((item.get("Calculation Date") for item in parsed if item.get("Calculation Date")), None)
                if first_calc_date is not None:
                    # openpyxl may return datetime or date
                    ipd_date = first_calc_date.date() if hasattr(first_calc_date, "date") else first_calc_date
                else:
                    ipd_date = datetime.utcnow().date()
            except Exception:
                ipd_date = datetime.utcnow().date()
        if not display_name:
            display_name = datetime.strftime(ipd_date, "%b-%Y")

        period = (
            db_session.query(CovenantPeriod)
            .filter(CovenantPeriod.portfolio_id == portfolio_id, CovenantPeriod.ipd_date == ipd_date)
            .first()
        )
        if not period:
            period = CovenantPeriod(
                portfolio_id=portfolio_id,
                ipd_date=ipd_date,
                display_name=display_name,
                template_status="Draft",
                source="Provisional",
                is_provisional=True,
            )
            db_session.add(period)
            db_session.commit()

        # Map parsed covenants to entries
        created = []
        for block in parsed or []:
            covenants = block.get("Covenants") or []
            for cov in covenants:
                entry = CovenantEntryV2(
                    period_id=period.id,
                    covenant_name=str(cov.get("Covenant Name") or ""),
                    threshold=str(cov.get("Threshold") or "") or None,
                    borrower_calc=str(cov.get("Borrower Calculation") or "") or None,
                    lender_calc=str(cov.get("Lender Calculation") or "") or None,
                    consequence=str(cov.get("Consequence") or "") or None,
                    compliance_check=str(cov.get("Compliance Check") or "") or None,
                    comment=str(cov.get("Comment") or "") or None,
                    source_file=str(cov.get("Source File") or filename),
                    reference_file=str(cov.get("Reference File") or "") or None,
                    document_id=doc.id,
                )
                db_session.add(entry)
                created.append(entry)
        db_session.commit()
        return jsonify({"period": period.to_dict(), "entries": [e.to_dict() for e in created]})

    @app.route("/api/portfolio/<portfolio_id>/covenants/upload-pdf", methods=["POST"])
    def upload_covenants_pdf(portfolio_id: str):
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(save_path)

        # Store document record
        doc = Document(portfolio_id=portfolio_id, filename=filename, path=save_path, doc_type="pdf")
        db_session.add(doc)
        db_session.commit()

        # Reuse parser
        parsed = parse_compliance_certificate(save_path)
        return jsonify({"document": doc.to_dict(), **parsed})

    @app.route("/api/covenants/parse", methods=["GET"])
    def parse_existing_pdf():
        """Parse a previously uploaded PDF by document id or path.

        Query params:
          - doc_id: Document.id
          - path: full path (debug only)
        """
        doc_id = request.args.get("doc_id")
        path = request.args.get("path")
        target_path = None
        if doc_id:
            doc = db_session.query(Document).get(int(doc_id))
            if not doc:
                return jsonify({"error": "Document not found"}), 404
            target_path = doc.path
        elif path:
            target_path = path
        else:
            return jsonify({"error": "Provide doc_id or path"}), 400

        try:
            parsed = parse_compliance_certificate(target_path)
            return jsonify(parsed)
        except Exception as ex:
            return jsonify({"calc_date": None, "rows": [], "items": [], "error": str(ex)}), 200

    @app.route("/api/covenants/<int:entry_id>", methods=["PUT"])
    def update_covenant_entry(entry_id: int):
        data = request.get_json(force=True)
        # Try v2 first
        entry = db_session.query(CovenantEntryV2).get(entry_id)
        if entry is None:
            entry_legacy = db_session.query(CovenantEntry).get(entry_id)
            if entry_legacy is None:
                return jsonify({"error": "Not found"}), 404
            for k in [
                "covenant_name","threshold","borrower_calc","lender_calc","consequence",
                "compliance_check","comment","source_file","reference_file"
            ]:
                if k in data:
                    setattr(entry_legacy, k, data.get(k))
            db_session.commit()
            return jsonify(entry_legacy.to_dict())
        for k in [
            "covenant_name","threshold","borrower_calc","lender_calc","consequence",
            "compliance_check","comment","source_file","reference_file"
        ]:
            if k in data:
                setattr(entry, k, data.get(k))
        db_session.commit()
        return jsonify(entry.to_dict())

    @app.route("/api/portfolio/<portfolio_id>/covenants/period/<int:period_id>", methods=["PUT"])
    def update_period(portfolio_id: str, period_id: int):
        period = db_session.query(CovenantPeriod).get(period_id)
        if period is None or period.portfolio_id != portfolio_id:
            return jsonify({"error": "Not found"}), 404
        data = request.get_json(force=True)
        for k in [
            "template_status","source","is_provisional","provisional_start_date","report_link"
        ]:
            if k in data:
                if k == "provisional_start_date" and data.get(k):
                    try:
                        setattr(period, k, datetime.strptime(data.get(k), "%Y-%m-%d").date())
                    except Exception:
                        return jsonify({"error": "Invalid provisional_start_date"}), 400
                else:
                    setattr(period, k, data.get(k))
        db_session.commit()
        return jsonify(period.to_dict())

    return app


if __name__ == "__main__":
    init_db()
    app = create_app()
    port = int(os.environ.get("PORT", 5001))
    logger = logging.getLogger(__name__)
    logger.info(f"Starting Flask app on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)