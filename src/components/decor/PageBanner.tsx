import Image from "next/image";
import type { ReactNode } from "react";
import type { Photo } from "@/lib/photos";
import FloatingHearts from "@/components/decor/FloatingHearts";

/** Rounded photo header used at the top of the Upload and Wall pages. */
export default function PageBanner({
  photo,
  eyebrow,
  title,
  
  children,
}: {
  photo: Photo;
  eyebrow: string;
  title: string;
  
  children?: ReactNode;
}) {
  return (
    <header className="relative isolate overflow-hidden rounded-b-[2.5rem] px-5 pb-10 pt-[calc(2.5rem+env(safe-area-inset-top))] text-center text-foreground shadow-soft md:pt-28">
      <Image
        src={photo.src}
        alt=""
        fill
        preload
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-center animate-ken-burns"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(170deg, color-mix(in srgb, var(--background) 78%, transparent) 0%, color-mix(in srgb, var(--background) 82%, transparent) 55%, color-mix(in srgb, var(--background) 92%, transparent) 100%)",
        }}
      />
      <FloatingHearts className="-z-10" count={7} />
      <div className="mx-auto max-w-xl animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-ink">{eyebrow}</p>
        <h1 className="mt-1 font-script text-6xl text-foreground drop-shadow-[0_4px_20px_rgb(200_169_106/0.35)]">
          {title}
        </h1>
        
        {children}
      </div>
    </header>
  );
}
