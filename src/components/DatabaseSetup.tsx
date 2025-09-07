import React, { useState } from 'react';

const DatabaseSetup = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setError('Please enter both Supabase URL and API Key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/transactions?select=count`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsConnected(true);
        localStorage.setItem('supabase_url', supabaseUrl);
        localStorage.setItem('supabase_key', supabaseKey);
        setError('');
      } else {
        setError('Failed to connect. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection failed. Please check your URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Database Setup</h2>
          <p className="text-gray-600 mb-6">
            Configure your Supabase database connection to enable data persistence
          </p>

          {!isConnected ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supabase API Key
                  </label>
                  <input
                    type="password"
                    placeholder="your-anon-key-here"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              <button
                onClick={testConnection}
                disabled={isLoading}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Testing Connection...' : 'Test Connection'}
              </button>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Setup Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> and create a new project</li>
                  <li>Go to Settings → API in your Supabase dashboard</li>
                  <li>Copy the Project URL and anon public key</li>
                  <li>Paste them in the fields above and click "Test Connection"</li>
                  <li>Once connected, your data will be saved to the database</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-md">
              <span className="text-green-700 font-medium">
                Database connected successfully! Your data will now be saved to Supabase.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;