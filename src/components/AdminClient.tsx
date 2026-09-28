"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  HardDrive,
  Heart,
  ImageIcon,
  Loader2,
  Mic,
  Package,
  Video,
} from "lucide-react";
import { getMediaUrl } from "@/lib/media-url";
import { cn, formatBytes } from "@/lib/utils";
import AuroraBackground from "@/components/decor/AuroraBackground";
import { timeAgo } from "@/lib/time-ago";
import type { MediaType, UploadRow } from "@/lib/types";

const FILTERS: { key: "all" | MediaType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "photo", label: "Photos" },
  { key: "video", label: "Videos" },
  { key: "voice", label: "Voice notes" },
];

export default function AdminClient({ initialItems }: { initialItems: UploadRow[] }) {
  const [filter, setFilter] = useState<"all" | MediaType>("all");
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState({ done: 0, total: 0 });

  const stats = useMemo(() => {
    const totalBytes = initialItems.reduce((sum, i) => sum + i.size_bytes, 0);
    return {
      total: initialItems.length,
      photos: initialItems.filter((i) => i.media_type === "photo").length,
      videos: initialItems.filter((i) => i.media_type === "video").length,
      voice: initialItems.filter((i) => i.media_type === "voice").length,
      totalBytes,
    };
  }, [initialItems]);

  const filtered = useMemo(
    () => (filter === "all" ? initialItems : initialItems.filter((i) => i.media_type === filter)),
    [initialItems, filter],
  );

  async function downloadZip() {
    setZipping(true);
    setZipProgress({ done: 0, total: filtered.length });
    try {
      const { default: JSZip } = await import("jszip");
      const { saveAs } = await import("file-saver");
      const zip = new JSZip();
      let done = 0;
      const usedNames = new Set<string>();

      for (const item of filtered) {
        const res = await fetch(getMediaUrl(item.storage_path));
        const blob = await res.blob();
        let name = `${item.media_type}-${item.id.slice(0, 8)}-${item.file_name}`;
        let suffix = 1;
        while (usedNames.has(name)) {
          name = `${item.media_type}-${item.id.slice(0, 8)}-${suffix}-${item.file_name}`;
          suffix += 1;
        }
        usedNames.add(name);
        zip.file(name, blob);
        done += 1;
        setZipProgress({ done, total: filtered.length });
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `wedding-memories-${filter}.zip`);
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <AuroraBackground className="-z-10 opacity-70" />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-12 pt-[calc(1.5rem+env(safe-area-inset-top))]">
        <header className="relative overflow-hidden rounded-[2rem] bg-brand px-6 py-8 text-primary-foreground shadow-glow">
          <Heart
            size={120}
            fill="currentColor"
            className="absolute -right-6 -top-6 text-primary-foreground/10"
            aria-hidden="true"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/85">Just for the two of you</p>
          <h1 className="mt-1 font-script text-5xl">Couple&rsquo;s dashboard</h1>
          <p className="mt-1 text-base text-primary-foreground/90">Everything guests have shared, in one place.</p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} icon={Package} />
          <StatCard label="Photos" value={stats.photos} icon={ImageIcon} />
          <StatCard label="Videos" value={stats.videos} icon={Video} />
          <StatCard label="Voice notes" value={stats.voice} icon={Mic} />
        </div>
        <p className="-mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <HardDrive size={14} aria-hidden="true" />
          Total storage used: {formatBytes(stats.totalBytes)}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Filter memories" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "relative h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
                    active ? "border-transparent text-primary-foreground" : "border-border bg-card text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-filter"
                      className="absolute inset-0 rounded-full bg-brand"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{f.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={downloadZip}
            disabled={zipping || filtered.length === 0}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-sm font-semibold text-primary-foreground shadow-glow transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {zipping ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Zipping {zipProgress.done}/{zipProgress.total}
              </>
            ) : (
              <>
                <Download size={16} aria-hidden="true" />
                Download all as ZIP
              </>
            )}
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border bg-card/70 py-14 text-center text-base text-muted-foreground">
            Nothing shared here yet.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.03 }}
                className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
              >
                <div className="flex aspect-square items-center justify-center bg-muted">
                  {item.media_type === "photo" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getMediaUrl(item.storage_path)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : item.media_type === "video" ? (
                    <Video size={28} className="text-gold-ink" aria-hidden="true" />
                  ) : (
                    <Mic size={28} className="text-gold-ink" aria-hidden="true" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.guest_name ?? "A guest"}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</p>
                  </div>
                  <a
                    href={getMediaUrl(item.storage_path)}
                    download={item.file_name}
                    aria-label={`Download ${item.file_name}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-gold-ink transition active:scale-90"
                  >
                    <Download size={18} aria-hidden="true" />
                  </a>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Package;
}) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-primary-foreground">
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-2xl font-semibold leading-none text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
