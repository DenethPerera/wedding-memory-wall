import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key. Never import this from a
// "use client" file or a component tree that could bundle it for the
// browser -- the `server-only` import makes that a build error.
export function createServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
