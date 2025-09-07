# Supabase Setup Guide for Altmonitor

This guide will help you set up Supabase as your database backend for the Altmonitor investment tracking platform.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Your Altmonitor project cloned locally

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in to your account
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `altmonitor` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root (same level as `package.json`)
2. Add the following content:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Project URL and anon key from Step 2.

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `database-schema.sql` from this project
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema

This will create all the necessary tables, indexes, and sample data for your application.

## Step 5: Verify the Setup

1. In your Supabase dashboard, go to **Table Editor**
2. You should see the following tables:
   - `investments`
   - `transactions`
   - `users`
   - `calendar_events`
   - `facilities`
3. Each table should have some sample data

## Step 6: Update Your Application

To use Supabase instead of localStorage, you have two options:

### Option A: Use the New Supabase Context (Recommended)

Replace your current DataProvider with the SupabaseDataProvider:

```tsx
// In your main App.tsx or wherever you wrap your app
import { SupabaseDataProvider } from './context/SupabaseDataContext';

// Replace DataProvider with SupabaseDataProvider
<SupabaseDataProvider>
  {/* your app components */}
</SupabaseDataProvider>
```

Then update your components to use the new hook:

```tsx
// Replace useData with useSupabaseData
import { useSupabaseData } from './context/SupabaseDataContext';

const { investments, addInvestment, loading, error } = useSupabaseData();
```

### Option B: Gradually Migrate

You can keep both contexts and gradually migrate components from localStorage to Supabase.

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Open your application in the browser
3. Try creating, updating, and deleting records
4. Check your Supabase dashboard to verify data is being saved

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Make sure your `.env.local` file exists and has the correct values
   - Restart your development server after adding environment variables

2. **Database connection errors**
   - Verify your Project URL and anon key are correct
   - Check that your Supabase project is active (not paused)

3. **Permission denied errors**
   - The schema includes Row Level Security (RLS) policies
   - For development, all operations are allowed
   - For production, you'll need to implement proper authentication

4. **Data not appearing**
   - Check the browser console for errors
   - Verify the database schema was created successfully
   - Make sure you're using the correct context provider

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the browser console for error messages
- Check the Supabase dashboard logs in **Logs** → **API**

## Next Steps

Once you have Supabase working:

1. **Authentication**: Implement user authentication using Supabase Auth
2. **Real-time**: Enable real-time subscriptions for live data updates
3. **Security**: Implement proper RLS policies for production
4. **Backups**: Set up automated backups in Supabase
5. **Monitoring**: Use Supabase's built-in monitoring and analytics

## Production Considerations

- Change the RLS policies to be more restrictive
- Implement proper user authentication
- Set up database backups
- Monitor usage and performance
- Consider upgrading your Supabase plan if needed