# Wedding Memory Wall — Design System (Master)

Source of truth for the frontend. Page-specific deviations go in `pages/<page>.md`.
Derived from the ui-ux-pro-max dataset profiles **Wedding/Event Planning** and
**Couple & Relationship App** (Aurora UI + Soft UI Evolution, storytelling +
gallery reveals, flowing gradients) and the **Wedding/Romance** font pairing.

## Audit of the previous frontend (before redesign)

| Area | Finding | Severity |
|---|---|---|
| Style | Muted terracotta/sage/cream palette — tasteful but reads rustic and flat, not "colourful romance" | High (brief mismatch) |
| Imagery | No photography anywhere; homepage is text + gradient only, empty wall is a dashed box | High |
| Mobile nav | Navbar is a top bar; primary actions (Upload/Wall) sit far from the thumb zone on phones | High |
| Hierarchy | Couple names in plain serif; nothing distinguishes the wedding identity from a generic app | Medium |
| Motion | Only a single fade-up on the home hero and the PIN card; no state/gallery motion, lightbox snaps open | Medium |
| Feedback | Upload success is a small check icon; errors reuse the brand colour (`text-primary`) so error ≠ brand is not distinguishable | Medium |
| A11y | Good baseline: labels, aria-selected tabs, focus on lightbox close, reduced-motion CSS. Missing visible `focus-visible` rings on custom buttons | Medium |
| Tokens | Semantic tokens already in place (kept and extended) | OK |

## Direction: matches the wedding invite

This app is part of the same wedding as the invite site
(https://wedding-invite-azure-mu.vercel.app/), so its colours are taken
directly from the invite's stylesheet: blush page, deep charcoal text, champagne
gold accents, cream cards, dusty-rose sparkles. **Light only** — the invite has no
dark mode, so neither does this app (`color-scheme: light`).

### Colour tokens

| Token | Value | Invite source | Use |
|---|---|---|---|
| `--background` | `#FDECEF` blush | `body` / `bg-blush` | page |
| `--foreground` | `#1F2933` deep charcoal | `body` / `text-deep` | text (14:1) |
| `--card` | `#FCF9F5` cream | card gradient `#FFFFFE → #FCF9F5 → #FAF4EC` | surfaces |
| `--glass` | `rgba(253,236,239,0.7)` | navbar `bg-blush/70` + blur | translucent surfaces |
| `--primary` | `#C8A96A` gold | `bg-gold` / `text-gold` | fills, active state, glows |
| `--primary-foreground` | `#FFFFFF` | RSVP button `text-white` | labels on gold |
| `--secondary` | `#A38042` | RSVP gradient end | gradient partner |
| `--accent` | `#C8A96A` | — | ampersand, hairlines |
| `--gold-ink` | `#A38042` | RSVP gradient end | gold used as small text (a shade deeper than `#C8A96A` so it stays legible on blush) |
| `--coral` / `--peach` / `--lavender` | `#E8A598` / `#FAF4EC` / `#FDF0F2` | sparkles, cream, overlay | aurora blobs only (names kept for compatibility) |
| `--muted` / `--muted-foreground` | `#FDF0F2` / `#5F636B` | overlay tint / `text-deep/70` | secondary text (5.0:1) |
| `--border` | `#EDD8C7` | `border-gold/30` on blush | hairlines |
| `--ring` | `#A38042` | — | focus outline (≥3:1) |
| `--scrim` | `#1F2933` | `text-deep` | dark media overlays (lightbox, wall tiles) |
| `--danger` / `--success` | `#B42318` / `#0F7A55` | — | status — never the brand colour |

Brand gradient (buttons): `#D9B87B → #C8A96A → #A38042`, white labels — same as the invite's RSVP button.
Secondary button: `bg-white/80` + blur, `border-gold/40`, charcoal label — same as the invite's "View details".
Card shadow: `rgba(180,140,80,0.22)`. Sparkles: `#C8A96A`, `#E8A598`, `#D98E82`, `#D9B87B`.
Note: white-on-gold is ~2.3:1 — accepted to match the invite; keep those labels short, bold and ≥14px.

### Typography

| Role | Font | Notes |
|---|---|---|
| Script (names, flourishes) | **Great Vibes** | Short phrases at ≥24px only (names, captions), never body copy |
| Display (headings) | **Cormorant Garamond** 500–700 | Elegant serif headings, italic for emphasis |
| Body / UI | **Jost** 400–600 | Geometric, legible at 16px on phones |

Scale (mobile → desktop): 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64+ (script hero).

### Layout (mobile-first)

- Designed at 375px first; breakpoints 640 / 768 / 1024.
- **Bottom tab bar on phones** (Home · Share · Wall) with a raised gradient
  Share button in the thumb zone; becomes a floating top pill on ≥768px.
- Content reserves bottom padding for the tab bar + `env(safe-area-inset-bottom)`.
- Full-bleed photo hero (`100svh`) on home; photo banners on upload/wall.
- Rounded-3xl cards, glass surfaces only over photography.

### Motion

- Framer Motion for state (tabs `layoutId` pill, lightbox scale/fade, gallery stagger 40ms).
- CSS keyframes for ambient loops (floating hearts 9–16s, aurora drift 14s,
  Ken Burns hero zoom 20s, photo marquee 45s).
- All ambient motion stops under `prefers-reduced-motion`; marquee has a pause control.
- Enter 300–600ms ease-out `[0.16, 1, 0.3, 1]`; exit ~60% of enter.

### Photography

All placeholder photos live in `public/photos/` and are registered in
`src/lib/photos.ts`. Replace a file with a same-named `.jpg` to swap in the
real pre-shoot photos — dimensions and blur placeholders are picked up
automatically at build time via static imports.

### Anti-patterns to avoid

- Emoji as icons (use Lucide only)
- Brand rose used for error text
- Script font under 24px or for anything longer than a short phrase
- Animating width/height/top/left (transform + opacity only)
- Text over photos without a scrim
