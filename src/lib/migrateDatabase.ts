import { supabase } from './supabase';

// Migration to make transaction_id optional in facilities table
export const migrateDatabase = async () => {
  try {
    console.log('Starting database migration...');
    
    // First, let's check if the migration is needed
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, is_nullable')
      .eq('table_name', 'facilities')
      .eq('column_name', 'transaction_id');

    if (tableError) {
      console.error('Error checking table structure:', tableError);
      return { success: false, error: tableError.message };
    }

    console.log('Current transaction_id column info:', tableInfo);

    // If transaction_id is NOT NULL, we need to make it nullable
    const isCurrentlyNotNull = tableInfo && tableInfo.length > 0 && tableInfo[0].is_nullable === 'NO';
    
    if (isCurrentlyNotNull) {
      console.log('Making transaction_id nullable...');
      
      // This would require a direct SQL execution in Supabase
      // For now, we'll just log what needs to be done
      console.log('Please run this SQL in your Supabase SQL Editor:');
      console.log('ALTER TABLE facilities ALTER COLUMN transaction_id DROP NOT NULL;');
      
      return { 
        success: false, 
        error: 'Please run the SQL migration manually in Supabase SQL Editor',
        sql: 'ALTER TABLE facilities ALTER COLUMN transaction_id DROP NOT NULL;'
      };
    } else {
      console.log('transaction_id is already nullable');
      return { success: true, message: 'No migration needed' };
    }
  } catch (err) {
    console.error('Migration failed:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};

// Test if facilities can be created without transaction_id
export const testFacilityCreationWithoutTransaction = async () => {
  try {
    console.log('Testing facility creation without transaction_id...');
    
    const testFacility = {
      investment_name: 'Test Investment Without Transaction',
      facility_type: 'Debt',
      payment_rank: 'Senior Secured',
      seniority: 'First Lien',
      currency: 'USD',
      from_date: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    const { data, error } = await supabase
      .from('facilities')
      .insert(testFacility)
      .select()
      .single();

    if (error) {
      console.error('Test facility creation error:', error);
      return { success: false, error: error.message };
    }

    console.log('Test facility created successfully:', data);
    
    // Clean up the test facility
    await supabase
      .from('facilities')
      .delete()
      .eq('id', data.id);

    return { success: true, data };
  } catch (err) {
    console.error('Test facility creation failed:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};