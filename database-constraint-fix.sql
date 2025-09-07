-- Safe Database Constraint Fix
-- This script only fixes the transaction_id constraint issue
-- Run this in your Supabase SQL Editor

-- First, let's check if the facilities table exists and what constraints it has
-- This is just for reference - you can run this to see the current state
-- SELECT 
--     column_name, 
--     is_nullable, 
--     data_type, 
--     column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'facilities' 
-- AND column_name = 'transaction_id';

-- If the transaction_id column allows NULL, we need to make it NOT NULL
-- But first, we need to ensure all existing facilities have a valid transaction_id

-- Step 1: Update any facilities that have NULL transaction_id
-- (This will only work if you have existing data with NULL transaction_ids)
UPDATE facilities 
SET transaction_id = (
    SELECT id 
    FROM transactions 
    WHERE transactions.deal = facilities.investment_name 
    OR transactions.issuer = facilities.investment_name
    LIMIT 1
)
WHERE transaction_id IS NULL;

-- Step 2: If there are still facilities with NULL transaction_id, 
-- create default transactions for them
INSERT INTO transactions (deal, issuer, currency, country_of_risk, collateral_description, contract_date, asset_manager, asset_manager_name, amount, status, transaction_type, notes)
SELECT DISTINCT
    investment_name as deal,
    investment_name as issuer,
    'USD' as currency,
    'USA' as country_of_risk,
    'Default facility transaction' as collateral_description,
    COALESCE(from_date, CURRENT_DATE) as contract_date,
    'Default Manager' as asset_manager,
    'Default Manager Name' as asset_manager_name,
    '0' as amount,
    'Active'::transaction_status as status,
    'investment' as transaction_type,
    'Auto-created transaction for existing facility' as notes
FROM facilities 
WHERE transaction_id IS NULL;

-- Step 3: Update facilities with the newly created transaction IDs
UPDATE facilities 
SET transaction_id = (
    SELECT id 
    FROM transactions 
    WHERE transactions.deal = facilities.investment_name 
    AND transactions.notes = 'Auto-created transaction for existing facility'
    LIMIT 1
)
WHERE transaction_id IS NULL;

-- Step 4: Now we can safely add the NOT NULL constraint
-- First, let's check if the constraint already exists
DO $$
BEGIN
    -- Check if the column is already NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'facilities' 
        AND column_name = 'transaction_id' 
        AND is_nullable = 'NO'
    ) THEN
        RAISE NOTICE 'transaction_id column is already NOT NULL';
    ELSE
        -- Add the NOT NULL constraint
        ALTER TABLE facilities ALTER COLUMN transaction_id SET NOT NULL;
        RAISE NOTICE 'Added NOT NULL constraint to transaction_id column';
    END IF;
END $$;

-- Step 5: Verify the constraint was added
SELECT 
    column_name, 
    is_nullable, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'facilities' 
AND column_name = 'transaction_id';