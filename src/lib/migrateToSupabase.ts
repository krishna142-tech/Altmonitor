import { supabase } from './supabase';
import { DatabaseService } from './database';

// Migration script to help set up the database
export const migrateToSupabase = async () => {
  try {
    console.log('Starting Supabase migration...');

    // Test connection first
    const { data, error } = await supabase
      .from('transactions')
      .select('count')
      .limit(1);

    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    console.log('✅ Database connection successful');

    // Check if we have any existing data in localStorage
    const localData = localStorage.getItem('altmonitor_data');
    if (localData) {
      console.log('📦 Found existing localStorage data, migrating...');
      
      const data = JSON.parse(localData);
      
      // Migrate transactions
      if (data.transactions && data.transactions.length > 0) {
        console.log(`Migrating ${data.transactions.length} transactions...`);
        for (const transaction of data.transactions) {
          try {
            await DatabaseService.createTransaction(transaction);
            console.log(`✅ Migrated transaction: ${transaction.deal}`);
          } catch (err) {
            console.warn(`⚠️ Failed to migrate transaction ${transaction.deal}:`, err);
          }
        }
      }

      // Migrate investments
      if (data.investments && data.investments.length > 0) {
        console.log(`Migrating ${data.investments.length} investments...`);
        for (const investment of data.investments) {
          try {
            await DatabaseService.createInvestment(investment);
            console.log(`✅ Migrated investment: ${investment.name}`);
          } catch (err) {
            console.warn(`⚠️ Failed to migrate investment ${investment.name}:`, err);
          }
        }
      }

      // Migrate facilities
      if (data.facilities && data.facilities.length > 0) {
        console.log(`Migrating ${data.facilities.length} facilities...`);
        for (const facility of data.facilities) {
          try {
            await DatabaseService.createFacility(facility);
            console.log(`✅ Migrated facility: ${facility.investmentName}`);
          } catch (err) {
            console.warn(`⚠️ Failed to migrate facility ${facility.investmentName}:`, err);
          }
        }
      }

      // Migrate calendar events
      if (data.calendarEvents && data.calendarEvents.length > 0) {
        console.log(`Migrating ${data.calendarEvents.length} calendar events...`);
        for (const event of data.calendarEvents) {
          try {
            await DatabaseService.createCalendarEvent(event);
            console.log(`✅ Migrated calendar event: ${event.title}`);
          } catch (err) {
            console.warn(`⚠️ Failed to migrate calendar event ${event.title}:`, err);
          }
        }
      }

      console.log('🎉 Migration completed successfully!');
    } else {
      console.log('ℹ️ No localStorage data found to migrate');
    }

    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Helper function to check if database is properly configured
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('count')
      .limit(1);

    if (error) {
      return { connected: false, error: error.message };
    }

    return { connected: true, error: null };
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};