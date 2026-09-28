import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { STORAGE_BUCKET, UPLOAD_LIMITS } from "@/lib/event-config";
import { safeFileExt } from "@/lib/utils";

const MEDIA_TYPES = ["photo", "video", "voice"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

const MIME_PREFIX: Record<MediaType, string> = {
  photo: "image/",
  video: "video/",
  voice: "audio/",
};

const SIZE_LIMIT: Record<MediaType, number> = {
  photo: UPLOAD_LIMITS.photoMaxBytes,
  video: UPLOAD_LIMITS.videoMaxBytes,
  voice: UPLOAD_LIMITS.voiceMaxBytes,
};

const EXT_FALLBACK: Record<MediaType, string> = {
  photo: "jpg",
  video: "mp4",
  voice: "webm",
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "";
  const mediaType = body?.mediaType as MediaType | undefined;
  const sizeBytes = Number(body?.sizeBytes);

  if (!mediaType || !MEDIA_TYPES.includes(mediaType)) {
    return NextResponse.json({ error: "Invalid media type." }, { status: 400 });
  }
  if (!mimeType.startsWith(MIME_PREFIX[mediaType])) {
    return NextResponse.json(
      { error: `Expected a ${mediaType} file.` },
      { status: 400 },
    );
  }
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return NextResponse.json({ error: "Invalid file size." }, { status: 400 });
  }
  if (sizeBytes > SIZE_LIMIT[mediaType]) {
    return NextResponse.json(
      { error: `File is too large for a ${mediaType} upload.` },
      { status: 413 },
    );
  }

  const ext = safeFileExt(fileName, EXT_FALLBACK[mediaType]);
  const path = `${mediaType}/${crypto.randomUUID()}.${ext}`;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create upload URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
  });
}
