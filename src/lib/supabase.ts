import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';

// This client is for public/client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This client is for admin/server-side use ONLY
export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) throw new Error("Missing Supabase Service Key");
  return createClient(supabaseUrl, supabaseServiceKey);
};
