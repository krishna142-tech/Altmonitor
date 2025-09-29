from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import logging

from .db import init_db, db_session
from .models import CovenantEntry, CovenantPeriod, CovenantEntryV2, Document
from .parse_covenant import parse_compliance_certificate


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = uploads_dir

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()

    @app.route("/api/health", methods=["GET"])
    def health():
        logger.info("Health check endpoint called")
        return jsonify({"status": "ok", "message": "Backend is running"})

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
        for item in data:
            try:
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
        return jsonify([e.to_dict() for e in saved]), 201

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

        # Basic CSV/XLSX parsing placeholder: expect a simple CSV-like content if .csv
        rows = []
        try:
            if filename.lower().endswith(".csv"):
                import csv
                with open(save_path, newline="", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for r in reader:
                        rows.append({
                            "covenant_name": r.get("covenant_name") or r.get("Covenant") or "",
                            "threshold": r.get("threshold") or r.get("Threshold") or "",
                            "borrower_calc": r.get("borrower_calc") or r.get("Borrower") or "",
                            "lender_calc": r.get("lender_calc") or r.get("Lender") or "",
                            "consequence": r.get("consequence") or r.get("Consequence") or "",
                            "compliance_check": r.get("compliance_check") or r.get("Compliance") or "",
                            "comment": r.get("comment") or r.get("Comment") or "",
                            "source_file": filename,
                            "reference_file": r.get("reference") or r.get("Reference") or "",
                        })
            else:
                # For xlsx, require pandas if available
                try:
                    import pandas as pd  # type: ignore
                    df = pd.read_excel(save_path)
                    for _, r in df.iterrows():
                        rows.append({
                            "covenant_name": str(r.get("covenant_name") or r.get("Covenant") or ""),
                            "threshold": str(r.get("threshold") or r.get("Threshold") or ""),
                            "borrower_calc": str(r.get("borrower_calc") or r.get("Borrower") or ""),
                            "lender_calc": str(r.get("lender_calc") or r.get("Lender") or ""),
                            "consequence": str(r.get("consequence") or r.get("Consequence") or ""),
                            "compliance_check": str(r.get("compliance_check") or r.get("Compliance") or ""),
                            "comment": str(r.get("comment") or r.get("Comment") or ""),
                            "source_file": filename,
                            "reference_file": str(r.get("reference") or r.get("Reference") or ""),
                        })
                except Exception:
                    return jsonify({"error": "Install pandas to parse Excel or upload CSV"}), 400
        except Exception as ex:
            return jsonify({"error": f"Failed to parse file: {ex}"}), 400

        # Create or find a period by query param ipd_date, otherwise today
        ipd_date_qs = request.args.get("ipd_date")
        display_name = request.args.get("display_name")
        try:
            ipd_date = datetime.strptime(ipd_date_qs, "%Y-%m-%d").date() if ipd_date_qs else datetime.utcnow().date()
        except Exception:
            return jsonify({"error": "Invalid ipd_date"}), 400
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

        # Map rows to entries
        created = []
        for r in rows:
            entry = CovenantEntryV2(
                period_id=period.id,
                covenant_name=r.get("covenant_name") or "",
                threshold=r.get("threshold"),
                borrower_calc=r.get("borrower_calc"),
                lender_calc=r.get("lender_calc"),
                consequence=r.get("consequence"),
                compliance_check=r.get("compliance_check"),
                comment=r.get("comment"),
                source_file=r.get("source_file"),
                reference_file=r.get("reference_file"),
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