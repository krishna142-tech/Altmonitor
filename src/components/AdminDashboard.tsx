import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminManagement } from './AdminManagement';
import { useSupabaseData } from '../context/SupabaseDataContext';
import { DebugAuthComponent } from './DebugAuth';
import DatabaseSetup from './DatabaseSetup';
import { LoginDebugger } from './LoginDebugger';

export const AdminDashboard: React.FC = () => {
  const { user, canManageAdmins, canManageData, hasPermission } = useAuth();
  const { 
    investments, 
    transactions, 
    facilities, 
    calendarEvents, 
    dashboardStats, 
    loading 
  } = useSupabaseData();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          You are logged in as <span className="font-medium">{user?.role.replace('_', ' ').toUpperCase()}</span>
        </p>
      </div>

      {/* Dashboard Stats */}
      {hasPermission('view_dashboard') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Portfolio Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${dashboardStats.totalPortfolioValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Investments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.activeInvestments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Transactions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.pendingTransactions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Return Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.returnPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {canManageData() && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hasPermission('manage_investments') && (
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium text-gray-900">Add Investment</div>
                <div className="text-sm text-gray-500">Create new investment</div>
              </button>
            )}
            {hasPermission('manage_transactions') && (
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium text-gray-900">Add Transaction</div>
                <div className="text-sm text-gray-500">Create new transaction</div>
              </button>
            )}
            {hasPermission('manage_facilities') && (
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium text-gray-900">Add Facility</div>
                <div className="text-sm text-gray-500">Create new facility</div>
              </button>
            )}
            {hasPermission('manage_calendar') && (
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium text-gray-900">Add Event</div>
                <div className="text-sm text-gray-500">Schedule new event</div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Investments */}
        {hasPermission('view_investments') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Investments</h2>
            <div className="space-y-3">
              {investments.slice(0, 5).map((investment) => (
                <div key={investment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{investment.name}</div>
                    <div className="text-sm text-gray-500">{investment.type.replace('_', ' ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${investment.currentValue.toLocaleString()}</div>
                    <div className="text-sm text-green-600">+{investment.returnRate}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {hasPermission('view_transactions') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{transaction.deal}</div>
                    <div className="text-sm text-gray-500">{transaction.issuer}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${transaction.amount}</div>
                    <div className={`text-sm ${
                      transaction.status === 'Completed' ? 'text-green-600' : 
                      transaction.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Management - Only for Super Admin */}
      {canManageAdmins() && (
        <AdminManagement />
      )}

      {/* Database Setup Helper - Only show if needed */}
      {!user && <DatabaseSetup />}
    </div>
  );
};