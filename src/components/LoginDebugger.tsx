import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthService } from '../lib/auth';

export const LoginDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isDebugging, setIsDebugging] = useState(false);

  const debugLogin = async () => {
    setIsDebugging(true);
    setDebugInfo('Starting login debug...\n');

    try {
      // Test 1: Check database connection
      setDebugInfo(prev => prev + '1. Testing database connection...\n');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        setDebugInfo(prev => prev + `❌ Database connection failed: ${connectionError.message}\n`);
        return;
      }
      setDebugInfo(prev => prev + '✅ Database connected\n\n');

      // Test 2: Check if users exist
      setDebugInfo(prev => prev + '2. Checking users in database...\n');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role, password_hash')
        .order('created_at', { ascending: false });

      if (usersError) {
        setDebugInfo(prev => prev + `❌ Error fetching users: ${usersError.message}\n`);
        return;
      }

      if (!users || users.length === 0) {
        setDebugInfo(prev => prev + '❌ No users found in database\n');
        setDebugInfo(prev => prev + 'You need to set up the database first.\n');
        return;
      }

      setDebugInfo(prev => prev + `✅ Found ${users.length} users:\n`);
      users.forEach(user => {
        setDebugInfo(prev => prev + `  - ${user.email} (${user.role})\n`);
      });
      setDebugInfo(prev => prev + '\n');

      // Test 3: Check specific user
      setDebugInfo(prev => prev + '3. Looking for admin@altmonitor.com...\n');
      const adminUser = users.find(u => u.email === 'admin@altmonitor.com');
      
      if (!adminUser) {
        setDebugInfo(prev => prev + '❌ admin@altmonitor.com not found in database\n');
        setDebugInfo(prev => prev + 'Available users:\n');
        users.forEach(user => {
          setDebugInfo(prev => prev + `  - ${user.email}\n`);
        });
        return;
      }

      setDebugInfo(prev => prev + `✅ Found admin user: ${adminUser.name}\n`);
      setDebugInfo(prev => prev + `  Role: ${adminUser.role}\n`);
      setDebugInfo(prev => prev + `  Status: ${adminUser.status || 'unknown'}\n`);
      setDebugInfo(prev => prev + `  Password hash: ${adminUser.password_hash.substring(0, 20)}...\n\n`);

      // Test 4: Test password verification
      setDebugInfo(prev => prev + '4. Testing password verification...\n');
      const testPassword = 'admin123';
      const isValidPassword = AuthService.verifyPassword(testPassword, adminUser.password_hash);
      
      setDebugInfo(prev => prev + `Password '${testPassword}' verification: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}\n`);
      
      if (!isValidPassword) {
        setDebugInfo(prev => prev + `Expected hash: ${adminUser.password_hash}\n`);
        setDebugInfo(prev => prev + `Computed hash: ${AuthService.hashPassword(testPassword)}\n`);
      }
      setDebugInfo(prev => prev + '\n');

      // Test 5: Try actual login
      setDebugInfo(prev => prev + '5. Testing actual login...\n');
      const loginResult = await AuthService.login({
        email: 'admin@altmonitor.com',
        password: 'admin123'
      });

      setDebugInfo(prev => prev + `Login result: ${loginResult.success ? '✅ Success' : '❌ Failed'}\n`);
      if (!loginResult.success) {
        setDebugInfo(prev => prev + `Error: ${loginResult.error}\n`);
      }

    } catch (error) {
      setDebugInfo(prev => prev + `❌ Debug error: ${error}\n`);
    } finally {
      setIsDebugging(false);
    }
  };

  const createAdminUser = async () => {
    setIsDebugging(true);
    setDebugInfo('Creating admin user...\n');

    try {
      const adminUser = {
        name: 'Admin User',
        email: 'admin@altmonitor.com',
        password_hash: AuthService.hashPassword('admin123'),
        role: 'admin',
        status: 'active'
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(adminUser, { onConflict: 'email' });

      if (error) {
        setDebugInfo(prev => prev + `❌ Error creating user: ${error.message}\n`);
      } else {
        setDebugInfo(prev => prev + '✅ Admin user created successfully!\n');
        setDebugInfo(prev => prev + 'You can now try logging in with admin@altmonitor.com / admin123\n');
      }
    } catch (error) {
      setDebugInfo(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Login Debugger</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={debugLogin}
            disabled={isDebugging}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isDebugging ? 'Debugging...' : 'Debug Login'}
          </button>
          
          <button
            onClick={createAdminUser}
            disabled={isDebugging}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Create Admin User
          </button>
          
          <button
            onClick={() => setDebugInfo('')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear
          </button>
        </div>

        {debugInfo && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-medium mb-2">Debug Results:</h3>
            <pre className="text-sm whitespace-pre-wrap font-mono">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  );
};