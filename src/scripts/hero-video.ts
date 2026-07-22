/**
 * Hero background video loader (spec §6 guardrails). Shared by every homepage
 * variant so the video behavior stays identical: attach sources only when the
 * connection/motion/device allows, lighter rendition on small screens, and
 * fail silently to the poster if a file is missing or autoplay is refused.
 */
const video = document.getElementById('hero-video') as HTMLVideoElement | null;

if (video) {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const conn = nav.connection;
  const slow = conn ? /(^|-)2g/.test(conn.effectiveType ?? '') : false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!conn?.saveData && !slow && !reduced) {
    const small = matchMedia('(max-width: 767px)').matches;
    const source = document.createElement('source');
    source.src = small ? '/media/hero-mobile.mp4' : '/media/hero.mp4';
    source.type = 'video/mp4';
    source.addEventListener('error', () => video.removeAttribute('src'));
    video.append(source);
    video.load();
    video.play().catch(() => {
      /* autoplay refused — poster stays, which is fine */
    });
  }
}
