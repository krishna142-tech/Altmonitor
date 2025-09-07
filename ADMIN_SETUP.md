# Admin System Setup Guide

This guide explains how to set up and use the hierarchical admin system for Altmonitor.

## 🏗️ Admin Hierarchy

The system supports two levels of admin access:

### 1. **Super Admin** (`super_admin`)
- **Full platform access** - Can manage all data (investments, transactions, facilities, etc.)
- **Admin management** - Can create, update, and delete other admins
- **User management** - Can manage all users in the system
- **System administration** - Full control over the platform

### 2. **Regular Admin** (`admin`)
- **Data management** - Can create, update, and delete all platform data
- **No admin management** - Cannot manage other admins
- **Full data access** - Can view and manage investments, transactions, facilities, etc.

### 3. **Manager** (`manager`)
- **Limited data access** - Can view investments and transactions
- **Calendar management** - Can manage calendar events
- **No data modification** - Cannot create or modify core data

### 4. **Investor** (`investor`)
- **View-only access** - Can only view their own data
- **No admin functions** - Cannot access admin features

## 🔐 Default Credentials

After running the database schema, you'll have these default accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Super Admin | superadmin@altmonitor.com | admin123 | Full access + admin management |
| Admin | admin@altmonitor.com | admin123 | Full data management |
| Manager | manager@altmonitor.com | admin123 | View data + calendar |
| Investor | investor@altmonitor.com | admin123 | View own data only |

## 🚀 Setup Instructions

### 1. Database Setup

First, run the updated database schema:

```sql
-- The schema includes the new admin roles and password hashing
-- Run the entire database-schema.sql file in your Supabase SQL Editor
```

### 2. Environment Variables

Make sure your `.env.local` file has the Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install Dependencies

The system requires bcryptjs for password hashing:

```bash
npm install bcryptjs @types/bcryptjs
```

### 4. Start the Application

```bash
npm run dev
```

## 🎯 How to Use

### 1. **Login as Super Admin**

1. Go to `http://localhost:5173`
2. You'll be redirected to the admin login page
3. Use: `superadmin@altmonitor.com` / `admin123`
4. You'll see the admin dashboard with full access

### 2. **Create New Admins (Super Admin Only)**

1. Login as Super Admin
2. Scroll down to the "Admin Management" section
3. Click "Add New Admin"
4. Fill in the details:
   - **Name**: Admin's full name
   - **Email**: Unique email address
   - **Password**: Secure password
   - **Role**: Choose "Admin" or "Manager"
5. Click "Create Admin"

### 3. **Manage Existing Admins**

As a Super Admin, you can:
- **Edit** admin details (name, email, role, status)
- **Deactivate** admins (set status to inactive)
- **Delete** admins (permanent removal)
- **View** last login times and creation info

### 4. **Role-Based Access**

The system automatically shows/hides features based on user role:

- **Super Admin**: Sees everything + admin management
- **Admin**: Sees all data management features
- **Manager**: Sees limited data views + calendar
- **Investor**: Sees only their own data

## 🔒 Security Features

### Password Security
- All passwords are hashed using bcryptjs
- Default password for all accounts: `admin123`
- **Important**: Change default passwords in production!

### Session Management
- Sessions are stored in localStorage
- Automatic session restoration on page refresh
- Logout clears all session data

### Permission System
- Granular permissions for each feature
- Role-based access control
- Automatic permission checking on all routes

## 📊 Admin Dashboard Features

### For Super Admins:
- **Dashboard Stats**: Portfolio value, investments, transactions
- **Quick Actions**: Add investments, transactions, facilities, events
- **Recent Data**: Latest investments and transactions
- **Admin Management**: Full admin user management interface

### For Regular Admins:
- **Dashboard Stats**: Portfolio value, investments, transactions
- **Quick Actions**: Add investments, transactions, facilities, events
- **Recent Data**: Latest investments and transactions
- **No Admin Management**: Cannot see admin management section

### For Managers:
- **Dashboard Stats**: Portfolio value, investments, transactions
- **Recent Data**: Latest investments and transactions
- **No Quick Actions**: Cannot add new data

## 🛠️ Customization

### Adding New Permissions

1. Update `PERMISSIONS` in `src/lib/auth.ts`:
```typescript
export const PERMISSIONS = {
  // ... existing permissions
  NEW_PERMISSION: 'new_permission'
} as const;
```

2. Add to role permissions in `ROLE_PERMISSIONS`:
```typescript
const ROLE_PERMISSIONS = {
  admin: [
    // ... existing permissions
    PERMISSIONS.NEW_PERMISSION
  ]
};
```

3. Use in components:
```typescript
const { hasPermission } = useAuth();
if (hasPermission('new_permission')) {
  // Show feature
}
```

### Adding New Roles

1. Update the enum in `database-schema.sql`:
```sql
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'investor', 'new_role');
```

2. Add permissions in `src/lib/auth.ts`:
```typescript
const ROLE_PERMISSIONS = {
  new_role: [PERMISSIONS.SOME_PERMISSION]
};
```

## 🔧 Troubleshooting

### Common Issues

1. **"Access Denied" errors**
   - Check if user has the required permission
   - Verify user role in database
   - Ensure user status is 'active'

2. **Login not working**
   - Check Supabase connection
   - Verify email/password combination
   - Check browser console for errors

3. **Admin management not showing**
   - Only Super Admins can see admin management
   - Check user role in database

4. **Data not loading**
   - Check Supabase connection
   - Verify RLS policies
   - Check browser console for errors

### Debug Commands

Open browser console and run:

```javascript
// Check current user
console.log(window.authService?.getCurrentUser());

// Check permissions
console.log(window.authService?.hasPermission('manage_admins'));

// Test Supabase connection
window.testSupabase?.testConnection();
```

## 🚨 Production Considerations

### Security
- Change all default passwords
- Implement proper password policies
- Enable email verification for new admins
- Set up proper RLS policies
- Use HTTPS in production

### Monitoring
- Set up Supabase monitoring
- Log admin actions
- Monitor failed login attempts
- Track permission changes

### Backup
- Regular database backups
- Export admin user data
- Document admin roles and permissions

## 📝 API Reference

### AuthService Methods

```typescript
// Login
AuthService.login({ email, password })

// Logout
AuthService.logout()

// Check permissions
AuthService.hasPermission('permission_name')

// Create admin (Super Admin only)
AuthService.createAdmin({ name, email, password, role })

// Update admin (Super Admin only)
AuthService.updateAdmin(adminId, updates)

// Delete admin (Super Admin only)
AuthService.deleteAdmin(adminId)

// Get all admins (Super Admin only)
AuthService.getAdmins()
```

### React Hooks

```typescript
// Get auth context
const { user, login, logout, hasPermission, isSuperAdmin, isAdmin } = useAuth();

// Get data context
const { investments, addInvestment, loading, error } = useSupabaseData();
```

This admin system provides a complete solution for managing your Altmonitor platform with proper role-based access control and security features.