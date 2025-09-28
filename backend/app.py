from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import logging

from db import init_db, db_session
from models import CovenantEntry
from parse_covenant import parse_compliance_certificate


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

    return app


if __name__ == "__main__":
    init_db()
    app = create_app()
    port = int(os.environ.get("PORT", 5001))
    logger = logging.getLogger(__name__)
    logger.info(f"Starting Flask app on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)