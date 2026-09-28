"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, Heart, ImageIcon, Mic, Play, Sparkles, Video } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getMediaUrl } from "@/lib/media-url";
import { timeAgo } from "@/lib/time-ago";
import { cn } from "@/lib/utils";
import { COUPLE_STRIP, PHOTOS } from "@/lib/photos";
import type { MediaType, UploadRow } from "@/lib/types";
import Lightbox, { type LightboxMedia } from "@/components/Lightbox";

const FILTERS: { key: "all" | MediaType; label: string; icon: typeof ImageIcon }[] = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "photo", label: "Photos", icon: ImageIcon },
  { key: "video", label: "Videos", icon: Video },
  { key: "voice", label: "Voice notes", icon: Mic },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export default function WallClient({ initialItems }: { initialItems: UploadRow[] }) {
  const [items, setItems] = useState<UploadRow[]>(initialItems);
  const [filter, setFilter] = useState<"all" | MediaType>("all");
  const [lightbox, setLightbox] = useState<LightboxMedia | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const seenIds = useRef(new Set(initialItems.map((i) => i.id)));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel("uploads-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "uploads" },
        (payload) => {
          const row = payload.new as UploadRow;
          if (seenIds.current.has(row.id)) return;
          seenIds.current.add(row.id);
          setItems((prev) => [row, ...prev]);
          setToast(`New memory from ${row.guest_name ?? "a guest"}`);
          if (toastTimer.current) clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(() => setToast(null), 4000);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const counts = useMemo(
    () => ({
      all: items.length,
      photo: items.filter((i) => i.media_type === "photo").length,
      video: items.filter((i) => i.media_type === "video").length,
      voice: items.filter((i) => i.media_type === "voice").length,
    }),
    [items],
  );

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.media_type === filter)),
    [items, filter],
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);

  return (
    <div className="flex flex-col gap-8 py-8">
      {/* ---------- From the couple ---------- */}
      <section aria-labelledby="couple-strip-title">
        <div className="mx-auto flex w-full max-w-5xl items-end justify-between px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-ink">
              From the couple
            </p>
            <h2 id="couple-strip-title" className="font-display text-2xl font-semibold text-foreground">
              Our favourite frames
            </h2>
          </div>
          <p className="text-sm text-muted-foreground" aria-hidden="true">
            Swipe &rarr;
          </p>
        </div>
        <ul className="no-scrollbar mx-auto mt-4 flex max-w-5xl snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3">
          {COUPLE_STRIP.map((photo, i) => (
            <li key={i} className="snap-start">
              <motion.button
                type="button"
                onClick={() =>
                  setLightbox({ type: "photo", url: photo.src.src, alt: photo.alt, credit: photo.caption })
                }
                aria-label={`View photo: ${photo.alt}`}
                className="group relative block h-60 w-44 overflow-hidden rounded-3xl shadow-soft sm:h-72 sm:w-56"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
                whileTap={{ scale: 0.97 }}
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  placeholder="blur"
                  sizes="(min-width: 640px) 224px, 176px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1f2933]/80 to-transparent px-3 pb-3 pt-10 text-left font-script text-3xl text-white">
                  {photo.caption}
                </span>
              </motion.button>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Guest memories ---------- */}
      <section aria-labelledby="guest-title" className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-ink">From our guests</p>
          <h2 id="guest-title" className="font-display text-2xl font-semibold text-foreground">
            Shared with love
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Filter memories"
          className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1"
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "relative flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                  active
                    ? "border-transparent text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/40",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="wall-filter"
                    className="absolute inset-0 rounded-full bg-brand shadow-glow"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={16} className="relative" aria-hidden="true" />
                <span className="relative">{f.label}</span>
                <span
                  className={cn(
                    "relative rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-primary-foreground/15" : "bg-muted text-muted-foreground",
                  )}
                >
                  {counts[f.key]}
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <EmptyState filtered={filter !== "all"} />
        ) : (
          <div key={filter} className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
            <AnimatePresence initial={false}>
              {filtered.map((item, i) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  index={i}
                  onOpen={() =>
                    setLightbox({
                      type: item.media_type === "video" ? "video" : "photo",
                      url: getMediaUrl(item.storage_path),
                      alt: item.caption ?? `Photo from ${item.guest_name ?? "a guest"}`,
                      credit: `Shared by ${item.guest_name ?? "a guest"}`,
                    })
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ---------- New-memory toast ---------- */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[calc(1rem+env(safe-area-inset-top))] z-50 flex justify-center px-4 md:top-20"
      >
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
              className="flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              <Sparkles size={16} aria-hidden="true" />
              {toast}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {lightbox && <Lightbox media={lightbox} onClose={closeLightbox} />}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl px-6 py-14 text-center">
      <div aria-hidden="true" className="absolute inset-0 -z-20 grid grid-cols-3 gap-1 opacity-80 blur-[1px]">
        {[PHOTOS.detail2, PHOTOS.moment2, PHOTOS.detail3].map((p, i) => (
          <div key={i} className="relative">
            <Image src={p.src} alt="" fill sizes="33vw" placeholder="blur" className="object-cover" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/75 to-background" />
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-primary-foreground shadow-glow">
        <Heart size={24} fill="currentColor" className="animate-heartbeat" aria-hidden="true" />
      </span>
      <p className="mt-4 font-display text-2xl font-semibold text-foreground">
        {filtered ? "Nothing here yet" : "The wall is waiting for you"}
      </p>
      <p className="mx-auto mt-1 max-w-xs text-base text-muted-foreground">
        Be the first to share a photo, video or voice note — it&rsquo;ll appear here instantly.
      </p>
      <Link
        href="/upload"
        className="mx-auto mt-6 flex h-12 max-w-[15rem] items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-base font-semibold text-primary-foreground shadow-glow transition active:scale-[0.97]"
      >
        <Camera size={18} aria-hidden="true" />
        Share a memory
      </Link>
    </div>
  );
}

function MediaCard({
  item,
  index,
  onOpen,
}: {
  item: UploadRow;
  index: number;
  onOpen: () => void;
}) {
  const reduce = useReducedMotion();
  const url = getMediaUrl(item.storage_path);
  const motionProps = {
    layout: "position" as const,
    initial: reduce ? false : { opacity: 0, y: 24, scale: 0.94 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
    transition: { duration: 0.55, delay: Math.min(index, 12) * 0.04, ease: EASE },
  };

  if (item.media_type === "voice") {
    return (
      <motion.div
        {...motionProps}
        className="break-inside-avoid overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-soft"
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-primary-foreground">
            <Mic size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {item.guest_name ?? "A guest"}
            </p>
            <p className="text-xs text-muted-foreground">Voice note · {timeAgo(item.created_at)}</p>
          </div>
        </div>
        <div aria-hidden="true" className="mb-3 flex h-8 items-center gap-[3px]">
          {Array.from({ length: 22 }, (_, i) => (
            <span
              key={i}
              className="w-1 flex-1 rounded-full bg-gradient-to-t from-primary to-secondary opacity-70"
              style={{ height: `${25 + ((i * 37) % 75)}%` }}
            />
          ))}
        </div>
        <audio controls src={url} className="h-10 w-full" />
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.97 }}
      aria-label={`Open ${item.media_type} from ${item.guest_name ?? "a guest"}`}
      className="group relative block w-full break-inside-avoid overflow-hidden rounded-3xl bg-muted text-left shadow-soft"
    >
      {item.media_type === "video" ? (
        <div className="relative">
          <video src={`${url}#t=0.1`} className="w-full" preload="metadata" muted playsInline />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="glass-dark flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110">
              <Play size={22} fill="currentColor" aria-hidden="true" />
            </span>
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={item.caption ?? `Photo from ${item.guest_name ?? "a guest"}`}
          loading="lazy"
          className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-[#1f2933]/80 to-transparent px-3 pb-2.5 pt-8 text-white">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
          <Heart size={12} fill="currentColor" className="shrink-0 text-[#d9b87b]" aria-hidden="true" />
          <span className="truncate">{item.guest_name ?? "A guest"}</span>
        </span>
        <span className="shrink-0 text-xs text-white/85">{timeAgo(item.created_at)}</span>
      </span>
    </motion.button>
  );
}
