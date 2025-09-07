import { supabase } from './supabase';
import CryptoJS from 'crypto-js';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'investor';
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  canManageAdmins: () => boolean;
  canManageData: () => boolean;
}

// Permission definitions
export const PERMISSIONS = {
  // Super Admin permissions
  MANAGE_ADMINS: 'manage_admins',
  MANAGE_USERS: 'manage_users',
  VIEW_ALL_DATA: 'view_all_data',
  MANAGE_ALL_DATA: 'manage_all_data',
  
  // Admin permissions
  MANAGE_INVESTMENTS: 'manage_investments',
  MANAGE_TRANSACTIONS: 'manage_transactions',
  MANAGE_FACILITIES: 'manage_facilities',
  MANAGE_CALENDAR: 'manage_calendar',
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Manager permissions
  VIEW_INVESTMENTS: 'view_investments',
  VIEW_TRANSACTIONS: 'view_transactions',
  MANAGE_CALENDAR: 'manage_calendar',
  
  // Investor permissions
  VIEW_OWN_DATA: 'view_own_data'
} as const;

// Role-based permission mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    PERMISSIONS.MANAGE_ADMINS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ALL_DATA,
    PERMISSIONS.MANAGE_ALL_DATA,
    PERMISSIONS.MANAGE_INVESTMENTS,
    PERMISSIONS.MANAGE_TRANSACTIONS,
    PERMISSIONS.MANAGE_FACILITIES,
    PERMISSIONS.MANAGE_CALENDAR,
    PERMISSIONS.VIEW_DASHBOARD
  ],
  admin: [
    PERMISSIONS.MANAGE_INVESTMENTS,
    PERMISSIONS.MANAGE_TRANSACTIONS,
    PERMISSIONS.MANAGE_FACILITIES,
    PERMISSIONS.MANAGE_CALENDAR,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ALL_DATA
  ],
  manager: [
    PERMISSIONS.VIEW_INVESTMENTS,
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.MANAGE_CALENDAR,
    PERMISSIONS.VIEW_DASHBOARD
  ],
  investor: [
    PERMISSIONS.VIEW_OWN_DATA
  ]
};

export class AuthService {
  private static currentUser: AdminUser | null = null;
  private static listeners: Array<(user: AdminUser | null) => void> = [];

  /**
   * Subscribe to auth state changes
   */
  static subscribe(listener: (user: AdminUser | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of auth state changes
   */
  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  /**
   * Get current user
   */
  static getCurrentUser(): AdminUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Login with email and password
   */
  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const { email, password } = credentials;

      console.log('Attempting login for:', email);

      // First, try to get user from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .single();

      console.log('Database query result:', { userData, error });

      if (error) {
        console.log('Database error:', error);
        // If table doesn't exist or no users, create a temporary super admin
        if (error.code === 'PGRST116' || error.message.includes('relation "users" does not exist')) {
          console.log('Users table not found, creating temporary super admin');
          return this.createTemporarySuperAdmin(email, password);
        }
        return { success: false, error: `Database error: ${error.message}` };
      }

      if (!userData) {
        console.log('No user found in database');
        return { success: false, error: 'Invalid email or password' };
      }

      console.log('User found in database:', userData);

      // Verify password
      const isValidPassword = this.verifyPassword(password, userData.password_hash);
      console.log('Password verification result:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('Password verification failed');
        console.log('Expected hash:', userData.password_hash);
        console.log('Computed hash:', this.hashPassword(password));
        return { success: false, error: 'Invalid email or password' };
      }

      // Convert to AdminUser format
      const user: AdminUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        lastLogin: userData.last_login,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        createdBy: userData.created_by
      };

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Set current user
      this.currentUser = user;
      this.notifyListeners();

      // Store in localStorage for persistence
      localStorage.setItem('altmonitor_admin', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: `Login failed: ${error}` };
    }
  }

  /**
   * Create a temporary super admin if database is not set up
   */
  private static createTemporarySuperAdmin(email: string, password: string): { success: boolean; user?: AdminUser; error?: string } {
    // Allow both superadmin and admin for temporary access
    if ((email === 'superadmin@altmonitor.com' || email === 'admin@altmonitor.com') && password === 'admin123') {
      const tempUser: AdminUser = {
        id: 'temp-super-admin',
        name: email === 'superadmin@altmonitor.com' ? 'Super Admin (Temporary)' : 'Admin (Temporary)',
        email: email,
        role: 'super_admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.currentUser = tempUser;
      this.notifyListeners();
      localStorage.setItem('altmonitor_admin', JSON.stringify(tempUser));

      return { success: true, user: tempUser };
    }

    return { success: false, error: 'Invalid email or password' };
  }

  /**
   * Logout current user
   */
  static logout(): void {
    this.currentUser = null;
    this.notifyListeners();
    localStorage.removeItem('altmonitor_admin');
  }

  /**
   * Restore session from localStorage
   */
  static async restoreSession(): Promise<boolean> {
    try {
      const stored = localStorage.getItem('altmonitor_admin');
      if (!stored) return false;

      const user: AdminUser = JSON.parse(stored);
      
      // Verify user still exists and is active
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .eq('status', 'active')
        .single();

      if (error || !userData) {
        this.logout();
        return false;
      }

      this.currentUser = user;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Session restore error:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    
    const userPermissions = ROLE_PERMISSIONS[this.currentUser.role] || [];
    return userPermissions.includes(permission);
  }

  /**
   * Check if user is super admin
   */
  static isSuperAdmin(): boolean {
    return this.currentUser?.role === 'super_admin';
  }

  /**
   * Check if user is admin or super admin
   */
  static isAdmin(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'super_admin';
  }

  /**
   * Check if user can manage other admins
   */
  static canManageAdmins(): boolean {
    return this.hasPermission(PERMISSIONS.MANAGE_ADMINS);
  }

  /**
   * Check if user can manage platform data
   */
  static canManageData(): boolean {
    return this.hasPermission(PERMISSIONS.MANAGE_ALL_DATA) || 
           this.hasPermission(PERMISSIONS.MANAGE_INVESTMENTS) ||
           this.hasPermission(PERMISSIONS.MANAGE_TRANSACTIONS) ||
           this.hasPermission(PERMISSIONS.MANAGE_FACILITIES);
  }

  /**
   * Hash password for storage
   */
  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password + 'altmonitor_salt').toString();
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string): boolean {
    const hashedPassword = this.hashPassword(password);
    return hashedPassword === hash;
  }

  /**
   * Create new admin user (Super Admin only)
   */
  static async createAdmin(adminData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'manager';
  }): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    if (!this.canManageAdmins()) {
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      const hashedPassword = this.hashPassword(adminData.password);

      const { data, error } = await supabase
        .from('users')
        .insert({
          name: adminData.name,
          email: adminData.email,
          password_hash: hashedPassword,
          role: adminData.role,
          status: 'active',
          created_by: this.currentUser?.id
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const newAdmin: AdminUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by
      };

      return { success: true, user: newAdmin };
    } catch (error) {
      console.error('Create admin error:', error);
      return { success: false, error: 'Failed to create admin' };
    }
  }

  /**
   * Update admin user (Super Admin only)
   */
  static async updateAdmin(
    adminId: string, 
    updates: {
      name?: string;
      email?: string;
      role?: 'admin' | 'manager';
      status?: 'active' | 'inactive';
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.canManageAdmins()) {
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', adminId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Update admin error:', error);
      return { success: false, error: 'Failed to update admin' };
    }
  }

  /**
   * Delete admin user (Super Admin only)
   */
  static async deleteAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.canManageAdmins()) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Prevent deleting self
    if (this.currentUser?.id === adminId) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', adminId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete admin error:', error);
      return { success: false, error: 'Failed to delete admin' };
    }
  }

  /**
   * Get all admins (Super Admin only)
   */
  static async getAdmins(): Promise<AdminUser[]> {
    if (!this.canManageAdmins()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['super_admin', 'admin', 'manager'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get admins error:', error);
        return [];
      }

      return data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        createdBy: user.created_by
      }));
    } catch (error) {
      console.error('Get admins error:', error);
      return [];
    }
  }
}