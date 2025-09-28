Backend setup (Flask Covenant Service)

1) Create and activate a Python environment, then install requirements:

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
```

2) Run the API:

```bash
python -m backend.app
```

The API listens on http://localhost:5001. Configure the frontend by adding VITE_COVENANT_API to `.env` if needed.

Database

- Default is SQLite file `covenants.db` in `backend/`. To change, set `COVENANT_DATABASE_URL` (e.g., `postgresql+psycopg://user:pass@host/db`).

Endpoints

- GET /api/health
- POST /api/covenants/upload (multipart: file=PDF)
- GET /api/covenants?calc_date=YYYY-MM-DD
- POST /api/covenants (JSON array of entries)

Data model

`covenant_entries(id, calc_date, covenant_name, threshold, borrower_calc, lender_calc, consequence, compliance_check, comment, source_file, reference_file, pdf_path)`


