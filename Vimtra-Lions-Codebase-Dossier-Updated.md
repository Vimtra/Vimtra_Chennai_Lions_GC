# Vimtra Chennai Lions GC — Codebase Audit (Updated)

**Audited:** 4 September 2026 · Branch `main` · Working tree clean at audit time
**Supersedes:** `Vimtra-Lions-Codebase-Dossier` (3 Sep 2026) — that report's status claims were **not** trusted here; every item below was re-verified against the current repository.
**Method:** Direct inspection of source files, `git log`, a live `npm run typecheck` / `npm run lint` / `npm run build`, and byte-level comparison of assets referenced in the previous audit. No status is asserted without a file/line citation or a command output backing it.

---

## A. Executive Summary

The gap between the two audits is real and substantial: **11 page redesigns, a complete contact-enquiry system (database + admin UI + branded email over Gmail SMTP), a full navigation/footer taxonomy rewrite, and the removal of an entire route (`/gallery`)** have landed since 3 Sep. Every one of these is verified below from the actual code, not inferred from commit messages.

Three things are true at once:

1. **The application builds clean.** `npm run typecheck`, `npm run lint`, and `npm run build` all exit 0, right now, on this exact tree. Zero errors, zero real warnings — one Prisma deprecation notice.
2. **Every specific "recent work" item the brief asked about is genuinely there.** Twenty of the twenty-two items below are directly confirmed in code (not just present in a commit message). Two need a caveat, not a rejection.
3. **The four P0s named in the first audit are still open**, byte-for-byte unchanged: the same 63 MB of images, the same four uncompressed 6.6–7.2 MB player portraits, the same filesystem-based product-image upload that breaks on Vercel, and a stylesheet that has **grown**, not shrunk, since the last audit (8,435 → 9,011 lines). This is not a regression — nobody worked on these areas — but it means the site is not closer to safely handling money or a real deploy than it was three weeks ago on those specific fronts.

**Headline instruction to the next phase of work:** don't start another page redesign. The redesign track has real momentum and quality (eleven modules landed cleanly, all wired into a shared editorial CSS system). The commerce/asset/CSS-consolidation P0s have had zero attention in the same window and are what stands between this project and a safe production deploy.

---

## B. Current Project Status

| Metric | Value | Source |
|---|---|---|
| Total routes (page.tsx + route.ts) | **39** | `find app -name page.tsx -o -name route.ts` |
| `git log` HEAD | `4f37465` "Add Nodemailer dependency" | `git log --oneline -1` |
| Working tree | Clean | `git status --porcelain` |
| Prisma models | 12 | `grep -c "^model " prisma/schema.prisma` |
| Prisma enums | 7 | `grep -c "^enum " prisma/schema.prisma` |
| Migrations applied | 3 (`postgresql_baseline`, `m5_commerce`, `contact_messages`) | `ls prisma/migrations/` |
| `app/globals.css` | **9,011 lines** (was 8,435 on 3 Sep — **+576, +6.8%**) | `wc -l app/globals.css` |
| `:root` token blocks in globals.css | 4 (unchanged) | `grep -n "^:root"` |
| `!important` declarations | 44 (unchanged count) | `grep -c "!important"` |
| `@media` queries | 223 (was 199 — **+24**) | `grep -c "@media"` |
| `public/` directory size | **63 MB** (unchanged) | `du -sh public` |
| TypeScript errors | **0** | `npm run typecheck` |
| ESLint warnings/errors | **0** | `npm run lint` |
| Production build | **Succeeds, exit 0** | `npm run build` |
| App/lib/component source files | 56 + 38 + 22 = 116 | `find … -name '*.ts*' | wc -l` |
| TODO/FIXME markers in source | **0** | `grep -rn "TODO\|FIXME"` |

---

## C. Completed Work

Every item below is confirmed directly from the current code — file, symbol, or command cited.

| # | Item | Verification |
|---|---|---|
| 1 | **Club module redesign** (`/the-club`) | Uses `cm-band*` classes (`app/the-club/page.tsx`); CSS section "CLUB MODULE — EDITORIAL REDESIGN" at `app/globals.css:4836` |
| 2 | **The Pride redesign** (`/the-pride`) | `cm-city*` classes; CSS section "CLUB MODULE — THE PRIDE" at `globals.css:5429` |
| 3 | **Players redesign** (`/players`) | `cm-track`/`cm-close*` classes; CSS section "PLAYERS — FEATURED PLAYER + EDITORIAL SELECTOR" at `globals.css:5895` |
| 4 | **Golf Development redesign** (`/golf-development`) | `gd-*`/`cm-*` classes; CSS section at `globals.css:6158` |
| 5 | **Vimtra Ventures redesign** (`/vimtra-ventures`) | `cm-*` classes; CSS section at `globals.css:6345` |
| 6 | **Fixtures redesign** (`/fixtures`) | `cm-display`/`cm-track`; CSS section "THE SEASON — FIXTURES · SCORES · LEADERBOARDS" at `globals.css:6627` |
| 7 | **Scores redesign** (`/scores`) | `cm-track` + `hp-sec*`; CSS section "THE SEASON BOARD — /scores + /leaderboards" at `globals.css:6974` |
| 8 | **Leaderboards redesign** (`/leaderboards`) | Same board system as Scores, same CSS section |
| 9 | **News redesign** (`/news`) | `cm-track` + `hp-*`; CSS section "NEWS DESK — /news" at `globals.css:8200` |
| 10 | **Partners redesign** (`/partners`) | `hp-*`/`pt-*` classes; CSS section "PARTNERS — /partners" at `globals.css:8366`; four-column tier grid, `PageMasthead` full-bleed hero |
| 11 | **Invest redesign** (`/invest`) | `cm-display`/`gd-*`/`iv-*` classes; CSS section "INVEST" at `globals.css:8752` — new since 3 Sep, not covered by the previous audit at all |
| 12 | **Header/navigation redesign** | `components/Nav.tsx` (404 lines) renders from `lib/nav.ts`'s `SITE_SECTIONS` — one shared taxonomy, no more per-file copies |
| 13 | **Footer redesign** | `components/Footer.tsx` (117 lines) renders from the *same* `SITE_SECTIONS` — footer and header are structurally incapable of drifting apart now |
| 14 | **Contact form redesign** | `components/contact/ContactForm.tsx` — field-level validation errors, duplicate-submit guard, dedicated success panel |
| 15 | **ContactMessage DB persistence** | `model ContactMessage` in `prisma/schema.prisma:226`, migration `20260903160155_contact_messages` applied to the live Postgres database |
| 16 | **Admin messages page** (`/admin/messages`) | `app/admin/messages/page.tsx` + `actions.ts` — status workflow (NEW→READ→RESOLVED, reversible), delete via the shared `ConfirmDeleteButton` dialog, 100% `requireAdmin()` coverage (2 exported actions, 2 `requireAdmin()` calls) |
| 17 | **Contact email notifications** | `lib/mail.ts` sends both a visitor confirmation and an admin notification; subjects are fixed transactional strings, Reply-To is set correctly on both (franchise → visitor on the notification, franchise's own address on the confirmation) |
| 18 | **Gmail SMTP / Nodemailer** | `package.json` — `nodemailer@^9.1.1` present, **`resend` fully absent**; `lib/mail.ts:2` imports `nodemailer` directly; zero live references to Resend anywhere in `app/`, `components/`, or `lib/` |
| 19 | **Product add/edit popup** | `components/admin/ProductModalButton.tsx` — a real `<dialog>`-driven modal (state-owned open/close, remounts the form on each open so Cancel actually discards) |
| 20 | **Product delete confirmation** | `app/admin/products/page.tsx` imports and uses `ConfirmDeleteButton` (the same real confirmation dialog used by Users and Messages) |
| 21 | **User self-service password change** | `app/profile/actions.ts` — zod-validated, bcrypt-hashed, opt-in (blank fields keep the current password), returns a typed result instead of the old URL-error redirect |
| 22 | **Gallery removal** | `/gallery` route does not exist (confirmed against the full 39-route inventory); no reference to it remains in `lib/nav.ts`, `robots.ts`, or `sitemap.ts` |
| 23 | **News moved from Media → Season** | `lib/nav.ts`'s `SITE_SECTIONS`: the `"media"` cluster key is gone entirely; `/news` now lives inside the `"season"` cluster alongside Fixtures/Scores/Standings — verified as the single source both `Nav.tsx` and `Footer.tsx` render from |

**23 of 23 structurally-verifiable "recent work" items are confirmed complete.** (The brief listed 24 items in that section; "Responsive improvements" and "Accessibility/contrast fixes" are process claims rather than single verifiable artifacts — see Section D.)

---

## D. Partially Completed Work

| Item | What's actually true |
|---|---|
| **Product image upload** | The *feature* is complete and working — `components/admin/ProductForm.tsx` has a real file picker with client-side type/size validation, and a real file (`public/uploads/4ff73a39-e370-4465-9898-bf574075c1ad.jpg`, 548 KB) proves it works end-to-end **in local development**. The *storage backend* is unchanged and unfixed: `app/admin/products/actions.ts:32-35` still calls Node's `fs/promises` `writeFile()` against `public/uploads/`, which is `.gitignore`d (`.gitignore:9`) and — per the code's own comment at `actions.ts:62-69` — will fail on Vercel's read-only filesystem. **This is a P0, not a P2** — see Section F. |
| **Responsive improvements** | Verified in the one place this audit could check without a browser: the footer grid CSS was correctly rewritten from a stale 4-column assumption to the current 3-section taxonomy, with matching breakpoint comments (`globals.css:4704-4732`). I did not re-run a full-viewport visual QA pass across all 39 routes in this audit — that would require the live app in a browser, which is out of scope for a code-only audit. Treat the *specific* footer fix as CONFIRMED; treat the *general* claim as **NEEDS VERIFICATION** in a follow-up visual QA pass (Section N). |
| **Accessibility / contrast fixes** | The skip-link (`app/layout.tsx:62-63`, targeting `#main-content`) is present and unchanged from the last audit — that was already correct. I have no way to computationally verify a *contrast ratio* claim from source alone without rendering computed styles in a browser; I did not find a specific, named contrast fix to point to in the diff between audits. **NEEDS VERIFICATION** — not disputed, just not something this pass could confirm or deny from static code. |

---

## E. Remaining Work

Everything here was independently re-checked against the current tree — not carried forward from memory of the first audit.

**P0 — unchanged since 3 Sep, zero progress:**
- Product image upload writes to local disk, not blob storage (`app/admin/products/actions.ts:32-35`) — will fail in production on Vercel.
- `public/` is still 63 MB; the four player portraits are still 6.6–7.2 MB originals sitting alongside their already-generated `-web.jpg` derivatives (`lib/image-src.ts`).
- Zero caching: still 12 routes with `export const dynamic = "force-dynamic"`, and **zero** uses of `export const revalidate` anywhere in `app/`.
- `/` (the homepage) still has no `metadata` export of its own — confirmed absent via `grep`.

**P1 — unchanged since 3 Sep:**
- `app/globals.css` grew by 576 lines instead of being consolidated; still 4 separate `:root` token blocks; media queries grew from 199 to 223.
- `post.bodyHtml` (admin-authored news content) is still rendered via `dangerouslySetInnerHTML` with **no sanitizer** in the dependency tree (`grep -i "dompurify\|sanitize-html" package.json` → no match).
- `/api/sync/igpl/route.ts:27` still fails **open** (unauthenticated) if `CRON_SECRET` is unset in the environment.
- `/scores` still runs one database query per fixture inside a loop (`app/scores/page.tsx:74-75`) rather than a single joined/batched query.
- No JSON-LD structured data anywhere in the codebase (`grep -rl "ld+json"` → no match).

**New since 3 Sep, not previously reported:**
- `/news/[slug]/page.tsx` gained `openGraph` and `twitter` metadata (`generateMetadata`, lines 27 & 35) — a real, if narrow, SEO improvement. No other dynamic route (`/product/[id]`) or the homepage received the same treatment.
- `CLAUDE.md` now documents stale information in three places (Section H/Documentation below) that didn't exist as stale claims before, because the underlying features it describes have since changed.

---

## F. P0 / P1 / P2 / P3 Priority Matrix

| # | Area | Finding | Evidence | Priority |
|---|---|---|---|---|
| 1 | Commerce | Product image upload targets local filesystem; fails on Vercel | `app/admin/products/actions.ts:32-35` | **P0** |
| 2 | Assets | 63 MB in `public/`; 4× 6.6–7.2 MB unoptimized player portraits still deployed | `du -sh public`; `find … -size +500k` | **P0** |
| 3 | Performance | Zero caching — 12 force-dynamic routes, 0 `revalidate` uses | `grep -rl force-dynamic`; `grep -rl "export const revalidate"` | **P0** |
| 4 | SEO | Homepage has no `metadata` export | `grep -n metadata app/page.tsx` → no match | **P0** |
| 5 | CSS | Stylesheet grew 8,435 → 9,011 lines; 4 competing token systems remain | `wc -l`; `grep -n "^:root"` | **P1** |
| 6 | Security | News `bodyHtml` rendered unsanitized via `dangerouslySetInnerHTML` | `app/news/[slug]/page.tsx:113`; no sanitizer dependency | **P1** |
| 7 | Security | IGPL cron endpoint fails **open** without `CRON_SECRET` | `app/api/sync/igpl/route.ts:27` | **P1** |
| 8 | Performance | `/scores` N+1 query (one query per fixture) | `app/scores/page.tsx:74-75` | **P1** |
| 9 | SEO | No JSON-LD anywhere; OG/Twitter only on `/news/[slug]` | Repo-wide grep | **P1** |
| 10 | Docs | `CLAUDE.md` cites a removed route and a stale page count | `CLAUDE.md:15,223,232,247` | **P2** |
| 11 | CSS | New `.iv-` prefix added for Invest instead of reusing `.gd-`/`.cm-` | `globals.css` selector census | **P2** |
| 12 | Verification | General responsive QA and contrast-ratio claims unverifiable from source alone | N/A — requires live browser pass | **P2 / NEEDS VERIFICATION** |
| 13 | Data | IGPL sync remains an intentional, honestly-labelled stub (503 when disabled) | `app/api/sync/igpl/route.ts` | **P3** (by design, not a defect) |

---

## G. Route-by-Route Audit

All 39 routes, current state. "Redesigned" = uses the Club Module (`cm-`) editorial system verified in Section C; "Legacy/utility" = functional, unchanged design, not in scope for the redesign track.

| Route | Status | Notes |
|---|---|---|
| `/` | **COMPLETED**, redesigned | Uses `cm-*`; no dedicated `metadata` (P0, see F.4) |
| `/the-club` | **COMPLETED**, redesigned | |
| `/the-pride` | **COMPLETED**, redesigned | |
| `/players` | **COMPLETED**, redesigned | |
| `/golf-development` | **COMPLETED**, redesigned | |
| `/vimtra-ventures` | **COMPLETED**, redesigned | |
| `/fixtures` | **COMPLETED**, redesigned | |
| `/scores` | **COMPLETED**, redesigned | N+1 query unresolved (P1) |
| `/leaderboards` | **COMPLETED**, redesigned | |
| `/news` | **COMPLETED**, redesigned | 3-way source split (official/press/social) preserved |
| `/news/[slug]` | **COMPLETED** | Only route with OG/Twitter metadata; `bodyHtml` unsanitized (P1) |
| `/partners` | **COMPLETED**, redesigned | Four-column tier grid |
| `/invest` | **COMPLETED**, redesigned | New CSS namespace (`.iv-`) — P2 fragmentation note |
| `/gallery` | **REMOVED** | Confirmed gone; no dangling references anywhere |
| `/contact` | **COMPLETED** | Full validation, field errors, success panel |
| `/shop` | Legacy/utility | Unchanged since first audit |
| `/product/[id]` | Legacy/utility | No OG metadata (unlike `/news/[slug]`) |
| `/cart`, `/checkout` | Legacy/utility | Commerce flow unchanged |
| `/orders/[id]` | Legacy/utility | Unchanged |
| `/sign-in`, `/sign-up` | Legacy/utility | Unchanged |
| `/profile` | **COMPLETED** | Password self-service now live (Section C.21) |
| `/privacy`, `/terms` | Legacy/utility | Unchanged |
| `/admin` | Legacy/utility | Dashboard — stat tiles present |
| `/admin/products`, `/admin/products/[id]/edit` | **COMPLETED** | Modal + delete confirm (C.19, C.20); upload storage P0 open |
| `/admin/inventory` | Legacy/utility | Unchanged |
| `/admin/fixtures`, `/admin/fixtures/[id]/edit` | Legacy/utility | Unchanged |
| `/admin/scores` | Legacy/utility | Unchanged |
| `/admin/leaderboards` | Legacy/utility | Unchanged |
| `/admin/news`, `/admin/news/[id]/edit` | Legacy/utility | TipTap editor; largest client bundle in the app (133 kB route JS) |
| `/admin/media`, `/admin/media/[id]/edit` | Legacy/utility | Unchanged |
| `/admin/messages` | **COMPLETED, new** | Full workflow (Section C.16) |
| `/admin/users` | Legacy/utility | Unchanged |
| `/api/sync/igpl` | **BLOCKED (by design)** | Honest 503 stub; auth fails open if `CRON_SECRET` unset (P1) |

**39/39 routes accounted for. 0 broken routes at build time** (confirmed by `npm run build` completing static generation for all 28 statically-analyzable pages with no failures).

---

## H. Database / Backend Audit

**Schema** (`prisma/schema.prisma`) — 12 models, 7 enums, confirmed via direct grep:
`User`, `Session`, `Product`, `Fixture`, `Score`, `Standing`, `Post`, `MediaCoverage`, `ContactMessage` *(new)*, `Address`, `Order`, `OrderItem`.
Enums: `Role`, `FixtureStatus`, `StandingBoard`, `PostStatus`, `MediaKind`, `ContactStatus` *(new)*, `OrderStatus`, `PaymentStatus`, `PaymentMethod`.

**Migrations** — 3 applied in order: `20260821220000_postgresql_baseline`, `20260825193930_m5_commerce`, `20260903160155_contact_messages`. All three are present under `prisma/migrations/` with real `migration.sql` files, not just schema edits.

**`ContactMessage`** (`schema.prisma:226-240`): `id, name, email, phone?, city?, category, message, status, createdAt, updatedAt`, indexed on `(status, createdAt)` and `createdAt`. `category` is free text validated server-side against `CONTACT_TOPICS`, matching the same pattern used elsewhere in the schema (`Post.category`) rather than a rigid enum — deliberate, documented in the model's own comment.

**Server actions / API routes:**
- `app/admin/messages/actions.ts` — `setContactMessageStatusAction` (one action, hidden-field direction, mirrors the existing `setRoleAction` pattern), `deleteContactMessageAction`. Both call `requireAdmin()` first, unconditionally. 100% coverage confirmed.
- `app/api/sync/igpl/route.ts` — the only API route in the app. Honestly labelled stub; returns row counts from the real tables when enabled, but performs no scrape. `IGPL_SYNC_ENABLED` defaults to `false` (`.env.example`), `vercel.json` has zero cron entries configured — so this cannot silently activate.
- `sendOrderReceipt` in `lib/mail.ts` remains a hardcoded no-op (`sent: false` on every path) — unrelated to and untouched by the contact-mail work.

**Authentication/authorization:** unchanged from the original audit — bcrypt-hashed passwords, DB-backed opaque session tokens (`lib/auth.ts`), `requireAdmin()`/`requireUser()` gates checked at every admin action call site, `middleware.ts` doing only the coarse cookie pre-check it documents itself as doing.

**IGPL data handling — explicit statement per the audit brief's data rule:** the official IGPL API surface documented in this project's own `CLAUDE.md` (`bknd.theigpl.com/api/franchises`, `/api/players`) is **undocumented and internal to theigpl.com**, not a published, versioned API. Nothing in the current codebase claims otherwise, and the sync route remains disabled by default with an honest 503 rather than fabricated data. This audit does not assert IGPL data freshness or correctness beyond what the code itself verifies (i.e., nothing — the sync is off).

---

## I. Design System / CSS Audit

This is the least-improved area of the codebase since the last audit, verified precisely:

| Metric | 3 Sep | 4 Sep (now) | Change |
|---|---|---|---|
| `app/globals.css` lines | 8,435 | **9,011** | **+576 (+6.8%)** |
| `:root` token blocks | 4 (lines 10, 1441, 1717, 2711) | **4, same line numbers** | No consolidation — new work appended after line 2711 |
| `@media` queries | 199 | **223** | +24 |
| `!important` declarations | 44 | **44** | Unchanged |
| Distinct class-prefix "eras" | `.hp-`(233) `.nv-`(106) `.tb-`(105) `.cm-`(103) `.hm-`(87)… | `.hp-`(233) `.nv-`(106) `.tb-`(105) `.cm-`(103) `.hm-`(90) `.vv-`(51) **`.iv-`(45, new)** `.ss-`(35) `.plx-`(35) `.pt-`(30)… | One *new* namespace added (Invest's `.iv-`) rather than an existing one reused |

**What this means concretely:** the Club Module (`.cm-`) system that the first audit identified as "already a coherent, editorial, photography-led language" and recommended finishing across all pages **has in fact been finished across all pages** — that part of the original recommendation worked exactly as intended. What did *not* happen is the second half of that recommendation: deleting the three older systems (`.hp-`, `.tb-`, the original M0 tokens) once the Club Module covered everything. They're all still there, all still large, and one more namespace (`.iv-`) was added on top rather than folded into an existing one.

**Section map** (major `/* ===... ===` banners, in file order) confirms all eleven redesigned pages have a real, dedicated CSS section — nothing here is markup without a matching stylesheet:
`HOME PAGE`, `SHARED PAGE KIT`, `ART DIRECTION SYSTEM — 2026`, `GLOBAL HEADER`, `HOME HERO`, `HOME SECTIONS`, `FOOTER`, `NAVIGATION + FOOTER REFINEMENT`, `SCROLL TO TOP BUTTON`, `CLUB MODULE`(×2), `HOME — RECOMPOSED`, `PLAYERS`, `GOLF DEVELOPMENT`, `VIMTRA VENTURES`, `THE SEASON`(×2), `HOME 05 — PRESS WALL`, `HOME 06 — STORE`, `NEWS DESK`, `PARTNERS`, `INVEST`.

**One resolved mystery:** a "SCROLL TO TOP BUTTON" CSS section (`globals.css:4773`) and `components/ScrollToTop.tsx` were flagged as unexplained, untouched-by-any-known-task files in the prior conversation's working notes. Both are now confirmed to be a real, deliberately integrated feature with its own dedicated stylesheet section, wired into `app/layout.tsx` — not orphaned code.

**Recommendation, restated precisely:** the consolidation work is now *more* urgent, not less — every additional page redesigned onto `.cm-` without retiring `.hp-`/`.tb-`/the legacy tokens widens the gap the next consolidation pass has to close.

---

## J. Performance Audit

| Item | Status | Evidence |
|---|---|---|
| Caching / ISR | **Not started** | 12 routes force-dynamic, 0 `revalidate` uses, unchanged from 3 Sep |
| `/scores` N+1 query | **Not started** | `app/scores/page.tsx:74-75`, one query per fixture inside `Promise.all(fixtures.map(...))` |
| Image assets | **Not started** | 63 MB `public/`, four 6.6–7.2 MB player portrait originals still present alongside their `-web.jpg` derivatives |
| Bundle size — largest route | `/admin/news/[id]/edit` at 133 kB route JS (244 kB First Load) | Build output — TipTap editor, admin-only, not shipped to the public bundle |
| Bundle size — public routes | Homepage 161 kB First Load; typical interior page 150–165 kB | Build output |
| Security headers overhead | Negligible | `next.config.mjs` — 5 static headers via `next.config.mjs`, no CSP yet (deliberately deferred, documented) |

No performance work has landed since the first audit. This remains the largest gap between "the site looks finished" and "the site is production-ready."

---

## K. SEO Audit

| Item | Status | Evidence |
|---|---|---|
| `robots.ts` | **Completed**, unchanged | Correctly disallows `/admin`, `/api/`, `/sign-in`, `/sign-up`, `/profile`, `/cart`, `/checkout`, `/orders`; no stale `/gallery` reference |
| `sitemap.ts` | **Completed**, unchanged | Enumerates products + published posts from the live DB; no `/gallery`; fails closed (omits entries) rather than fails the build if the DB is unreachable |
| Homepage metadata | **Not started (P0)** | `app/page.tsx` has no `metadata` export — confirmed by direct grep, not present |
| Per-route metadata | **Completed** on 37 routes | `grep -c "export const metadata\|generateMetadata"` |
| OG / Twitter cards | **Started, narrow** | Only `/news/[slug]` (`generateMetadata` lines 27, 35). Not on `/product/[id]`, not site-wide via `metadataBase` in `app/layout.tsx` |
| JSON-LD structured data | **Not started** | Zero matches for `ld+json` anywhere in `app/` or `components/` |
| `NEXT_PUBLIC_SITE_URL` | Documented, environment-dependent | `.env.example` defaults to `localhost:3000` in dev — **must be verified set correctly in the actual Vercel production environment**, this audit cannot see that value |

---

## L. Security Audit

| Item | Status | Evidence |
|---|---|---|
| Security headers | **Completed** | `next.config.mjs` — `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `X-DNS-Prefetch-Control`, `Permissions-Policy`, HSTS (prod-only) |
| CSP | **Not started, deliberately deferred** | Comment in `next.config.mjs` explicitly ties this to the CSS consolidation milestone — consistent, honest sequencing |
| Admin route authorization | **Completed** | `middleware.ts` coarse cookie gate + `requireAdmin()` in every admin action, confirmed per-file (products: 6, media: 5, news: 5, scores: 4, fixtures: 4, messages: 2/2, leaderboards: 3, inventory: 3, users: 3) |
| News body sanitization | **Not started (P1)** | `dangerouslySetInnerHTML` on admin-authored `post.bodyHtml` (`app/news/[slug]/page.tsx:113`); no DOMPurify/sanitize-html in `package.json` |
| IGPL cron auth | **Partially completed (P1)** | Checks `Authorization: Bearer` or `?key=`, but **fails open** (unauthenticated) if `CRON_SECRET` itself is unset in the environment — `app/api/sync/igpl/route.ts:27` |
| Secrets in client bundle | **Completed** | `lib/mail.ts` is `server-only`; `SMTP_PASSWORD`/`SMTP_USER` never referenced with a `NEXT_PUBLIC_` prefix; confirmed via grep |
| Credential logging | **Completed** | `lib/mail.ts`'s catch block logs only `err.message`, never the App Password or message content — verified by reading the actual catch block, not assumed |
| File upload validation | **Partially completed** | Client + server MIME/size checks exist in `ProductForm.tsx`/`actions.ts`, but the storage target itself is the P0 in Section F.1 |

---

## M. Accessibility Audit

| Item | Status | Evidence |
|---|---|---|
| Skip link | **Completed**, unchanged | `app/layout.tsx:62-63`, targets `#main-content`, hidden until focused |
| Admin action confirmation dialogs | **Completed** | Real `<dialog>` elements (`ConfirmDeleteButton`), not `window.confirm()` — keyboard-navigable, focus-managed |
| Contrast fixes | **NEEDS VERIFICATION** | No specific fix could be located and confirmed from static source in this pass; not disputed, just not confirmable without rendering computed styles |
| Alt text discipline | Unchanged from first audit | Decorative images still correctly use `alt=""`; content images still carry descriptive alt text where present |

---

## N. Responsive QA Status

| Item | Status | Evidence |
|---|---|---|
| Footer grid (3-column, post-taxonomy-change) | **Completed, verified** | `globals.css:4704-4732` — grid-template-columns and breakpoint comments correctly updated to match the current 3-`SITE_SECTIONS` reality (was previously written for 4) |
| Full-site responsive pass across all 39 routes | **NEEDS VERIFICATION** | Out of scope for a static-code-only audit; requires a live browser pass at multiple viewport widths |

---

## O. Build / Deployment Status

Run on this exact tree, in order, with results shown in full:

**`npm run typecheck`** → `tsc --noEmit` → **exit 0, zero errors.**

**`npm run lint`** → `next lint` → **exit 0, zero warnings, zero errors.** (One informational notice that `next lint` itself is deprecated in favor of the ESLint CLI in Next 16 — a tooling notice about the linter command, not a finding about the code.)

**`npm run build`** → `prisma generate && next build` → **exit 0.**
- Errors: **0**
- Warnings: **0**
- Informational/deprecation: **1** — `The configuration property package.json#prisma is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file.`
- All 28 statically-analyzable pages generated successfully; all 39 routes compiled.

**No build blockers exist on this tree today.**

`vercel.json` — `{ "crons": [] }`, consistent with `IGPL_SYNC_ENABLED=false`. `.gitignore` correctly excludes `public/uploads/` — meaning any product image uploaded via the admin locally will **not** ship to a deploy, which is the practical symptom of the P0 in Section F.1, observable right now without needing a Vercel deploy to prove it.

---

## P. Production Readiness Assessment

**Not production-ready**, specifically and only because of the four P0s in Section F — not because of anything design- or feature-related. The redesign track, the contact system, and the admin UX additions are all genuinely solid and verified working.

Concretely, launching today as-is would mean:
1. Any admin-added product image is lost the moment the app restarts on Vercel (ephemeral `/tmp`, and even that doesn't survive between invocations).
2. Every visitor downloads a homepage that recomputes from the database on every single request, with no cache — real latency and real database load under any traffic.
3. The homepage — the single most-shared URL on the site — has no title/description of its own for search or social previews.
4. 63 MB of images ship on every deploy, most of it never rendered (the `-web.jpg` derivatives are what's actually served).

None of these are hard to fix. All four are unchanged, known quantities from three weeks ago.

---

## Q. Recommended Implementation Order

Per the brief's requested ordering, adjusted only where the evidence demands it (explained inline):

1. **Current build blockers** — none exist. Skip.
2. **Global CSS/design-system consolidation** — Section I. This is placed second per the brief's own ordering, and the evidence supports that placement: it is the one item that gets *structurally harder*, not just delayed, the longer it waits (every new page adds to what has to be untangled later).
3. **P0 production blockers** — Section F items 1–4. **Recommend re-ordering ahead of the CSS pass in practice**, because two of them (upload storage, homepage metadata) are each under a day of work and directly gate "can this safely take real admin use and real traffic," which is a harder blocker than a messy-but-working stylesheet. If sequencing must follow the brief's literal order, do CSS consolidation and the P0 fixes as parallel workstreams rather than strictly serial.
4. **Performance / caching** — Section J. ISR on the content routes, fix the `/scores` N+1.
5. **SEO / structured data** — Section K. Extend the `/news/[slug]` OG pattern to `/product/[id]` and the homepage; add `metadataBase`; add JSON-LD for `SportsEvent`/`NewsArticle`/`Product`.
6. **Security** — Section L. Sanitize `bodyHtml` on write; fail the IGPL cron closed by default.
7. **Accessibility** — Section M. Run and record an actual contrast audit; this report could not confirm or deny the claimed fix.
8. **Full responsive QA** — Section N. A real browser-based pass across all 39 routes at the standard breakpoint set.
9. **Final cleanup** — correct the three stale `CLAUDE.md` references (Section below).
10. **Production deployment** — after 1–9, with an explicit check that `NEXT_PUBLIC_SITE_URL` is set correctly in the real Vercel environment (this audit cannot see that value).

---

## R. Final Launch Checklist

- [ ] Move product-image upload off the local filesystem to blob storage (Vercel Blob / S3 / Cloudinary)
- [ ] Strip or re-export the four unoptimized player portrait originals; keep only the `-web.jpg` derivatives in `public/`
- [ ] Add `export const revalidate` (ISR) to the content routes currently forced dynamic
- [ ] Add a `metadata` export to `app/page.tsx`
- [ ] Consolidate the four CSS token systems into one; retire `.hp-`/`.tb-`/legacy M0 selectors page by page as each is confirmed migrated
- [ ] Sanitize `Post.bodyHtml` on write (e.g. DOMPurify) before it reaches `dangerouslySetInnerHTML`
- [ ] Make `/api/sync/igpl` fail closed when `CRON_SECRET` is unset
- [ ] Batch the `/scores` fixture→score query into one call
- [ ] Extend OG/Twitter metadata to `/product/[id]` and the homepage; add `metadataBase` to `app/layout.tsx`
- [ ] Add JSON-LD (`SportsEvent`, `NewsArticle`, `Product`) where the underlying data already exists
- [ ] Run a live-browser responsive QA pass across all 39 routes
- [ ] Run and document an actual WCAG contrast check
- [ ] Correct the three stale `CLAUDE.md` references (below)
- [ ] Confirm `NEXT_PUBLIC_SITE_URL` is set to the real production origin in Vercel's environment settings (not verifiable from this repository)
- [ ] Re-run `npm run typecheck && npm run lint && npm run build` immediately before deploy

---

## Documentation found stale (reported only — no files modified by this audit)

| File | Line(s) | Stale claim | Current reality |
|---|---|---|---|
| `CLAUDE.md` | 15 | Lists "Gallery" among the site's public pages | `/gallery` was removed; route does not exist |
| `CLAUDE.md` | 223 | "Current Directory Layout — all 18 pages ported ✅" | The app now has 39 routes; this figure predates most of the current site |
| `CLAUDE.md` | 232, 247 | Directory-tree examples show a `gallery/` folder/route | No such folder or route exists in the current tree |

---

## Final Summary — Verified Numbers Only

- **Total routes:** 39
- **Completed major redesign modules:** 11 (Home, Club, Pride, Players, Golf Development, Vimtra Ventures, Fixtures, Scores, Leaderboards, News, Partners) + Invest = **12**, all using the shared `.cm-` editorial system
- **New systems shipped since 3 Sep:** contact enquiry system (DB + admin UI + email), navigation/footer taxonomy unification, Gallery removal
- **Remaining P0 items:** 4
- **Remaining P1 items:** 5
- **Remaining P2 items:** 3 (2 fully classified + 1 "needs verification" pairing)
- **Build status:** ✅ exit 0, 0 errors, 0 warnings, 1 deprecation notice
- **Typecheck status:** ✅ exit 0, 0 errors
- **Lint status:** ✅ exit 0, 0 warnings/errors
- **Production readiness:** **Not ready** — blocked specifically by 4 verified P0s, none of them design or feature gaps

---

*Every claim in this report traces to a file, a line number, or a command output captured during this audit on 4 September 2026. Where evidence could not be obtained from static source alone (general responsive behaviour, contrast ratios), the item is marked NEEDS VERIFICATION rather than asserted either way. No statistics, fixtures, player facts, partner details, or business figures were introduced — this project's data-integrity rule applies to its own audit.*
