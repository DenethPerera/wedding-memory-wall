"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mic, MicOff, RotateCcw, Send, Square } from "lucide-react";

const BAR_COUNT = 24;

function pickMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) ?? "";
}

export default function VoiceRecorder({
  onSubmit,
  submitting,
}: {
  onSubmit: (blob: Blob, mimeType: string, durationSeconds: number) => void;
  submitting: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "recording" | "recorded" | "denied">(
    "idle",
  );
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(4));
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobRef = useRef<{ blob: Blob; mimeType: string } | null>(null);

  useEffect(() => {
    return () => {
      stopTracks();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopTracks() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const next = Array.from({ length: BAR_COUNT }, (_, i) => {
          const value = data[i % data.length] ?? 0;
          return 4 + (value / 255) * 36;
        });
        setLevels(next);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        blobRef.current = { blob, mimeType: mimeType || "audio/webm" };
        setAudioUrl(URL.createObjectURL(blob));
        setStatus("recorded");
      };
      recorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setStatus("denied");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    stopTracks();
  }

  function reset() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    blobRef.current = null;
    setAudioUrl(null);
    setSeconds(0);
    setStatus("idle");
  }

  function submit() {
    if (!blobRef.current) return;
    onSubmit(blobRef.current.blob, blobRef.current.mimeType, seconds);
  }

  if (status === "denied") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-muted p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <MicOff size={22} aria-hidden="true" />
        </span>
        <p className="text-base font-semibold text-foreground">Microphone access was blocked</p>
        <p className="text-sm text-muted-foreground">
          Please allow microphone permission in your browser settings to record a
          voice message, then try again.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-1 flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition active:scale-95"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  const recording = status === "recording";

  return (
    <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-muted via-card to-lavender/40 p-6">
      <div className="flex h-16 items-center gap-1" aria-hidden="true">
        {levels.map((level, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-primary to-secondary transition-[height] duration-100"
            style={{ height: `${recording ? level : 4 + ((i * 7) % 10)}px`, opacity: recording ? 1 : 0.45 }}
          />
        ))}
      </div>

      <p
        className={
          "flex items-center gap-2 font-display text-3xl font-semibold tabular-nums " +
          (recording ? "text-danger" : "text-foreground")
        }
      >
        {recording && <span className="h-2.5 w-2.5 rounded-full bg-danger animate-pulse" aria-hidden="true" />}
        {String(Math.floor(seconds / 60)).padStart(2, "0")}:
        {String(seconds % 60).padStart(2, "0")}
        {recording && <span className="sr-only">Recording</span>}
      </p>

      {status === "recorded" && audioUrl && (
        <audio controls src={audioUrl} className="h-10 w-full" />
      )}

      <div className="flex items-center gap-3">
        {status === "idle" && (
          <div className="relative">
            <span aria-hidden="true" className="live-ping absolute inset-0 rounded-full bg-primary/40" />
            <motion.button
              type="button"
              onClick={startRecording}
              whileTap={{ scale: 0.9 }}
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand text-primary-foreground shadow-glow"
              aria-label="Start recording voice message"
            >
              <Mic size={30} aria-hidden="true" />
            </motion.button>
          </div>
        )}
        {recording && (
          <motion.button
            type="button"
            onClick={stopRecording}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground text-background shadow-lg"
            aria-label="Stop recording"
          >
            <Square size={24} aria-hidden="true" fill="currentColor" />
          </motion.button>
        )}
        {status === "recorded" && (
          <>
            <button
              type="button"
              onClick={reset}
              className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition active:scale-95"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Re-record
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex h-12 items-center gap-2 rounded-2xl bg-brand px-5 text-sm font-semibold text-primary-foreground shadow-glow transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Send size={16} aria-hidden="true" />
              )}
              Send voice note
            </button>
          </>
        )}
      </div>

      {status === "idle" && (
        <p className="text-center text-base text-muted-foreground">
          Tap the microphone and leave a message for the couple.
        </p>
      )}
      {recording && (
        <p className="text-center text-sm text-muted-foreground">Tap stop when you&rsquo;re done.</p>
      )}
    </div>
  );
}
