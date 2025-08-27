import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export const supabaseAdmin = supabase.auth.admin;
