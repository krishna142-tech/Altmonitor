import React, { useState } from 'react';
import { DebugAuth } from '../lib/debugAuth';

export const DebugAuthComponent: React.FC = () => {
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDebugTests = async () => {
    setIsRunning(true);
    setDebugResults([]);
    
    // Override console.log to capture results
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      addResult(args.join(' '));
      originalLog(...args);
    };
    
    console.error = (...args) => {
      addResult(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };

    try {
      await DebugAuth.runAllDebugTests();
    } catch (error) {
      addResult(`FATAL ERROR: ${error}`);
    } finally {
      // Restore console
      console.log = originalLog;
      console.error = originalError;
      setIsRunning(false);
    }
  };

  const testSpecificLogin = async () => {
    setIsRunning(true);
    setDebugResults([]);
    
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      addResult(args.join(' '));
      originalLog(...args);
    };
    
    console.error = (...args) => {
      addResult(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };

    try {
      await DebugAuth.debugLogin('superadmin@altmonitor.com', 'admin123');
    } catch (error) {
      addResult(`FATAL ERROR: ${error}`);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Authentication Debug Tool</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={runDebugTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run All Debug Tests'}
          </button>
          
          <button
            onClick={testSpecificLogin}
            disabled={isRunning}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Super Admin Login
          </button>
          
          <button
            onClick={() => setDebugResults([])}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>

        {debugResults.length > 0 && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-medium mb-2">Debug Results:</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {debugResults.map((result, index) => (
                <div key={index} className={`text-sm font-mono ${
                  result.includes('ERROR') || result.includes('❌') 
                    ? 'text-red-600' 
                    : result.includes('✅') 
                    ? 'text-green-600' 
                    : 'text-gray-700'
                }`}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};