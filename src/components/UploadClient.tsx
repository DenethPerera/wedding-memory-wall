"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Link from "next/link";
import imageCompression from "browser-image-compression";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  Check,
  FolderOpen,
  Heart,
  ImageIcon,
  Loader2,
  Mic,
  RefreshCw,
  UploadCloud,
  UserRound,
  Video,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET, UPLOAD_LIMITS } from "@/lib/event-config";
import VoiceRecorder from "@/components/VoiceRecorder";

type MediaType = "photo" | "video" | "voice";
type ItemStatus = "queued" | "processing" | "uploading" | "saving" | "done" | "error";

type QueueItem = {
  id: string;
  mediaType: MediaType;
  fileName: string;
  previewUrl: string | null;
  status: ItemStatus;
  errorMessage?: string;
};

const TABS: { key: MediaType; label: string; icon: typeof ImageIcon }[] = [
  { key: "photo", label: "Photo", icon: ImageIcon },
  { key: "video", label: "Video", icon: Video },
  { key: "voice", label: "Voice", icon: Mic },
];

const GUEST_NAME_KEY = "wmw_guest_name";
const CONCURRENCY = 3;

async function uploadOne(
  item: { file: Blob; fileName: string; mimeType: string; mediaType: MediaType; durationSeconds?: number },
  guestName: string,
  onStatus: (status: ItemStatus, errorMessage?: string) => void,
) {
  onStatus("uploading");
  const signRes = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: item.fileName,
      mimeType: item.mimeType,
      mediaType: item.mediaType,
      sizeBytes: item.file.size,
    }),
  });
  const signData = await signRes.json();
  if (!signRes.ok) throw new Error(signData.error ?? "Could not start upload.");

  const supabase = createBrowserSupabaseClient();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .uploadToSignedUrl(signData.path, signData.token, item.file, {
      contentType: item.mimeType,
    });
  if (uploadError) throw new Error(uploadError.message);

  onStatus("saving");
  const completeRes = await fetch("/api/uploads/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: signData.path,
      mediaType: item.mediaType,
      fileName: item.fileName,
      mimeType: item.mimeType,
      sizeBytes: item.file.size,
      guestName,
      durationSeconds: item.durationSeconds,
    }),
  });
  const completeData = await completeRes.json();
  if (!completeRes.ok) throw new Error(completeData.error ?? "Could not save upload.");

  onStatus("done");
}

export default function UploadClient() {
  const [activeTab, setActiveTab] = useState<MediaType>("photo");
  const [guestName, setGuestName] = useState<string>(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(GUEST_NAME_KEY) ?? "",
  );
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [voiceSubmitting, setVoiceSubmitting] = useState(false);

  const filesRef = useRef<Map<string, Blob>>(new Map());
  const pendingRef = useRef<
    { id: string; file: Blob; fileName: string; mimeType: string; mediaType: MediaType; durationSeconds?: number }[]
  >([]);
  const activeCountRef = useRef(0);

  function persistGuestName(value: string) {
    setGuestName(value);
    window.localStorage.setItem(GUEST_NAME_KEY, value);
  }

  function updateItem(id: string, patch: Partial<QueueItem>) {
    setQueue((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function drainQueue() {
    while (activeCountRef.current < CONCURRENCY && pendingRef.current.length > 0) {
      const next = pendingRef.current.shift();
      if (!next) break;
      activeCountRef.current += 1;
      const currentGuestName = window.localStorage.getItem(GUEST_NAME_KEY) ?? "";
      uploadOne(next, currentGuestName, (status, errorMessage) =>
        updateItem(next.id, { status, errorMessage }),
      )
        .catch((err: Error) => {
          updateItem(next.id, { status: "error", errorMessage: err.message });
        })
        .finally(() => {
          activeCountRef.current -= 1;
          drainQueue();
        });
    }
  }

  function enqueue(
    file: Blob,
    fileName: string,
    mimeType: string,
    mediaType: MediaType,
    durationSeconds?: number,
  ) {
    const id = crypto.randomUUID();
    const previewUrl =
      mediaType === "photo" || mediaType === "video" ? URL.createObjectURL(file) : null;
    filesRef.current.set(id, file);
    setQueue((prev) => [{ id, mediaType, fileName, previewUrl, status: "queued" }, ...prev]);
    pendingRef.current.push({ id, file, fileName, mimeType, mediaType, durationSeconds });
    drainQueue();
  }

  async function handleFiles(fileList: FileList | null, mediaType: MediaType) {
    if (!fileList || fileList.length === 0) return;
    const limit =
      mediaType === "photo"
        ? UPLOAD_LIMITS.photoMaxBytes
        : mediaType === "video"
          ? UPLOAD_LIMITS.videoMaxBytes
          : UPLOAD_LIMITS.voiceMaxBytes;

    for (const file of Array.from(fileList)) {
      if (file.size > limit) {
        const id = crypto.randomUUID();
        setQueue((prev) => [
          {
            id,
            mediaType,
            fileName: file.name,
            previewUrl: null,
            status: "error",
            errorMessage: `Too large (max ${formatBytes(limit)}).`,
          },
          ...prev,
        ]);
        continue;
      }

      if (mediaType === "photo") {
        const id = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);
        setQueue((prev) => [
          { id, mediaType, fileName: file.name, previewUrl, status: "processing" },
          ...prev,
        ]);
        try {
          const compressed = await imageCompression(file, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 2400,
            useWebWorker: true,
            fileType: file.type,
          });
          filesRef.current.set(id, compressed);
          pendingRef.current.push({
            id,
            file: compressed,
            fileName: file.name,
            mimeType: compressed.type || file.type,
            mediaType,
          });
          updateItem(id, { status: "queued" });
          drainQueue();
        } catch {
          pendingRef.current.push({
            id,
            file,
            fileName: file.name,
            mimeType: file.type,
            mediaType,
          });
          updateItem(id, { status: "queued" });
          drainQueue();
        }
      } else {
        enqueue(file, file.name, file.type, mediaType);
      }
    }
  }

  function handleVoiceSubmit(blob: Blob, mimeType: string, durationSeconds: number) {
    setVoiceSubmitting(true);
    const ext = mimeType.includes("mp4") ? "m4a" : "webm";
    enqueue(blob, `voice-note.${ext}`, mimeType, "voice", durationSeconds);
    setTimeout(() => setVoiceSubmitting(false), 400);
  }

  function retryItem(id: string) {
    const file = filesRef.current.get(id);
    const item = queue.find((q) => q.id === id);
    if (!file || !item) return;
    updateItem(id, { status: "queued", errorMessage: undefined });
    pendingRef.current.push({
      id,
      file,
      fileName: item.fileName,
      mimeType: file.type || "application/octet-stream",
      mediaType: item.mediaType,
    });
    drainQueue();
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    if (activeTab === "voice") return;
    handleFiles(e.dataTransfer.files, activeTab);
  }

  const doneCount = useMemo(() => queue.filter((i) => i.status === "done").length, [queue]);

  return (
    <div className="relative z-10 mx-auto -mt-6 flex w-full max-w-xl flex-col gap-6 px-4">
      <div className="flex flex-col gap-5 rounded-[2rem] border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="guestName" className="text-sm font-semibold text-foreground">
            Your name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <div className="relative">
            <UserRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="guestName"
              value={guestName}
              onChange={(e) => persistGuestName(e.target.value)}
              placeholder="So the couple knows who to thank"
              autoComplete="name"
              className="h-13 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-base text-foreground outline-none ring-primary/30 transition placeholder:text-muted-foreground/80 focus:border-primary focus:ring-4"
            />
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Media type"
          className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="upload-tab"
                    className="absolute inset-0 rounded-xl bg-brand shadow-glow"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={18} className="relative" aria-hidden="true" />
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab === "voice" ? "voice" : "files"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === "voice" ? (
              <VoiceRecorder onSubmit={handleVoiceSubmit} submitting={voiceSubmitting} />
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={cn(
                  "border-gradient flex flex-col items-center gap-4 rounded-3xl p-6 text-center transition-transform",
                  dragActive && "scale-[1.02]",
                )}
              >
                <motion.span
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-gold-ink"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <UploadCloud size={30} aria-hidden="true" />
                </motion.span>
                <div>
                  <p className="font-display text-xl font-semibold text-foreground">
                    {activeTab === "photo" ? "Add your photos" : "Add a video clip"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="hidden sm:inline">Drag and drop here, or </span>
                    {activeTab === "photo" ? "snap one now or pick a few." : "record now or pick one."}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <FilePickerButton
                    primary
                    icon={Camera}
                    label={activeTab === "photo" ? "Take photo" : "Record video"}
                    accept={activeTab === "photo" ? "image/*" : "video/*"}
                    capture="environment"
                    onFiles={(files) => handleFiles(files, activeTab)}
                  />
                  <FilePickerButton
                    icon={FolderOpen}
                    label="Choose from device"
                    accept={activeTab === "photo" ? "image/*" : "video/*"}
                    multiple
                    onFiles={(files) => handleFiles(files, activeTab)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Max {formatBytes(
                    activeTab === "photo" ? UPLOAD_LIMITS.photoMaxBytes : UPLOAD_LIMITS.videoMaxBytes,
                  )}{" "}
                  per file.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {queue.length > 0 && (
        <section aria-labelledby="session-title" className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 id="session-title" className="font-display text-xl font-semibold text-foreground">
              Your memories{" "}
              <span className="font-sans text-sm font-medium text-muted-foreground">
                {doneCount}/{queue.length} shared
              </span>
            </h2>
            {doneCount > 0 && (
              <Link
                href="/wall"
                className="flex h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-gold-ink"
              >
                View the wall
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {queue.map((item) => (
                <QueueRow key={item.id} item={item} onRetry={() => retryItem(item.id)} />
              ))}
            </AnimatePresence>
          </ul>
        </section>
      )}

      <Celebration doneCount={doneCount} />
    </div>
  );
}

/** A burst of hearts + "It's on the wall" pill each time another upload finishes. */
function Celebration({ doneCount }: { doneCount: number }) {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const prev = useRef(doneCount);

  useEffect(() => {
    if (doneCount <= prev.current) {
      prev.current = doneCount;
      return;
    }
    prev.current = doneCount;
    setBurst((b) => b + 1);
    const id = setTimeout(() => setBurst(0), 2600);
    return () => clearTimeout(id);
  }, [doneCount]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(7rem+env(safe-area-inset-bottom))] z-50 flex justify-center md:bottom-10"
    >
      <AnimatePresence>
        {burst > 0 && (
          <motion.div
            key={burst}
            className="relative"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
          >
            {!reduce &&
              Array.from({ length: 10 }, (_, i) => {
                const angle = (i / 10) * Math.PI * 2;
                return (
                  <motion.span
                    key={i}
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 text-[#c8a96a]"
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                    animate={{
                      x: Math.cos(angle) * 90,
                      y: Math.sin(angle) * 60 - 20,
                      opacity: 0,
                      scale: 1.1,
                    }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                  >
                    <Heart size={14 + (i % 3) * 4} fill="currentColor" />
                  </motion.span>
                );
              })}
            <p className="flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              <Heart size={16} fill="currentColor" aria-hidden="true" />
              Shared! It&rsquo;s on the wall
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilePickerButton({
  icon: Icon,
  label,
  accept,
  capture,
  multiple,
  primary,
  onFiles,
}: {
  icon: typeof Camera;
  label: string;
  accept: string;
  capture?: "environment" | "user";
  multiple?: boolean;
  primary?: boolean;
  onFiles: (files: FileList | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex h-14 shrink-0 sm:flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-base font-semibold transition active:scale-[0.97]",
          primary
            ? "bg-brand text-primary-foreground shadow-glow"
            : "border border-border bg-background text-foreground hover:border-primary/40",
        )}
      >
        <Icon size={18} aria-hidden="true" />
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture}
        multiple={multiple}
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}

function QueueRow({ item, onRetry }: { item: QueueItem; onRetry: () => void }) {
  const statusLabel: Record<ItemStatus, string> = {
    queued: "Waiting…",
    processing: "Preparing…",
    uploading: "Uploading…",
    saving: "Almost done…",
    done: "Shared",
    error: item.errorMessage ?? "Failed",
  };

  const busy = item.status === "uploading" || item.status === "saving" || item.status === "processing";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-card p-2.5 shadow-soft",
        item.status === "error" ? "border-danger/40" : "border-border",
      )}
    >
      {busy && <span aria-hidden="true" className="bg-shimmer absolute inset-x-0 bottom-0 h-1" />}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
        {item.previewUrl ? (
          item.mediaType === "video" ? (
            <video src={item.previewUrl} className="h-full w-full object-cover" muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <Mic size={22} className="text-gold-ink" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{item.fileName}</p>
        <p
          className={cn(
            "flex items-center gap-1 text-xs",
            item.status === "error"
              ? "font-medium text-danger"
              : item.status === "done"
                ? "font-medium text-success"
                : "text-muted-foreground",
          )}
          aria-live="polite"
        >
          {item.status === "error" && <AlertCircle size={12} className="shrink-0" aria-hidden="true" />}
          {statusLabel[item.status]}
        </p>
      </div>
      {busy && <Loader2 size={20} className="mr-2 shrink-0 animate-spin text-gold-ink" aria-hidden="true" />}
      {item.status === "done" && (
        <motion.span
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-card"
        >
          <Check size={18} strokeWidth={3} aria-hidden="true" />
        </motion.span>
      )}
      {item.status === "error" && (
        <button
          type="button"
          onClick={onRetry}
          aria-label="Retry upload"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger transition active:scale-90"
        >
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      )}
    </motion.li>
  );
}
