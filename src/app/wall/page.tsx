import Navbar from "@/components/Navbar";
import WallClient from "@/components/WallClient";
import PageBanner from "@/components/decor/PageBanner";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { PHOTOS } from "@/lib/photos";
import type { UploadRow } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getInitialUploads(): Promise<UploadRow[]> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("uploads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(120);
  if (error) {
    console.error("Failed to load uploads", error.message);
    return [];
  }
  return data ?? [];
}

export default async function WallPage() {
  const initialItems = await getInitialUploads();

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1 pb-tabbar">
        <PageBanner
          photo={PHOTOS.venue2}
          eyebrow="Live from the celebration"
          title="The memory wall"
          
        >
          {/* <span className="glass-dark mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="live-ping absolute inline-flex h-full w-full rounded-full bg-[#5fd3a5]" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#5fd3a5]" />
            </span>
            
          </span> */}
        </PageBanner>
        <WallClient initialItems={initialItems} />
      </main>
    </div>
  );
}
