export type MediaType = "photo" | "video" | "voice";

export type UploadRow = {
  id: string;
  created_at: string;
  media_type: MediaType;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  guest_name: string | null;
  caption: string | null;
  duration_seconds: number | null;
};
