import { cn } from "@/lib/utils";

/** Slow-drifting sunset glow blobs (gold, champagne, blush). Decorative. */
export default function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl animate-aurora" />
      <div
        className="absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-coral/30 blur-3xl animate-aurora"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-lavender/60 blur-3xl animate-aurora"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-accent/25 blur-3xl animate-aurora"
        style={{ animationDelay: "-11s" }}
      />
    </div>
  );
}
