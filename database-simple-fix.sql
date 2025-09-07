-- Simple Database Constraint Fix
-- This script safely fixes the transaction_id constraint without enum issues
-- Run this in your Supabase SQL Editor

-- Step 1: Check current state of the facilities table
SELECT 
    column_name, 
    is_nullable, 
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'facilities' 
AND column_name = 'transaction_id';

-- Step 2: Check if there are any facilities with NULL transaction_id
SELECT COUNT(*) as facilities_with_null_transaction_id
FROM facilities 
WHERE transaction_id IS NULL;

-- Step 3: If there are facilities with NULL transaction_id, we need to handle them
-- First, let's see what we're working with
SELECT 
    id,
    investment_name,
    transaction_id,
    created_at
FROM facilities 
WHERE transaction_id IS NULL
LIMIT 5;

-- Step 4: For each facility with NULL transaction_id, create a transaction
-- We'll do this one by one to avoid enum casting issues
DO $$
DECLARE
    facility_record RECORD;
    new_transaction_id UUID;
BEGIN
    -- Loop through facilities with NULL transaction_id
    FOR facility_record IN 
        SELECT id, investment_name, from_date
        FROM facilities 
        WHERE transaction_id IS NULL
    LOOP
        -- Create a new transaction for this facility
        INSERT INTO transactions (
            deal, 
            issuer, 
            currency, 
            country_of_risk, 
            collateral_description, 
            contract_date, 
            asset_manager, 
            asset_manager_name, 
            amount, 
            status, 
            transaction_type, 
            notes
        ) VALUES (
            facility_record.investment_name,
            facility_record.investment_name,
            'USD',
            'USA',
            'Auto-created transaction for facility',
            COALESCE(facility_record.from_date, CURRENT_DATE),
            'Default Manager',
            'Default Manager Name',
            '0',
            'Active'::transaction_status,
            'investment',
            'Auto-created transaction for existing facility: ' || facility_record.investment_name
        ) RETURNING id INTO new_transaction_id;
        
        -- Update the facility with the new transaction_id
        UPDATE facilities 
        SET transaction_id = new_transaction_id
        WHERE id = facility_record.id;
        
        RAISE NOTICE 'Created transaction % for facility %', new_transaction_id, facility_record.investment_name;
    END LOOP;
END $$;

-- Step 5: Verify all facilities now have transaction_id
SELECT COUNT(*) as facilities_with_null_transaction_id_after_fix
FROM facilities 
WHERE transaction_id IS NULL;

-- Step 6: Add the NOT NULL constraint if it doesn't exist
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

-- Step 7: Final verification
SELECT 
    column_name, 
    is_nullable, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'facilities' 
AND column_name = 'transaction_id';

-- Step 8: Show summary of what was fixed
SELECT 
    'Summary' as info,
    COUNT(*) as total_facilities,
    COUNT(transaction_id) as facilities_with_transaction_id,
    COUNT(*) - COUNT(transaction_id) as facilities_without_transaction_id
FROM facilities;