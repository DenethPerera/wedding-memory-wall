import AdminClient from "@/components/AdminClient";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type { UploadRow } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getAllUploads(): Promise<UploadRow[]> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("uploads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load uploads for admin", error.message);
    return [];
  }
  return data ?? [];
}

export default async function AdminPage() {
  const items = await getAllUploads();
  return <AdminClient initialItems={items} />;
}
