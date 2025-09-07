-- Altmonitor Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE investment_type AS ENUM ('private_equity', 'real_estate', 'hedge_fund', 'venture_capital');
CREATE TYPE investment_status AS ENUM ('active', 'closed', 'pending');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE transaction_status AS ENUM ('Active', 'Pending', 'Completed', 'Failed', 'Cancelled');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'investor');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE event_type AS ENUM ('meeting', 'deadline', 'review', 'other');
CREATE TYPE event_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Investments table
CREATE TABLE investments (
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

-- Transactions table
CREATE TABLE transactions (
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
    number_of_shares TEXT,
    total_value TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- For admin authentication
    role user_role NOT NULL DEFAULT 'investor',
    status user_status NOT NULL DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id), -- Track who created this admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    type event_type NOT NULL,
    description TEXT,
    participants TEXT[],
    status event_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facilities table
CREATE TABLE facilities (
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

-- Create indexes for better performance
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_investments_type ON investments(type);
CREATE INDEX idx_investments_date_invested ON investments(date_invested);

CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_deal ON transactions(deal);
CREATE INDEX idx_transactions_issuer ON transactions(issuer);
CREATE INDEX idx_transactions_contract_date ON transactions(contract_date);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_calendar_events_date ON calendar_events(date);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);

CREATE INDEX idx_facilities_transaction_id ON facilities(transaction_id);
CREATE INDEX idx_facilities_investment_name ON facilities(investment_name);
CREATE INDEX idx_facilities_status ON facilities(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security requirements)
-- For development, we'll allow all operations. In production, you should implement proper authentication and authorization.

CREATE POLICY "Allow all operations for investments" ON investments
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for transactions" ON transactions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for users" ON users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for calendar_events" ON calendar_events
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for facilities" ON facilities
    FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data for testing
INSERT INTO investments (name, type, amount, current_value, return_rate, status, date_invested, maturity_date, description, risk_level) VALUES
('TechGrowth Capital Fund III', 'private_equity', 500000.00, 675000.00, 35.00, 'active', '2023-01-15', '2028-01-15', 'Focus on growth-stage technology companies', 'medium'),
('Manhattan Real Estate Partners', 'real_estate', 750000.00, 825000.00, 10.00, 'active', '2022-06-20', '2027-06-20', 'Commercial real estate development in NYC', 'low'),
('Quantum Ventures Fund', 'venture_capital', 250000.00, 380000.00, 52.00, 'active', '2023-03-10', NULL, 'Early-stage quantum computing startups', 'high');

INSERT INTO transactions (deal, issuer, currency, country_of_risk, collateral_description, contract_date, asset_manager, asset_manager_name, amount, status, investor_name, fund_name, transaction_type, notes) VALUES
('TECH-2023-001', 'TechGrowth Capital', 'USD', 'USA', 'Technology company equity', '2023-01-15', 'TECH-AM-001', 'TechGrowth Asset Management', '500000', 'Completed', 'Altmonitor Fund I', 'TechGrowth Capital Fund III', 'buy', 'Initial investment in TechGrowth Capital Fund III'),
('RE-2022-002', 'Manhattan RE Partners', 'USD', 'USA', 'Commercial real estate', '2022-06-20', 'RE-AM-001', 'Manhattan Real Estate Management', '750000', 'Completed', 'Altmonitor Fund I', 'Manhattan Real Estate Partners', 'buy', 'Commercial real estate development investment'),
('QV-2023-003', 'Quantum Ventures', 'USD', 'USA', 'Venture capital equity', '2023-03-10', 'QV-AM-001', 'Quantum Ventures Management', '250000', 'Completed', 'Altmonitor Fund I', 'Quantum Ventures Fund', 'buy', 'Early-stage quantum computing investment');

-- Insert default super admin (password: admin123)
-- Password hash for 'admin123' using SHA256 with salt 'altmonitor_salt'
INSERT INTO users (name, email, password_hash, role, status, created_by) VALUES
('Super Admin', 'superadmin@altmonitor.com', '1306ab84619603913b539e4305e651e245d90372973e239cfc21d897ff231fba', 'super_admin', 'active', NULL),
('Admin User', 'admin@altmonitor.com', '1306ab84619603913b539e4305e651e245d90372973e239cfc21d897ff231fba', 'admin', 'active', (SELECT id FROM users WHERE email = 'superadmin@altmonitor.com')),
('Portfolio Manager', 'manager@altmonitor.com', '1306ab84619603913b539e4305e651e245d90372973e239cfc21d897ff231fba', 'manager', 'active', (SELECT id FROM users WHERE email = 'superadmin@altmonitor.com')),
('Investor User', 'investor@altmonitor.com', '1306ab84619603913b539e4305e651e245d90372973e239cfc21d897ff231fba', 'investor', 'active', (SELECT id FROM users WHERE email = 'superadmin@altmonitor.com'));

INSERT INTO calendar_events (title, date, time, type, description, participants, status) VALUES
('Portfolio Review Meeting', '2024-01-15', '10:00:00', 'meeting', 'Monthly portfolio performance review', ARRAY['admin@altmonitor.com', 'manager@altmonitor.com'], 'scheduled'),
('Quarterly Report Deadline', '2024-03-31', '17:00:00', 'deadline', 'Q1 2024 quarterly report submission', ARRAY['manager@altmonitor.com'], 'scheduled'),
('Investment Committee Meeting', '2024-02-15', '14:00:00', 'meeting', 'Review new investment opportunities', ARRAY['admin@altmonitor.com', 'manager@altmonitor.com'], 'scheduled');

-- Create facilities for the sample transactions
INSERT INTO facilities (transaction_id, investment_name, facility_type, payment_rank, seniority, currency, from_date, status, investment_type, sector, country_of_risk) 
SELECT 
    t.id,
    i.name,
    'Equity Investment',
    'Senior',
    'First Lien',
    'USD',
    t.contract_date,
    'Active',
    i.type::text,
    'Technology',
    t.country_of_risk
FROM transactions t
JOIN investments i ON i.name LIKE '%' || split_part(t.issuer, ' ', 1) || '%'
WHERE t.deal IN ('TECH-2023-001', 'RE-2022-002', 'QV-2023-003');