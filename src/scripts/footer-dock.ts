/**
 * Keeps a fixed, bottom-anchored element clear of the footer's bottom bar.
 *
 * Shared by the two things pinned to the viewport corners — the floating firm
 * CTA (lower left) and the chat launcher (lower right) — so they ride up
 * together and cannot drift apart.
 *
 * As the footer's bottom bar comes up into the element's space, it is lifted
 * by exactly the overlap so it comes to rest just above that line. Because the
 * lift is derived from live positions rather than a fixed scroll threshold, it
 * eases in as the footer is uncovered, settles at the very bottom, and unwinds
 * on the way back up.
 *
 * The bar's own position is NOT enough to drive this on the homepage: there
 * the footer is `position: sticky; bottom: 0` (the curtain reveal), so it is
 * parked at the viewport bottom for the whole page and the bar's rect never
 * moves. Measuring it alone kept the CTA docked mid-page, everywhere. So the
 * obstacle is whichever is LOWER on screen: the bar, or the bottom edge of the
 * content curtain still hiding it. Mid-page the curtain reaches past the
 * viewport bottom, so there is no overlap and the element sits in the corner;
 * only as the footer is uncovered does it ride up, and it stops once it clears
 * the bar. Pages whose footer scrolls normally are unaffected — there the bar
 * is always the lower of the two.
 */

/** Clearance between the element's bottom edge and the bar's top edge. */
const GAP = 16;
/** Safety cap, so a layout change can never fling the element up the page. */
const MAX_LIFT = 260;

export function dockAboveFooter(dock: HTMLElement): void {
  const footerBar = document.querySelector<HTMLElement>('[data-footer-bar]');
  if (!footerBar) return;

  // The opaque content layer that covers the pinned footer (curtain reveal).
  const curtain = document.getElementById('main');

  let lift = 0;
  let queued = false;

  const syncLift = () => {
    queued = false;
    // Add the lift already applied back on, to recover the element's resting
    // position — otherwise each frame measures its own output and the value
    // walks away.
    const restingBottom = dock.getBoundingClientRect().bottom + lift;
    const obstacleTop = Math.max(
      footerBar.getBoundingClientRect().top,
      curtain ? curtain.getBoundingClientRect().bottom : -Infinity,
    );
    const overlap = restingBottom + GAP - obstacleTop;

    const next = Math.max(0, Math.min(overlap, MAX_LIFT));
    if (next !== lift) {
      lift = next;
      dock.style.transform = lift ? `translate3d(0,${-lift}px,0)` : '';
    }
  };

  const request = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(syncLift);
  };

  syncLift();
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
}
