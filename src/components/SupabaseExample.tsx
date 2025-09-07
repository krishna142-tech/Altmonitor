import React, { useState } from 'react';
import { useSupabaseData } from '../context/SupabaseDataContext';
import { useAuth } from '../context/AuthContext';
import { MigrationService } from '../lib/migrateToSupabase';
import { AuthTest } from '../lib/testAuth';

/**
 * Example component demonstrating Supabase integration
 * This shows how to use the new SupabaseDataContext
 */
export const SupabaseExample: React.FC = () => {
  const { 
    investments, 
    addInvestment, 
    loading, 
    error, 
    refreshData 
  } = useSupabaseData();
  
  const { user, logout } = useAuth();
  
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus('Starting migration...');
    
    try {
      if (!MigrationService.hasLocalStorageData()) {
        setMigrationStatus('No localStorage data found to migrate');
        return;
      }

      // Create backup
      setMigrationStatus('Creating backup...');
      MigrationService.createBackup();
      
      // Run migration
      setMigrationStatus('Migrating data to Supabase...');
      const result = await MigrationService.migrateToSupabase();
      
      if (result.success) {
        setMigrationStatus(`Migration successful! Migrated: ${JSON.stringify(result.migrated)}`);
        // Refresh data to show migrated records
        await refreshData();
      } else {
        setMigrationStatus(`Migration completed with errors: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      setMigrationStatus(`Migration failed: ${error}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleAddSampleInvestment = async () => {
    try {
      await addInvestment({
        name: 'Sample Supabase Investment',
        type: 'private_equity',
        amount: 100000,
        currentValue: 120000,
        returnRate: 20,
        status: 'active',
        dateInvested: new Date().toISOString().split('T')[0],
        description: 'This is a test investment created via Supabase',
        riskLevel: 'medium'
      });
    } catch (error) {
      console.error('Failed to add investment:', error);
    }
  };

  const handleTestAuth = async () => {
    try {
      await AuthTest.runAllTests();
    } catch (error) {
      console.error('Auth test failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Supabase Integration</h2>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading data from Supabase...</span>
        </div>
      </div>
    );
  }

  return (
      <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Supabase Integration Example</h2>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Logged in as: <strong>{user.name}</strong> ({user.role})
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Current Investments ({investments.length})</h3>
          <div className="space-y-2">
            {investments.map((investment) => (
              <div key={investment.id} className="p-3 bg-gray-50 rounded border">
                <div className="font-medium">{investment.name}</div>
                <div className="text-sm text-gray-600">
                  {investment.type} • ${investment.amount.toLocaleString()} • {investment.returnRate}% return
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleAddSampleInvestment}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Sample Investment
          </button>
          
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh Data
          </button>
          
          <button
            onClick={handleTestAuth}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Auth
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Migration from localStorage</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you have existing data in localStorage, you can migrate it to Supabase.
        </p>
        
        <div className="space-y-2">
          <button
            onClick={handleMigration}
            disabled={isMigrating}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isMigrating ? 'Migrating...' : 'Migrate from localStorage'}
          </button>
          
          {migrationStatus && (
            <div className="p-3 bg-gray-100 rounded text-sm">
              {migrationStatus}
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Setup Instructions</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>1. Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com</a></p>
          <p>2. Copy your Project URL and anon key</p>
          <p>3. Create a <code className="bg-gray-200 px-1 rounded">.env.local</code> file with:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs">
{`VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
          </pre>
          <p>4. Run the SQL schema from <code className="bg-gray-200 px-1 rounded">database-schema.sql</code></p>
          <p>5. Restart your development server</p>
        </div>
      </div>
    </div>
  );
};