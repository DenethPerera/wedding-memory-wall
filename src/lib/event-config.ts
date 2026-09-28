export const EVENT = {
  coupleNames: process.env.NEXT_PUBLIC_COUPLE_NAMES ?? "Groom & Bride",
  eventDateISO: process.env.NEXT_PUBLIC_EVENT_DATE ?? "2026-12-12T16:00:00",
  venue: process.env.NEXT_PUBLIC_VENUE ?? "",
  hashtag: process.env.NEXT_PUBLIC_HASHTAG ?? "",
} as const;

export const UPLOAD_LIMITS = {
  photoMaxBytes: 25 * 1024 * 1024,
  videoMaxBytes: 300 * 1024 * 1024,
  voiceMaxBytes: 20 * 1024 * 1024,
} as const;

export const STORAGE_BUCKET = "wedding-media";
