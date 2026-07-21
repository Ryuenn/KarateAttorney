# Build Prompt — The Karate Attorney (karateattorney.com)

You are a senior front-end engineer building a high-end, animation-driven personal-brand website from scratch. Read this entire brief before writing code. Where something is unspecified or an asset is missing, use a clearly-marked placeholder and note it — do not silently invent facts about the client.

---

## 1. Goal & reference

Build the personal-brand site for **Ibrahim Awad — "The Karate Attorney"**: trial lawyer, martial artist, TEDx speaker, khateeb, founder, philanthropist. The site is about the man, message, and mission — it is **distinct from** his law firm site (theawadlawfirm.com) but cross-links to it.

Visual/UX bar: **Awwwards-tier**, in the spirit of `xnrgyclub.com` — full-bleed autoplay video hero, buttery smooth scroll, confident large typography, scroll-triggered reveals, generous whitespace.

**Two non-negotiable business goals:**
1. **Speaker Request funnel** — the #1 conversion feature. Organizations (especially masjids, Islamic schools, MSAs, conferences) must be able to book Ibrahim as a speaker/khateeb fast.
2. **Route legal-client traffic out** — many visitors type karateattorney.com intending to *hire him as an injury lawyer*. Capture that intent instantly and send it to theawadlawfirm.com. This must be impossible to miss on **every** page.

---

## 2. Tech stack (use exactly this)

- **Astro** (latest), TypeScript, **hybrid/SSR** via the Node adapter (needed for the form endpoint)
- **Tailwind CSS** for styling — design tokens defined in config (see §4)
- **Lenis** for smooth scroll
- **GSAP + ScrollTrigger** for animations (loaded only on pages/sections that need it; prefer Astro islands / client directives so JS stays minimal)
- **Three.js** (or **OGL** for a lighter bundle) for the signature scroll-driven 3D hero element — isolated in a single lazy client-only island, **not** React Three Fiber (don't pull React in for one effect). See §4.
- **Astro Content Collections** (MDX/Markdown) for the Content Hub and any article/reflection content — the site owner authors content himself
- **Speaker form backend:** Astro server endpoint (POST) → **Resend** for transactional emails → **Cloudflare Turnstile** for spam → webhook to an n8n workflow / Google Sheet for CRM handoff (make the webhook target an env var; stub it if not provided)
- **Deploy target:** Node output, self-hosted on Coolify (Hetzner), Cloudflare in front. Assume env vars via `.env`; document every var you introduce in the README.

Keep dependencies lean. No page builders. No jQuery. No UI kit unless justified.

---

## 3. Site architecture

Every area below must exist, and the Speaker Request funnel + "Need a Lawyer?" pathway must be reachable from every page.

**Pages / routes**
- `/` **Home** — video hero, one-line identity statement, two co-equal above-the-fold CTAs: **"Book Ibrahim to Speak"** and **"Injured? Hire Ibrahim → The Awad Law Firm"** (links to theawadlawfirm.com). Both visible without scrolling on mobile.
- `/about` **My Story** — full narrative: Palestinian-American roots, building the firm, martial-arts journey, faith, family.
- `/speaking` **Speaking (primary funnel)** — speaker reel, TEDx embed ("Beautiful Patience"), topic list, audience types, testimonials, past venues, and the **Speaker Request form** (§5).
- `/attorney` **The Attorney** — biographical/values overview; prominent link out to theawadlawfirm.com for legal inquiries. No practice-area detail (that lives on the firm site).
- `/martial-artist` **The Martial Artist** — training story, Team Karate Attorney, ring-to-courtroom philosophy ("Keep Your Hands Up").
- `/faith` **Faith & Community** — khutbahs, Team Fajr, community leadership.
- `/ventures` **Ventures** — cards/subpages for Palistory, Awad Academy, Team Karate Attorney, each linking out.
- `/giving` **Giving Back** — philanthropy & community initiatives.
- `/content` **Content Hub** — videos, reels, articles; **filterable by category** (legal education / motivational / faith). Powered by content collections.
- `/contact` **Contact** — form opening with a **triage chooser**: "I need a lawyer" (→ firm site/intake) · "Book Ibrahim to speak" (→ speaker form) · "Other". Legal inquiries must never land in the wrong inbox.
- `/lawyer` (and `/hire-me`) — instant redirect / one-click forward to theawadlawfirm.com, for social bios and video links.

**Global elements (in the shared layout)**
- Persistent header **"Book Ibrahim to Speak"** button on every page.
- Persistent header **"Need a Lawyer?"** button on every page, styled distinctly (**gold**), linking to theawadlawfirm.com.
- Slim top announcement bar: "Looking to hire Ibrahim for your injury case? Go to The Awad Law Firm →".
- Footer: social links (Instagram, YouTube, TikTok, LinkedIn), links to theawadlawfirm.com / Palistory / Awad Academy, and a newsletter signup.
- Legal-routing copy in **English and Spanish** where relevant ("¿Lesionado? Visite The Awad Law Firm").

---

## 4. Design system

- **Palette:** navy + gold as the core brand (define `navy`, `gold`, plus neutrals/ink/paper in Tailwind theme tokens). Strong, professional, warm.
- **Typography:** one confident display face for headlines (large, tight), one clean readable sans for body. Expose as tokens; make headline sizes fluid (`clamp`).
- **Imagery mix:** courtroom/professional, gi-and-gloves training, family/community, speaking-stage. Use `<Image>`/`astro:assets` for optimization; supply sized placeholders where real photos aren't provided.
- **Motion language:** smooth scroll (Lenis) + GSAP ScrollTrigger reveals (fade/translate on section entry, hero text stagger, optional pinned section). Respect `prefers-reduced-motion` — disable non-essential motion when set.
- **Mobile-first & accessible** (WCAG AA): semantic landmarks, focus states, alt text, keyboard-navigable menu, sufficient contrast on gold-on-navy.

### Signature 3D hero element (WebGL)

A scroll-reactive 3D centerpiece — the site's "wow" moment. An abstract mesh (default: a displaced / simplex-noise-deformed sphere or torus, **navy body with a molten-gold metallic material**) that:
- Idle-rotates slowly, and **deforms + spins faster as the user scrolls** — drive shader uniforms (displacement amount, rotation, color mix) from scroll progress via Lenis/ScrollTrigger.
- Optional subtle pointer parallax on desktop.
- Uses a vertex-displacement shader for the "deform" feel; keep the poly-count modest.

Concept is swappable: default to the abstract navy-gold form; if the client later supplies a brand object (stylized medal/coin, calligraphic form, gi/glove mesh) it drops in as a GLTF. Keep it tasteful and premium — not a generic gimmick blob.

**Hard performance/UX guardrails (do not skip — this is the #1 way an Awwwards site tanks its mobile Lighthouse):**
- Single **lazy client-only island**; dynamic-import the WebGL code so it never blocks first paint or LCP. Hero headline + CTAs must render instantly without it.
- **Static fallback** (poster image or CSS gradient) shown when: `prefers-reduced-motion` is set, WebGL is unavailable, on low-end/mobile devices, or on save-data / slow connections. Feature-detect and degrade gracefully — never a blank canvas.
- Pause the render loop when the canvas is offscreen (IntersectionObserver) and when the tab is hidden (`visibilitychange`). rAF-driven; no runaway loops.
- Cap `devicePixelRatio` (≤2), throttle resize, and dispose geometries/materials/renderer on unmount.
- If it threatens Core Web Vitals on mobile, ship the static fallback there entirely — the SEO bar in §6 wins ties.

---

## 5. Speaker Request form — functional spec (highest priority)

**Fields**
- Organization name + type (masjid, Islamic school, MSA/university, nonprofit, conference, corporate, law firm/legal association, other)
- Contact person: name, role, email, phone
- Event name; date(s) with a "flexible" option; location (city/state) + in-person vs virtual
- Engagement type: keynote, motivational talk, jumu'ah khutbah, workshop, fundraiser/banquet, panel, youth program
- Audience: expected size, age range, description
- Requested topic (dropdown of preset topics + "other / let's discuss")
- Honorarium/budget range (optional; include note that budget should never stop anyone from asking)
- "Anything else Ibrahim should know" (open text)

**Behavior / acceptance criteria**
- Single-column, mobile-friendly; conditional fields where sensible (e.g. virtual hides physical-location bits).
- On submit → confirmation screen **and** automatic confirmation email to the requester (Resend) **and** notification email to Ibrahim's designated inbox (env var).
- Spam protection via **Cloudflare Turnstile** (server-verified) + honeypot.
- Fire an analytics conversion event on successful submit (this is the site's primary KPI).
- Post to the CRM webhook (env var) so requests are never lost; fail gracefully if the webhook is down (still send emails, still confirm).
- Server-side validation; never trust client input.

Preset speaker topics for the dropdown: Beautiful Patience (sabr); Keep Your Hands Up (faith, discipline, never quitting); Fajr First; Unreasonable Hospitality — Islamic edition (ihsan); Facts Inform, Stories Transform (Palestinian memory); The Muslim Professional.

---

## 6. Performance, SEO & analytics (owner is an SEO specialist — hold a high bar)

- Target green Core Web Vitals on mobile. Ship minimal JS; hydrate only interactive islands.
- **Hero video:** `muted` + `autoplay` + `loop` + `playsinline`, `poster` fallback, a compressed + a lighter mobile-specific source (or poster-only on small screens / slow connections), served from Cloudflare. Never block LCP on the video — poster paints first.
- Per-page `<title>`, meta description, canonical, and Open Graph/Twitter tags. Central SEO component.
- `sitemap.xml` + `robots.txt`. JSON-LD structured data: `Person` for Ibrahim, `Event`/`Service` where it fits the speaking offering.
- Optimized responsive images (`astro:assets`), lazy-loaded below the fold.
- Analytics with event tracking wired for: **speaker form submissions (primary)** and **every firm-site link click (secondary conversion)**. Make the analytics provider swappable via env/config.

---

## 7. Build order (work in vertical slices; confirm before assuming)

1. Scaffold: Astro + TS + Tailwind + Node adapter; commit a clean baseline.
2. Design tokens (palette, type, spacing) in Tailwind config; a small style reference page.
3. Shared layout: header with both persistent CTAs, announcement bar, footer, mobile nav. Wire Lenis + a reduced-motion-safe GSAP setup.
4. Home hero (video + dual CTA + entrance animation) as the first showcase section. **Get the hero painting instantly with JS disabled first** — the 3D layers on top of a working hero, never as a dependency of it.
5. **Signature 3D hero island** — WebGL centerpiece with scroll-driven deform, behind every fallback/guardrail in §4. Verify hero + CTAs still render with the island removed.
6. **Speaker form vertical slice** end-to-end (endpoint + Resend + Turnstile + webhook stub) before heavy design polish — it's the core feature and the riskiest.
7. `/lawyer` redirect + confirm the "Need a Lawyer?" routing appears sitewide.
8. Remaining pages with placeholder copy structured for real content; Content Hub with content collections + category filter.
9. SEO layer, structured data, sitemap, analytics events.
10. Accessibility + performance pass; README documenting env vars, content-authoring workflow, and deploy steps for Coolify.

**Rules of engagement**
- Real copy, bios, testimonials, video links, photos, and social handles are **not final** — use obvious placeholders (`[PLACEHOLDER: ...]`) and list what you need from the client. Do not fabricate quotes or specifics about the client or his family.
- Keep children's names/faces/details off the site.
- Ask me before adding any dependency not listed in §2, or before making an assumption that would be expensive to reverse.
- Prefer small, reviewable commits with clear messages.

Start by confirming your understanding and proposing the file/folder structure, then scaffold.
