"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, X } from "lucide-react";

export type LightboxMedia = {
  type: "photo" | "video";
  url: string;
  alt: string;
  credit?: string | null;
};

/** Render inside <AnimatePresence> so the exit animation plays. */
export default function Lightbox({
  media,
  onClose,
}: {
  media: LightboxMedia;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Media preview"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, rgb(31 41 51 / 0.92), rgb(15 20 26 / 0.96))",
      }}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      transition={{ duration: 0.25 }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="glass-dark absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex h-12 w-12 items-center justify-center rounded-full text-white transition active:scale-90"
      >
        <X size={22} aria-hidden="true" />
      </button>

      <motion.div
        className="flex max-h-full max-w-3xl flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? false : { opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {media.type === "video" ? (
          <video
            src={media.url}
            controls
            autoPlay
            playsInline
            className="max-h-[78dvh] max-w-full rounded-2xl shadow-2xl"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.url}
            alt={media.alt}
            className="max-h-[78dvh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        )}
        {media.credit && (
          <p className="flex items-center gap-2 font-display text-lg italic text-white/90">
            <Heart size={14} fill="currentColor" className="text-[#d9b87b]" aria-hidden="true" />
            {media.credit}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
