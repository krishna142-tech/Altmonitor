/**
 * Debug authentication issues
 * Run these functions in browser console to debug auth problems
 */

import { supabase } from './supabase';
import { AuthService } from './auth';

export class DebugAuth {
  /**
   * Check if Supabase connection is working
   */
  static async testSupabaseConnection(): Promise<boolean> {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
        return false;
      }
      
      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
  }

  /**
   * Check if users exist in database
   */
  static async checkUsersInDatabase(): Promise<void> {
    try {
      console.log('Checking users in database...');
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, password_hash')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      console.log('Users in database:', data);
      
      if (data.length === 0) {
        console.log('❌ No users found in database. You need to run the database schema.');
      } else {
        console.log(`✅ Found ${data.length} users in database`);
      }
    } catch (error) {
      console.error('Error checking users:', error);
    }
  }

  /**
   * Test password hashing with different methods
   */
  static testPasswordHashing(): void {
    console.log('Testing password hashing...');
    
    const password = 'admin123';
    const salt = 'altmonitor_salt';
    
    // Test current method
    const currentHash = AuthService.hashPassword(password);
    console.log('Current method hash:', currentHash);
    
    // Test verification
    const isValid = AuthService.verifyPassword(password, currentHash);
    console.log('Password verification:', isValid);
    
    // Test with the expected hash from database
    const expectedHash = '1306ab84619603913b539e4305e651e245d90372973e239cfc21d897ff231fba';
    const matchesExpected = AuthService.verifyPassword(password, expectedHash);
    console.log('Matches expected hash:', matchesExpected);
  }

  /**
   * Try to find a specific user by email
   */
  static async findUserByEmail(email: string): Promise<void> {
    try {
      console.log(`Looking for user with email: ${email}`);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error finding user:', error);
        return;
      }

      console.log('User found:', data);
      
      // Test password with this user's hash
      const password = 'admin123';
      const isValid = AuthService.verifyPassword(password, data.password_hash);
      console.log('Password verification for this user:', isValid);
      
    } catch (error) {
      console.error('Error finding user:', error);
    }
  }

  /**
   * Test login step by step
   */
  static async debugLogin(email: string, password: string): Promise<void> {
    console.log(`Debugging login for: ${email}`);
    
    try {
      // Step 1: Check if user exists
      console.log('Step 1: Checking if user exists...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .single();

      if (userError) {
        console.error('User not found or inactive:', userError);
        return;
      }

      console.log('User found:', userData);

      // Step 2: Test password verification
      console.log('Step 2: Testing password verification...');
      const isValidPassword = AuthService.verifyPassword(password, userData.password_hash);
      console.log('Password valid:', isValidPassword);

      if (!isValidPassword) {
        console.log('Password hash in database:', userData.password_hash);
        console.log('Expected hash for this password:', AuthService.hashPassword(password));
      }

      // Step 3: Test full login
      console.log('Step 3: Testing full login...');
      const result = await AuthService.login({ email, password });
      console.log('Login result:', result);

    } catch (error) {
      console.error('Debug login error:', error);
    }
  }

  /**
   * Run all debug tests
   */
  static async runAllDebugTests(): Promise<void> {
    console.log('🔍 Starting authentication debug tests...\n');

    // Test 1: Supabase connection
    console.log('1. Testing Supabase connection...');
    const connectionOk = await this.testSupabaseConnection();
    
    if (!connectionOk) {
      console.log('❌ Supabase connection failed. Check your environment variables.');
      return;
    }

    // Test 2: Check users in database
    console.log('\n2. Checking users in database...');
    await this.checkUsersInDatabase();

    // Test 3: Test password hashing
    console.log('\n3. Testing password hashing...');
    this.testPasswordHashing();

    // Test 4: Find specific user
    console.log('\n4. Looking for superadmin user...');
    await this.findUserByEmail('superadmin@altmonitor.com');

    // Test 5: Debug login
    console.log('\n5. Debugging login...');
    await this.debugLogin('superadmin@altmonitor.com', 'admin123');

    console.log('\n📊 Debug tests completed!');
  }
}

// Make debug functions available globally
if (typeof window !== 'undefined') {
  (window as any).debugAuth = DebugAuth;
  (window as any).runDebugTests = () => DebugAuth.runAllDebugTests();
}