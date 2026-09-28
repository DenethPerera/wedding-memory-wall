"use client";

import { useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import type { Photo } from "@/lib/photos";

function Row({ photos, reverse, duration }: { photos: Photo[]; reverse?: boolean; duration: string }) {
  // Duplicate the set so the -50% translate loops seamlessly.
  const loop = [...photos, ...photos];
  return (
    <div className="overflow-hidden">
      <div
        className="marquee-track flex w-max gap-3"
        data-reverse={reverse ? "true" : "false"}
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {loop.map((photo, i) => (
          <div
            key={i}
            className="relative h-36 w-52 shrink-0 overflow-hidden rounded-2xl shadow-soft sm:h-48 sm:w-72"
            style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)` }}
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="(min-width: 640px) 288px, 208px"
              placeholder="blur"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Two rows of pre-shoot photos drifting in opposite directions. Decorative. */
export default function PhotoMarquee({ top, bottom }: { top: Photo[]; bottom: Photo[] }) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="marquee relative flex flex-col gap-4 py-3" data-paused={paused ? "true" : "false"}>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <Row photos={top} duration="50s" />
        <Row photos={bottom} duration="58s" reverse />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Play photo animation" : "Pause photo animation"}
        className="glass absolute bottom-0 right-4 flex h-11 w-11 items-center justify-center rounded-full text-foreground shadow-soft transition active:scale-90"
      >
        {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}
