# The Karate Attorney — karateattorney.com

Personal-brand site for Ibrahim Awad ("The Karate Attorney"). Distinct from the
law-firm site (theawadlawfirm.com) but cross-links to it on every page.

Full spec: [karate-attorney-build-prompt.md](karate-attorney-build-prompt.md).

## Stack

- [Astro](https://astro.build) + TypeScript, static-first with on-demand server
  routes via the Node adapter (standalone mode)
- Tailwind CSS v4 (design tokens in `src/styles/global.css` via `@theme`)
- Lenis (smooth scroll) + GSAP ScrollTrigger (animations) — added in the
  layout slice
- Three.js/OGL 3D hero island — added in the hero slice
- Resend + Cloudflare Turnstile — added in the speaker-form slice

## Commands

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm install`     | Install dependencies                      |
| `npm run dev`     | Start dev server at `localhost:4321`      |
| `npm run build`   | Build production site to `./dist/`        |
| `npm run preview` | Preview the production build locally      |

## Environment variables

See [.env.example](.env.example). None required yet; each slice that introduces
one documents it there and in this section.

## Deploy

Target: Node standalone output (`node ./dist/server/entry.mjs`), self-hosted on
Coolify (Hetzner) behind Cloudflare. Detailed steps land in the final slice.
