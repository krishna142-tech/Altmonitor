import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminLoginPage } from './AdminLoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string | string[]; // Allow multiple permissions
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  fallback 
}) => {
  const { user, loading, hasPermission, userRole } = useAuth();

  // Check if user has any of the required permissions
  const checkPermissions = (permissions: string | string[]) => {
    if (Array.isArray(permissions)) {
      return permissions.some(permission => hasPermission(permission));
    }
    return hasPermission(permissions);
  };

  // Define role-based permissions for cashflow
  const hasCashflowAccess = () => {
    const cashflowRoles = [
      'SUPER_ADMIN',
      'ADMIN',
      'PORTFOLIO_MANAGER',
      'RISK_MANAGER',
      'ANALYST'
    ];
    return user && cashflowRoles.includes(userRole);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLoginPage />;
  }

  // Check both required permissions and cashflow access
  if (requiredPermission && !checkPermissions(requiredPermission)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">
            {!hasCashflowAccess() 
              ? "You don't have permission to manage cashflow schedules."
              : "You don't have permission to access this page."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};