/**
 * Gatekeeper for the signature 3D hero (spec §4 guardrails).
 *
 * This file stays tiny. It decides IF the WebGL scene should exist, and
 * only then dynamic-imports ./hero-scene (a separate chunk containing OGL
 * + shaders), after window load + idle so it never competes with LCP.
 *
 * Skips entirely (leaving the static poster/gradient fallback) when:
 *  - the mount is not laid out (3D renders on large screens only)
 *  - the user prefers reduced motion
 *  - save-data is on or the connection is 2G-class
 *  - the device reports low memory (< 4 GB)
 *  - WebGL is unavailable
 * While alive: pauses offscreen (IntersectionObserver) and on hidden tabs.
 */

const mount = document.getElementById('hero-3d');

function shouldRender(): boolean {
  if (!mount || mount.offsetParent === null) return false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return false;
  if (/(^|-)2g/.test(nav.connection?.effectiveType ?? '')) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;

  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
  if (!gl) return false;
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return true;
}

async function boot(): Promise<void> {
  if (!mount || !shouldRender()) return;

  const { createHeroScene } = await import('./hero-scene');
  const scene = createHeroScene(mount);

  let onScreen = true;
  let tabVisible = !document.hidden;
  const sync = () => (onScreen && tabVisible ? scene.resume() : scene.pause());

  const section = mount.closest('section') ?? mount;
  new IntersectionObserver(
    (entries) => {
      onScreen = entries[0]?.isIntersecting ?? true;
      sync();
    },
    { threshold: 0 },
  ).observe(section);

  document.addEventListener('visibilitychange', () => {
    tabVisible = !document.hidden;
    sync();
  });
}

function schedule(): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => void boot(), { timeout: 2500 });
  } else {
    setTimeout(() => void boot(), 400);
  }
}

if (document.readyState === 'complete') {
  schedule();
} else {
  window.addEventListener('load', schedule, { once: true });
}
