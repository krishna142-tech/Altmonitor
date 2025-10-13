-- Create investment_summary_comments table
CREATE TABLE IF NOT EXISTS investment_summary_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id TEXT NOT NULL,
  investment_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_investment_summary_comments_facility_id ON investment_summary_comments(facility_id);
CREATE INDEX IF NOT EXISTS idx_investment_summary_comments_user_email ON investment_summary_comments(user_email);
CREATE INDEX IF NOT EXISTS idx_investment_summary_comments_created_at ON investment_summary_comments(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE investment_summary_comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all comments
CREATE POLICY "Allow authenticated users to read comments" ON investment_summary_comments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert comments
CREATE POLICY "Allow authenticated users to insert comments" ON investment_summary_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow users to update their own comments
CREATE POLICY "Allow users to update their own comments" ON investment_summary_comments
  FOR UPDATE USING (auth.email() = user_email);

-- Create policy to allow users to delete their own comments
CREATE POLICY "Allow users to delete their own comments" ON investment_summary_comments
  FOR DELETE USING (auth.email() = user_email);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_investment_summary_comments_updated_at 
  BEFORE UPDATE ON investment_summary_comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();