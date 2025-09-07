import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const QuickDatabaseSetup: React.FC = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [status, setStatus] = useState<string>('');

  const setupDatabase = async () => {
    setIsSettingUp(true);
    setStatus('Setting up database...');

    try {
      // Step 1: Create users table
      setStatus('Creating users table...');
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'investor',
            status TEXT NOT NULL DEFAULT 'active',
            last_login TIMESTAMP WITH TIME ZONE,
            created_by UUID REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (createError) {
        setStatus(`Error creating table: ${createError.message}`);
        return;
      }

      setStatus('Table created successfully. Inserting users...');

      // Step 2: Insert users
      const users = [
        {
          name: 'Super Admin',
          email: 'superadmin@altmonitor.com',
          password_hash: '1306ab84619603913b539e4305e651e245d90372973e239cfc21d897ff231fba',
          role: 'super_admin',
          status: 'active'
        },
        {
          name: 'Admin User',
          email: 'admin@altmonitor.com',
          password_hash: '1306ab84619603913b539e4305e651e245d90372973e239cfc21d897ff231fba',
          role: 'admin',
          status: 'active'
        },
        {
          name: 'Portfolio Manager',
          email: 'manager@altmonitor.com',
          password_hash: '1306ab84619603913b539e4305e651e245d90372973e239cfc21d897ff231fba',
          role: 'manager',
          status: 'active'
        },
        {
          name: 'Investor User',
          email: 'investor@altmonitor.com',
          password_hash: '1306ab84619603913b539e4305e651e245d90372973e239cfc21d897ff231fba',
          role: 'investor',
          status: 'active'
        }
      ];

      for (const user of users) {
        const { error: insertError } = await supabase
          .from('users')
          .upsert(user, { onConflict: 'email' });

        if (insertError) {
          setStatus(`Error inserting user ${user.email}: ${insertError.message}`);
          return;
        }
      }

      setStatus('✅ Database setup completed! You can now login with superadmin@altmonitor.com / admin123');
      
    } catch (error) {
      setStatus(`Setup failed: ${error}`);
    } finally {
      setIsSettingUp(false);
    }
  };

  const testConnection = async () => {
    try {
      setStatus('Testing database connection...');
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        setStatus(`❌ Connection failed: ${error.message}`);
      } else {
        setStatus('✅ Database connection successful');
      }
    } catch (error) {
      setStatus(`❌ Connection test failed: ${error}`);
    }
  };

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">Database Setup Required</h3>
      
      <div className="space-y-4">
        <p className="text-yellow-700">
          The database needs to be set up before you can use the admin system. 
          Click the button below to automatically set up the database.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Connection
          </button>
          
          <button
            onClick={setupDatabase}
            disabled={isSettingUp}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSettingUp ? 'Setting up...' : 'Setup Database'}
          </button>
        </div>

        {status && (
          <div className="p-3 bg-white rounded border">
            <pre className="text-sm whitespace-pre-wrap">{status}</pre>
          </div>
        )}

        <div className="text-sm text-yellow-600">
          <p><strong>Note:</strong> If automatic setup doesn't work, you can manually run the SQL commands in your Supabase dashboard.</p>
        </div>
      </div>
    </div>
  );
};