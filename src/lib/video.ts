/**
 * Shared helpers for the YouTube-backed video bands (PageVideo, ReelWall).
 *
 * Both render the same <VideoDialog>, and both need to name it before it
 * exists — the trigger points at the dialog by id — so id generation lives
 * here rather than inside the dialog component, which has no way to hand a
 * generated id back to whoever rendered it.
 */

// Module scope, so it increments across every dialog rendered into a
// document rather than resetting per component. The counter matters: two
// bands on one page (or the same talk embedded twice) must not share an id,
// and a trigger must not be able to open the wrong player.
let dialogCount = 0;

/** Unique id for one video dialog and the trigger that opens it. */
export function videoDialogId(videoId: string): string {
  dialogCount += 1;
  return `ka-video-${videoId}-${dialogCount}`;
}

/**
 * Embed URL for the modal player. Built server-side so the id stays data and
 * the client only ever handles a finished URL.
 *   nocookie   — no tracking cookie until playback starts
 *   autoplay   — the visitor already clicked play; a second click is friction
 *   rel=0      — related videos at the end stay on this channel
 *   playsinline— iOS plays in the modal instead of hijacking fullscreen
 */
export function youTubeEmbedSrc(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

/**
 * Pulls the id out of a YouTube URL — /shorts/ID, /watch?v=ID or youtu.be/ID.
 * Returns undefined for anything else, which is the signal that a link is an
 * ordinary link and should be left to navigate.
 */
export function youTubeIdFromUrl(url: string): string | undefined {
  const match =
    /(?:youtube\.com\/(?:shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/.exec(
      url,
    ) ?? /[?&]v=([\w-]{11})/.exec(url);

  return match?.[1];
}
