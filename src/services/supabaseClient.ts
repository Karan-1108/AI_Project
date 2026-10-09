import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Missing Supabase environment variables. " +
    "Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env (local) " +
    "and in Vercel → Settings → Environment Variables (deployed)."
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: false,   // no login system yet — avoid unnecessary warnings
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});