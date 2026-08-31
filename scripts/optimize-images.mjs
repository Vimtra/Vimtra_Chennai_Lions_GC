/**
 * Create web-sized derivatives of oversized source photography.
 *
 * Originals are NEVER modified or deleted — derivatives are written
 * alongside them with a `-web` suffix and the app points at those, so the
 * full-resolution masters stay available.
 *
 * Images that carry real transparency stay PNG (JPEG cannot hold alpha);
 * everything else becomes progressive mozjpeg. EXIF rotation is baked in
 * via .rotate() so derivatives are upright regardless of downstream EXIF
 * handling.
 *
 * Run: node scripts/optimize-images.mjs
 */
import sharp from "sharp";
import { readdir, stat, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const TARGETS = [
  { dir: "public/players", max: 2000, q: 76, minBytes: 300_000 },
  { dir: "public/assets", max: 2000, q: 80, minBytes: 300_000 },
];

// Brand marks must stay lossless/vector-crisp — never rasterise these.
const SKIP = /(logo|wordmark|mascot|monotone|primary|horizontal)/i;

/** True if the image has an alpha channel that is actually used. */
async function hasRealAlpha(src) {
  const meta = await sharp(src).metadata();
  if (!meta.hasAlpha) return false;
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const ch = info.channels;
  // sample up to 20k pixels for a transparent one
  const step = Math.max(1, Math.floor(px / 20000));
  for (let i = 0; i < px; i += step) {
    if (data[i * ch + ch - 1] < 250) return true;
  }
  return false;
}

let saved = 0;
let made = 0;
const report = [];

for (const t of TARGETS) {
  const abs = path.join(ROOT, t.dir);
  if (!existsSync(abs)) continue;

  for (const f of await readdir(abs)) {
    const ext = path.extname(f).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;
    if (SKIP.test(f) || f.includes("-web.")) continue;

    const src = path.join(abs, f);
    const info = await stat(src);
    if (info.size < t.minBytes) continue;

    const base = path.basename(f, ext).replace(/\.jpg$/i, "");
    const alpha = await hasRealAlpha(src);
    const out = path.join(abs, `${base}-web.${alpha ? "png" : "jpg"}`);

    // clear any stale derivative of the other format
    const other = path.join(abs, `${base}-web.${alpha ? "jpg" : "png"}`);
    if (existsSync(other)) await unlink(other);

    let p = sharp(src)
      .rotate()
      .resize({ width: t.max, height: t.max, fit: "inside", withoutEnlargement: true });

    p = alpha
      ? p.png({ compressionLevel: 9, palette: true, quality: 82 })
      : p.jpeg({ quality: t.q, mozjpeg: true, progressive: true });

    await p.toFile(out);

    const after = (await stat(out)).size;
    saved += info.size - after;
    made++;
    report.push({
      file: f,
      alpha,
      before: info.size,
      after,
      out: path.basename(out),
    });
  }
}

report.sort((a, b) => b.before - a.before);
for (const r of report) {
  console.log(
    `  ${r.file}${r.alpha ? "  [alpha->png]" : ""}\n` +
      `    ${(r.before / 1024).toFixed(0)}KB -> ${r.out} ${(r.after / 1024).toFixed(0)}KB` +
      `  (-${(((r.before - r.after) / r.before) * 100).toFixed(0)}%)`
  );
}
console.log(`\n${made} derivatives. Saved ${(saved / 1048576).toFixed(1)} MB.`);
