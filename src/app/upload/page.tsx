import Navbar from "@/components/Navbar";
import UploadClient from "@/components/UploadClient";
import PageBanner from "@/components/decor/PageBanner";
import { PHOTOS } from "@/lib/photos";

export default function UploadPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col pb-tabbar">
        <PageBanner
          photo={PHOTOS.detail1}
          eyebrow="Be part of our story"
          title="Share a memory"
        />
        <UploadClient />
      </main>
    </div>
  );
}
