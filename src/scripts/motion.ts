/**
 * Sitewide motion foundation (spec §4): Lenis smooth scroll + GSAP
 * ScrollTrigger reveals. Reduced-motion-safe by design — when the user
 * prefers reduced motion nothing here runs, native scrolling is kept, and
 * content is fully visible because reveal states are applied by JS only.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

if (!prefersReducedMotion) {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.12 });
  window.__lenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Page preloader reveal (overlay exists only when the inline head
  // script in BaseLayout added .ka-preload): the logo fades in and holds
  // while the navy panels slide up staggered, then the logo rises and fades
  // out over the revealed page.
  const root = document.documentElement;
  const preloader = document.getElementById('preloader');
  const preloading = root.classList.contains('ka-preload') && !!preloader;
  let heroDelay = 0.15;

  // Section reveals: any element with [data-reveal] fades/rises on entry.
  // Initial hidden state is set here (not in CSS) so content is always
  // visible without JS — a failed script can never blank the page.
  // Elements already inside the first viewport get a visible entrance
  // cascade instead of triggering (and finishing) during page paint.
  const startReveals = () => {
    let inViewCount = 0;
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const inView =
        el.getBoundingClientRect().top < window.innerHeight * 0.88;
      const delay =
        parseFloat(el.dataset.revealDelay ?? '0') +
        (inView ? 0.15 + inViewCount++ * 0.08 : 0);
      gsap.from(el, {
        opacity: 0,
        y: 28,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  };

  if (preloading && preloader) {
    preloader.dataset.started = '1';
    // Logo fades in and holds while the four columns slide away —
    // alternating up/down, staggered in random order (xnrgy-style);
    // the logo fades near the end, floating over the half-revealed page.
    gsap
      .timeline({
        onComplete: () => {
          preloader.remove();
          root.classList.remove('ka-preload');
          // Reveals are created only now, so nothing plays hidden
          // beneath the overlay.
          startReveals();
        },
      })
      .to('.preloader-logo', { opacity: 1, duration: 0.45, ease: 'power2.out' })
      .addLabel('exit', '+=0.25')
      .to(
        preloader.querySelectorAll('.preloader-panel'),
        {
          yPercent: (i: number) => (i % 2 === 0 ? -100 : 100),
          duration: 0.9,
          ease: 'power4.inOut',
          stagger: { each: 0.12, from: 'random' },
        },
        'exit',
      )
      // Exit: the logo rises and fades out IN LOCKSTEP with the panels —
      // same start ('exit' label), same duration and ease — so it clears
      // together with the cards instead of lagging behind.
      .to(
        '.preloader-logo',
        { opacity: 0, y: -80, duration: 0.9, ease: 'power4.inOut' },
        'exit',
      );
    // Hero lines rise while the columns are mid-reveal.
    heroDelay = 1.2;
  } else {
    startReveals();
  }

  // Hero entrance: staggered rise for [data-hero-line] elements on load.
  const heroLines = document.querySelectorAll<HTMLElement>('[data-hero-line]');
  if (heroLines.length) {
    gsap.from(heroLines, {
      opacity: 0,
      y: 36,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.09,
      delay: heroDelay,
    });
  }

  // Inner-page hero photo: the bottom-right quadrant frame slides in from the
  // right edge (PageHero — the homepage hero is a different component and is
  // untouched).
  //
  // No rotation and no fade. The frame is already pinned to the right edge of
  // the viewport, so it simply arrives from just off it — the same panel-slide
  // vocabulary as the preloader columns, which travel vertically. The section
  // clips on X, so the frame is invisible until it crosses the edge; a fade
  // would only muddy an entrance that is already clean.
  //
  // The photo inside lags behind the frame — it travels a shorter distance, so
  // it drifts against the moving edge instead of being carried rigidly with
  // it. That differential is the whole effect. It is also why the photo is
  // over-scaled: at rest the frame crops it exactly, leaving no slack to shift
  // within, so the scale buys overhang on both sides. 8% of travel against
  // 12.5% of overhang per side keeps the frame covered for the entire tween —
  // if you raise the shift, raise the scale with it or a bare strip of
  // background will show at the leading edge.
  //
  // Timing: starts a beat AHEAD of the wordmark lines (heroDelay, 1.2s) while
  // the preloader columns are still clearing, so the photo is already settling
  // as the last column leaves rather than beginning after it.
  const heroPhoto = document.querySelector<HTMLElement>('[data-hero-photo]');
  if (heroPhoto) {
    const heroPhotoImg = heroPhoto.querySelector<HTMLElement>(
      '[data-hero-photo-inner]',
    );

    const photoTl = gsap.timeline({ delay: preloading ? 0.95 : 0.1 });

    photoTl.from(heroPhoto, {
      xPercent: 100,
      duration: 1.1,
      ease: 'power4.out',
      // Dropped afterwards so the compositor hint does not outlive the
      // one-shot entrance (it costs a layer for the life of the page).
      onComplete: () => {
        heroPhoto.style.willChange = '';
      },
    });
    heroPhoto.style.willChange = 'transform';

    if (heroPhotoImg) {
      // Runs alongside (position 0) and settles a little later, so the photo
      // is still easing as the frame lands — the lag must outlive the slide,
      // or the two arrive together and read as one rigid block.
      photoTl.from(
        heroPhotoImg,
        { xPercent: -8, scale: 1.25, duration: 1.35, ease: 'power4.out' },
        0,
      );
    }
  }

  // Homepage scroll-cover polish. The pinning itself is CSS (.hero-sticky
  // in global.css) so the effect works without JS; this only adds the depth
  // cues — the hero dims and eases back slightly as the next section
  // travels over it, instead of sitting flat behind the overlay.
  const heroSticky = document.querySelector<HTMLElement>('.hero-sticky');
  const heroCover = document.querySelector<HTMLElement>('.hero-cover');
  // Animate the hero's inner section, never .hero-sticky itself — a
  // transform on the sticky box shrinks it about its own centre, which
  // pushes its top edge down and visibly unpins it from the header.
  const heroInner = heroSticky?.firstElementChild as HTMLElement | null;
  if (heroInner && heroCover) {
    gsap.to(heroInner, {
      scale: 0.94,
      opacity: 0.35,
      transformOrigin: '50% 30%',
      ease: 'none',
      scrollTrigger: {
        trigger: heroCover,
        // Runs across the first screenful of cover travel: begins as the
        // covering section reaches the fold, completes once it has fully
        // taken the viewport.
        start: 'top bottom',
        end: 'top top',
        scrub: 0.4,
      },
    });
  }

  // Split-headline testimonials. The two headline halves start closed and
  // push apart horizontally while the card column scrolls up through the
  // gap between them, with the whole stage pinned by `position: sticky`.
  const stage = document.querySelector<HTMLElement>('[data-split-stage]');
  const track = document.querySelector<HTMLElement>('[data-split-track]');
  const splitLeft = document.querySelector<HTMLElement>('[data-split-left]');
  const splitRight = document.querySelector<HTMLElement>('[data-split-right]');

  // Below this width there is no room for the (large) headline either side
  // of the card column — the words would collide with the quotes — so
  // narrower screens keep the plain stacked section instead. The threshold
  // is tied to the headline size: bigger type needs a wider viewport.
  const splitFits = window.matchMedia('(min-width: 1280px)').matches;

  if (splitFits && stage && track && splitLeft && splitRight) {
    // Switches the stage from the stacked fallback to the pinned layout.
    // The section header is pinned at the top of the stage (see global.css),
    // so it travels with the headline instead of drifting a screen away.
    document.documentElement.classList.add('ka-split');

    // Card travel geometry, measured (not assumed) so it survives the
    // pinned container's padding/centring. The column starts a little below
    // the fold and travels up until the LAST card has just cleared the top.
    //
    //   startY : y offset that puts the first card just below the fold
    //   endY   : y offset at which the track's bottom edge reaches the top
    //            (plus a small margin so the last card fully exits)
    //
    // trackRestBottom is where the track's bottom sits with no transform, in
    // viewport coordinates — read once the stage is pinned. endY is then the
    // negative offset that lifts that bottom edge to just above the fold.
    // The stage height (scroll budget) is sized to exactly this travel, so
    // the last card clears the screen the instant the pin releases and
    // scrolling on lands straight in the next section — no empty gap.

    // The pinned container (the sticky box) is the track's offset parent
    // chain; the track's bottom *within* that box is constant no matter
    // where the page is scrolled. Measuring bottom-relative-to-pin gives a
    // stable "rest bottom" free of both the scroll position and any y tween.
    const pinBox = stage.firstElementChild as HTMLElement;
    const trackRestBottom = () => {
      const y = (gsap.getProperty(track, 'y') as number) || 0;
      const tb = track.getBoundingClientRect().bottom;
      const pb = pinBox.getBoundingClientRect().top;
      return tb - pb - y; // track bottom relative to pin top, untransformed
    };
    // The track's untransformed TOP, relative to the pin top. (Its bottom
    // minus its own height.) Used to place the whole column just below the
    // fold at the start, so the FIRST card enters from the bottom edge
    // rather than appearing already stacked mid-screen.
    const trackRestTop = () => trackRestBottom() - track.scrollHeight;

    // Start: the track's top edge sits a touch below the fold, so the first
    // card rises up into view from the very bottom.
    const startY = () => window.innerHeight - trackRestTop() + 24;
    // End: the track's bottom (last card) still at the FOLD, not fully above
    // it — so as the pin releases, the last card exits through the top
    // exactly while the next section rises in from the bottom. Ending it
    // fully cleared instead would leave an empty viewport scrolling past.
    const endY = () => window.innerHeight - trackRestBottom();
    const cardTravel = () => startY() - endY();

    // Pin duration = stageHeight - viewport, and the card tween is scrubbed
    // across it (end: 'bottom bottom'). We want that duration to equal the
    // card travel, so the pin releases exactly as the last card exits — and
    // because the sticky box is only as tall as the viewport, the next
    // section sits immediately below, with no empty trailing scroll.
    const sizeStage = () => {
      stage.style.height = `${window.innerHeight + cardTravel()}px`;
    };
    sizeStage();

    // Open targets, computed per side so the layout is *balanced*, not just
    // symmetric about the viewport centre. The two words differ in width
    // ("What They" ≠ "Said.") and the card column may not be exactly
    // centred, so equal outward travel leaves unequal gaps. Instead each
    // word is placed to leave the same inner margin beside the cards; the
    // outer margins then come out equal too, since word + inner-gap is the
    // same on both sides. A cap keeps the outer edge off the screen edge.
    const CARD_MARGIN = 40; // desired px between each word and the card column

    // Returns { left, right } — the x delta each half animates to. Left is
    // negative (moves left), right positive.
    const splitTargets = () => {
      const t = track.getBoundingClientRect();
      const lx = gsap.getProperty(splitLeft, 'x') as number;
      const rx = gsap.getProperty(splitRight, 'x') as number;
      const l = splitLeft.getBoundingClientRect();
      const r = splitRight.getBoundingClientRect();

      // Rest (untransformed) inner edges.
      const lRestRight = l.right - lx;
      const rRestLeft = r.left - rx;

      // Target inner edges: one CARD_MARGIN outside each card edge.
      const lTargetRight = t.left - CARD_MARGIN;
      const rTargetLeft = t.right + CARD_MARGIN;

      let left = lTargetRight - lRestRight; // ≤ 0
      let right = rTargetLeft - rRestLeft; // ≥ 0

      // Keep both outer edges at least this far from the screen edge; if
      // one side would overshoot, pull both back equally so they stay
      // balanced rather than one word hugging the glass.
      const EDGE = 48;
      const lRestLeft = l.left - lx;
      const rRestRight = r.right - rx;
      const leftOuter = lRestLeft + left; // resulting left edge of left word
      const rightOuter = rRestRight + right; // resulting right edge of right word
      const overLeft = EDGE - leftOuter; // >0 if too far left
      const overRight = rightOuter - (window.innerWidth - EDGE); // >0 if too far right
      const pullback = Math.max(0, overLeft, overRight);
      left += pullback;
      right -= pullback;

      return { left: Math.min(0, left), right: Math.max(0, right) };
    };

    gsap
      .timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      })
      // Phase 1 — the halves part outward from centre. Opens quickly (over
      // the first ~fifth of the stage) so the words are fully apart before
      // the first card climbs to the headline row, avoiding a brief frame
      // where a card sits on top of the still-closed words.
      .fromTo(
        splitLeft,
        { x: 0 },
        { x: () => splitTargets().left, ease: 'power2.out', duration: 0.2 },
        0,
      )
      .fromTo(
        splitRight,
        { x: 0 },
        { x: () => splitTargets().right, ease: 'power2.out', duration: 0.2 },
        0,
      )
      // Phase 2 — the column travels up through the opened gap. Starts just
      // below the fold so the first card enters after the split opens, and
      // ends with the last card exactly cleared off the top. Because the
      // stage height is sized to this same travel, the tween reaches its end
      // as the pin releases — so scrolling on lands straight in the next
      // section with no empty gap.
      .fromTo(
        track,
        { y: () => startY() },
        { y: () => endY(), ease: 'none', duration: 1 },
        0,
      );

    // Re-measure on resize: the stage height and split distance are both
    // viewport-derived, so a stale value would mistime the whole sequence.
    window.addEventListener('resize', () => {
      sizeStage();
      ScrollTrigger.refresh();
    });
  }

  // "Three Arenas" scroll-stepper. The section is pinned for one screenful
  // per card; as it scrolls, the active card swaps 01 → 02 → 03. Without this
  // (no JS / reduced motion) the cards render stacked and readable — see the
  // `.ka-arenas` rules in global.css, added here only once wired.
  const arenasSection = document.querySelector<HTMLElement>('[data-arenas]');
  const arenaCards = arenasSection
    ? Array.from(arenasSection.querySelectorAll<HTMLElement>('[data-arena-card]'))
    : [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stageEl = arenasSection?.querySelector<HTMLElement>('.ka-arenas-stage');
  const arenaTrack = arenasSection?.querySelector<HTMLElement>('[data-arena-track]');

  if (arenasSection && stageEl && arenaTrack && arenaCards.length > 1 && !reduceMotion) {
    document.documentElement.classList.add('ka-arenas');

    // Masked-window stepper (reference behaviour): the white window is a fixed
    // height that clips the card track inside it, so the next card is hidden
    // below the mask until the track slides up to reveal it — nothing shows
    // outside the white frame. The pin is pure CSS `position: sticky` on the
    // stage (Lenis drives real document scroll, so the wheel is never
    // captured, cursor position irrelevant).
    //
    // Each card fills exactly one window height (--ka-card-h). Scrolling
    // translates the track up by (cardHeight × progress × (cards-1)), so each
    // screenful advances exactly one card cleanly into the window.
    let cardH = 0;
    const steps = arenaCards.length - 1;

    const measure = () => {
      const vh = window.innerHeight;
      // Window height: a comfortable share of the viewport (leaves room for
      // the side labels and the pinned frame breathing space).
      cardH = Math.min(vh * 0.82, 700);
      arenasSection.style.setProperty('--ka-card-h', `${cardH}px`);
      // Scroll budget: one screenful per transition between cards.
      arenasSection.style.height = `${vh * arenaCards.length}px`;
    };
    measure();

    const render = (progress: number) => {
      // Translate up by whole card heights across the scroll; the track moves
      // from 0 (card 0 shown) to -(cardH × steps) (last card shown).
      gsap.set(arenaTrack, { y: -cardH * steps * progress });
    };
    render(0);

    ScrollTrigger.create({
      trigger: arenasSection,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onUpdate: (self) => render(self.progress),
    });

    window.addEventListener('resize', () => ScrollTrigger.refresh());
  }

  // Let islands (e.g. the WebGL hero) hook into the same scroll instance.
  document.dispatchEvent(new CustomEvent('ka:motion-ready'));
}
