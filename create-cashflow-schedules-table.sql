-- Create cashflow_schedules table
-- Run this in your Supabase SQL Editor

-- Create the cashflow_schedules table
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
    schedule_data JSONB, -- Store the full cashflow schedule data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cashflow_schedules_investment_id ON cashflow_schedules(investment_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_schedules_transaction_id ON cashflow_schedules(transaction_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_schedules_facility_id ON cashflow_schedules(facility_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_schedules_status ON cashflow_schedules(status);

-- Enable Row Level Security (RLS)
ALTER TABLE cashflow_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (allow all for now)
CREATE POLICY "Allow all operations on cashflow_schedules" ON cashflow_schedules FOR ALL USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_cashflow_schedules_updated_at 
    BEFORE UPDATE ON cashflow_schedules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cashflow_schedules' 
ORDER BY ordinal_position;