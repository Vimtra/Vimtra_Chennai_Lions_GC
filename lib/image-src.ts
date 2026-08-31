/**
 * Resolve a stored image path to its optimized web derivative.
 *
 * Image paths live in the database (news cover images, media coverage,
 * product images) and were entered before the `-web` derivatives existed.
 * Rewriting every row would leave admin-entered paths broken again the next
 * time someone pastes an original filename, so the mapping is applied at
 * render time instead: any known original resolves to its derivative, and
 * anything unknown is returned untouched.
 *
 * Pure string lookup — no filesystem access, so it is safe in both server
 * and client components.
 */

/** Originals that have a `-web` derivative on disk. */
const DERIVATIVES: Record<string, string> = {
  // Player portraits (6–7 MB originals → ~160 KB)
  "/players/gaganjeet-bhullar.jpg": "/players/gaganjeet-bhullar-web.jpg",
  "/players/harshjeet-singh-sethie.jpg": "/players/harshjeet-singh-sethie-web.jpg",
  "/players/samarth-dwivedi.jpg": "/players/samarth-dwivedi-web.jpg",
  "/players/yashas-chandra.jpg": "/players/yashas-chandra-web.jpg",

  // Environment / brand photography
  "/assets/fac-main.png": "/assets/fac-main-web.jpg",
  "/assets/fac-range.png": "/assets/fac-range-web.jpg",
  "/assets/car-1.png": "/assets/car-1-web.jpg",
  "/assets/car-2.png": "/assets/car-2-web.jpg",
  "/assets/car-3.png": "/assets/car-3-web.jpg",
  "/assets/fan-thumb.png": "/assets/fan-thumb-web.jpg",
  "/assets/gear-thumb.png": "/assets/gear-thumb-web.jpg",
  "/assets/subash-yammada.png": "/assets/subash-yammada-web.jpg",
  "/assets/thimmaji-rao-yammada.jpg": "/assets/thimmaji-rao-yammada-web.jpg",

  // hero-golfer.png is a transparent cutout. It renders as an empty tile
  // under object-fit: cover, so any record still pointing at it is sent to
  // a real photograph instead.
  "/assets/hero-golfer.png": "/assets/car-2-web.jpg",
  "/assets/hero-golfer-web.png": "/assets/car-2-web.jpg",

  // Product photography
  "/assets/prod-tshirt.png": "/assets/prod-tshirt-web.jpg",
  "/assets/prod-cap.png": "/assets/prod-cap-web.jpg",
  "/assets/prod-mug.png": "/assets/prod-mug-web.jpg",
  "/assets/prod-pen.png": "/assets/prod-pen-web.jpg",
  "/assets/prod-earbuds.png": "/assets/prod-earbuds-web.jpg",
  "/assets/prod-golfballs.png": "/assets/prod-golfballs-web.jpg",
  "/assets/prod-insulatedmug.png": "/assets/prod-insulatedmug-web.jpg",
  "/assets/prod-sunglasses.png": "/assets/prod-sunglasses-web.jpg",
  "/assets/prod-whiskey.png": "/assets/prod-whiskey-web.jpg",
};

/** Map a stored path to its optimized derivative when one exists. */
export function webSrc<T extends string | null | undefined>(src: T): T {
  if (!src) return src;
  return (DERIVATIVES[src] ?? src) as T;
}
