-- Altmonitor Database Migration Script
-- This script safely updates your existing database schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist (this will fail if they're in use, which is expected)
-- We'll handle this gracefully by using IF EXISTS
DROP TYPE IF EXISTS investment_type CASCADE;
DROP TYPE IF EXISTS investment_status CASCADE;
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;

-- Recreate custom types
CREATE TYPE investment_type AS ENUM ('private_equity', 'real_estate', 'hedge_fund', 'venture_capital');
CREATE TYPE investment_status AS ENUM ('active', 'closed', 'pending');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE transaction_status AS ENUM ('Active', 'Pending', 'Completed', 'Failed', 'Cancelled');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'investor');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE event_type AS ENUM ('meeting', 'deadline', 'review', 'other');
CREATE TYPE event_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Drop existing tables if they exist (this will remove all data!)
-- Only run this if you want to start fresh
-- DROP TABLE IF EXISTS cashflow_schedules CASCADE;
-- DROP TABLE IF EXISTS facilities CASCADE;
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS investments CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Create tables (only if they don't exist)
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type investment_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    return_rate DECIMAL(5,2) NOT NULL,
    status investment_status NOT NULL DEFAULT 'active',
    date_invested DATE NOT NULL,
    maturity_date DATE,
    description TEXT NOT NULL,
    risk_level risk_level NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal TEXT NOT NULL,
    issuer TEXT NOT NULL,
    currency TEXT NOT NULL,
    country_of_risk TEXT NOT NULL,
    collateral_description TEXT NOT NULL,
    contract_date DATE NOT NULL,
    asset_manager TEXT NOT NULL,
    asset_manager_name TEXT NOT NULL,
    amount TEXT NOT NULL,
    status transaction_status NOT NULL DEFAULT 'Pending',
    investor_name TEXT,
    fund_name TEXT,
    transaction_type TEXT,
    share_price TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    investment_name TEXT NOT NULL,
    facility_type TEXT NOT NULL,
    payment_rank TEXT NOT NULL,
    seniority TEXT NOT NULL,
    currency TEXT NOT NULL,
    from_date DATE NOT NULL,
    status TEXT NOT NULL,
    -- Additional optional fields
    investment_type TEXT,
    has_tranche TEXT,
    isin TEXT,
    cusip TEXT,
    bbg_id TEXT,
    fisn TEXT,
    internal_deal_id TEXT,
    loan_reference_number TEXT,
    fund_id TEXT,
    covenant_id TEXT,
    asset_classification TEXT,
    asset_tag TEXT,
    sector TEXT,
    sub_sector TEXT,
    instrument_type TEXT,
    country_of_risk TEXT,
    general_terms JSONB,
    cashflows JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cashflow_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    schedule_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    frequency TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'investor',
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    status event_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_deal ON transactions(deal);
CREATE INDEX IF NOT EXISTS idx_transactions_issuer ON transactions(issuer);
CREATE INDEX IF NOT EXISTS idx_facilities_investment_name ON facilities(investment_name);
CREATE INDEX IF NOT EXISTS idx_facilities_transaction_id ON facilities(transaction_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_schedules_investment_id ON cashflow_schedules(investment_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_schedules_transaction_id ON cashflow_schedules(transaction_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_schedules_facility_id ON cashflow_schedules(facility_id);
CREATE INDEX IF NOT EXISTS idx_events_investment_id ON events(investment_id);
CREATE INDEX IF NOT EXISTS idx_events_transaction_id ON events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_events_facility_id ON events(facility_id);

-- Enable Row Level Security (RLS)
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - allow all for now)
-- You can customize these based on your security requirements
CREATE POLICY "Allow all operations on investments" ON investments FOR ALL USING (true);
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on facilities" ON facilities FOR ALL USING (true);
CREATE POLICY "Allow all operations on cashflow_schedules" ON cashflow_schedules FOR ALL USING (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cashflow_schedules_updated_at BEFORE UPDATE ON cashflow_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();