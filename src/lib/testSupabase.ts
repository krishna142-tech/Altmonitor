import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', supabase.supabaseUrl);
    console.log('Supabase Key (first 10 chars):', supabase.supabaseKey.substring(0, 10) + '...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('facilities')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }

    console.log('Supabase connection successful');
    return { success: true, data };
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

export const testFacilityCreation = async () => {
  try {
    console.log('Testing facility creation...');
    
    const testFacility = {
      transaction_id: 'test-transaction-123',
      investment_name: 'Test Investment',
      facility_type: 'Debt',
      payment_rank: 'Senior Secured',
      seniority: 'First Lien',
      currency: 'USD',
      from_date: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    console.log('Test facility data:', testFacility);

    const { data, error } = await supabase
      .from('facilities')
      .insert(testFacility)
      .select()
      .single();

    if (error) {
      console.error('Facility creation error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message };
    }

    console.log('Facility created successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Facility creation failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

export const testDatabaseSchema = async () => {
  try {
    console.log('Testing database schema...');
    
    // Test if facilities table exists and has the right structure
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Database schema test error:', error);
      return { success: false, error: error.message };
    }

    console.log('Database schema test successful');
    return { success: true, data };
  } catch (err) {
    console.error('Database schema test failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};