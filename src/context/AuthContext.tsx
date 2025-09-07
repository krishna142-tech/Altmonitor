import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, type AdminUser, type LoginCredentials, type AuthContextType } from '../lib/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const restored = await AuthService.restoreSession();
        if (restored) {
          setUser(AuthService.getCurrentUser());
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const unsubscribe = AuthService.subscribe((currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await AuthService.login(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
        return true;
      } else {
        console.error('Login failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    return AuthService.hasPermission(permission);
  };

  const isSuperAdmin = (): boolean => {
    return AuthService.isSuperAdmin();
  };

  const isAdmin = (): boolean => {
    return AuthService.isAdmin();
  };

  const canManageAdmins = (): boolean => {
    return AuthService.canManageAdmins();
  };

  const canManageData = (): boolean => {
    return AuthService.canManageData();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isSuperAdmin,
    isAdmin,
    canManageAdmins,
    canManageData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};