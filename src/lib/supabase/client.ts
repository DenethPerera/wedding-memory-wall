"use client";

import { createClient } from "@supabase/supabase-js";

// Browser client: anon key only. Used for direct-to-storage uploads (signed
// URLs) and for the realtime subscription that powers the live gallery wall.
// It never touches the database with write access directly — inserts happen
// server-side after a signed upload completes, keeping the service role key
// off the client entirely.
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return createClient(url, anonKey, {
    realtime: { params: { eventsPerSecond: 5 } },
  });
}
