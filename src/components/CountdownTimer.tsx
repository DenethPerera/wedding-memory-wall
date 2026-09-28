"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

function getParts(targetISO: string) {
  const diff = Math.max(0, new Date(targetISO).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: diff === 0,
  };
}

export default function CountdownTimer({
  targetISO,
  onPhoto = false,
}: {
  targetISO: string;
  /** Render light-on-glass for use over photography. */
  onPhoto?: boolean;
}) {
  // The server and client compute this a moment apart, so the seconds digit
  // can legitimately differ by one on first paint. That's expected for a
  // live clock (see https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content),
  // so the mismatch is suppressed only on the single fast-changing digit
  // below rather than papering over real bugs elsewhere.
  const [parts, setParts] = useState(() => getParts(targetISO));

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(targetISO)), 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  if (parts.done) {
    return (
      <p
        className={cn(
          "flex items-center gap-2 font-display text-xl italic",
          onPhoto ? "text-white" : "text-gold-ink",
        )}
      >
        <Heart size={18} fill="currentColor" className="animate-heartbeat" aria-hidden="true" />
        Today&rsquo;s the day! Thank you for celebrating with us.
      </p>
    );
  }

  const items = [
    { label: "days", value: parts.days },
    { label: "hours", value: parts.hours },
    { label: "mins", value: parts.minutes },
    { label: "secs", value: parts.seconds },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3" role="timer" aria-live="off">
      {items.map((item) => {
        const text = String(item.value).padStart(2, "0");
        return (
          <div
            key={item.label}
            className={cn(
              "flex w-[4.25rem] flex-col items-center rounded-2xl px-2 py-2.5 sm:w-20",
              onPhoto ? "glass-dark text-white" : "glass shadow-soft text-foreground",
            )}
          >
            <span className="relative block h-8 w-full overflow-hidden text-center sm:h-9">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={text}
                  suppressHydrationWarning
                  initial={{ y: "-100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 font-display text-[1.75rem] font-semibold leading-8 tabular-nums sm:text-3xl sm:leading-9"
                >
                  {text}
                </motion.span>
              </AnimatePresence>
            </span>
            <span
              className={cn(
                "mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em]",
                onPhoto ? "text-white/85" : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
