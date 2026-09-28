import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Deterministic "random" layout so server and client markup match.
const PETALS = Array.from({ length: 14 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  const r = seed / 233280;
  return {
    left: (i * 37 + 11) % 100,
    size: 10 + Math.round(r * 16),
    duration: 10 + ((i * 7) % 9),
    delay: -((i * 13) % 16),
    drift: ((i % 2 === 0 ? 1 : -1) * (20 + ((i * 17) % 50))),
    kind: i % 3 === 0 ? "petal" : "heart",
    tone: i % 4,
  };
});

const TONES = [
  "text-[#c8a96a]",
  "text-[#e8a598]",
  "text-[#d98e82]",
  "text-[#d9b87b]",
];

/**
 * Softly rising hearts and petals. Purely decorative: hidden from assistive
 * tech and removed entirely under prefers-reduced-motion (see globals.css).
 */
export default function FloatingHearts({
  className,
  count = 14,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {PETALS.slice(0, count).map((p, i) => (
        <span
          key={i}
          className={cn("petal absolute -bottom-10 block", TONES[p.tone])}
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              "--petal-duration": `${p.duration}s`,
              "--petal-delay": `${p.delay}s`,
              "--petal-drift": `${p.drift}px`,
              "--petal-opacity": 0.85,
            } as CSSProperties
          }
        >
          {p.kind === "heart" ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full drop-shadow-sm">
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.4 2.5.8-1.4 2.3-2.5 4.4-2.5 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full opacity-90">
              <path d="M12 2c4 3 6 7 6 11a6 6 0 0 1-12 0c0-4 2-8 6-11z" />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}
