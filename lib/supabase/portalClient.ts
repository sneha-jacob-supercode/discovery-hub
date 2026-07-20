import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — check .env.local"
  );
}

// Plain anon-key client with no Supabase Auth session at all — used only by
// the app/api/client-portal/* route handlers to call the client_portal_*
// RPCs. Every RPC except client_portal_verify_email requires a valid
// HMAC-signed token as an argument and re-verifies it itself, so this
// client carries no more trust than a public browser tab would.
export const portalSupabase = createClient(supabaseUrl, supabaseAnonKey);
