import type { StaticImageData } from "next/image";

// ---------------------------------------------------------------------------
// Pre-shoot / couple photos shown around the site.
//
// These are placeholder stock photos. To use your own, overwrite the file in
// `public/photos/` with a same-named .jpg (e.g. replace `hero.jpg`). Width,
// height and the blurred loading placeholder are read from the file at build
// time, so any aspect ratio works — though the hints below give the best fit.
//
// Note: the whole site is open with no guest PIN, so only put photos here
// you're happy to be public.
// ---------------------------------------------------------------------------
import hero from "../../public/photos/hero.jpg"; //            portrait (vertical) — home hero
import portrait1 from "../../public/photos/portrait-1.jpg"; // any — couple portrait
import portrait2 from "../../public/photos/portrait-2.jpg"; // portrait — couple portrait
import portrait3 from "../../public/photos/portrait-3.jpg"; // landscape — close-up / kiss
import moment1 from "../../public/photos/moment-1.jpg"; //    portrait — candid moment
import moment2 from "../../public/photos/moment-2.jpg"; //    landscape — candid moment
import moment3 from "../../public/photos/moment-3.jpg"; //    landscape — scenic
import moment4 from "../../public/photos/moment-4.jpg"; //    landscape — scenic / walking
import detail1 from "../../public/photos/detail-1.jpg"; //    landscape — rings / hands
import detail2 from "../../public/photos/detail-2.jpg"; //    landscape — rings / flowers
import detail3 from "../../public/photos/detail-3.jpg"; //    portrait — bouquet
import detail4 from "../../public/photos/detail-4.jpg"; //    landscape — holding hands
import detail5 from "../../public/photos/detail-5.jpg"; //    landscape — shoes / outfit
import venue1 from "../../public/photos/venue-1.jpg"; //      landscape — ceremony / aisle
import venue2 from "../../public/photos/venue-2.jpg"; //      landscape — reception hall
import venue3 from "../../public/photos/venue-3.jpg"; //      portrait — flowers / decor
import venue4 from "../../public/photos/venue-4.jpg"; //      landscape — decor
import sign from "../../public/photos/sign.jpg"; //           landscape — sign / detail

export type Photo = { src: StaticImageData; alt: string; caption?: string };

export const PHOTOS = {
  hero: { src: hero, alt: "The couple embracing by the sea", caption: "Forever starts here" },
  portrait1: { src: portrait1, alt: "The couple smiling together", caption: "Us" },
  portrait2: { src: portrait2, alt: "The couple laughing arm in arm", caption: "Pure joy" },
  portrait3: { src: portrait3, alt: "A kiss beneath the veil", caption: "Just us" },
  moment1: { src: moment1, alt: "A kiss surrounded by friends and confetti", caption: "Showered in love" },
  moment2: { src: moment2, alt: "The couple releasing balloons", caption: "Up, up and away" },
  moment3: { src: moment3, alt: "The couple dancing on the beach", caption: "Our dance" },
  moment4: { src: moment4, alt: "The couple walking hand in hand at dusk", caption: "Side by side" },
  detail1: { src: detail1, alt: "Hands with wedding rings", caption: "Yes" },
  detail2: { src: detail2, alt: "Wedding rings resting on roses", caption: "Two rings" },
  detail3: { src: detail3, alt: "A bridal bouquet of peach roses", caption: "Blooms" },
  detail4: { src: detail4, alt: "Holding hands in the sunlight", caption: "Hold on" },
  detail5: { src: detail5, alt: "Wedding shoes side by side", caption: "Next steps" },
  venue1: { src: venue1, alt: "A flower-lined ceremony aisle", caption: "The aisle" },
  venue2: { src: venue2, alt: "A glowing reception hall", caption: "The party" },
  venue3: { src: venue3, alt: "A garden ceremony pavilion", caption: "The garden" },
  venue4: { src: venue4, alt: "Decorated chairs for the couple", caption: "Saved seats" },
  sign: { src: sign, alt: "A Mr & Mrs wooden sign", caption: "Mr & Mrs" },
} satisfies Record<string, Photo>;

/** Couple photos for the "From the couple" strip on the wall. */
export const COUPLE_STRIP: Photo[] = [
  PHOTOS.portrait2,
  PHOTOS.moment1,
  PHOTOS.portrait3,
  PHOTOS.moment3,
  PHOTOS.detail3,
  PHOTOS.portrait1,
  PHOTOS.moment4,
];

/** Photos scrolling in the homepage marquee (two rows). */
export const MARQUEE_TOP: Photo[] = [
  PHOTOS.detail1,
  PHOTOS.venue1,
  PHOTOS.moment2,
  PHOTOS.detail2,
  PHOTOS.venue2,
  PHOTOS.detail4,
];
export const MARQUEE_BOTTOM: Photo[] = [
  PHOTOS.venue4,
  PHOTOS.moment3,
  PHOTOS.detail5,
  PHOTOS.sign,
  PHOTOS.venue3,
  PHOTOS.moment4,
];

/** Background collage behind the admin PIN screen. */
export const GATE_COLLAGE: Photo[] = [
  PHOTOS.portrait2,
  PHOTOS.detail2,
  PHOTOS.moment1,
  PHOTOS.venue1,
  PHOTOS.detail3,
  PHOTOS.portrait3,
  PHOTOS.venue3,
  PHOTOS.detail1,
  PHOTOS.moment3,
];
