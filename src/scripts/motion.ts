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

  // Section reveals: any element with [data-reveal] fades/rises on entry.
  // Initial hidden state is set here (not in CSS) so content is always
  // visible without JS — a failed script can never blank the page.
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 28,
      duration: 0.9,
      delay: parseFloat(el.dataset.revealDelay ?? '0'),
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Let islands (e.g. the WebGL hero) hook into the same scroll instance.
  document.dispatchEvent(new CustomEvent('ka:motion-ready'));
}
