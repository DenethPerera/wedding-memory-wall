# Wedding Memory Wall

A private, single-event site for your sister's wedding: guests scan a QR
code, enter a shared event code, and upload photos, videos and voice notes
straight from their phones. Everything appears instantly on a live gallery
wall — great to project on a screen at the reception.

Not a multi-tenant SaaS like Eventoly — this is wired for exactly one event,
which keeps it simple, cheap and fast.

## Tech stack (and why)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind v4 | Server-rendered for fast first paint, fully static where possible |
| Hosting | Vercel | Serverless — auto-scales for a single-day traffic spike with zero server management |
| Database | Supabase Postgres | Stores upload metadata (who, when, what type); realtime built in |
| File storage | Supabase Storage (S3-compatible, CDN-backed) | Guests upload **directly** to storage via signed URLs — file bytes never pass through your Vercel functions, so 100 people uploading video at once doesn't bottleneck on your app server |
| Live updates | Supabase Realtime | The `/wall` page subscribes to new-row events over a websocket — no polling |
| Animation/UI | Framer Motion, Lucide icons | Smooth, accessible, no emoji-as-icon shortcuts |

**Why this scales for ~100 guests on one day:** the only thing your Next.js
server does per upload is (1) check the PIN cookie and (2) mint a signed
upload URL / write one database row — both sub-100ms operations. The actual
photo/video bytes go straight from the guest's phone to Supabase's storage
CDN. Photos are also compressed in the browser before upload (down to
~1.5MB, max 2400px) so you're not waiting on cellular/venue-wifi uploads of
12MB raw phone photos.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick a region close to the wedding venue (lower latency for uploads).
3. Wait ~2 minutes for provisioning.
4. In **Project Settings → API**, copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → this is `SUPABASE_SERVICE_ROLE_KEY`
     (**never** put this in a `NEXT_PUBLIC_` variable or client code)

## 2. Set up the database and storage bucket

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql)
   and click **Run**.
   - This creates the `uploads` table, locks it down with Row Level
     Security (public read, write only via the service role), creates the
     `wedding-media` storage bucket, and enables Realtime on the table.
3. Double check Realtime is on: **Database → Replication** → the `uploads`
   table should be listed under the `supabase_realtime` publication (the
   SQL script already does this, this is just a sanity check).

## 3. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env.local
```

- `GATE_SECRET` — any long random string. Generate one with:
  ```bash
  openssl rand -hex 32
  ```
- `EVENT_PIN` — the code you'll print on invitations/table cards, e.g.
  `NIMA-SAM-2026`. Keep it easy to type on a phone keyboard (avoid symbols).
- `ADMIN_PIN` — a separate, private code only you and your sister use to
  reach `/admin` (view stats, download everything).
- `NEXT_PUBLIC_COUPLE_NAMES`, `NEXT_PUBLIC_EVENT_DATE`,
  `NEXT_PUBLIC_VENUE`, `NEXT_PUBLIC_HASHTAG` — shown on the homepage and
  countdown.

## 4. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the
PIN screen. Enter your `EVENT_PIN` to get in, then try `/upload` (allow
camera/microphone permissions) and watch items appear on `/wall`.

## 5. Deploy to Vercel

1. Push this project to a **private** GitHub repository.
   ```bash
   git init
   git add .
   git commit -m "Wedding memory wall"
   git remote add origin <your-private-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import that repo.
3. In the import screen (or **Project → Settings → Environment Variables**
   afterward), add every variable from your `.env.local`.
4. Deploy. Vercel gives you a URL like `wedding-memory-wall.vercel.app` —
   add a custom domain there too if you have one (optional).

Vercel's free/hobby tier is plenty for ~100 guests on one day; nothing here
needs a paid plan to work, though see the cost note below.

## 5b. Swap in your own pre-shoot photos

The site ships with placeholder stock photos (free Unsplash images) in
[`public/photos/`](public/photos/). To use your real photos, overwrite each
file with a same-named `.jpg`, then rebuild — sizes and blurred loading
previews are picked up automatically.

| File | Where it shows | Best shape |
|---|---|---|
| `hero.jpg` | Home page, full-screen behind the names | **Vertical** (faces in the upper third) |
| `portrait-1..3.jpg`, `moment-1..4.jpg` | Home polaroids, "From the couple" strip on the wall | Any |
| `detail-1..5.jpg` | Upload page banner, marquee, polaroids | Any |
| `venue-1..4.jpg`, `sign.jpg` | Marquee, wall banner (`venue-2`), "Save the date" card | Landscape |

Captions and alt text live in [`src/lib/photos.ts`](src/lib/photos.ts) — edit
them there. Note that anything in `public/` is reachable without the event
PIN, so only put photos there you're happy to be public.

The design system (colours, fonts, motion rules) is documented in
[`design-system/wedding-memory-wall/MASTER.md`](design-system/wedding-memory-wall/MASTER.md).

## 6. Make it easy for guests to find

- On the homepage, the **Share a memory** / **View the wall** buttons are
  the two links guests need. Put the deployed URL behind a QR code (any
  free QR generator, e.g. [qr-code-generator.com](https://www.qr-code-generator.com/))
  printed on table cards, next to the event PIN.
- Consider a short link (e.g. via a free Bitly/is.gd link) so it's easy to
  read off a card: `your-short-link.com` + code `NIMA-SAM-2026`.

## 7. Before the big day — a quick checklist

- [ ] Walk through the whole flow yourself on a phone: enter PIN → upload a
      photo → record a 10s video → record a voice note → check `/wall`.
- [ ] Confirm the venue's guest wifi (or guests' own mobile data) can
      handle uploads — ask 2-3 family members to test from the venue if
      possible.
- [ ] Set `NEXT_PUBLIC_EVENT_DATE` to the real date/time so the countdown
      and "today's the day" message are correct.
- [ ] Decide who projects `/wall` on a screen at the reception (open it in
      a browser tab, maybe on a laptop connected to a TV/projector — it
      updates live, no refresh needed).
- [ ] Share the `ADMIN_PIN` only with people who should be able to download
      everything afterward.

## 8. After the wedding

Go to `/admin`, enter the admin code, and use **Download all as ZIP**
(optionally filtered to just Photos, Videos, or Voice notes) to save
everything to a computer. Individual items also have their own download
button.

## Notes on limits and tradeoffs (so nothing surprises you later)

- **File size caps** (edit in [`src/lib/event-config.ts`](src/lib/event-config.ts)):
  25MB/photo, 300MB/video, 20MB/voice note. Raise these if needed, but
  bigger videos take longer to upload on venue wifi.
- **The storage bucket is public-read.** Anyone with a direct file URL
  (a random UUID-based path) could view that one file without the PIN.
  The *site* itself is still PIN-gated, and paths aren't guessable or
  listed anywhere public — a reasonable tradeoff for a private one-day
  event in exchange for fast, CDN-served images with no signing overhead.
  If you want stricter privacy, make the bucket private and switch
  `getMediaUrl` to mint signed read URLs instead (ask if you want this
  wired up).
- **The PIN rate-limiter is in-memory**, so it resets whenever a
  serverless instance recycles. Fine for deterring casual guessing at
  ~100 guests; not a substitute for a strong, hard-to-guess `EVENT_PIN`.
- **Voice recording (MediaRecorder)** works in all modern mobile browsers,
  but Safari on older iOS versions can be inconsistent — the recorder
  degrades to showing a "microphone blocked" message rather than crashing
  if permission is denied or the API is unavailable.

## Estimated cost

For a single wedding day with ~100 guests each sharing a handful of
photos/clips: comfortably within Supabase's free tier (500MB DB, 1GB
storage, 2GB bandwidth — if you expect more than a few hundred photos/clips
total, upgrade to Supabase Pro at $25/month for the month of the wedding,
then downgrade) and Vercel's free Hobby tier. Total realistic cost: **$0–25**,
one month.
