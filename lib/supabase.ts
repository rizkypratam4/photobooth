import { createClient } from "@supabase/supabase-js";

// Client untuk frontend (read-only, pakai anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Client untuk API Routes (full access, pakai service role key)
// JANGAN dipakai di komponen frontend
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
