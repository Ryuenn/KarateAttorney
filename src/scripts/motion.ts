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

  // First-visit preloader reveal (overlay exists only when the inline head
  // script in BaseLayout added .ka-preload): wordmark fades in/out, then
  // the navy panels slide up staggered, uncovering the page.
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
    try {
      sessionStorage.setItem('ka-preloaded', '1');
    } catch {
      /* storage unavailable — the overlay still clears below */
    }
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
      .to('.preloader-logo', {
        opacity: 0,
        duration: 0.3,
        delay: 0.35,
        ease: 'power2.in',
      })
      .to(
        preloader.querySelectorAll('.preloader-panel'),
        {
          yPercent: -100,
          duration: 0.75,
          ease: 'power4.inOut',
          stagger: 0.06,
        },
        '-=0.05',
      );
    // Hero lines rise while the panels are mid-reveal.
    heroDelay = 1.35;
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

  // Let islands (e.g. the WebGL hero) hook into the same scroll instance.
  document.dispatchEvent(new CustomEvent('ka:motion-ready'));
}
