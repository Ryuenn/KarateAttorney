# The Karate Attorney — karateattorney.com

Personal-brand site for **Ibrahim Awad** ("The Karate Attorney") — trial
lawyer, martial artist, TEDx speaker, khateeb. Distinct from the law-firm site
([theawadlawfirm.com](https://theawadlawfirm.com)) but routes legal-intent
visitors there from every page.

Full spec: [karate-attorney-build-prompt.md](karate-attorney-build-prompt.md).

## Business goals (in priority order)

1. **Speaker Request funnel** — `/speaking#request` → `/api/speaker-request`.
   Primary KPI event: `speaker_request_submitted`.
2. **Route legal clients out** — every outbound firm link carries
   `data-firm-link` and fires the `firm_link_click` event. `/lawyer` and
   `/hire-me` are HTTP redirects to the firm site.

## Stack

- **Astro 7** + TypeScript, static-first: pages prerender; the form endpoints
  (`/api/*`) and redirects run on-demand via **@astrojs/node** (standalone)
- **Tailwind CSS v4** — all design tokens in [src/styles/global.css](src/styles/global.css)
  (`@theme` block: navy/royal-blue palette, fluid type scale, motion/rhythm tokens)
- **Lenis** + **GSAP ScrollTrigger** — [src/scripts/motion.ts](src/scripts/motion.ts);
  fully skipped under `prefers-reduced-motion`, content never depends on JS
- **Content Collections** (Markdown) — the Content Hub, see “Authoring” below
- **Resend** (email) + **Cloudflare Turnstile** (spam) + CRM webhook on the
  speaker form; all optional in dev with logged fallbacks

Fonts: headings use a system **Helvetica Neue** stack (`--font-display` in
[global.css](src/styles/global.css), matching the XNRGY reference — no webfont,
falls back to Helvetica/Arial); the **Inter** body face is downloaded at build
time and self-hosted via Astro's fonts API. Swap either in
[astro.config.mjs](astro.config.mjs) + the `--font-*` tokens.

## Commands

| Command           | Action                                        |
| :---------------- | :-------------------------------------------- |
| `npm install`     | Install dependencies                          |
| `npm run dev`     | Dev server at `localhost:4321`                |
| `npm run build`   | Production build to `./dist/`                 |
| `npm run preview` | Preview the production build                  |

Run the production server with `node ./dist/server/entry.mjs` (respects
`HOST`/`PORT`).

## Environment variables

Copy [.env.example](.env.example) to `.env`. `PUBLIC_*` variables are inlined
at **build** time; everything else is read at **runtime** (set them in Coolify
and they apply without a rebuild — except `PUBLIC_*`, which need a redeploy).

| Variable | Used for | Unset behavior |
| :-- | :-- | :-- |
| `RESEND_API_KEY` | Transactional email (both forms) | Emails skipped, request logged |
| `SPEAKER_NOTIFY_EMAIL` | Speaker-request notifications | No notification sent (logged) |
| `SPEAKER_FROM_EMAIL` | From address (verified Resend sender) | Resend onboarding address |
| `CONTACT_NOTIFY_EMAIL` | General-contact messages | Falls back to `SPEAKER_NOTIFY_EMAIL` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget (build-time) | Widget hidden, notice shown |
| `TURNSTILE_SECRET_KEY` | Server-side spam verification | Verification skipped (dev only) |
| `CRM_WEBHOOK_URL` | n8n/Sheet handoff of speaker requests | Handoff skipped (emails still send) |
| `PUBLIC_ANALYTICS_PROVIDER` | `plausible` \| `ga4` \| `none` | No analytics |
| `PUBLIC_ANALYTICS_ID` | Plausible domain / GA4 measurement ID | No analytics |
| `PUBLIC_NEWSLETTER_ACTION` | Footer newsletter form POST target | Disabled notice shown |

## Authoring content (Content Hub)

Add a Markdown file to `src/content/hub/` — filename becomes the URL slug:

```markdown
---
title: 'Why the first offer is rarely the best offer'
description: 'One sentence shown on the card and in search results.'
category: legal-education   # legal-education | motivational | faith
type: video                 # video | reel | article
date: 2026-08-01
videoUrl: 'https://youtube.com/…'   # video/reel only
draft: false                # true hides it everywhere
---

Body (articles) or context notes (videos) in plain Markdown.
```

Delete the `sample-*.md` placeholder entries once real content exists. The
hub page, category filter, detail pages, and sitemap all update automatically
on the next build.

## Deploying on Coolify (Hetzner) behind Cloudflare

1. Coolify → new **Application** from this git repo, build pack **Nixpacks**
   (or Dockerfile if preferred). Build command `npm run build`, start command
   `node ./dist/server/entry.mjs`, port `4321` (or set `PORT`).
2. Set all environment variables above in Coolify. Remember `PUBLIC_*` are
   baked in at build — change ⇒ redeploy.
3. Point DNS at the server through Cloudflare (proxy on). Recommended:
   cache static assets (`/_astro/*` is content-hashed and safe for
   long-lived caching), leave HTML uncached.
4. Hero video: the compressed renditions (`public/media/hero.mp4` desktop,
   `hero-mobile.mp4` mobile) and poster (`hero-poster.jpg`) are committed
   and deploy with the site. The 4K master (`video-hero.mp4`) is
   gitignored (too large for GitHub); to regenerate renditions from a new
   master:

   ```sh
   ffmpeg -y -i public/media/video-hero.mp4 -vf scale=1920:-2 -c:v libx264 \
     -preset fast -crf 26 -an -pix_fmt yuv420p -movflags +faststart \
     public/media/hero.mp4
   ffmpeg -y -i public/media/video-hero.mp4 -vf scale=960:-2 -c:v libx264 \
     -preset fast -crf 28 -an -pix_fmt yuv420p -movflags +faststart \
     public/media/hero-mobile.mp4
   ffmpeg -y -ss 1 -i public/media/video-hero.mp4 -frames:v 1 \
     -vf scale=1920:-2 -q:v 3 public/media/hero-poster.jpg
   ```

   Moving them to Cloudflare R2/Stream later only changes the two
   `<source>` URLs in [Hero.astro](src/components/home/Hero.astro).
5. Turnstile: create the widget for `karateattorney.com` in the Cloudflare
   dashboard to get the site key + secret.

## Accessibility & performance notes

- WCAG AA: semantic landmarks, skip link, visible focus rings, labelled
  form fields, `aria-pressed` filter buttons, AA-checked color pairs
  (see `/styleguide`).
- Reduced motion: Lenis/GSAP/WebGL all no-op; reveal states are JS-applied so
  a failed script can never hide content.
- The hero poster is the LCP; video sources attach client-side only on fast
  connections (never on save-data/2G), lighter rendition on small screens.
- The 3D WebGL hero element was removed at the owner's request
  (2026-07-22); it lives in git history (`src/scripts/webgl/`, dep `ogl`)
  if it's ever wanted back.

## Asset & content checklist (needed from the client)

Everything marked `[PLACEHOLDER: …]` in the codebase, principally:

- **Copy**: hero identity statement + sublines, page intros, About chapters,
  attorney/martial-artist/faith/giving narratives, venture descriptions,
  newsletter pitch, meta descriptions
- **Speaking**: reel video, TEDx "Beautiful Patience" YouTube ID, 1-line
  description per signature topic, testimonials (quote/name/role/org), past
  venues list
- **Media**: ~~hero video~~ (done — renditions generated from the provided
  4K master); photography (courtroom, training, speaking, community — no
  children's faces/names); a 1200×630 Open Graph image
- **Links**: Instagram/YouTube/TikTok/LinkedIn URLs; Palistory, Awad
  Academy, Team Karate Attorney URLs; newsletter provider
- **Config**: speaker notification inbox, verified Resend sending domain,
  Turnstile keys, CRM webhook URL, analytics provider + ID
- **Brand**: final typography pair (headings use a Helvetica Neue system
  stack, body Inter — both swappable placeholders),
  confirmation of the navy/royal-blue hex values in `global.css`
