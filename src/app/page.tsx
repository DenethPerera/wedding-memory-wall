import Image from "next/image";
import Link from "next/link";
import {
  CalendarHeart,
  Camera,
  ChevronDown,
  Hash,
  Heart,
  LayoutGrid,
  MapPin,
  Mic,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import CountdownTimer from "@/components/CountdownTimer";
import PhotoMarquee from "@/components/PhotoMarquee";
import AuroraBackground from "@/components/decor/AuroraBackground";
import CoupleNames from "@/components/decor/CoupleNames";
import FloatingHearts from "@/components/decor/FloatingHearts";
import Reveal from "@/components/decor/Reveal";
import SectionHeading from "@/components/decor/SectionHeading";
import { EVENT } from "@/lib/event-config";
import { MARQUEE_BOTTOM, MARQUEE_TOP, PHOTOS, type Photo } from "@/lib/photos";

const STEPS = [
  {
    icon: Camera,
    step: "Step one",
    title: "Snap it",
    body: "Take photos or short videos of the moments you love — candid is best.",
    photo: PHOTOS.moment1,
  },
  {
    icon: Mic,
    step: "Step two",
    title: "Say it",
    body: "Record a voice note with your wishes, a story or a little advice.",
    photo: PHOTOS.detail4,
  },
  {
    icon: Sparkles,
    step: "Step three",
    title: "See it glow",
    body: "Everything appears instantly on our live memory wall for everyone to enjoy.",
    photo: PHOTOS.venue3,
  },
];

export default function HomePage() {
  const eventDate = new Date(EVENT.eventDateISO);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ---------- Hero ---------- */}
        {/* Photo fills the top ~3/4 and fades into the page background, so the
            text sits below the couple's faces rather than over them. */}
        <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-background">
          <div className="absolute inset-x-0 top-0 -z-20 h-[76%] overflow-hidden md:h-full">
            <Image
              src={PHOTOS.hero.src}
              alt={PHOTOS.hero.alt}
              fill
              preload
              placeholder="blur"
              sizes="100vw"
              className="object-cover object-[50%_25%] animate-ken-burns"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, transparent 38%, color-mix(in srgb, var(--background) 55%, transparent) 52%, color-mix(in srgb, var(--background) 94%, transparent) 66%, var(--background) 76%)",
            }}
          />
          <FloatingHearts className="-z-10" />

          <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-28 text-center text-foreground md:pb-16">
            <p
              className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
              We&rsquo;re getting married
              <span aria-hidden="true" className="h-px w-8 bg-gradient-to-l from-transparent to-accent" />
            </p>

            <div className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
              <CoupleNames
                names={EVENT.coupleNames}
                className="mt-3 text-[3.75rem] leading-none text-foreground drop-shadow-[0_4px_24px_rgb(200_169_106/0.35)] sm:text-8xl"
              />
            </div>

            

            <div
              className="mt-7 flex w-full max-w-sm flex-col gap-3 animate-fade-up sm:flex-row"
              style={{ animationDelay: "0.7s" }}
            >
              <Link
                href="/upload"
                className="flex h-14 shrink-0 sm:flex-1 items-center justify-center gap-2 rounded-2xl bg-brand px-6 text-base font-semibold text-primary-foreground shadow-glow transition active:scale-[0.97]"
              >
                <Camera size={20} aria-hidden="true" />
                Share a memory
              </Link>
              <Link
                href="/wall"
                className="flex h-14 shrink-0 sm:flex-1 items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-white/80 backdrop-blur px-6 text-base font-semibold text-foreground transition active:scale-[0.97]"
              >
                <LayoutGrid size={20} aria-hidden="true" />
                View the wall
              </Link>
            </div>

            <a
              href="#story"
              className="mt-6 flex flex-col items-center gap-1 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground"
            >
              Our story
              <ChevronDown size={20} className="animate-bounce-soft" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* ---------- Story / polaroids ---------- */}
        <section id="story" className="relative isolate overflow-hidden px-5 py-16 sm:py-24">
          <AuroraBackground className="-z-10" />
          {/* <Reveal className="mb-16 flex flex-col items-center gap-4">
            <p className="font-script text-4xl text-gold-ink">Counting down to forever</p>
            <CountdownTimer targetISO={EVENT.eventDateISO} />
          </Reveal> */}
          <Reveal>
            <SectionHeading
              eyebrow="Our story"
              title="Moments before forever"
              subtitle="A few favourites from our pre-shoot — now help us fill the wall with the rest of the story."
            />
          </Reveal>

          <div className="relative mx-auto mt-10 h-[40rem] w-full max-w-sm sm:h-[50rem] sm:max-w-md">
            <Polaroid photo={PHOTOS.portrait2} rotate={-6} className="left-0 top-0 w-[58%]" delay={0} />
            <Polaroid photo={PHOTOS.detail3} rotate={5} className="right-0 top-10 w-[54%]" delay={0.12} />
            <Polaroid photo={PHOTOS.portrait3} rotate={-2} className="left-[18%] top-[20rem] w-[62%] sm:top-[24.5rem]" delay={0.24} />
            <Heart
              size={40}
              fill="currentColor"
              className="absolute right-6 top-[18rem] text-gold-ink/80 sm:top-[21rem] animate-heartbeat"
              aria-hidden="true"
            />
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section className="px-5 pb-16 sm:pb-24">
          <Reveal>
            <SectionHeading
              eyebrow="Join in"
              title="Three little ways to love"
              
            />
          </Reveal>
          {/* Offset ladder on phones: each card stays wide enough for a
              readable measure, and alternating alignment breaks the symmetric
              grid. Three staggered tall cards from 640px up, unchanged. */}
          <ol className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className={`max-sm:w-[88%] ${
                    i === 1 ? "max-sm:self-end sm:translate-y-8" : "max-sm:self-start"
                  }`}
                >
                  <Reveal delay={i * 0.12} y={36} className="h-full">
                    <div className="group h-full rounded-[1.75rem] bg-brand p-[2px] shadow-glow">
                      <div className="relative isolate flex h-full min-h-[15rem] flex-col justify-between overflow-hidden rounded-[calc(1.75rem-2px)] p-4 text-foreground sm:min-h-[26rem] sm:p-5">
                        <Image
                          src={step.photo.src}
                          alt=""
                          fill
                          placeholder="blur"
                          sizes="(min-width: 640px) 300px, 90vw"
                          className="-z-20 object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 -z-10"
                          style={{
                            background:
                              "linear-gradient(180deg, transparent 0%, transparent 25%, color-mix(in srgb, var(--background) 72%, transparent) 45%, color-mix(in srgb, var(--background) 95%, transparent) 62%, var(--background) 100%)",
                          }}
                        />

                        <div className="flex items-start justify-between">
                          <span className="relative flex h-12 w-12 items-center justify-center">
                            <span aria-hidden="true" className="live-ping absolute inset-0 rounded-2xl bg-white/30" />
                            <span className="glass relative flex h-12 w-12 items-center justify-center rounded-2xl text-gold-ink">
                              <Icon size={22} aria-hidden="true" />
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className="font-display text-5xl font-bold italic leading-none text-white/70 drop-shadow-[0_2px_10px_rgb(31_41_51/0.35)] sm:text-6xl"
                          >
                            0{i + 1}
                          </span>
                        </div>

                        <div>
                          <p className="font-script text-2xl leading-none text-gold-ink">{step.step}</p>
                          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight sm:text-3xl">
                            {step.title}
                          </h3>
                          <span aria-hidden="true" className="my-2 block h-0.5 w-10 rounded-full bg-accent" />
                          <p className="text-base leading-snug text-muted-foreground">
                            {step.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ---------- Photo marquee ---------- */}
        <section aria-labelledby="glimpse-title" className="pb-16 sm:pb-24">
          <Reveal>
            <p id="glimpse-title" className="text-center font-script text-5xl text-gold-ink sm:text-6xl">
              A glimpse of us
            </p>
          </Reveal>
          <div className="mt-6">
            <PhotoMarquee top={MARQUEE_TOP} bottom={MARQUEE_BOTTOM} />
          </div>
        </section>

        {/* ---------- Details ---------- */}
        <section className="px-5 pb-tabbar">
          <Reveal>
            <div className="relative isolate mx-auto max-w-2xl overflow-hidden rounded-[2rem] px-6 py-12 text-center text-foreground shadow-soft">
              <Image
                src={PHOTOS.venue2.src}
                alt=""
                fill
                placeholder="blur"
                sizes="(min-width: 768px) 672px, 100vw"
                className="-z-20 object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/85 to-background/95" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-ink">
                Save the date
              </p>
              <CoupleNames as="h2" names={EVENT.coupleNames} className="mt-2 text-5xl text-foreground" />
              <dl className="mx-auto mt-6 flex max-w-xs flex-col gap-3 text-left text-base">
                {/* <div className="flex items-center gap-3">
                  <dt className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gold-ink">
                    <CalendarHeart size={18} aria-hidden="true" />
                    <span className="sr-only">Date</span>
                  </dt>
                  <dd>
                    {formattedDate}
                    <span className="block text-sm text-muted-foreground">{formattedTime}</span>
                  </dd>
                </div> */}
                {/* {EVENT.venue && (
                  <div className="flex items-center gap-3">
                    <dt className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gold-ink">
                      <MapPin size={18} aria-hidden="true" />
                      <span className="sr-only">Venue</span>
                    </dt>
                    <dd>{EVENT.venue}</dd>
                  </div>
                )} */}
                {EVENT.hashtag && (
                  <div className="flex items-center gap-3">
                    <dt className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gold-ink">
                      <Hash size={18} aria-hidden="true" />
                      <span className="sr-only">Hashtag</span>
                    </dt>
                    <dd>Tag your own posts with {EVENT.hashtag}</dd>
                  </div>
                )}
              </dl>
              <Link
                href="/upload"
                className="mx-auto mt-8 flex h-14 max-w-xs items-center justify-center gap-2 rounded-2xl bg-brand px-6 text-base font-semibold text-primary-foreground shadow-glow transition active:scale-[0.97]"
              >
                <Heart size={18} fill="currentColor" aria-hidden="true" />
                Leave us a memory
              </Link>
            </div>
          </Reveal>

          <footer className="mt-12 flex flex-col items-center gap-1 text-center">
            <CoupleNames as="p" names={EVENT.coupleNames} className="text-4xl text-gold-ink" />
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              Made with <Heart size={14} fill="currentColor" className="text-gold-ink" aria-hidden="true" /><span className="sr-only">love</span> for our favourite people
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}

function Polaroid({
  photo,
  rotate,
  className,
  delay,
}: {
  photo: Photo;
  rotate: number;
  className: string;
  delay: number;
}) {
  return (
    <Reveal rotate={rotate} delay={delay} y={40} className={`absolute ${className}`}>
      <figure className="rounded-md bg-white p-2 pb-1 shadow-[0_20px_40px_-12px_rgb(180_140_80/0.22)] transition-transform duration-300 hover:-translate-y-1">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            placeholder="blur"
            sizes="(min-width: 640px) 280px, 60vw"
            className="object-cover"
          />
        </div>
        <figcaption className="py-1.5 text-center font-script text-2xl text-muted-foreground">
          {photo.caption}
        </figcaption>
      </figure>
    </Reveal>
  );
}
