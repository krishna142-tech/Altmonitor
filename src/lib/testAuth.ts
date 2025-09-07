/**
 * Test authentication functions
 * Run these in the browser console to test auth functionality
 */

import { AuthService } from './auth';

export class AuthTest {
  /**
   * Test password hashing and verification
   */
  static testPasswordHashing(): boolean {
    try {
      const password = 'admin123';
      const hash = AuthService.hashPassword(password);
      const isValid = AuthService.verifyPassword(password, hash);
      
      console.log('Password:', password);
      console.log('Hash:', hash);
      console.log('Verification:', isValid);
      
      return isValid;
    } catch (error) {
      console.error('Password hashing test failed:', error);
      return false;
    }
  }

  /**
   * Test login with default credentials
   */
  static async testLogin(): Promise<boolean> {
    try {
      console.log('Testing login with superadmin@altmonitor.com...');
      const result = await AuthService.login({
        email: 'superadmin@altmonitor.com',
        password: 'admin123'
      });
      
      console.log('Login result:', result);
      return result.success;
    } catch (error) {
      console.error('Login test failed:', error);
      return false;
    }
  }

  /**
   * Test all auth functions
   */
  static async runAllTests(): Promise<void> {
    console.log('🧪 Starting authentication tests...\n');

    // Test password hashing
    console.log('1. Testing password hashing...');
    const hashTest = this.testPasswordHashing();
    console.log(hashTest ? '✅ Password hashing works' : '❌ Password hashing failed');

    // Test login
    console.log('\n2. Testing login...');
    const loginTest = await this.testLogin();
    console.log(loginTest ? '✅ Login works' : '❌ Login failed');

    // Test current user
    console.log('\n3. Testing current user...');
    const currentUser = AuthService.getCurrentUser();
    console.log('Current user:', currentUser);

    // Test permissions
    if (currentUser) {
      console.log('\n4. Testing permissions...');
      console.log('Is Super Admin:', AuthService.isSuperAdmin());
      console.log('Is Admin:', AuthService.isAdmin());
      console.log('Can manage admins:', AuthService.canManageAdmins());
      console.log('Can manage data:', AuthService.canManageData());
    }

    console.log('\n📊 Auth tests completed!');
  }
}

// Make test functions available globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).testAuth = AuthTest;
  (window as any).runAuthTests = () => AuthTest.runAllTests();
}