// Supabase Configuration
// Copy these values to your .env.local file:
// VITE_SUPABASE_URL=your_supabase_project_url_here
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || 'https://your-project.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key') || 'your-anon-key-here'
}

// Debug logging
console.log('Supabase Config:', {
  url: SUPABASE_CONFIG.url,
  anonKey: SUPABASE_CONFIG.anonKey.substring(0, 10) + '...',
  hasEnvUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasEnvKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  hasLocalUrl: !!localStorage.getItem('supabase_url'),
  hasLocalKey: !!localStorage.getItem('supabase_key')
});

// Instructions for setup:
// 1. Go to https://supabase.com and create a new project
// 2. Go to Settings > API in your Supabase dashboard
// 3. Copy the Project URL and anon public key
// 4. Create a .env.local file in your project root
// 5. Add the environment variables as shown above