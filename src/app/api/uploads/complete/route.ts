import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { GUEST_COOKIE, verifyGateToken } from "@/lib/gate";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const MEDIA_TYPES = ["photo", "video", "voice"] as const;

export async function POST(request: NextRequest) {
  const secret = process.env.GATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }
  const cookieStore = await cookies();
  const valid = await verifyGateToken(
    cookieStore.get(GUEST_COOKIE)?.value,
    "guest",
    secret,
  );
  if (!valid) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path : "";
  const mediaType = body?.mediaType as (typeof MEDIA_TYPES)[number] | undefined;
  const fileName = typeof body?.fileName === "string" ? body.fileName.slice(0, 200) : "upload";
  const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "application/octet-stream";
  const sizeBytes = Number(body?.sizeBytes) || 0;
  const guestName =
    typeof body?.guestName === "string" && body.guestName.trim()
      ? body.guestName.trim().slice(0, 80)
      : null;
  const caption =
    typeof body?.caption === "string" && body.caption.trim()
      ? body.caption.trim().slice(0, 280)
      : null;
  const durationSeconds =
    typeof body?.durationSeconds === "number" ? body.durationSeconds : null;

  if (!mediaType || !MEDIA_TYPES.includes(mediaType) || !path.startsWith(`${mediaType}/`)) {
    return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("uploads")
    .insert({
      media_type: mediaType,
      storage_path: path,
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      guest_name: guestName,
      caption,
      duration_seconds: durationSeconds,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ upload: data });
}
