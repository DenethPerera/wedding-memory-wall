"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useAnimate, useReducedMotion } from "framer-motion";
import { AlertCircle, Heart, Loader2 } from "lucide-react";
import CoupleNames from "@/components/decor/CoupleNames";
import FloatingHearts from "@/components/decor/FloatingHearts";
import { GATE_COLLAGE } from "@/lib/photos";

export default function PinForm({
  endpoint,
  title,
  subtitle,
  defaultNext,
  pinLabel = "Event code",
}: {
  endpoint: string;
  title: string;
  subtitle: string;
  defaultNext: string;
  pinLabel?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formRef, animate] = useAnimate<HTMLFormElement>();

  function fail(message: string) {
    setError(message);
    setLoading(false);
    if (!reduce) animate(formRef.current, { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.4 });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        fail(data.error ?? "Something went wrong.");
        return;
      }
      const next = searchParams.get("next") ?? defaultNext;
      router.replace(next);
      router.refresh();
    } catch {
      fail("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-5 py-16">
      {/* Photo collage backdrop */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 grid scale-110 grid-cols-3 gap-2 -rotate-6">
        {[...GATE_COLLAGE, ...GATE_COLLAGE.slice(0, 3)].map((photo, i) => (
          <motion.div
            key={i}
            className="relative min-h-40 overflow-hidden rounded-2xl"
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image src={photo.src} alt="" fill sizes="34vw" placeholder="blur" className="object-cover" />
          </motion.div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--background) 55%, transparent) 0%, color-mix(in srgb, var(--background) 68%, transparent) 50%, color-mix(in srgb, var(--background) 85%, transparent) 100%)",
        }}
      />
      <FloatingHearts className="-z-10" count={10} />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass relative w-full max-w-sm rounded-[2rem] p-7 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-primary-foreground shadow-glow">
            <Heart size={24} fill="currentColor" className="animate-heartbeat" aria-hidden="true" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-ink">
            Welcome
          </p>
          <CoupleNames names={title} className="mt-1 text-5xl text-gold-ink" />
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pin" className="text-sm font-semibold text-foreground">
              {pinLabel}
            </label>
            <input
              id="pin"
              name="pin"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. NIMA-SAM-2026"
              className="h-14 rounded-2xl border border-border bg-card px-4 text-center text-lg font-medium tracking-[0.15em] text-foreground outline-none ring-primary/30 transition placeholder:tracking-normal placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "pin-error" : undefined}
            />
          </div>

          {error && (
            <p
              id="pin-error"
              role="alert"
              className="flex items-center gap-2 text-sm font-medium text-danger"
            >
              <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="mt-1 flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand text-base font-semibold text-primary-foreground shadow-glow transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <Heart size={18} aria-hidden="true" />
            )}
            {loading ? "Opening…" : "Enter"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
