# Supabase Database Setup for Covenant Tracking

## 1. Get Your Supabase Database URL

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string**
4. Copy the **URI** connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## 2. Set Environment Variables

### For Railway Deployment:
1. In Railway dashboard, go to your project
2. Click **Variables** tab
3. Add these environment variables:
   - `SUPABASE_DATABASE_URL` = `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - `COVENANT_DATABASE_URL` = `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### For Local Development:
Create `.env` file in project root:
```
SUPABASE_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
COVENANT_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## 3. Create Covenant Table in Supabase

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS covenant_entries (
    id SERIAL PRIMARY KEY,
    calc_date DATE NOT NULL,
    covenant_name VARCHAR(255) NOT NULL,
    threshold VARCHAR(128),
    borrower_calc VARCHAR(128),
    lender_calc VARCHAR(128),
    consequence VARCHAR(255),
    compliance_check VARCHAR(64),
    comment TEXT,
    source_file VARCHAR(255),
    reference_file VARCHAR(255),
    pdf_path VARCHAR(512),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_covenant_entries_calc_date ON covenant_entries(calc_date);
CREATE INDEX IF NOT EXISTS idx_covenant_entries_covenant_name ON covenant_entries(covenant_name);
```

## 4. Test Connection

After setting up, restart your backend and test:
- Health check: `https://your-railway-url.railway.app/api/health`
- Should return: `{"status": "ok", "message": "Backend is running"}`