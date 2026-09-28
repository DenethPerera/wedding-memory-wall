import { STORAGE_BUCKET } from "@/lib/event-config";

// Pure URL construction -- safe to call from Server or Client Components
// without spinning up a Supabase client. The bucket is public-read (see
// supabase/schema.sql); access to the *site* is still gated by the PIN.
export function getMediaUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}
