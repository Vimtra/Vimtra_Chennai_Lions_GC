# Vimtra Chennai Lions GC
## Complete Technical Project & Developer Learning Guide

> **What this document is.** A teaching manual for *this specific repository*, written
> so you can read it front to back and end up able to work on the codebase without
> guessing. Every file path, function name, component name, route, model and
> environment variable below was read out of the repo before it was written down.
>
> **What this document is not.** It is not a generic Next.js tutorial, and it does not
> describe anything the repository does not contain. Where the project's own
> documentation (`CLAUDE.md`) and the actual code disagree, both are shown side by
> side and neither is silently preferred — see **Part 35** for the full list.
>
> **Verified against:** working tree on branch `main`, commit `7196592`
> (`refactor(players): update hero photograph description and add marquee image`).
> No source file, database, migration, environment variable or dependency was
> modified to produce this document.

---

## Table of contents

| Part | Subject |
|---|---|
| 1 | Project overview |
| 2 | Technology stack |
| 3 | Architecture |
| 4 | Folder structure |
| 5 | Next.js fundamentals, as used here |
| 6 | React fundamentals, as used here |
| 7 | TypeScript |
| 8 | Tailwind + CSS architecture |
| 9 | Component architecture |
| 10 | Database + Prisma |
| 11 | Database safety rules |
| 12 | Authentication |
| 13 | API routes |
| 14 | Server Actions |
| 15 | E-commerce |
| 16 | Admin system |
| 17 | Validation + security |
| 18 | Email system |
| 19 | Files / images / Blob storage |
| 20 | GSAP + animation system |
| 21 | Accessibility |
| 22 | SEO |
| 23 | Responsive design |
| 24 | Performance |
| 25 | Error handling |
| 26 | IGPL integration |
| 27 | Deployment |
| 28 | Git workflow |
| 29 | Debugging guide |
| 30 | How to read this project |
| 31 | Learning roadmap |
| 32 | Practical exercises |
| 33 | Code walkthroughs |
| 34 | Important design decisions |
| 35 | Known limitations / future work |
| 36 | Final cheat sheet |

---
---

# PART 1 — PROJECT OVERVIEW

## 1.1 What is Vimtra Chennai Lions GC?

Vimtra Chennai Lions GC is Chennai's franchise in the **AM Green Indian Golf Premier
League (IGPL)**, owned by **Vimtra Ventures**. On the league's own data feed the
franchise is identified as `id: "che"`, `city: "Chennai"`, `name: "Vimtra Ventures"`
(recorded in `CLAUDE.md`, section *Chennai scope*).

This repository is the franchise's **public website plus its private operations
console** — one Next.js application serving both.

## 1.2 What problem does it solve?

Three distinct jobs, in one deployment:

1. **Publish the franchise.** Editorial pages for the club, the squad, the city, the
   parent company, the development programme and the investment story.
2. **Report the season honestly.** Fixtures, round scores and three season
   leaderboards, driven entirely by database rows, with deliberate *empty states*
   when data has not been verified, instead of placeholder numbers.
3. **Sell merchandise and answer enquiries.** A full commerce flow (catalogue to cart
   to checkout to order to order history) and a contact form, both backed by real
   database tables and both administered from `/admin`.

### The data-integrity rule (read this before you write any content code)

`CLAUDE.md` opens with a permanent project rule that outranks any design brief:

> **Never invent data.** No numbers, statistics, rankings, scores, achievements,
> match results, fixtures, records, sponsorship or business figures, awards, dates or
> tournament information may be created. If a value is not available from an approved
> source, render an **intentional empty / unavailable state** — never a placeholder,
> an estimate, or an illustrative row.

You can see this rule enforced in the code itself, not just asserted:

* `app/scores/page.tsx` — the page header comment: *"Nothing on this page is
  fabricated... Where the Score table holds nothing for an event the board is drawn
  unlit rather than filled with provisional or illustrative numbers."*
* `app/leaderboards/page.tsx` — *"No illustrative or placeholder ranks are ever
  presented as though they were live."* The empty-state sentence is **counted from
  the `Fixture` and `Standing` tables**, not typed in.
* `app/fixtures/page.tsx` — only two hard-coded numbers exist on the whole page
  (`SEASON_EVENTS = 15`, `SEASON_FRANCHISES = 10`), and both carry a source citation
  in a comment (brochure p. 05). Everything else is a count of database rows.
* `data/players.ts` — a 60-line header documenting, player by player, every place the
  franchise brochure and the official IGPL record **disagree**, with the conflict
  reported rather than reconciled.

## 1.3 Major user types

| User type | How they are recognised | What they can do |
|---|---|---|
| **Anonymous visitor** | No `lions_session` cookie | Read every public page; browse the shop; build a cart (stored in their browser); submit the contact form |
| **Member (`Role.USER`)** | Valid session, `emailVerifiedAt` set (or account predates the verification cutoff) | Everything above, plus checkout, order history, account settings, address book, email/phone verification |
| **Pending member** | Valid session, `emailVerifiedAt = null`, account created on/after `2026-09-11T12:00:00Z` | Held at `/check-email`; can resend the link or correct a mistyped address, nothing else |
| **Admin (`Role.ADMIN`)** | Valid session and `role === "ADMIN"` | Everything above, plus the whole `/admin` console |

There is **no separate "player" login**. Players are editorial content
(`data/players.ts` plus `public/players/`), not accounts.

## 1.4 Feature inventory

### Business functionality

| Area | What it does | Where |
|---|---|---|
| Franchise story | Club, squad, city identity, parent company, academy/development, investment case, partners | `/the-club`, `/the-pride`, `/players`, `/vimtra-ventures`, `/golf-development`, `/invest`, `/partners` |
| Season reporting | Calendar, per-event round scoring, three standings boards | `/fixtures`, `/scores`, `/leaderboards` |
| Newsroom | Franchise editorial articles plus curated third-party press and social posts, as one classified feed | `/news`, `/news/[slug]` |
| Merchandise | Catalogue, product detail, cart, checkout, order confirmation, order history | `/shop`, `/product/[id]`, `/cart`, `/checkout`, `/orders/[id]`, `/profile/orders` |
| Enquiries | Contact form with topic routing, persisted and answerable | `/contact`, `/admin/messages` |
| Legal | Privacy policy, terms | `/privacy`, `/terms` |

### Technical functionality

| Area | Implementation |
|---|---|
| Accounts | Custom: bcrypt passwords, opaque DB-backed sessions, httpOnly cookie |
| Verify-before-activate | Email verification gate for accounts created after a fixed cutoff |
| Phone verification | Fully implemented OTP logic; **no SMS transport is configured** |
| Brute-force protection | Per-email and per-IP login rate limiting, database-backed |
| Commerce | Server-authoritative pricing, atomic stock decrement, idempotent order placement |
| Email | Gmail SMTP via Nodemailer; six live senders, one dormant stub |
| Image upload | Vercel Blob in production, `public/uploads/` locally |
| Admin console | Ten managed areas, every action gated by `requireAdmin()` |
| SEO | `metadataBase`, per-page canonicals, dynamic sitemap, robots rules |
| IGPL sync | Authenticated endpoint, flag-gated, **currently a no-op stub** |

---
---

# PART 2 — TECHNOLOGY STACK

Versions below are the **installed** versions read from `node_modules`, with the
`package.json` range in brackets where it differs.

| Technology | Version | Purpose | Where it is used | Why it earns its place here |
|---|---|---|---|---|
| **Next.js** | 15.5.19 (`^15.5.19`) | Full-stack React framework (App Router) | Every route in `app/` | One deployment serves marketing pages, a database-backed shop and a private admin console. Server Components let pages query Postgres directly with no API layer. |
| **React** | 18.3.1 | UI library | All components | Server Components for data, Client Components for interaction. |
| **TypeScript** | 5.9.3 | Static typing | Entire codebase, `strict: true` | Prisma generates types from the schema, so a schema change surfaces as a compile error rather than a runtime 500. |
| **Tailwind CSS** | 3.4.19 | Utility-first CSS | `app/globals.css`, `tailwind.config.ts`, all markup | Brand tokens live in config; utilities keep one-off styling local. |
| **PostgreSQL** | external (Neon, per `.env.example`) | Relational database | All persistent data | Needs real transactions, `jsonb`, string arrays and concurrency safety for checkout. |
| **Prisma** | 6.19.3 | ORM plus migration tool | `prisma/`, every `lib/` file that touches data | Schema-first, typed client, versioned migrations. |
| **Zustand** | 5.0.14 (`^5.0.3`) | Client state | `store/cart.ts`, `store/toast.ts`, `store/admin-toast.ts` | Cart survives navigation and page reload with about 30 lines and no provider tree. |
| **GSAP** | 3.15.0 | Animation plus ScrollTrigger | `components/motion/gsap.ts`, home/news/season components | Scroll-linked editorial choreography that CSS transitions cannot express. |
| **Zod** | 4.4.3 | Runtime schema validation | Auth, contact, profile, check-email actions | TypeScript types vanish at runtime; form data arrives untyped and untrusted. |
| **Nodemailer** | 9.1.1 | SMTP client | `lib/mail.ts` | Sends through Gmail SMTP with an App Password; no third-party email SaaS to onboard. |
| **@vercel/blob** | 2.8.0 | Object storage | `lib/cover-upload.ts` | Vercel's filesystem is read-only and ephemeral, so uploaded images need external storage. |
| **bcryptjs** | 3.0.3 | Password hashing | `lib/auth.ts`, `prisma/seed.ts` | Pure-JS bcrypt, so no native build step in serverless. |
| **TipTap** | 3.30.2 (`core`, `react`, `starter-kit`) | Rich-text editor | `components/admin/PostEditor.tsx` | Produces both HTML (for rendering) and JSON (for round-trip editing). Loaded only on the admin route. |
| **sanitize-html** | 2.17.7 | HTML sanitisation | `lib/news-html.ts` | Article bodies are rendered with `dangerouslySetInnerHTML`; this is the allow-list that makes that safe. |
| **lucide-react** | 0.469.0 | Icon set | Nav, admin, error pages, throughout | Tree-shakable React icons, no CDN dependency. |
| **tsx** | 4.22.4 | TypeScript script runner | `prisma/seed.ts`, `scripts/*` | Runs `.ts` scripts directly without a build step. |
| **ESLint** | 8 plus `eslint-config-next` 15 | Linting | `npm run lint` | Catches Next.js-specific mistakes (image usage, client/server boundaries). |
| **Git / GitHub** | n/a | Version control | Remote is named `Lions` | 63 commits of history; commit messages carry the design rationale. |
| **Vercel** | n/a | Hosting | `vercel.json`, `next.config.mjs` | Server Actions, middleware and the admin console all need a Node/serverless runtime. |

---

## 2.1 Each major technology, explained twice

### Next.js

**A. Beginner explanation.**
React on its own renders in the browser. Next.js is a framework that runs React on a
*server* as well, decides what each URL should render, and handles routing, data
fetching, bundling and deployment. The **App Router** (the `app/` directory) is its
current routing model: a folder is a URL segment, and a `page.tsx` inside it is that
URL's page.

**B. How this project uses it.**
Every URL is a folder under `app/`. Pages are **async server functions** that call
Prisma directly:

```tsx
// app/shop/page.tsx
export default async function ShopPage() {
  const products = await listProducts().catch(() => []);
  // ...
}
```

There is no `/api/products` route, because there does not need to be — the page runs
on the server and queries the database itself. The only API route in the project is
`app/api/sync/igpl/route.ts`, which exists because an external cron needs a URL to
call. Form submissions go through **Server Actions** instead of API routes.

**Where to find it:** `app/layout.tsx` (the root shell), `app/page.tsx` (home),
`next.config.mjs` (headers, image hosts, body-size limit), `middleware.ts` (edge gate).

**Why it matters:** understanding that a page *is* server code is the single biggest
mental shift in this codebase. If you try to `useState` in `app/shop/page.tsx` it will
not compile, and that is correct.

---

### React

**A. Beginner explanation.**
React builds UI from **components** — functions that return markup. Components take
**props** (inputs from the parent) and can hold **state** (values that change over
time and re-render the component when they do).

**B. How this project uses it.**
The split that matters here is **Server Component vs Client Component**. A Server
Component runs only on the server, can be `async`, can query the database, and ships
*no JavaScript* to the browser. A Client Component opts in with the `"use client"`
directive at the top of the file, and can use hooks, state and event handlers.

Count in this repo: **64 files declare `"use client"`** — 59 in `components/`, 3 in
`store/`, and 2 in `app/`. Everything else is a Server Component by default.

Rule of thumb as practised here: *data fetching and page composition on the server;
only the interactive leaf becomes a client component.* `app/shop/page.tsx` (server)
fetches products and hands them to `components/shop/ShopBrowser.tsx` (client), which
owns the filter and sort interaction.

---

### TypeScript

**A. Beginner explanation.**
TypeScript is JavaScript with type annotations checked before the code runs. `strict`
mode additionally forbids implicit `any` and requires you to handle `null` and
`undefined`.

**B. How this project uses it.**
`tsconfig.json` sets `"strict": true` and the path alias `"@/*": ["./*"]`, which is
why imports read `@/lib/auth` rather than `../../../lib/auth`.

The highest-value types here are the ones Prisma generates. `import type { Order,
OrderStatus } from "@prisma/client"` gives you the exact shape of a database row and
the exact set of allowed status strings — both regenerated from `schema.prisma` every
time you run `prisma generate`.

---

### Tailwind CSS

**A. Beginner explanation.**
Instead of writing a CSS class and a rule for it, you compose small single-purpose
utility classes directly in markup: `className="flex items-center gap-4"`.

**B. How this project uses it.**
Hybrid, deliberately. `tailwind.config.ts` defines the brand palette
(`crimson`, `cream`, `gold`, `ink`, `muted`, plus a newer "Grandstand" set of
`paper` / `stone` / `charcoal` / `slate`) and typography families. Utilities handle
layout and one-off spacing. But the *design system itself* — 14,567 lines of it —
lives in `app/globals.css` as hand-written CSS with CSS custom properties. See
**Part 8**.

---

### PostgreSQL plus Prisma

**A. Beginner explanation.**
PostgreSQL is a relational database: data lives in tables with typed columns, and the
database itself enforces rules (uniqueness, foreign keys). Prisma sits in front of it:
you describe your tables in `schema.prisma`, Prisma generates a typed client
(`prisma.order.findMany(...)`), and generates SQL migration files that bring a
database from one schema version to the next.

**B. How this project uses it.**
`prisma/schema.prisma` defines **15 models and 9 enums**. Every read and write goes
through a single client instance in `lib/prisma.ts`. The data layer is split by
concern into `lib/` modules (`db.ts` for products, `orders.ts`, `addresses.ts`,
`fixtures.ts`, `scores.ts`, `standings.ts`, `posts.ts`, `media-coverage.ts`,
`contact-messages.ts`, `verification.ts`, `auth-rate-limit.ts`), each marked
`import "server-only"` so it can never be bundled into the browser.

Where correctness matters most — placing an order — the project drops to raw SQL
inside a Prisma transaction. See **Part 15**.

---

### Zustand

**A. Beginner explanation.**
A small state library. You create a store with `create()`, and any component can read
from it or update it without passing props down a tree.

**B. How this project uses it.**
`store/cart.ts` wraps the store in Zustand's `persist` middleware, writing to
`localStorage` under the key **`lions_cart`**. Because the server renders an empty
cart and the browser then hydrates the saved one, the file exports a guard hook:

```ts
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
```

**Always read cart state behind `useCartHydrated()`** or you will get a React
hydration mismatch.

---

### GSAP

**A. Beginner explanation.**
GreenSock Animation Platform animates properties over time. Its **ScrollTrigger**
plugin ties an animation's progress to scroll position.

**B. How this project uses it.**
`components/motion/gsap.ts` is the single registration point and exposes a small set
of reusable primitives — `revealImage`, `revealLines`, `rise`, `riseOnScroll`,
`revealLinesOnScroll`, `revealImageOnScroll`, `countUp`, `parallax`. Every one of them
begins with a `reduced()` check and returns early under
`prefers-reduced-motion: reduce`. See **Part 20**.

---

### Zod

**A. Beginner explanation.**
You declare a schema (`z.object({ email: z.string().email() })`) and call
`.safeParse(data)`. It returns either parsed, typed data or a list of issues — at
runtime, where TypeScript cannot help.

**B. How this project uses it.**
Every action that accepts free-form user input validates with Zod first:
`app/(auth)/actions.ts` (`signInSchema`, `signUpSchema`), `app/contact/actions.ts`
(`contactSchema`, with per-field max lengths), `app/profile/actions.ts`,
`app/check-email/actions.ts`. Admin actions validate by explicit allow-list checks
instead (`ORDER_STATUSES.includes(raw)`), which is equally strict for enum-shaped
input.

---

### Nodemailer / Gmail SMTP

**A. Beginner explanation.**
SMTP is the protocol for sending email. Nodemailer is a Node client for it. Gmail
requires an **App Password** (not your login password) and 2-Step Verification.

**B. How this project uses it.**
`lib/mail.ts` builds **one cached transporter per server process**, only after
confirming all four variables are present (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`,
`MAIL_FROM`). Without them, sending is *skipped* — never attempted, never thrown. See
**Part 18**.

---

### Vercel Blob

**A. Beginner explanation.**
Object storage: you upload a file, you get back a permanent public URL.

**B. How this project uses it.**
`lib/cover-upload.ts` is the project's single image-storage path for all three admin
image types (`news`, `media`, `products`). Production uses Blob; local development
without a token falls back to `public/uploads/`. See **Part 19**.

---

### bcryptjs

**A. Beginner explanation.**
Bcrypt turns a password into a one-way hash that is deliberately slow to compute, so
an attacker who steals the database cannot cheaply brute-force passwords.

**B. How this project uses it.**
`lib/auth.ts` uses `BCRYPT_ROUNDS = 10`. Note that `verifyCredentials()` compares
against a **dummy hash** when no user exists, to reduce user-enumeration timing leaks.

---

### TipTap

**A. Beginner explanation.**
A headless rich-text editor — it gives you editing behaviour and document state, and
you build the toolbar yourself.

**B. How this project uses it.**
`components/admin/PostEditor.tsx` uses `useEditor` with `StarterKit` and
`immediatelyRender: false` (to avoid an SSR/CSR mismatch). It saves **both**
`Post.bodyHtml` (pre-rendered, so `/news/[slug]` never loads editor libraries) and
`Post.bodyJson` (so the editor can reload exactly what was typed).

---
---

# PART 3 — PROJECT ARCHITECTURE

## 3.1 The whole system

```
                          +-----------------------------+
                          |          BROWSER            |
                          |  HTML - RSC payload - JS    |
                          |  localStorage: lions_cart   |
                          |  cookie: lions_session      |
                          +--------------+--------------+
                                         | HTTPS
                          +--------------v--------------+
                          |   VERCEL EDGE               |
                          |   middleware.ts             |
                          |   (cookie presence on       |
                          |    /admin/* only)           |
                          +--------------+--------------+
                                         |
      +----------------------------------v----------------------------------+
      |                    NEXT.JS 15 APP ROUTER (Node runtime)             |
      |                                                                     |
      |   app/layout.tsx  ->  getCurrentUser()  ->  Nav / Footer / Loader   |
      |                                                                     |
      |   +--------------------+        +------------------------------+    |
      |   | SERVER COMPONENTS  |        | CLIENT COMPONENTS (64 files) |    |
      |   | async, DB access,  | props  | "use client", hooks, events, |    |
      |   | zero client JS     |------->| zustand, GSAP                |    |
      |   +---------+----------+        +--------------+---------------+    |
      |             |                                  | invoke             |
      |             |                   +--------------v---------------+    |
      |             |                   | SERVER ACTIONS ("use server")|    |
      |             |                   | 17 files - 48 exported fns   |    |
      |             |                   | auth -> validate -> write -> |    |
      |             |                   | revalidatePath -> result     |    |
      |             |                   +--------------+---------------+    |
      |             |                                  |                    |
      |   +---------v----------------------------------v---------------+    |
      |   |  BUSINESS LOGIC - lib/*.ts  (all import "server-only")      |    |
      |   |  auth - orders - db - addresses - verification - mail -     |    |
      |   |  fixtures - scores - standings - posts - media-coverage -   |    |
      |   |  contact-messages - cover-upload - auth-rate-limit          |    |
      |   +-------------------------+-----------------------------------+    |
      |                             |                                        |
      |   +-------------------------v-----------------------------------+    |
      |   |  lib/prisma.ts - one PrismaClient (globalThis-cached in dev)|    |
      |   +-------------------------+-----------------------------------+    |
      +-----------------------------+------------------------------------+
                                    |
          +-------------------------v----------+   +----------------------+
          |  PostgreSQL  (Neon: pooled +       |   |  Vercel Blob         |
          |  direct URLs) - 15 models          |   |  news/ media/        |
          +------------------------------------+   |  products/           |
                                                   +----------------------+
          +------------------------------------+
          |  Gmail SMTP (smtp.gmail.com:465)   |
          +------------------------------------+
```

## 3.2 Layer by layer

**1. Browser.** Holds two pieces of state: the `lions_session` httpOnly cookie (which
JavaScript cannot read — that is the point) and the `lions_cart` localStorage entry
(which it can, and which the server therefore never trusts).

**2. Edge middleware.** `middleware.ts` matches `/admin/:path*` only. It checks
whether a `lions_session` cookie *exists* — nothing more. It cannot check the role,
because the Edge runtime has no database connection. Its own comment says so:
*"Full role authorization (ADMIN) is enforced server-side by requireAdmin() in each
admin page."*

**3. Root layout.** `app/layout.tsx` is `async`. It calls `getCurrentUser()` once per
request and passes the result to `<Nav>`. It loads three Google fonts through
`next/font/google`, exposes them as CSS variables, and wraps the public chrome in
`<PublicChrome>` so `/admin/*` gets none of it.

**4. Server Components.** The default. They compose the page and fetch its data.

**5. Client Components.** Interaction only.

**6. Server Actions.** The write path. Always: authenticate, validate, authorise,
write, `revalidatePath`, return a typed result.

**7. Business logic (`lib/`).** Pure data-layer modules. The `import "server-only"`
line at the top of each is a build-time guard: if a client component ever imports one,
the build fails rather than shipping database code to the browser.

**8. Prisma / PostgreSQL.** One client instance, cached on `globalThis` in development
so hot reload does not exhaust the connection pool.

---

## 3.3 Authentication flow

```
Visitor submits /sign-in form
        |
        v  (Server Action: signIn, app/(auth)/actions.ts)
  zod signInSchema.safeParse          -- fail --> redirect /sign-in?error=invalid
        |
        v
  getLoginRateLimitState(email, ip)   -- blocked --> redirect /sign-in?error=creds
        |                                           (deliberately the same message
        v                                            as a wrong password)
  verifyCredentials(email, password)
    |- user not found -> bcrypt.compare against DUMMY hash -> null
    +- bcrypt.compare(password, user.passwordHash)
        |
        |- null --> recordLoginFailure(email, ip) --> redirect ?error=creds
        |
        v SafeUser
  clearLoginRateLimits(email, ip)
        |
        v
  createSession(userId)
    |- crypto.randomBytes(32).toString("hex")   <- the token
    |- INSERT Session { token, userId, expiresAt = now + 90 days }
    +- cookies().set("lions_session", token, { httpOnly, sameSite:"lax",
                                               secure in prod, path:"/" })
        |
        v
  user.verificationRequired ?
    |- yes --> redirect /check-email?next=...
    +- no  --> redirect next ?? (ADMIN ? "/admin" : "/profile")
```

Every later request:

```
Request  -->  cookie lions_session
              |
              v
         getPendingUser()   - SELECT Session WHERE token, INCLUDE user
              |             - reject if expiresAt < now
              v
         getCurrentUser()   - additionally hides accounts whose email is
              |              unverified AND created >= VERIFICATION_REQUIRED_SINCE
              v
         requireUser(next) / requireAdmin()   - redirect if not satisfied
```

## 3.4 Email flow

```
Trigger (signUp / contact submit / COD order / admin cancel / resend)
        |
        v
  lib/email-templates.ts  ->  { subject, text, html }   (pure function,
        |                                                every value escapeHtml'd)
        v
  lib/mail.ts sendMail()
        |
        |- isContactSmtpConfigured()?  SMTP_HOST && SMTP_USER
        |                              && SMTP_PASSWORD && MAIL_FROM
        |      +- no  --> { sent:false, reason:"not-configured" }  (silent, no throw)
        |
        v yes
  getContactTransporter()   - one cached nodemailer transport per process
        |
        v
  transporter.sendMail({ from: resolveFromAddress(), to, subject, text, html, replyTo })
        |
        |- throws --> console.error(transport message only) --> { sent:false, reason:"error" }
        +- ok     --> { sent:true, provider:"smtp" }
```

**The rule every call site obeys:** email is best effort and never rolls back the
database write it follows.

## 3.5 E-commerce flow

```
/shop (server)  listProducts()  -->  ShopBrowser (client)
    |
    v
/product/[id] (server)  getProductById()  -->  QtyAddToCart (client)
    |
    v
useCart.add()  -->  zustand + localStorage "lions_cart"
    |
    v
/cart (client)  - quantities, subtotal, computeTotals() preview
    |
    v
/checkout (server)  requireUser("/checkout") + listAddresses(user.id)
    |
    v
CheckoutFlow (client) - step 1 contact+address, step 2 payment+review
    |   generates clientRequestId ONCE per mount (crypto.randomUUID)
    v
placeOrderAction(formData)   ["use server"]
    |- requireUser("/checkout")       <- re-checked, not trusted from the page
    |- parseCart()                    <- only {productId, qty}; prices ignored
    |- validate email / phone / payment method
    |- optionally createAddress()     <- BEFORE the order transaction
    v
placeOrder()   [lib/orders.ts]
    |- idempotency short-circuit on clientRequestId (plain read, no transaction)
    v prisma.$transaction
    |- resolve + freeze shipping address  -> shippingSnapshot (jsonb)
    |- re-read Product rows               -> authoritative price / stock / image
    |- ONE raw SQL UPDATE ... FROM (VALUES ...) WHERE active AND stock >= qty
    |     RETURNING id                    -> atomic multi-row decrement
    |- applied.length !== lines.length ?  -> throw InsufficientStockError (rollback)
    |- computeTotals()                    -> subtotal / shipping / GST / total
    +- order.create with nested items     -> retry up to 5x on orderNumber collision
    v
COD?  - yes -> sendCodOrderConfirmationToUser  -> recordCodEmailSent(id,"user")
      |        sendCodOrderNotificationToAdmin -> recordCodEmailSent(id,"admin")
      +- no  -> sendOrderReceipt (dormant stub - never sends)
    v
revalidatePath /profile/orders, /orders/[id], /admin/orders
    v
{ ok:true, orderId, orderNumber }  -> client clears cart -> router.push(/orders/[id])
```

## 3.6 Admin flow

```
GET /admin/anything
    |
    v middleware.ts (Edge)   cookie present?  - no -> /sign-in?next=...
    |
    v app/admin/layout.tsx   requireAdmin()   - not admin -> /?denied=admin
    |                        getAdminBadges() -> AdminChrome (sidebar counts)
    |
    v app/admin/<area>/page.tsx   requireAdmin() AGAIN
    |   (a layout is not re-rendered on every client navigation,
    |    so the per-page check is the real gate)
    |
    v form action={someAdminAction}
    |
    v app/admin/<area>/actions.ts   "use server"
        await requireAdmin()    <- FIRST LINE of every single admin action
        validate input
        write via lib/*
        revalidatePath(public + admin surfaces)
        return ActionResult  -> AdminToaster shows it
```

## 3.7 Image / Blob flow

```
Admin picks a file in CoverImageField / ProductForm
    |
    v  multipart FormData -> Server Action (bodySizeLimit "6mb", next.config.mjs)
    |
    v  lib/cover-upload.ts storeCoverImage(file, folder)
    |- declared MIME in COVER_ACCEPTED_TYPES?         no -> CoverUploadError
    |- size <= 5 MB and > 0?                          no -> CoverUploadError
    |- read bytes -> detectImageType(bytes)           <- MAGIC-NUMBER sniff
    |- actual type === declared type?                 no -> CoverUploadError
    v
    BLOB_READ_WRITE_TOKEN set?
      |- yes -> put(`${folder}/${uuid}.${ext}`, bytes, { access:"public" }) -> blob.url
      +- no  -> requiresBlobStorage() (prod/Vercel)? -> CoverUploadError
                otherwise -> write to public/uploads/<folder>/ -> "/uploads/..."
    v
    URL string stored on the row (Product.images[0] / Post.coverImage / MediaCoverage.coverImage)
    v
    next/image renders it; next.config.mjs allows *.public.blob.vercel-storage.com
```

## 3.8 Deployment flow

```
Local: npm run dev   (next dev, http://localhost:3000)
   |
   v  git add / git commit   (on a branch - never straight to main)
   |
   v  git push Lions <branch>          <- the remote is named "Lions"
   |
   v  GitHub
   |
   v  Vercel build
        1. npm install
        2. npm run build  ->  "prisma generate && next build"
        3. env vars injected from Vercel project settings
   |
   v  Production (Node/serverless)
        - middleware on the Edge
        - Server Components + Server Actions on Node
        - DATABASE_URL = pooled Neon URL
        - DIRECT_URL   = direct Neon URL (migrations only)
```

Migrations are **not** run by the build. `npx prisma migrate deploy` is a separate,
deliberate step. See **Part 11**.

---
---

# PART 4 — FOLDER STRUCTURE

## 4.1 Top level (tracked files only)

```
Vimtra Chennai Lions Gc Web/
|-- app/                     Next.js App Router: every route, layout and server action
|-- components/              React components (70 .tsx files; 59 are client components)
|-- lib/                     Business logic and data access - the real "backend"
|-- data/                    Static, code-owned content (products seed, roster)
|-- store/                   Zustand client stores
|-- prisma/                  Schema, migrations, seed
|-- scripts/                 Operational and test scripts (tsx / node)
|-- public/                  Static assets served at the site root
|-- middleware.ts            Edge gate for /admin
|-- next.config.mjs          Security headers, image hosts, server-action body limit
|-- tailwind.config.ts       Brand design tokens
|-- tsconfig.json            strict TS, "@/*" alias
|-- postcss.config.mjs       tailwind + autoprefixer
|-- .eslintrc.json           next/core-web-vitals
|-- vercel.json              Vercel config (crons currently empty)
|-- package.json             Scripts and dependencies
|-- CLAUDE.md                Project rules and developer guide (the data-integrity rule)
|-- .env.example             Every environment variable, documented
+-- Vimtra-Chennai-Lions-IGPL-Brochure.pdf   Source document cited by data/players.ts
```

**Untracked directories you will see on disk but must ignore:** `golf/`, `logos/`,
`products/`, `new-site/`, `modern-prototype/`, `.tmp-img/`, `.next/`, `.vercel/`,
`node_modules/`. Only `.tmp-img/` has any tracked content. None of them is part of the
application.

---

## 4.2 `app/` — routes, layouts, actions

**What it contains.** Everything that maps to a URL, plus the Server Actions that
those URLs post to, plus the global stylesheet.

**Why it exists.** The App Router derives routing from the filesystem, so this folder
*is* the site map.

**What depends on it.** Nothing imports from `app/` except client components importing
Server Actions (for example `components/shop/CheckoutFlow.tsx` imports
`placeOrderAction` from `@/app/checkout/actions`).

**What belongs here.** `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`,
`not-found.tsx`, `route.ts`, `actions.ts`, and route-scoped CSS (`admin/admin.css`).

**What does not.** Reusable components (put them in `components/`) and data access
(put it in `lib/`).

### The 47 page routes (27 public, 20 admin)

```
PUBLIC EDITORIAL          COMMERCE                 ACCOUNT
/                         /shop                    /(auth)/sign-in
/the-club                 /product/[id]            /(auth)/sign-up
/the-pride                /cart                    /check-email
/players                  /checkout                /verify-email
/golf-development         /orders/[id]             /profile
/vimtra-ventures                                   /profile/orders
/invest
/partners                 SEASON                   ADMIN (20 routes)
/news                     /fixtures                /admin
/news/[slug]              /scores                  /admin/products (+ [id]/edit)
/contact                  /leaderboards            /admin/inventory
/privacy                                           /admin/orders (+ [id])
/terms                                             /admin/users
                                                   /admin/messages
API                                                /admin/news (+ new, [id]/edit, editorial)
/api/sync/igpl  (GET)                              /admin/media (+ new, [id]/edit)
                                                   /admin/fixtures (+ new, [id]/edit)
                                                   /admin/scores
                                                   /admin/leaderboards
```

### Key files in `app/`

| File | What it does |
|---|---|
| `app/layout.tsx` | Root shell. Loads Sora/Manrope/Fraunces as CSS variables, defines site-wide `metadata` (including `metadataBase` and the `%s - Vimtra Chennai Lions GC` title template), calls `getCurrentUser()`, renders the skip link, `Loader`, `Nav`, `<main id="main-content" tabIndex={-1}>`, `Footer`, `ScrollToTop` |
| `app/globals.css` | 14,567 lines. Tailwind directives plus the entire hand-written design system |
| `app/page.tsx` | Home. Fetches fixtures, featured official news and products in one `Promise.all`, each with `.catch(() => [])`, then renders seven narrative chapters |
| `app/loading.tsx` | The only route-level loading UI in the project (root scope) |
| `app/error.tsx` | The only error boundary. `"use client"`, `role="alert"`, focuses its heading on mount |
| `app/not-found.tsx` | 404 page |
| `app/robots.ts` | Emits robots rules and **exports `SITE_URL`**, which `layout.tsx` and `sitemap.ts` both import so there is exactly one origin |
| `app/sitemap.ts` | Static routes plus live product and published-post URLs, each in its own `try/catch` |
| `app/admin/layout.tsx` | Admin frame. `requireAdmin()`, badge counts, `robots: { index: false }` |
| `app/admin/admin.css` | 1,016 lines, imported only by the admin layout |

---

## 4.3 `components/`

**What it contains.** Every reusable React component, grouped by feature.

```
components/
|-- Nav.tsx               Global header: mega menu, cart count, auth state
|-- Footer.tsx            Global footer (shares taxonomy with Nav via lib/nav.ts)
|-- Loader.tsx            Brand splash on first load
|-- PublicChrome.tsx      Renders children only outside /admin
|-- ScrollToTop.tsx       Appears past 300px of scroll
|-- ToastHost.tsx         Public toast outlet (store/toast.ts)
|-- Reveal.tsx            IntersectionObserver scroll reveal (CSS-driven)
|-- AeText.tsx            Word / mask / char staggered text reveal
|-- motion/gsap.ts        GSAP registration + reusable choreography primitives
|-- site/                 Page-shell primitives: Section, PageHero, PageMasthead,
|                         StoryHero, VimtraHero, FullBleedStatement, Chapters
|-- home/                 Hero, HeroCarousel, Sections (the 7 home chapters)
|-- shop/                 ProductCard, ShopProductCard, ShopHero, ShopBrowser,
|                         AddToCartButton, QtyAddToCart, CheckoutFlow
|-- players/              PlayerExperience
|-- fixtures/             FixturesList
|-- season/               ScoreExperience, StandingsBoard
|-- news/                 Newsroom, OfficialNews, DayInTheDen
|-- partners/             CommercialTiers
|-- invest/               ThreePillars
|-- club/                 ClubBuild
|-- vv/                   LeadershipComposition
|-- contact/              ContactForm, topics.ts (CONTACT_TOPICS)
|-- auth/                 PasswordField, CheckEmailPanel, VerifyEmailConfirm
|-- profile/              ProfileClient, AccountNav, AccountSettingsForm,
|                         OrdersList, PasswordField, VerificationPanel
+-- admin/                AdminShell + forms + a ui/ primitives folder
```

**What belongs here.** Anything rendered in more than one place, or any interactive
leaf that needs `"use client"`.

**What does not.** Database queries. If a component needs data, either its parent
server component fetches it, or it calls a Server Action.

---

## 4.4 `lib/` — the actual backend

This is the most important folder to understand. 33 modules.

| Module | Lines | Responsibility |
|---|---|---|
| `prisma.ts` | 15 | The single `PrismaClient`, cached on `globalThis` in dev |
| `auth.ts` | 218 | Passwords, sessions, `getCurrentUser` / `requireUser` / `requireAdmin`, the verification cutoff, `safeNextPath` |
| `auth-rate-limit.ts` | 125 | Login throttling by hashed email and hashed IP, atomic upsert in raw SQL |
| `verification.ts` | 476 | Email tokens and phone OTPs: issue, peek, consume, rate limits, `changeUserEmail` |
| `orders.ts` | 666 | `placeOrder` transaction, idempotency, lifecycle transitions, cancel-and-restock |
| `orders-totals.ts` | 59 | Pure totals maths (shipping threshold, GST), env-overridable |
| `orders-format.ts` | 127 | Pure label/style formatters and `generateOrderNumber()` — safe on the client |
| `db.ts` | 256 | Product catalogue CRUD |
| `products.ts` | 77 | Product type, `productImage`, `inr`, `FALLBACK_LOGO`, `SEED_PRODUCTS` — **no server-only**, so client components can import it |
| `addresses.ts` | 149 | Address book, `addressToSnapshot` |
| `mail.ts` | 380 | SMTP transport and every sender |
| `email-templates.ts` | 744 | Pure `{subject, text, html}` builders |
| `cover-upload.ts` | 215 | Image validation and storage |
| `fixtures.ts` / `fixtures-format.ts` | 113 / 47 | Fixture data layer / pure date formatters |
| `scores.ts` | 71 | Score rows per fixture |
| `standings.ts` | 155 | Three leaderboard boards, JSON `extra` column |
| `posts.ts` / `posts-format.ts` | 147 / 16 | News articles, published-only public helpers |
| `media-coverage.ts` / `-format.ts` | 130 / 26 | Press and social coverage |
| `coverage-admin.ts` | 96 | Shared admin form parsing for coverage |
| `news-desk.ts` | 218 | Merges `Post` and `MediaCoverage` into one classified feed — **pure, no server-only**, so the client index filters the same objects |
| `news-html.ts` | 37 | `sanitizeNewsHtml()` allow-list |
| `contact-messages.ts` / `-format.ts` | 120 / 20 | Enquiry persistence and display |
| `admin-dashboard.ts` | 108 | Badge counts and dashboard queries |
| `admin-action-result.ts` | 17 | The one `ActionResult<T>` shape every admin action returns |
| `sms.ts` | 108 | SMS transport — deliberately reports `not-configured` |
| `site-url.ts` | 69 | Resolves the public origin; throws `SiteUrlError` in production rather than emailing a localhost link |
| `image-src.ts` | 60 | Maps stored original image paths to optimised `-web` derivatives at render time |
| `nav.ts` | 181 | Navigation taxonomy shared by `Nav` and `Footer`, plus `FLOATING_HEADER_ROUTES` |

**The `server-only` convention.** Any module that touches Prisma, secrets or the
filesystem starts with `import "server-only"`. Modules that are pure formatting
(`orders-format.ts`, `fixtures-format.ts`, `posts-format.ts`, `products.ts`,
`orders-totals.ts`, `news-desk.ts`, `admin-action-result.ts`, `image-src.ts`,
`site-url.ts`) deliberately do **not**, because client components import them.

---

## 4.5 `data/`

| File | Contents |
|---|---|
| `products.json` | The seed catalogue consumed by `lib/products.ts` as `SEED_PRODUCTS` and by `prisma/seed.ts`. The *live* catalogue is the `Product` table, not this file |
| `players.ts` | `ROSTER` — the four Season 2026 players, each fact cited to either the official IGPL record or a brochure page, with conflicts documented |

**What belongs here.** Content that is genuinely code-owned and not admin-editable.

**What does not.** Anything an admin should be able to change without a deploy. That
goes in a database table.

---

## 4.6 `prisma/`

```
prisma/
|-- schema.prisma              provider = "postgresql"  <- the live schema (15 models)
|-- schema.sqlite.prisma       provider = "sqlite"      <- STALE: only 9 models
|-- migrations/                Postgres migration history (10 migrations)
|   |-- migration_lock.toml
|   |-- 20260821220000_postgresql_baseline/
|   |-- 20260825193930_m5_commerce/
|   |-- 20260903160155_contact_messages/
|   |-- 20260908220000_order_idempotency_cod_email_tracking/
|   |-- 20260909000000_email_phone_verification/
|   |-- 20260911120000_media_kind_official/
|   |-- 20260911120100_media_status/
|   |-- 20260911130000_media_featured_on_home/
|   |-- 20260914120000_auth_rate_limits/
|   +-- 20260915120000_order_cancellation_email/
|-- migrations_sqlite/         Preserved SQLite history (7 migrations)
+-- seed.ts                    Seeds fixtures, media coverage, products, one admin
```

**Important and not obvious:** `schema.sqlite.prisma` has drifted. It defines
9 models and 6 enums; `schema.prisma` defines 15 and 9. The SQLite schema has **no**
`Address`, `Order`, `OrderItem`, `AuthRateLimit`, `EmailVerificationToken` or
`PhoneOtp`. The "local SQLite escape hatch" documented in `CLAUDE.md` therefore cannot
run commerce, login rate limiting or verification. Treat Postgres as the only
supported target unless you first update that schema.

---

## 4.7 `store/`

| File | Purpose |
|---|---|
| `cart.ts` | The shopping cart. Persisted to `localStorage` key `lions_cart`. Exports `useCart`, `cartCount`, `cartSubtotal`, `useCartHydrated` |
| `toast.ts` | Public-site toast. Holds a `ReactNode` (changed from raw HTML in commit `501d174`) and auto-hides after 2200 ms |
| `admin-toast.ts` | Admin toasts. Separate from the public one *because admin toast text quotes admin input and is always rendered as plain text* |

---

## 4.8 `public/`

```
public/
|-- assets/     ~90 files: brand marks, photography, product mockups,
|               optimised "-web" derivatives, photo/CREDITS.md
|-- players/    Four player portraits, each with a "-web" derivative
+-- uploads/    Local-dev destination for admin image uploads (git-ignored)
```

`public/uploads/` is in `.gitignore`. On Vercel the filesystem is read-only and
ephemeral, which is exactly why `lib/cover-upload.ts` prefers Blob there.

---

## 4.9 `scripts/`

| Script | npm alias | What it does |
|---|---|---|
| `test-checkout-phase-5-3.ts` | `npm run test:checkout` | The project's only automated test. Snapshots every product row it touches, runs five checkout scenarios against a real Postgres URL, then restores the snapshot and deletes rows it created. **Never point it at production** |
| `harness-server-only-preload.mjs` + `-loader.mjs` + `-stub.cjs` | (used by the above) | Stub out `import "server-only"` so `lib/orders.ts` can be imported by a plain `tsx` script |
| `sync-product-assets.ts` | `npm run db:sync-product-assets` | Aligns product image paths with files on disk |
| `optimize-images.mjs` | (manual) | Generates the `-web` derivatives that `lib/image-src.ts` maps to |
| `stage-t6-stock.ts` | `npm run stage:t6:snapshot` / `:restore` | Snapshot and restore stock levels around staging tests. **Referenced in `package.json` but the file is not present in `scripts/`** |

---
---

# PART 5 — NEXT.JS FUNDAMENTALS USED IN THIS PROJECT

Each concept below follows the same four-beat pattern: **what it means**, **a simple
example**, **where it appears here**, **why it was done that way**.

---

## 5.1 App Router

**What it means.** Routing comes from the `app/` directory structure. A folder is a URL
segment. A `page.tsx` in that folder is the page for that URL.

**Simple example.**
```
app/shop/page.tsx      ->  /shop
app/product/[id]/page.tsx  ->  /product/anything
```

**Where in this project.** All 47 routes. `find app -name "page.tsx"` prints the site
map.

**Why.** The alternative (the older `pages/` router) cannot do Server Components or
Server Actions, both of which this project relies on heavily.

---

## 5.2 Layouts

**What it means.** A `layout.tsx` wraps every page beneath it and **does not re-render
on navigation** between those pages.

**Where in this project.** Three layouts:

| Layout | Scope | Job |
|---|---|---|
| `app/layout.tsx` | Everything | Fonts, global metadata, `getCurrentUser()`, skip link, Nav/Footer, `<main>` |
| `app/admin/layout.tsx` | `/admin/*` | `requireAdmin()`, badge counts, admin CSS, `robots: noindex` |
| `app/cart/layout.tsx` | `/cart` | Exists *only* to supply `metadata`, because `app/cart/page.tsx` is a Client Component and client components cannot export `metadata` |

**Why the admin layout is not the security boundary.** Its own comment explains:

> `requireAdmin()` runs here AND in every page — a layout is not re-rendered on every
> client navigation, so the per-page check remains the actual gate.

That is a genuinely important Next.js gotcha and this codebase handles it correctly:
**every one of the 20 admin pages calls `requireAdmin()` itself.**

---

## 5.3 Pages

**What it means.** The default export of `page.tsx`. In the App Router it can be
`async`.

**Where.** `app/shop/page.tsx` is the clearest example: an async function that awaits a
database call and returns JSX.

---

## 5.4 Nested routes and dynamic segments

**What it means.** `[id]` in a folder name captures a URL segment. In Next.js 15,
`params` is a **Promise** and must be awaited.

**Where.**
```tsx
// app/product/[id]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  if (!product.active) notFound();   // hidden products are 404, not 403
```

Other dynamic routes: `app/news/[slug]`, `app/orders/[id]`, `app/admin/orders/[id]`,
`app/admin/products/[id]/edit`, `app/admin/news/[id]/edit`,
`app/admin/media/[id]/edit`, `app/admin/fixtures/[id]/edit`.

**Why `notFound()` and not a redirect for inactive products.** Returning 404 does not
tell the caller whether the id exists — the same reasoning used for order ownership in
`app/orders/[id]/page.tsx`.

---

## 5.5 Route groups

**What it means.** A folder in parentheses groups routes **without** adding a URL
segment.

**Where.** `app/(auth)/` contains `sign-in/page.tsx`, `sign-up/page.tsx` and
`actions.ts`. The URLs are `/sign-in` and `/sign-up` — no `/auth/` prefix.

**Why.** It keeps the two auth pages and their shared Server Actions in one folder
without inventing a URL segment nobody wants.

---

## 5.6 `loading.tsx`

**What it means.** A file that Next.js shows automatically while the sibling page's
data is loading, via a React Suspense boundary.

**Where.** `app/loading.tsx` only — a single root-level loading state. It has
`role="status"` and `aria-live="polite"`.

**Current implementation note.** There are **no** route-scoped `loading.tsx` files.
Every route inherits the root one. Added in commit `8dfbc36`.

---

## 5.7 `error.tsx`

**What it means.** A React error boundary for a route subtree. It must be a Client
Component and receives `{ error, reset }`.

**Where.** `app/error.tsx` only. It is hardened for accessibility (commit `fe097da`):

```tsx
const headingRef = useRef<HTMLHeadingElement>(null);
useEffect(() => { headingRef.current?.focus(); }, []);
// ...
<div role="alert" aria-live="assertive">
  <h1 ref={headingRef} tabIndex={-1}>Something went wrong</h1>
```

**Why focus the heading.** A screen-reader user who triggers an error otherwise has no
idea the page changed; moving focus announces it.

---

## 5.8 `not-found.tsx`

**Where.** `app/not-found.tsx`. Rendered by the `notFound()` call in
`app/product/[id]`, `app/news/[slug]` and `app/orders/[id]`.

---

## 5.9 Server Components

**What it means.** The default in the App Router. Runs on the server, can be `async`,
ships zero JavaScript.

**Where.** All 47 pages except `app/cart/page.tsx`.

**Why it matters here.** It is why there is no REST layer. `app/page.tsx` does:

```tsx
const [fixtures, coverage, products] = await Promise.all([
  listFixtures().catch(() => []),
  listActiveMediaCoverage("OFFICIAL").catch(() => []),
  listProducts().catch(() => []),
]);
```

Three parallel database queries in a component. No `useEffect`, no loading spinner, no
`/api/*` route, no client-side fetch waterfall.

---

## 5.10 Client Components and `"use client"`

**What it means.** A directive on the first line of a file. It marks that file — and
everything it imports — as browser code.

**Where.** 64 files (59 in `components/`, 3 in `store/`, 2 in `app/`). Representative ones:

| File | Why it must be a client component |
|---|---|
| `components/Nav.tsx` | `usePathname`, cart count, menu state |
| `components/shop/CheckoutFlow.tsx` | Multi-step form state, `useTransition` |
| `components/Reveal.tsx` | `IntersectionObserver` |
| `components/motion/gsap.ts` | GSAP touches the DOM |
| `app/cart/page.tsx` | Reads the zustand cart |
| `components/admin/PostEditor.tsx` | TipTap |
| `store/*.ts` | Zustand hooks |

**Why the boundary is drawn where it is.** Pushing `"use client"` as far down the tree
as possible keeps the JavaScript bundle small. `app/shop/page.tsx` stays on the server;
only `ShopBrowser` crosses.

---

## 5.11 Server Actions

Covered in full in **Part 14**. In short: a function in a `"use server"` file is
callable directly from a client component; Next.js turns the call into a POST.

---

## 5.12 Metadata

**What it means.** Export a `metadata` object (static) or a `generateMetadata()`
function (dynamic) and Next.js renders the `<head>` tags.

**Where.** `app/layout.tsx` sets the defaults:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vimtra Chennai Lions GC - AM Green IGPL - Season 2026",
    template: "%s - Vimtra Chennai Lions GC",
  },
  // ...
};
```

Each page then supplies only its own name (`title: "Shop"`) and its canonical
(`alternates: { canonical: "/shop" }`).

Dynamic example — `app/product/[id]/page.tsx`:

```tsx
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product - Vimtra Chennai Lions GC" };
  return { title: product.name, description: product.desc };
}
```

**Why the layout deliberately omits `title`/`description`/`url` from `openGraph`.** Its
comment is worth reading in full — declaring them at the layout level would pin every
page's social card to the home page's wording.

---

## 5.13 `sitemap.ts` and `robots.ts`

**Where.** `app/sitemap.ts` and `app/robots.ts` — Next.js file conventions that produce
`/sitemap.xml` and `/robots.txt`.

The interesting bit is that `robots.ts` **exports** the origin:

```ts
export const SITE_URL = getSiteOrigin({ strict: false });
```

and both `layout.tsx` and `sitemap.ts` import it, so canonical URLs and the advertised
sitemap host can never disagree. See **Part 22**.

---

## 5.14 Middleware

**What it means.** Code that runs on the Edge before a matching request reaches a
route.

**Where.** `middleware.ts`, matcher `["/admin/:path*"]`. Seventeen lines. It redirects
to `/sign-in?next=<path>` when no `lions_session` cookie is present.

**Why it does so little.** Edge runtime, no database. It is a fast rejection of the
obvious case, not the authorisation check.

---

## 5.15 Redirects

**What it means.** `redirect()` from `next/navigation` throws a special
`NEXT_REDIRECT` error that Next.js turns into an HTTP redirect.

**Where.** `lib/auth.ts` (`requireUser`, `requireAdmin`), `app/(auth)/actions.ts`,
`app/admin/actions.ts`.

**The critical nuance, documented in `lib/admin-action-result.ts`:**

> Actions never `redirect()` on failure — that throws NEXT_REDIRECT, which a client
> form cannot tell apart from a crash, and it discards everything the admin typed.

So: `redirect()` for navigation-style outcomes (sign-in, sign-out, auth gates); a typed
`ActionResult` return value for form failures.

**Open-redirect protection.** `safeNextPath()` in `lib/auth.ts`:

```ts
return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
  ? next : undefined;
```

This guards `?next=` on sign-in, `?next=` inside verification emails, and the
check-email flow.

---

## 5.16 Revalidation and caching

**What it means.** Next.js caches rendered output by default. `revalidatePath(path)`
invalidates a specific path's cache from a Server Action.

**Where.** Every write action calls it. The pattern is always "invalidate every surface
that reads this row":

```ts
// app/admin/products/actions.ts
function revalidateCatalog(id?: string) {
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath("/");
  if (id) revalidatePath(`/product/${id}`);
}
```

Note that admin order actions revalidate the **buyer's** pages too
(`/orders/[id]`, `/profile/orders`), because the same row is read there.

---

## 5.17 `force-dynamic`

**What it means.** `export const dynamic = "force-dynamic"` opts a route out of static
generation: it is rendered fresh on every request.

**Where.** 33 files declare it: 31 pages, `app/admin/layout.tsx`, and the API route. Every page that reads the database does.

Representative reasons, taken from the comments:

* `app/fixtures/page.tsx` — *"Always resolve against the current DB row set so admin edits are reflected immediately."*
* `app/scores/page.tsx` — *"Live rounds change every few minutes during a tournament week."*
* `app/checkout/page.tsx` — *"auth-gated and personalised."*
* `app/admin/layout.tsx` — *"Badge counts must reflect the database on every request."*

**Routes that do NOT declare it:** `/the-club`, `/the-pride`, `/players`,
`/golf-development`, `/vimtra-ventures`, `/invest`, `/partners`, `/contact`,
`/privacy`, `/terms`, `/cart`, `/sign-in`, `/sign-up`. These are either fully static
editorial or purely client-side, so they can be prerendered.

**There is no `export const revalidate` anywhere in the project.** Freshness is handled
by `force-dynamic` plus `revalidatePath`, not by time-based ISR.

---
---

# PART 6 — REACT FUNDAMENTALS

## 6.1 Components and composition

The site's page shell is built from composable primitives in `components/site/`:

```tsx
// exported by components/site/Section.tsx
Section, IndexLabel, SectionTitle, NumberedList, Figures, EmptyState
```

A public page is assembled from those plus a hero. `app/page.tsx` is pure composition:

```tsx
<Hero next={next} />
<Statement />
<Club />
<Season rows={seasonRows} />
<Development />
<Media stories={stories} />
<Shop facts={store} />
<Closing />
```

---

## 6.2 Props

**What it means.** Inputs passed from parent to child.

**Where — the server-to-client handoff.** This is the most important prop flow in the
project:

```tsx
// app/checkout/page.tsx  (SERVER)
const user = await requireUser("/checkout");
const savedAddresses = await listAddresses(user.id);
return <CheckoutFlow user={user} savedAddresses={savedAddresses} />;
```

`CheckoutFlow` is a Client Component. Props crossing that boundary must be
serialisable — which is exactly why `lib/auth.ts` exposes `SafeUser` (id, email, name,
role, two booleans) rather than the raw Prisma `User` row with its `passwordHash`.

---

## 6.3 `useState`

**Where.** `components/shop/CheckoutFlow.tsx` holds the whole form:

```tsx
const [step, setStep] = useState<1 | 2>(1);
const [error, setError] = useState<string | null>(null);
const [addressChoice, setAddressChoice] = useState<string>(
  defaultSaved ? defaultSaved.id : "new"
);
const [inline, setInline] = useState({ label: "", fullName: user.name ?? "", /* ... */ });
const [paymentMethod, setPaymentMethod] = useState<"COD" | "OFFLINE_INVOICE">("COD");
```

**The lazy-initialiser trick, used for idempotency:**

```tsx
const [clientRequestId] = useState(() =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
);
```

Passing a *function* to `useState` means it runs **once, on mount**, not on every
render. That single stable value is what makes double-click protection work. Remove the
function wrapper and you would mint a new UUID every render, defeating the whole
mechanism.

---

## 6.4 `useEffect`

**Where.** `components/Reveal.tsx` sets up an `IntersectionObserver` and returns a
cleanup function:

```tsx
useEffect(() => {
  const el = ref.current;
  if (!el) return;
  if (!("IntersectionObserver" in window)) { setInView(true); return; }
  const io = new IntersectionObserver(/* ... */, { threshold: 0.18, rootMargin: "0px 0px -60px 0px" });
  io.observe(el);
  return () => io.disconnect();      // <- cleanup
}, [delay]);
```

`components/ScrollToTop.tsx` follows the same shape with a passive scroll listener.

**The GSAP variant** (`components/home/Sections.tsx`) uses GSAP's own scoping:

```tsx
const ctx = gsap.context(() => { /* create tweens */ }, el);
return () => ctx.revert();   // reverts every tween and ScrollTrigger created inside
```

---

## 6.5 `useMemo`

**Where.**

```tsx
// components/shop/CheckoutFlow.tsx
const totals = useMemo(
  () => computeTotals(items.map((i) => ({ price: i.price, qty: i.qty }))),
  [items]
);
```

```tsx
// components/admin/PostEditor.tsx
const initialJson = useMemo(() => {
  if (!post.bodyJson) return undefined;
  try { return JSON.parse(post.bodyJson); } catch { return undefined; }
}, [post.bodyJson]);
```

---

## 6.6 `useCallback`

**Where.** `components/Nav.tsx` (menu open/close handlers passed to children).

---

## 6.7 Refs

Three distinct uses in this codebase:

| Use | File | Purpose |
|---|---|---|
| DOM handle | `components/Reveal.tsx` | Element to observe |
| Focus management | `app/error.tsx` | Move focus to the heading on mount |
| Mutable non-render value | `components/contact/ContactForm.tsx` | `inFlightRef` duplicate-submit guard |

That last one deserves its own note, because the comment explains a real bug class:

```tsx
// A ref guard, not just the `disabled` prop: a second Enter-key submit
// fired in the same tick as the first can land before React re-renders
// the button disabled, so state alone isn't a reliable duplicate guard.
const inFlightRef = useRef(false);
```

---

## 6.8 `useTransition`

**What it means.** Marks a state update as non-urgent and gives you a `pending` flag.
In the App Router it is the idiomatic way to call a Server Action while showing a
loading state.

**Where.**

```tsx
const [pending, startTransition] = useTransition();
// ...
startTransition(async () => {
  const res: PlaceOrderResult = await placeOrderAction(fd);
  if (res.ok) { clearCart(); router.push(`/orders/${res.orderId}`); return; }
  setError(res.error);
  if (res.code === "INSUFFICIENT_STOCK") setStep(1);
});
```

---

## 6.9 Event handlers

Plain function props: `onClick={onConfirm}`, `onChange={(e) => setContactEmail(e.target.value)}`.
`components/contact/ContactForm.tsx` uses a controlled `onSubmit` with
`e.preventDefault()` because it needs to inject the selected topic into the FormData
before calling the action.

---

## 6.10 Conditional rendering

```tsx
// app/shop/page.tsx
{hasAnything ? (
  <section ...><ShopBrowser products={products} /></section>
) : (
  <EmptyState eyebrow="Store - Restocking" title="The Chennai Lions store is between drops." ... />
)}
```

```tsx
// components/shop/CheckoutFlow.tsx
{hydrated && items.length === 0 && <EmptyState ... />}
{hydrated && items.length > 0 && step === 1 && <StepOne ... />}
```

The `hydrated &&` guard is not cosmetic — it is what prevents the server-rendered
"empty cart" from flashing differently to the hydrated cart.

---

## 6.11 Lists and keys

```tsx
// components/home/Sections.tsx
{rows.map((f, i) => (
  <li key={f.slug}>...</li>
))}
```

Keys are stable database identities (`f.slug`, `p.id`, `m.id`) — never array indices —
except in `components/AeText.tsx`, where the "list" is the characters of a fixed
string and the index genuinely is the identity.

---

## 6.12 Controlled inputs

Every form field in `CheckoutFlow`, `ContactForm`, `AccountSettingsForm` and the admin
forms is controlled: `value={x}` plus `onChange`. React state is the source of truth,
and the server re-validates everything anyway.

---

## 6.13 Data flow summary

```
DATABASE
   |  lib/*.ts
   v
SERVER COMPONENT (page.tsx)
   |  props (must be serialisable)
   v
CLIENT COMPONENT
   |  user interaction -> local state
   v
SERVER ACTION  ("use server")
   |  validate -> authorise -> write
   v
DATABASE
   |
   v
revalidatePath()  ->  affected Server Components re-render
   |
   v
typed ActionResult returned to the client -> toast / inline error / router.push
```

---
---

# PART 7 — TYPESCRIPT

## 7.1 Configuration

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "noEmit": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "paths": { "@/*": ["./*"] }
  }
}
```

* **`strict: true`** — no implicit `any`, and `null` / `undefined` must be handled.
* **`resolveJsonModule`** — this is what lets `lib/products.ts` do
  `import rawProducts from "@/data/products.json"`.
* **`noEmit`** — TypeScript only type-checks; Next.js does the compiling.
* **`paths`** — the `@/` alias.

Check types without building: `npx tsc --noEmit` (also `npm run typecheck`).

---

## 7.2 Interfaces

**What it means.** A named description of an object's shape.

**Example from the project — `lib/products.ts`:**

```ts
export interface Product {
  id: string;        // URL-friendly slug
  name: string;
  cat: string;
  price: number;     // integer INR
  glyph: string;
  img?: string;      // legacy single-image field
  range: string;
  desc: string;
  stock: number;
  active: boolean;
  images: string[];
  weightGrams?: number;
  sku?: string;
}
```

**What would break if this were removed?** `data/products.json` is cast to
`Product[]`. Without the interface, a typo in the JSON (`prise` instead of `price`)
would produce `NaN` in `computeTotals()` and silently give someone a free order. The
type is the contract between a hand-edited JSON file and the money code.

---

## 7.3 Type aliases and unions

**Discriminated unions** are the backbone of this codebase's error handling. Every
Server Action returns one.

```ts
// lib/admin-action-result.ts
export type ActionResult<T extends object = object> =
  | ({ ok: true; message?: string } & T)
  | { ok: false; error: string; field?: string };
```

```ts
// app/checkout/actions.ts
export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | {
      ok: false;
      error: string;
      code: "AUTH" | "EMPTY_CART" | "INVALID_ADDRESS"
          | "INSUFFICIENT_STOCK" | "INVALID_PAYMENT" | "SERVER";
      insufficient?: { productId: string; requested: number; available: number };
    };
```

**Why this shape.** After `if (res.ok)`, TypeScript *narrows* the type: `res.orderId`
exists and `res.error` does not. In the `else` branch the reverse. You cannot read a
field that is not there for that outcome, and you cannot forget to handle failure.

Other examples: `MailResult`, `SmsResult`, `IssueResult`, `OtpIssueResult`,
`ConsumeResult`, `OtpVerifyResult`, `PeekResult`, `ProfileActionResult`,
`CheckEmailResult`, `ConfirmEmailResult`, `DeleteProductOutcome`, `BulkStockResult`.

**What would break if `PlaceOrderResult` were replaced with `any`?**
`CheckoutFlow.onConfirm` would still compile if you wrote `res.orderNumber` in the
failure branch — and you would ship a checkout that renders `undefined` when a
customer's card is declined on stock.

---

## 7.4 Enums (Prisma-generated)

The nine enums in `schema.prisma` become TypeScript union types in `@prisma/client`:

```ts
import type { OrderStatus, PaymentStatus, PaymentMethod, Role } from "@prisma/client";
```

They are used as **exhaustive switch** subjects:

```ts
// lib/orders-format.ts
export function orderStatusLabel(s: OrderStatus): string {
  switch (s) {
    case "PENDING": return "Pending";
    case "PAYMENT_PENDING": return "Awaiting payment";
    // ... all eight cases, no default
  }
}
```

**What would break if you added a ninth `OrderStatus` to the schema?** This function
would stop compiling, because the declared return type `string` would no longer be
satisfied on every path. That is the point: the compiler makes you update the label,
the style function, the `FORWARD` transition table and the admin allow-list.

---

## 7.5 Generics

`ActionResult<T extends object = object>` is the project's main generic. It lets an
action return extra data on success while keeping the shared failure shape:

```ts
export type ProductActionResult = ActionResult<{ id: string }>;
// success  -> { ok: true; message?: string; id: string }
// failure  -> { ok: false; error: string; field?: string }
```

Prisma also supplies generics throughout — `Prisma.OrderWhereInput`,
`prisma.$queryRaw<{ id: string }[]>`.

---

## 7.6 Type inference

Mostly relied upon. `const products = await listProducts()` infers `Product[]` because
the function declares its return type. The codebase annotates **function boundaries**
and lets everything inside infer.

---

## 7.7 Optional properties and `null` vs `undefined`

A convention worth internalising, because it appears everywhere in `lib/db.ts`:

* Prisma nullable columns come back as `T | null`.
* The application's own types use `T | undefined` (optional properties).
* `toProduct(row)` is the translation layer: `img: row.img ?? undefined`.

And in `ProductInput`, the two are used to mean genuinely different things:

```ts
/** null clears the column; undefined leaves it untouched on update. */
weightGrams?: number | null;
```

`lib/db.ts` `updateProduct` acts on that distinction with conditional spreads:

```ts
...(input.stock !== undefined ? { stock: Math.max(0, Math.round(input.stock)) } : {}),
```

The comment explains what this prevents: *"Otherwise the pre-M5 admin form (which
submits only 7 fields) would silently reset stock to 0 and wipe images/sku/weightGrams
on every save."*

---

## 7.8 Function types

```ts
// components/Reveal.tsx
as?: keyof JSX.IntrinsicElements;   // any valid HTML tag name
```

```ts
// components/admin/shell/AdminChrome.tsx (via app/admin/layout.tsx)
signOut={logout}     // a Server Action passed as a prop
```

---

## 7.9 Database types

The most valuable types in the project are free:

```ts
import type { Order, OrderItem, Address, Fixture, Post } from "@prisma/client";
```

`lib/orders.ts` extends one:

```ts
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export type AdminOrderRow = Order & { user: { name: string; email: string } };
```

**The `Json` column needs a hand-written accessor.** `Order.shippingSnapshot` is
`jsonb`, so Prisma types it as `Prisma.JsonValue` — useless for rendering. Hence:

```ts
export interface ShippingSnapshot {
  label: string | null; fullName: string; phone: string;
  line1: string; line2: string | null; city: string;
  state: string; postalCode: string; country: string;
}

export function readShippingSnapshot(o: Order): ShippingSnapshot {
  const raw = (o.shippingSnapshot ?? {}) as Partial<ShippingSnapshot>;
  return { label: raw.label ?? null, fullName: raw.fullName ?? "", /* ... */
           country: raw.country ?? "India" };
}
```

Every field has a fallback, so a legacy or malformed row renders blank rather than
crashing an order page.

---

## 7.10 React prop types

```ts
// components/Reveal.tsx
interface RevealProps {
  children: ReactNode;
  variant?: "fade-up" | "fade-left" | "fade-right" | "zoom-in" | "fade";
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  href?: string;
  "aria-label"?: string;
}
```

The `variant` union is tied to the CSS: `[data-reveal="fade-up"]` etc. in
`globals.css`. Add a variant to one and you must add it to the other.

---

## 7.11 Custom error classes

Typed errors let a caller branch on failure *kind* rather than parsing a message:

```ts
// lib/orders.ts
export class InsufficientStockError extends Error {
  constructor(public productId: string, public requested: number, public available: number) { /* ... */ }
}
export class EmptyCartError extends Error { /* ... */ }
export class InvalidAddressError extends Error { /* ... */ }
class DuplicateClientRequestError extends Error { /* ... */ }   // NOT exported - internal signal
```

Also `CoverUploadError` (`lib/cover-upload.ts`) and `SiteUrlError` (`lib/site-url.ts`).

`DuplicateClientRequestError` being unexported is deliberate — its doc comment says it
*"Never escapes placeOrder(): caught immediately below and turned into a lookup of the
row that won the race."*

---
---

# PART 8 — TAILWIND + CSS ARCHITECTURE

## 8.1 The two-system reality

This project uses **both** Tailwind utilities and a large hand-written CSS design
system, and the division is deliberate:

| System | Size | Handles |
|---|---|---|
| Tailwind utilities | inline in markup | Layout, spacing, one-off colour, responsive tweaks, admin UI |
| `app/globals.css` | 14,567 lines | The design system: heroes, section shells, nav, footer, editorial modules, animation, per-page styling |
| `app/admin/admin.css` | 1,016 lines | Admin console chrome, imported only by `app/admin/layout.tsx` |

If you are adding a **new one-off** style, reach for Tailwind. If you are touching the
**visual language** of a section, the class already exists in `globals.css` and you
should extend it there.

---

## 8.2 `tailwind.config.ts`

```ts
content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
```

`lib/` is included because `lib/orders-format.ts` returns colour values consumed
inline.

### Colour tokens

```ts
crimson: { 600: "#C4202A", 700: "#B11C25", 800: "#A8181F", 900: "#871119" },
cream:   { 50: "#FBF9F4", 100: "#F4F0E8" },
gold:    { 400: "#E6C57E", 500: "#C39A52", deep: "#3A1A06" },
ink:     "#1A1513",
muted:   "#6B635C",
// Grandstand foundation (P0) - additive only
paper:    "#FDFBF7",
stone:    "#E8E3D9",
charcoal: "#24201D",
slate:    { DEFAULT: "#2E2926", 700: "#3A3532" },
```

The config comment records the intent: *"Additive-only — pre-existing tokens above are
untouched so legacy pages render exactly as before. Migrated pages opt in."*

### Typography

```ts
sora:     ["var(--font-sora)", "Sora", "sans-serif"],
manrope:  ["var(--font-manrope)", "Manrope", "sans-serif"],
fraunces: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
```

Those variables come from `next/font/google` in `app/layout.tsx`. Sora is display /
headings, Manrope is body, Fraunces is the editorial serif for long-form leads.

### Other extensions

`maxWidth` (`prose: 720px`, `page: 1200px`, `wide: 1400px`,
`screen-content: 1280px`), `borderRadius` (`gs-xs` through `gs-xl`), `boxShadow`
(`gs-1`/`gs-2`/`gs-3` plus dark variants), `transitionDuration`
(`fast` 150ms, `base` 300ms, `slow` 700ms, `hero` 1200ms) and three named easings.

---

## 8.3 The visual system — three generations of tokens

The colours you asked about by name (Deep Ink, Crimson, Lion Gold, Gold Light, Ivory,
Card Surface) are the **Art Direction** layer, defined as CSS custom properties in
`app/globals.css`. There are three token families in the file, layered historically:

### Generation 1 — base brand (`:root`, line 10)

```css
:root {
  --crimson-600: #c4202a;  --crimson-700: #b11c25;
  --crimson-800: #a8181f;  --crimson-900: #871119;
  --cream-50:    #fbf9f4;  --cream-100:   #f4f0e8;
  --gold-400:    #e6c57e;  --gold-500:    #c39a52;  --gold-deep: #3a1a06;
  --ink:         #1a1513;  --muted:       #6b635c;
}
```

These mirror `tailwind.config.ts` exactly and are used by the loader, body, selection
colour and legacy pages.

### Generation 2 — Grandstand system tokens (`--gs-*`, from line ~1909)

Semantic rather than literal — this is where **Card Surface** lives:

```css
--gs-ground:           var(--cream-100);  /* body ground on public pages */
--gs-surface:          var(--cream-50);   /* default CARD SURFACE */
--gs-surface-elevated: #ffffff;           /* raised tiles, product cards */
--gs-paper:            #fdfbf7;           /* editorial article body */
--gs-charcoal:         #24201d;           /* admin ground */
--gs-slate:            #2e2926;           /* admin surface */
--gs-slate-2:          #3a3532;

--gs-text-primary:   var(--ink);
--gs-text-secondary: #5f574f;             /* WCAG AA on cream */
--gs-text-inverse:   #f4f0e8;
--gs-accent-line:    var(--gold-500);
--gs-accent-fill:    var(--gold-400);

--gs-border-hairline: rgba(26,21,19,0.08);
--gs-border-strong:   rgba(26,21,19,0.16);

--gs-radius-xs|sm|md|lg|xl|pill
--gs-elev-0|1|2|3  (+ -dark variants)
--gs-dur-fast|base|slow|hero
--gs-ease | --gs-ease-out | --gs-ease-swift
--gs-space-hair|xs|sm|md|lg|xl|2xl|3xl
```

### Generation 3 — Art Direction tokens (`--v-*`, from line ~3125)

This is the palette the current site actually renders:

| Name you asked about | Token | Value |
|---|---|---|
| **Deep Ink** | `--v-ink` | `#0e0b0a` (with `--v-ink-2: #171210`, `--v-ink-3: #241b17`) |
| **Crimson** | `--v-red` | `#bd2227` (`--v-red-lit: #dd353b`, `--v-red-deep: #5e1114`) |
| **Lion Gold** | `--v-gold` | `#b8904b` |
| **Gold Light** | `--v-gold-lit` | `#e2c290` |
| **Ivory** | `--v-ivory` | `#f5efe4` (`--v-ivory-2: #fbf7f0`) |
| **Card Surface** | `--gs-surface` / `--gs-surface-elevated` | `#fbf9f4` / `#ffffff` |

Plus explicit **text-role** tokens, so contrast is a decision rather than an accident
(the file says exactly that):

```css
--v-on-ink:        rgba(245,239,228,0.74);
--v-on-ink-faint:  rgba(245,239,228,0.46);
--v-on-ivory:      #4b443e;
--v-hair-ink:      rgba(245,239,228,0.16);
--v-hair-ivory:    rgba(14,11,10,0.13);
```

And one that exists purely for accessibility (commit `06c5db2`,
*"fix: improve gold contrast on light surfaces"*):

```css
/* TEXT ON LIGHT SURFACES ONLY. --v-gold remains the brand gold ... */
--v-gold-on-light: #7a5c24;
```

Use `--v-gold-on-light` for gold text on ivory; `--v-gold` for gold on ink.

### A fourth, aliasing layer (`--hp-*`, line ~2110)

The home-page tokens alias the `--v-*` ones where they are byte-identical, and stay
independent where they differ — each line carries a comment saying which:

```css
--hp-red:      var(--v-red);   /* #bd2227 == --v-red */
--hp-red-deep: #6d1418;        /* --v-red-deep is #5e1114 - different, left alone */
```

That is a careful piece of refactoring: consolidate what is provably the same, do not
"tidy" what is not.

---

## 8.4 Spacing rhythm

`globals.css` defines a fixed ladder and forbids off-ladder values:

```css
/* A fixed ladder. Nothing in the system may use an off-ladder
   value; that is what produced 37/53/67/91px before. */
--sp-1: 4px; --sp-2: 8px; --sp-3: 12px; /* ... */
```

---

## 8.5 The form-spacing constraint (you will hit this)

Tailwind's **preflight** resets `label` and `input` margins to zero. `CLAUDE.md`
records the fix, and it lives globally in `globals.css`:

```css
label { margin-bottom: 8px !important; line-height: 1.2 !important; font-weight: 600; }
.field {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  margin-bottom: 20px !important;
}
```

**Use the `.field` wrapper.** Do not re-solve this inline. You can see it applied in
`app/(auth)/sign-in/page.tsx`:

```tsx
<div className="field">
  <label htmlFor="sign-in-email">Email</label>
  <input id="sign-in-email" type="email" name="email" required autoComplete="username" />
</div>
```

---

## 8.6 Animation CSS

Two CSS-driven animation systems live in `globals.css`:

**Scroll reveal** — driven by `components/Reveal.tsx` adding `.is-in`:

```css
[data-reveal] { /* base: transition + initial transform/opacity */ }
[data-reveal="fade-up"]    { /* translateY */ }
[data-reveal="fade-left"]  { /* translateX */ }
[data-reveal="fade-right"] { /* translateX */ }
[data-reveal="zoom-in"]    { /* scale */ }
[data-reveal].is-in        { /* rest state */ }
```

**AE text reveals** — `.ae-words`, `.ae-mask`, `.ae-mask-inner`, `.ae-char`, driven by
`components/AeText.tsx`.

**Reduced motion.** There are **22 `@media (prefers-reduced-motion: reduce)` blocks**
in `globals.css` (the first, at line 1995, is the global P0 one) and **5 more** in
`admin.css`, plus the `reduced()` guard in every GSAP primitive. Motion is genuinely
optional in this project, not decoratively so.

---

## 8.7 Accessibility styling

```css
.gs-skip-link { /* visually hidden until focused */ }
.gs-skip-link:focus, .gs-skip-link:focus-visible { /* becomes visible */ }
.gs-skip-link { min-height: 44px; display: inline-flex; align-items: center; }
```

The 44px minimum is the touch-target guideline, applied to the skip link so it is
usable on a phone with a keyboard attached.

---

## 8.8 The relationship between Tailwind and custom CSS, in practice

Look at `app/shop/page.tsx`:

```tsx
<section className="hp-sec hp-sec-ivory sp-sec" aria-label="Catalogue">
  <div className="hp-wrap">
    <ShopBrowser products={products} />
  </div>
</section>
```

`hp-sec`, `hp-sec-ivory`, `sp-sec` and `hp-wrap` are all `globals.css` classes: section
shell, surface colour, page-specific spacing, and the 1360px-max container that every
page shares. Nothing here is Tailwind.

Now `app/loading.tsx`:

```tsx
<div className="mx-auto flex max-w-[760px] items-center justify-center gap-4
                rounded-[28px] border border-[#E6C57E]/30 bg-[#0E0B0A]/80 ...">
```

Pure Tailwind, arbitrary values, one-off component. Both are idiomatic *here*.

**The rule to follow:** if the thing you are styling has a name in the design system
(a hero, a section, a card, a nav item), use and extend the system class. If it is a
genuinely local arrangement, use utilities.

---
---

# PART 9 — COMPONENT ARCHITECTURE

## 9.1 How components are organised

Grouping is **by feature**, not by type. There is no `components/atoms/` or
`components/molecules/`. A folder maps to a surface of the site.

Two folders are the exception and hold genuine primitives:

* `components/site/` — page-shell primitives shared by every public page.
* `components/admin/ui/` — admin console primitives.

---

## 9.2 Global chrome

### `components/Nav.tsx` — client

| | |
|---|---|
| **Responsibility** | The global header: brand mark, mega menu, direct links, cart count, account state |
| **Props** | `user: SafeUser \| null` (from `app/layout.tsx`) |
| **State** | Open menu section, scrolled flag, mobile overlay |
| **Depends on** | `lib/nav.ts` (`DIRECT_NAV`, `MEGA_SECTIONS`, `SITE_SECTIONS`, `FLOATING_HEADER_ROUTES`), `store/cart.ts`, `app/(auth)/actions.ts` (`signOut`) |
| **Boundary** | Client — needs `usePathname` and cart state |

The header has three visual states: transparent over a dark full-bleed hero, deep ink
everywhere else, and deep ink once scrolled. Which routes get the transparent state is
data, not a conditional: `FLOATING_HEADER_ROUTES` in `lib/nav.ts`. Its comment is
explicit that *"Routes join this list as their heroes are converted... never
speculatively"*, and it notes that `/news/<slug>` is deliberately excluded because the
list is matched exactly, not by prefix.

### `components/Footer.tsx`

Renders the same taxonomy as the header, from the same `lib/nav.ts` source, so the two
cannot drift apart.

### `components/PublicChrome.tsx` — client, 12 lines

```tsx
export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
```

**Why it exists.** The root layout is shared by the whole app, but `/admin` has its own
frame. Rather than duplicate the layout, the public chrome is wrapped in this one
component. Small, and it removes a whole class of "why is the marketing nav on the
admin page" bugs.

### `components/Loader.tsx`, `components/ScrollToTop.tsx`, `components/ToastHost.tsx`

Brand splash on first load; a back-to-top button that appears past 300px of scroll
(with `aria-label="Scroll to top"`); and the outlet for `store/toast.ts`.

---

## 9.3 Page-shell primitives — `components/site/`

| Component | Role |
|---|---|
| `Section` | The standard section wrapper. Takes a `surface` (e.g. `"ivory"`) and a `size` (e.g. `"tight"`) |
| `SectionTitle`, `IndexLabel` | Editorial heading and the numbered "01 The Franchise" eyebrow |
| `NumberedList`, `Figures` | Repeated editorial patterns |
| `EmptyState` | **The data-integrity workhorse.** Takes `eyebrow`, `title`, `body` and children (a CTA) |
| `PageHero`, `PageMasthead`, `StoryHero`, `VimtraHero` | Four hero variants for different page types |
| `FullBleedStatement`, `Chapters` | Full-width statement band; chapter navigation |

`EmptyState` is worth calling out. It is what makes the never-invent-data rule
*renderable*. `/shop` with an unreachable database, `/shop` with a genuinely empty
catalogue, and `/checkout` with an empty cart all route into it — with different,
honest copy each time.

---

## 9.4 Home page — `components/home/`

| Component | Notes |
|---|---|
| `Hero` | Full-bleed photograph plus a `HeroNext` rail. `next` is `null` when no fixture is upcoming, and the rail simply disappears rather than showing a stale event |
| `HeroCarousel` | The rotating hero imagery |
| `Sections` | Exports the seven chapters: `Statement`, `Club`, `Season`, `Development`, `Media`, `Shop`, `Closing`, plus the types `SeasonRow`, `StoryRow`, `StoreFacts` |

`Sections` contains the shared motion hook:

```tsx
function useSectionMotion(withImage = false) {
  const root = useRef<HTMLElement | null>(null);
  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (el.querySelector("[data-line] > span")) revealLinesOnScroll("[data-line] > span", el);
      if (el.querySelector("[data-rise]"))        riseOnScroll("[data-rise]", el, { y: 22, stagger: 0.08 });
      if (withImage) { /* [data-fig] image reveals, [data-bleed] parallax */ }
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) =>
        countUp(n, Number(n.dataset.count || "0")));
    }, el);
    return () => ctx.revert();
  }, [withImage]);
  return root;
}
```

Sections **opt in through data attributes** (`data-rise`, `data-line`, `data-fig`,
`data-bleed`, `data-count`). There are no per-element animation components. This is why
the P1-4 animation pass (commit `c0fb931`) was a pure attribute removal — see
**Part 20**.

---

## 9.5 Shop — `components/shop/`

| Component | Boundary | Responsibility |
|---|---|---|
| `ShopHero` | server | Hero tiles plus a stat rail (`productCount`, `categoryCount`, `lowestPrice`). When `lowestPrice` is `null` it drops the "From" cell entirely |
| `ShopBrowser` | client | Category filter / sort over the products handed down from the server |
| `ProductCard`, `ShopProductCard` | server | Catalogue cards. Both resolve images through `productImage()` with the `FALLBACK_LOGO` |
| `AddToCartButton` | client | Single-click add, fires a toast |
| `QtyAddToCart` | client | Quantity stepper plus add, used on the product page |
| `CheckoutFlow` | client | The two-step checkout. See **Part 15** |

**The fallback-logo rule** (from `CLAUDE.md`, and honoured in all three rendering
surfaces): if a product has no image, render `FALLBACK_LOGO` (`/assets/logo-lion.png`)
centred in a red-to-dark gradient card with `object-fit: contain`.

---

## 9.6 Season — `components/season/` and `components/fixtures/`

| Component | Responsibility |
|---|---|
| `FixturesList` | The fixture timeline, grouped by month by the page |
| `ScoreExperience` | Per-fixture score boards. Exports the `BoardEvent` and `ScoreRow` types the page builds. **Renders an unlit board when a fixture has no scores** |
| `StandingsBoard` | One of the three leaderboards, with its own "awaiting verified data" state |

`app/scores/page.tsx` marks rows belonging to the franchise by checking against the
roster:

```ts
const ROSTER_NAMES = new Set(ROSTER.map((p) => p.fullName.trim().toLowerCase()));
```

That is the `is-lions` row marker `CLAUDE.md` describes: everybody in the field is
listed; only ours is marked.

It also reorders positions in the page rather than the query, because `Score.position`
is a `String` column and Postgres would sort it lexically (`1, 4, 5, 6, T2, T2`):

```ts
function positionRank(position: string | null): number {
  if (!position) return Number.MAX_SAFE_INTEGER;
  const n = Number(position.trim().replace(/^t/i, ""));
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}
```

---

## 9.7 News — `components/news/`

| Component | Responsibility |
|---|---|
| `Newsroom` | The client-side index that filters the feed by channel |
| `OfficialNews` | The official-news rail |
| `DayInTheDen` | The desktop editorial module |

The feed itself is built by `lib/news-desk.ts`, which is **pure and deliberately not
`server-only`** so the server page and the client index operate on the same objects.
Its header states the discipline plainly: *"Nothing here fetches, derives, estimates or
fills anything in — every string on a `NewsEntry` is copied verbatim from a row."*

---

## 9.8 Profile and auth

| Component | Responsibility |
|---|---|
| `profile/ProfileClient` | Account shell |
| `profile/AccountNav` | Sub-navigation, also used on `/orders/[id]` |
| `profile/AccountSettingsForm` | Name / email / password, calls `updateProfile` |
| `profile/VerificationPanel` | Email and phone verification state and actions |
| `profile/OrdersList` | Order history |
| `auth/PasswordField`, `profile/PasswordField` | Password input with a show/hide toggle. Takes an `id` prop so the page can wire `htmlFor` |
| `auth/CheckEmailPanel` | The gated "check your email" state: resend, change address |
| `auth/VerifyEmailConfirm` | The explicit confirm button on `/verify-email` |

`VerifyEmailConfirm` is a security design decision, not a UI one. The token is
consumed only by a deliberate POST from a person — never by the GET that a mail scanner
or link pre-fetcher performs. See **Part 12**.

---

## 9.9 Admin — `components/admin/`

**Shell**

* `shell/AdminChrome` — sidebar, topbar, badges, sign-out. Receives `email`, `name`,
  `badges` and the `signOut` Server Action as props from `app/admin/layout.tsx`.

**Forms**

`ProductForm`, `FixtureForm`, `CoverageForm`, `PostEditor`, `ScoreRowForm`,
`StandingRowForm`, `InventoryTable`, `CoverageTable`, `ContactMessageRow`,
`orders/PaymentStatusForm`, `CoverImageField`, `ProductModalButton`,
`ConfirmDeleteButton`.

**UI primitives (`components/admin/ui/`)**

`AdminToaster`, `AutoSubmitSelect`, `ConfirmActionButton`, `EmptyState`,
`FlashParams`, `PageHeader`, `Pagination`, `QuickActionButton`, `SearchForm`,
`StatusPill`.

Every admin form follows the same contract:

```
<form action={someAdminAction}>   ->  returns ActionResult
   ok:true   -> adminToast(message, "ok")   and possibly router.push
   ok:false  -> adminToast(error, "danger") and the form keeps its input
```

---

## 9.10 Motion components

| Component | Mechanism | Use it when |
|---|---|---|
| `Reveal` | `IntersectionObserver` adds `.is-in`; CSS does the animating | You want a simple scroll fade on an element or block |
| `AeText` | Splits text up front (so SSR markup matches), toggles `.is-in` | Display headings with word / mask / char stagger |
| `motion/gsap.ts` | GSAP + ScrollTrigger primitives | Choreographed, scroll-linked sequences |

`Reveal` renders any tag through `createElement(as, ...)`, so you can use it as a
`<li>`, `<a>` or `<section>` without a wrapper div.

---

## 9.11 Composition rules in force here

1. **Server fetches, client interacts.** A client component almost never fetches; it
   receives props or calls a Server Action.
2. **Pass Server Actions as props** when a shell component needs to trigger one
   (`signOut={logout}`).
3. **Keep `"use client"` at the leaf.** `app/shop/page.tsx` stays on the server.
4. **Share formatters, not data modules.** `lib/orders-format.ts` exists precisely so
   client components can format an order status without importing the `server-only`
   `lib/orders.ts`.
5. **Taxonomy lives in `lib/`, not in the component.** `lib/nav.ts` for navigation,
   `components/contact/topics.ts` for contact topics.

---
---

# PART 10 — DATABASE + PRISMA

## 10.1 What PostgreSQL is

A relational database. Data lives in **tables**; each row has typed **columns**; the
database itself enforces **constraints** (a column must be unique, a foreign key must
point at a real row) and supports **transactions** (a group of statements that either
all apply or none do).

Features this project specifically relies on and could not get from SQLite:

* `jsonb` — `Order.shippingSnapshot`
* `text[]` — `Product.images`
* `ON CONFLICT ... DO UPDATE` — the atomic rate-limit counter
* `UPDATE ... FROM (VALUES ...) RETURNING` — the atomic multi-row stock decrement
* real concurrent transaction isolation

## 10.2 What Prisma is

Three things in one tool:

1. **A schema language.** `prisma/schema.prisma` is the single description of the data.
2. **A migration engine.** `prisma migrate` diffs the schema against the recorded
   history and writes a `.sql` file.
3. **A generated, typed client.** `prisma generate` produces `@prisma/client` with a
   method per model and a TypeScript type per model and enum.

## 10.3 Schema anatomy

```prisma
generator client { provider = "prisma-client-js" }

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // POOLED Neon URL - runtime
  directUrl = env("DIRECT_URL")     // DIRECT Neon URL - migrations
}
```

**Why two URLs.** Neon offers a connection *pooler* (hostname contains `-pooler`).
Serverless functions open and close connections constantly, so runtime queries go
through the pooler. Schema operations cannot run through a pooler, so
`prisma migrate deploy` uses `DIRECT_URL`.

### Field anatomy, using `Order` as the example

```prisma
model Order {
  id                String        @id @default(cuid())
  orderNumber       String        @unique
  userId            String
  user              User          @relation(fields: [userId], references: [id])
  shippingAddressId String?
  shippingAddress   Address?      @relation("OrderShipping", fields: [shippingAddressId],
                                             references: [id], onDelete: SetNull)
  shippingSnapshot  Json
  subtotal          Int
  status            OrderStatus   @default(PENDING)
  clientRequestId   String?       @unique
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  items             OrderItem[]

  @@index([userId, createdAt])
  @@index([status, paymentStatus])
  @@index([createdAt])
}
```

| Syntax | Meaning |
|---|---|
| `@id` | Primary key |
| `@default(cuid())` | Collision-resistant id generated by Prisma |
| `@unique` | Database-enforced uniqueness (this is what makes idempotency race-safe) |
| `String?` | Nullable |
| `@relation(...)` | Foreign key plus the delete behaviour |
| `Json` | Postgres `jsonb` |
| `@updatedAt` | Prisma writes `now()` on every update |
| `@@index([...])` | A lookup index |
| `@@unique([a,b,c])` | A composite uniqueness constraint |

---

## 10.4 The 15 models

### Identity and access

| Model | Purpose | Notable fields |
|---|---|---|
| `User` | Accounts | `email @unique`, `passwordHash`, `role`, `emailVerifiedAt?`, `phone?`, `phoneVerifiedAt?` |
| `Session` | Live sessions | `token @unique`, `expiresAt`, `@@index([userId])` |
| `AuthRateLimit` | Login throttling | `key @unique` (a SHA-256 of email or IP), `attempts`, `windowStart`, `lockedUntil?` |
| `EmailVerificationToken` | Email links | `tokenHash @unique` (sha256), `expiresAt`, `usedAt?` |
| `PhoneOtp` | SMS codes | `codeHash`, `attempts`, `expiresAt`, `consumedAt?` |

The schema comment explains why tokens live in their own tables rather than as columns
on `User`: *"keeping them off User means a leaked/dumped User row never carries a live
secret."*

### Commerce

| Model | Purpose | Notable fields |
|---|---|---|
| `Product` | Catalogue | `id` is the slug (not a cuid), `price Int` (whole rupees), `stock`, `active`, `images String[]`, legacy `img?` |
| `Address` | Address book | `isDefault`, `country @default("India")` |
| `Order` | Orders | `orderNumber @unique`, `shippingSnapshot Json`, `clientRequestId @unique`, three email-sent timestamps |
| `OrderItem` | Line items | Frozen `productName`, `productImage`, `unitPrice`, `qty`, `lineTotal` |

### IGPL season

| Model | Purpose |
|---|---|
| `Fixture` | The tournament calendar (`slug @unique`, `status`, `sortOrder`) |
| `Score` | Per-player rounds inside a fixture (`r1`..`r4`, `thru`, `today`, `total` — all `String?`, because golf notation is not numeric) |
| `Standing` | Season boards. `@@unique([seasonYear, board, rank])`, with an `extra String?` holding JSON for board-specific columns |

### Content

| Model | Purpose |
|---|---|
| `Post` | Franchise editorial. `bodyHtml` (rendered) plus `bodyJson` (TipTap round-trip), `status`, `publishedAt?` |
| `MediaCoverage` | Third-party press and social. `kind`, `sourceUrl`, `status`, `active` (derived), `featuredOnHome` |
| `ContactMessage` | Enquiries. `category` is free text validated against `CONTACT_TOPICS` |

**On `ContactMessage`, read the schema comment.** It records a privacy decision:
*"Deliberately minimal: no IP address, no user-agent, no referrer — nothing beyond
what an admin needs to read and answer the enquiry."*

### The 9 enums

`Role` (USER, ADMIN) - `FixtureStatus` (UPCOMING, LIVE, COMPLETED, CANCELLED) -
`StandingBoard` (TEAM, PLAYER, ORDER) - `PostStatus` (DRAFT, PUBLISHED, ARCHIVED) -
`MediaKind` (OFFICIAL, ARTICLE, SOCIAL) - `ContactStatus` (NEW, READ, RESOLVED) -
`OrderStatus` (8 values) - `PaymentStatus` (5 values) - `PaymentMethod` (COD,
OFFLINE_INVOICE, ONLINE_TBD).

---

## 10.5 Relationship diagram (only relations that actually exist)

```
                              User
                          (Role: USER|ADMIN)
                                 |
   +---------+---------+---------+---------+-------------------+
   |         |         |         |         |                   |
   v         v         v         v         v                   v
Session  Address   Order   EmailVerif   PhoneOtp        (no relation to
 CASCADE  CASCADE  RESTRICT  Token        CASCADE         Post / Fixture /
                              CASCADE                     MediaCoverage /
                                 |                        ContactMessage)
                                 |
                      Address <--+ (soft FK, SET NULL)
                                 |
                              OrderItem  --RESTRICT-->  Product
                               CASCADE
                            (from Order)

Fixture  --CASCADE-->  Score

Standing        (standalone; unique on seasonYear+board+rank)
Post            (standalone)
MediaCoverage   (standalone)
ContactMessage  (standalone)
AuthRateLimit   (standalone; keyed by a hash, not a user id)
```

### Delete behaviour, and why each was chosen

| Relation | Behaviour | Reason (from the schema comments) |
|---|---|---|
| `Session -> User` | `Cascade` | Deleting an account must not leave live sessions |
| `Address -> User` | `Cascade` | Address book belongs to the account |
| `EmailVerificationToken -> User`, `PhoneOtp -> User` | `Cascade` | Secrets die with the account |
| `Score -> Fixture` | `Cascade` | A score has no meaning without its event |
| `Order -> User` | **default (Restrict)** | *"a customer's order history must never be deleted or orphaned because their account is removed"* |
| `Order -> Address` | `SetNull` | *"orders survive address deletion"* — the frozen snapshot remains authoritative |
| `OrderItem -> Order` | `Cascade` | Line items belong to their order |
| `OrderItem -> Product` | **`Restrict`** | *"so we never lose the historical link to a fulfilled item"* |

Those last two RESTRICTs are enforced in the UI as well:
`deleteProduct()` in `lib/db.ts` pre-counts `orderItem` rows and returns
`"referenced"`, and the admin dialog then offers **Hide** instead of Delete.
`deleteUserAction` does the same for orders.

---

## 10.6 Reading queries from this project, line by line

### A simple public read — `lib/db.ts`

```ts
export async function listProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },              // hidden products never reach the public shop
    orderBy: { createdAt: "asc" },        // catalogue order = creation order
  });
  return rows.map(toProduct);             // DB row shape -> application shape
}
```

There is a deliberate sibling, `listAllProducts()`, with no `where` — used by admin
only. Two functions rather than a boolean flag, so a missing argument can never
accidentally leak inactive rows to the public page.

### An ownership-scoped read — `lib/orders.ts`

```ts
export async function getOrderById(userId: string, id: string): Promise<OrderWithItems | null> {
  const row = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  return row && row.userId === userId ? row : null;
}
```

The ownership check is inside the data layer, and the signature *requires* a `userId`.
You cannot call this function without deciding whose order you are asking for.

### A paged admin search — `lib/orders.ts`

```ts
const page     = Math.max(1, opts.page ?? 1);
const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 25));   // hard upper bound
const where: Prisma.OrderWhereInput = {
  ...(opts.status ? { status: opts.status } : {}),
  ...(q ? { OR: [
      { orderNumber:  { contains: q, mode: "insensitive" } },
      { contactEmail: { contains: q, mode: "insensitive" } },
      { contactPhone: { contains: q } },
      { user: { name:  { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ] } : {}),
};
const [rows, total] = await Promise.all([
  prisma.order.findMany({ where, orderBy: { createdAt: "desc" },
                          skip: (page - 1) * pageSize, take: pageSize,
                          include: { user: { select: { name: true, email: true } } } }),
  prisma.order.count({ where }),
]);
```

Three things to notice: `pageSize` is clamped so a crafted query cannot ask for a
million rows; the buyer is joined with `select` so the list does not run one query per
row; and the page and the count run in parallel against the same `where`.

### An upsert — `lib/standings.ts`

```ts
return prisma.standing.upsert({
  where: { seasonYear_board_rank: { seasonYear, board, rank } },  // the @@unique tuple
  update: data,
  create: data,
});
```

`seasonYear_board_rank` is the name Prisma generates for `@@unique([seasonYear, board,
rank])`.

But note the sibling `updateStandingById()`, added because upserting on rank was wrong:

> Changing the rank moves THIS row rather than creating a second one (which is what an
> upsert keyed on rank did). Returns "conflict" if another row in the same season +
> board already holds the requested rank.

### A conditional write (compare-and-set) — `lib/orders.ts`

```ts
const changed = await prisma.order.updateMany({
  where: { id, status: existing.status },     // <- only if it is STILL that status
  data:  { status: next, ...(paymentStatus ? { paymentStatus } : {}) },
});
if (changed.count !== 1) return null;
return prisma.order.findUnique({ where: { id } });
```

**Why `updateMany` rather than `update`.** `update` matches on the primary key alone
and would happily overwrite a status another admin changed a second earlier.
`updateMany` lets you put the *expected current value* in the `where` clause, so the
write applies only if nothing moved underneath you. `count !== 1` means you lost the
race, and the action reports "Reload and try again" instead of silently clobbering.

The same pattern secures single-use tokens in `lib/verification.ts`:

```ts
const claimed = await prisma.emailVerificationToken.updateMany({
  where: { id: row.id, usedAt: null },     // only if not yet used
  data:  { usedAt: new Date() },
});
if (claimed.count !== 1) return { ok: false, reason: "used" };  // lost the race
```

Its header states the principle: *"SINGLE-USE IS ENFORCED BY THE DATABASE, NOT BY A
READ-THEN-WRITE."*

### Transactions

Two forms are used.

**Interactive** — a callback receives a transactional client `tx`:

```ts
return prisma.$transaction(async (tx) => {
  // every tx.* call is inside one transaction; a throw rolls it all back
});
```
Used by `placeOrder`, `cancelOrderAndRestock`, `createAddress`, `updateAddress`,
`setDefaultAddress`, `changeUserEmail`.

**Batch** — an array of operations applied atomically:

```ts
const rows = await prisma.$transaction(
  updates.map((u) => prisma.product.update({ where: { id: u.id },
                                             data: { stock: ..., active: u.active },
                                             select: { id: true } }))
);
```
Used by `bulkSetProductStock`.

### Raw SQL — where and why

Only three places, each with a written justification.

1. **`placeOrder` stock decrement** (`lib/orders.ts`). The comment is a genuine
   engineering note worth reading in full:

   > This used to issue one `tx.product.updateMany` per cart line... On this deployment
   > (app in India, Neon in us-east-2) a single round-trip measures ~290ms and
   > BEGIN/COMMIT alone ~1.2s, so Prisma's default 5000ms interactive-transaction
   > budget is exhausted at roughly nine round-trips — a cart of about six lines. Past
   > that the transaction expired mid-flight and the *next* statement,
   > `tx.order.create`, failed with P2028 "Transaction already closed".

   ```sql
   UPDATE "Product" AS p
      SET stock = p.stock - v.qty, "updatedAt" = NOW()
     FROM (VALUES (id, qty), ...) AS v(id, qty)
    WHERE p.id = v.id AND p.active = true AND p.stock >= v.qty
   RETURNING p.id
   ```

   One round-trip for any cart size. The `stock >= v.qty` guard is applied **per row by
   the database**, so a row whose stock moved underneath still refuses to update.
   `RETURNING` tells you which rows applied; if the count does not match the cart, the
   whole transaction rolls back.

2. **`cancelOrderAndRestock` restock** — the same shape, adding quantities back.

3. **`recordFailure` in `lib/auth-rate-limit.ts`** — an atomic counter:

   ```sql
   INSERT INTO "AuthRateLimit" (...) VALUES (...)
   ON CONFLICT ("key") DO UPDATE SET
     "attempts" = CASE WHEN windowStart <= $window THEN 1 ELSE attempts + 1 END,
     ...
   RETURNING ...
   ```

   Its comment: *"PostgreSQL serializes concurrent upserts on the unique key, so
   parallel login failures cannot lose updates."*

**All three use Prisma's tagged-template raw API** (`` tx.$queryRaw`...` ``), which
parameterises interpolated values. That is not string concatenation and it is not SQL
injection. `Prisma.join` / `Prisma.sql` build the `VALUES` list safely.

---

## 10.7 Migrations

A migration is a timestamped folder containing a `migration.sql`. Prisma records which
have been applied in a `_prisma_migrations` table.

The Postgres history:

| Migration | What it added |
|---|---|
| `20260821220000_postgresql_baseline` | One consolidated baseline capturing M0-M4 |
| `20260825193930_m5_commerce` | `Address`, `Order`, `OrderItem`, product stock/active/images |
| `20260903160155_contact_messages` | `ContactMessage` |
| `20260908220000_order_idempotency_cod_email_tracking` | `clientRequestId`, COD email timestamps |
| `20260909000000_email_phone_verification` | `EmailVerificationToken`, `PhoneOtp`, user verification columns |
| `20260911120000_media_kind_official` | `MediaKind.OFFICIAL` |
| `20260911120100_media_status` | `MediaCoverage.status` |
| `20260911130000_media_featured_on_home` | `MediaCoverage.featuredOnHome` |
| `20260914120000_auth_rate_limits` | `AuthRateLimit` |
| `20260915120000_order_cancellation_email` | `Order.cancellationEmailSentAt` |

`prisma/migrations_sqlite/` preserves the older SQLite history for reference.

---

## 10.8 The seed

`prisma/seed.ts`, run by `npm run db:seed` (which `package.json` maps to
`tsx prisma/seed.ts`). It seeds:

* Four Season 2026 fixtures — with a long comment recording that **dates follow the
  official IGPL schedule, not the brochure**, and listing every place the two differed.
* Media coverage rows.
* Products from `data/products.json`.
* Exactly one admin user.

**The seed refuses to run** without credentials:

```ts
if (!email || !password) {
  throw new Error("Refusing to seed: set ADMIN_EMAIL and ADMIN_PASSWORD ...");
}
if (password.length < 12) {
  throw new Error("Refusing to seed: ADMIN_PASSWORD must be at least 12 characters.");
}
```

The comment says why: *"a leaked 'lions2026'-style default would compromise every
deployment that ever ran the seed."*

---
---

# PART 11 — DATABASE SAFETY RULES FOR THIS PROJECT

> This chapter exists because several of the commands in `package.json` will
> permanently destroy data if pointed at the wrong database, and nothing in the tooling
> will stop you.

## 11.1 The single rule

**Know which database `DATABASE_URL` points at before you run anything.**

There is no environment guard in this project. `npm run db:migrate` reads `.env` and
does what it is told. `.env` is git-ignored and exists on your machine — if it holds a
production Neon URL, then every "local" command is a production command.

Check first:

```bash
node -e "const u=new URL(process.env.DATABASE_URL||'file:none');console.log(u.protocol,u.hostname,u.pathname)"
```

(Run it in a shell where `.env` has been loaded, or read the host out of `.env`
directly. The point is to read the **host**, never to print the whole URL — it contains
the password.)

## 11.2 Command risk table

| Command | Risk | What it actually does |
|---|---|---|
| `npx prisma studio` / `npm run db:studio` | **Low read / high write** | Opens a GUI on the live database. Every edit is immediate and unlogged. Safe to browse; treat every field as live |
| `npx prisma generate` | **None** | Regenerates the TypeScript client. Touches no data |
| `npm run db:deploy` (`prisma migrate deploy`) | **Medium** | Applies pending migrations. Correct for production, but a migration containing a `DROP COLUMN` will drop it |
| `npm run db:migrate` (`prisma migrate dev`) | **HIGH — never in production** | Diffs schema vs history, *writes a new migration file*, applies it, reruns the seed, and **will offer to reset the database** if it detects drift |
| `npx prisma db push` | **HIGH** | Pushes the schema with no migration file. Silently drops columns and tables to make reality match the schema. There is no record of what it did |
| `npx prisma migrate reset` | **DESTRUCTIVE** | Drops the database, replays every migration, reruns the seed. Total data loss |
| `npm run db:seed` | **Medium** | Upserts fixtures/coverage/products and **updates the admin user's email, role and password hash** |
| `npm run test:checkout` | **Medium** | Writes orders and mutates stock on whatever `DATABASE_URL` is exported, then restores. Its own header: *"DO NOT run this against production"* |

## 11.3 Why each is dangerous, concretely

**`prisma migrate dev`.** It is a *development* command by design. If the target
database does not match the recorded migration history (which is normal on a shared or
production database that has been touched any other way), Prisma prompts to reset. In a
non-interactive shell that prompt may be auto-answered. It also re-runs the seed, which
rewrites the admin user.

**`prisma db push`.** It computes the shortest path from "what the database is" to
"what `schema.prisma` says" and executes it. Remove a field from the schema, run
`db push`, and the column with all its data is gone — with no migration file recording
it and no way to replay the change on another environment.

**`prisma migrate reset`.** Exactly what it says. Every order, every account, every
enquiry.

**`db:seed`.** Look at the tail of `prisma/seed.ts`:

```ts
const existingAdmin = configuredUser ?? (await prisma.user.findFirst({ where: { role: "ADMIN" } }));
if (existingAdmin) {
  await prisma.user.update({
    where: { id: existingAdmin.id },
    data: { email, role: "ADMIN", passwordHash },
  });
}
```

If `ADMIN_EMAIL` in your environment differs from the production admin's address, this
**renames the production admin account and resets its password**.

## 11.4 Migration-file discipline

1. Edit `prisma/schema.prisma`.
2. Generate the migration against a **local or staging** database:
   `npm run db:migrate -- --name describe_the_change`.
3. **Read `prisma/migrations/<timestamp>_<name>/migration.sql` before committing.**
   Look for `DROP`, `ALTER COLUMN ... TYPE`, and any `NOT NULL` added to a populated
   table without a default.
4. Commit the schema and the migration folder together.
5. Deploy to production with `npx prisma migrate deploy` — never `migrate dev`, never
   `db push`.

For a rename, prefer add-new-column, backfill, then drop-old-column in a *later*
migration. A single-migration rename is a `DROP`+`ADD` under the hood.

## 11.5 Environment-variable precautions

* **`.env` is git-ignored and must stay that way.** `.gitignore` covers `.env` and
  `.env*.local`. `.env.example` is the only committed one and holds no real values.
* **Two URLs, two jobs.** `DATABASE_URL` is the **pooled** Neon URL (hostname contains
  `-pooler`) used at runtime. `DIRECT_URL` is the **direct** URL used by
  `migrate deploy`. Swapping them causes either connection exhaustion under load or a
  migration that refuses to run.
* **Production secrets belong in Vercel project settings**, not in a committed file.
  `CLAUDE.md` says this explicitly for the SMTP credentials.
* **`ADMIN_PASSWORD` must be rotated immediately after the first login.** Both
  `.env.example` and `prisma/seed.ts` say so.
* **Never print a secret.** `lib/mail.ts` logs only the SMTP transport's own error
  message; `lib/cover-upload.ts` never includes the Blob token in an error;
  `lib/verification.ts` never logs a raw token or OTP.

## 11.6 Neon connection behaviour, as evidenced by this repository

Two things are documented in the code itself:

1. **Pooled vs direct** — `.env.example` spells out the Neon+Vercel+Prisma recipe and
   why both URLs are required.
2. **Latency budget** — the `placeOrder` comment records measured figures for this
   deployment: app in India, Neon in `us-east-2`, ~290ms per round-trip, ~1.2s for
   BEGIN/COMMIT alone, and Prisma's default 5000ms interactive-transaction budget
   exhausted at roughly nine round-trips. That is why the stock decrement is one
   statement rather than a loop, and it is the thing to remember if you ever add
   another query inside that transaction.

Beyond those two points, Neon-specific behaviour (cold starts, autosuspend) is **not
confirmed from the repository**.

## 11.7 Safe development workflow

```
1. Read .env. Confirm the host is your LOCAL or STAGING database.
2. npx prisma generate            (safe, no data)
3. npm run dev
4. Schema change?
     a. edit prisma/schema.prisma
     b. npm run db:migrate -- --name my_change     (local/staging only)
     c. read the generated migration.sql
     d. npx tsc --noEmit  and  npm run lint
     e. commit schema + migration together, on a branch
5. Deploy: push -> Vercel builds -> then, deliberately:
     npx prisma migrate deploy    with production DIRECT_URL
```

## 11.8 What this document's author did **not** run

For the record, and per the brief: no `prisma migrate`, no `db push`, no
`migrate reset`, no `db seed`, no `prisma studio`, no destructive SQL, no schema edit,
no `.env` change. Every database fact above was read from `prisma/schema.prisma`,
`prisma/migrations/*/migration.sql`, `prisma/seed.ts` and the `lib/` query code.

---
---

# PART 12 — AUTHENTICATION

## 12.1 What authentication and authorisation are

**Authentication** answers *who are you*. **Authorization** answers *are you allowed to
do this*. They are separate steps here, and the separation is load-bearing: a signed-in
user is authenticated but only an `ADMIN` is authorised for `/admin`.

## 12.2 Why this project rolled its own

`CLAUDE.md` has a stale line under *Component Guidelines* recommending Clerk or
Auth.js. **The implementation does not use either** — and the same file describes the
custom system accurately elsewhere. What exists is roughly 220 lines in `lib/auth.ts`:
bcrypt, an opaque random token, a `Session` row, and an httpOnly cookie. No third-party
dependency, no JWT, no refresh-token dance.

The trade-off is stated implicitly by the design: every request costs one database read
of the `Session` row, and in exchange **deleting the row signs the user out
everywhere, instantly**. A stateless JWT cannot do that.

## 12.3 Registration

```
/sign-up form  ->  signUp(formData)      [app/(auth)/actions.ts]
```

1. `safeNext()` sanitises `?next=`.
2. `signUpSchema.safeParse` — name >= 2 chars, valid email, password >= 8 chars.
3. `registerUser(input)` (`lib/auth.ts`):
   * lowercases and trims the email
   * `findUnique` on email; if taken, returns `{ ok: false, error }`
   * `hashPassword()` = `bcrypt.hash(password, 10)`
   * `prisma.user.create(...)` — `role` defaults to `USER`
4. **Welcome email**, awaited but best-effort. Its comment explains why there is no
   "already welcomed" flag: *"registerUser() itself only reaches `ok: true` once per
   email address... so this call site IS the guarantee."*
5. **Verification token issued and emailed.** Failure here never blocks account
   creation; the outcome is carried to the next page as `?verify=sent|failed`.
6. `createSession(result.user.id)` — a session *is* created, but the account is not
   active yet (see 12.6).
7. Redirect to `/check-email` (gated) or `/profile`.

## 12.4 Password hashing

```ts
const BCRYPT_ROUNDS = 10;
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
```

Verification, with the anti-enumeration measure:

```ts
export async function verifyCredentials(email: string, password: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    // Compare against a dummy hash to reduce user-enumeration timing leaks.
    await bcrypt.compare(password, "$2a$10$CwTycUXWue0Thq9StjUM0uJ8...");
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? toSafe(user) : null;
}
```

**Why the dummy compare.** Without it, "no such user" returns in microseconds while
"wrong password" takes the ~100ms bcrypt costs. That timing difference tells an
attacker which addresses have accounts.

`SafeUser` is what leaves this module. It has **no `passwordHash`**:

```ts
export interface SafeUser {
  id: string; email: string; name: string; role: Role;
  emailVerified: boolean;
  verificationRequired: boolean;
}
```

## 12.5 Sessions and cookies

```ts
const COOKIE = "lions_session";
const SESSION_DAYS = 90;

export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");       // 256 bits, opaque
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,                                  // JS cannot read it -> XSS cannot steal it
    sameSite: "lax",                                 // not sent on cross-site POSTs
    secure: process.env.NODE_ENV === "production",   // HTTPS only in prod
    path: "/",
    expires: expiresAt,
  });
}
```

**Why an opaque token rather than a JWT.** The token carries no information. Everything
about the session is looked up server-side, so a session can be revoked by deleting one
row, and a role change takes effect on the next request rather than at token expiry.

**Why 90 days.** The comment records the reasoning and the counter-argument:

> Was 30 days. A merch/fan account carries no payment-instrument or admin-by-default
> risk on its own (role is checked separately by requireAdmin() on every request, not
> cached in the session)... 90 days, not indefinite: it still expires, and
> getCurrentUser() still rejects an expired row on every read regardless of the
> cookie's own lifetime.

**Sign-out** deletes the row *and* clears the cookie, and clears the cookie even if the
delete fails.

## 12.6 Verify-before-activate — the rule that decides who is gated

```ts
export const VERIFICATION_REQUIRED_SINCE = new Date("2026-09-11T12:00:00Z");

export function isVerificationRequired(u: Pick<UserRow, "emailVerifiedAt" | "createdAt">): boolean {
  return u.emailVerifiedAt === null && u.createdAt >= VERIFICATION_REQUIRED_SINCE;
}
```

Accounts created **on or after** that instant must confirm their email before the
signed-in experience opens. Accounts created before it keep the behaviour they always
had.

**Why a date constant rather than a column.** The comment: *"A date rather than a new
column so no migration is needed; the schema already records createdAt and
emailVerifiedAt."* And it means no existing member — including the pre-existing
unverified admin — was locked out when the rule landed.

This produces the two-tier accessor pair:

```ts
getPendingUser()   // the user behind the cookie, whatever their verification state
getCurrentUser()   // null if that user is gated -> nav, checkout, orders, profile,
                   // admin all treat a gated account as signed out
```

Only `/check-email` uses `getPendingUser()`, so a gated account can resend its link or
correct a mistyped address — and nothing else.

## 12.7 Email verification, end to end

**Issue** (`issueEmailVerificationToken`, `lib/verification.ts`):

* refuses if already verified (*"no point minting a secret nobody needs"*)
* 60-second resend cooldown
* max 5 tokens per rolling hour
* token = `crypto.randomBytes(32).toString("hex")`, TTL 24 hours
* **stores only `sha256(token)`** — the raw token exists only inside the email
* opportunistically deletes this user's dead, out-of-window rows (best-effort, never
  fails the issue)

**Peek** (`peekEmailVerificationToken`): a read-only look, used to render the GET of
`/verify-email`. Nothing is written. Its comment: *"so that mail scanners and link
pre-fetchers, which follow the link without a person present, cannot burn it."*

**Consume** (`consumeEmailVerificationToken`): only from the explicit POST.

```
check expiry FIRST  -> expired link reports "expired", is not silently burned
claim conditionally -> updateMany WHERE id AND usedAt IS NULL
count !== 1         -> "used" (lost the race)
only the winner     -> UPDATE User SET emailVerifiedAt = now()
then                -> retire every other live token for this user
```

**Activate** (`confirmEmailAction`, `app/verify-email/actions.ts`): on success, if this
browser does not already hold a session for that user, one is created. The token is the
proof of ownership, so confirming it activates the account. `next` is re-validated with
`safeNextPath()` so the emailed link can never become an open redirect.

**Change of address** (`changeUserEmail`): one transaction writes the new email **and**
`emailVerifiedAt = null`, then retires every live token. *"Verified status never
carries across."*

## 12.8 Phone verification

Fully implemented in `lib/verification.ts`: `issuePhoneOtp` (6-digit
`crypto.randomInt`, sha256-hashed, 10-minute TTL, 60s cooldown, 5/hour cap, retires any
previous live code) and `verifyPhoneOtp` (constant-time hash compare, 5 wrong attempts
then the row is consumed, conditional claim on success, writes `phone` and
`phoneVerifiedAt` together so they can never disagree).

**But there is no SMS transport.** `lib/sms.ts` returns `not-configured`, and
`requestPhoneOtpAction` checks `isSmsConfigured()` **before** minting a code *"so a
disabled transport cannot burn a user's hourly quota on codes that could never be
delivered."*

The file states the rule it exists to enforce:

> A verification UI that says "code sent" when nothing was sent is worse than no UI at
> all... There is no development shortcut here, no console-log delivery, and no mock
> branch that could survive into production by accident.

## 12.9 Login rate limiting

`lib/auth-rate-limit.ts`:

| Setting | Value |
|---|---|
| Window | 15 minutes |
| Lockout | 15 minutes |
| Per-email limit | 5 failures |
| Per-IP limit | 10 failures |

The key stored is `login:email:<sha256>` or `login:ip:<sha256>` — **the raw address and
IP are never written to this table**.

The IP comes from `getTrustedClientIp()`, which reads only `x-vercel-forwarded-for`
(*"Vercel overwrites this platform header with the requester's public IP"*) and rejects
anything containing a comma or failing `net.isIP`. A client-supplied
`X-Forwarded-For` is ignored.

A blocked attempt returns `error=creds` — **the same message as a wrong password** — so
the lockout does not confirm that the address exists.

## 12.10 Protected routes and authorization

```ts
export async function requireUser(nextPath?: string): Promise<SafeUser> {
  const pending = await getPendingUser();
  if (pending?.verificationRequired) redirect(`/check-email?next=...`);
  if (!pending) redirect(`/sign-in?next=...`);
  return pending;
}

export async function requireAdmin(): Promise<SafeUser> {
  const pending = await getPendingUser();
  if (pending?.verificationRequired) redirect("/check-email?next=%2Fadmin");
  if (!pending) redirect("/sign-in?next=/admin");
  if (pending.role !== "ADMIN") redirect("/?denied=admin");
  return pending;
}
```

**The role is read from the database on every request.** It is not cached in the
session or the cookie. `app/admin/users/actions.ts` records the consequence: *"a
demoted admin loses access on their next request without a sign-out."*

### Defence in depth, four layers

| Layer | Mechanism | What it catches |
|---|---|---|
| Edge | `middleware.ts` cookie presence | Anonymous requests to `/admin`, cheaply |
| Layout | `app/admin/layout.tsx` `requireAdmin()` | Stops the admin frame rendering for a non-admin |
| Page | `requireAdmin()` in all 20 admin pages | The real gate — layouts do not re-run on client navigation |
| Action | `await requireAdmin()` as the first line of every admin action | A forged POST straight at the action endpoint |

That last layer is the one that matters most, because Server Actions are reachable
without ever loading the page.

## 12.11 Ownership checks

Authorisation is not only role-based. Three patterns:

```ts
// lib/orders.ts - the signature forces you to name the owner
getOrderById(userId, id)   ->  row.userId === userId ? row : null

// lib/addresses.ts - same
getAddress(userId, id)     ->  row.userId === userId ? row : null

// lib/orders.ts placeOrder - an address from the book must belong to the buyer
if (!addr || addr.userId !== input.userId) throw new InvalidAddressError();
```

And in `lib/verification.ts`, **no action accepts a user id from the client**. The
header of `app/profile/verification-actions.ts` states it: *"Every action begins with
requireUser() and acts ONLY on that session's own user id... so one signed-in person
can never issue or consume verification state for another."*

## 12.12 Full flow diagram

```
User
 |
 v
Sign In  (/sign-in)
 |
 v
Validation  -------------------- zod signInSchema
 |
 v
Rate-limit check  -------------- lib/auth-rate-limit.ts (email hash + IP hash)
 |
 v
Password Verification  --------- bcrypt.compare (dummy compare when no user)
 |
 v
Session Creation  -------------- randomBytes(32) -> INSERT Session (90 days)
 |
 v
Cookie  ------------------------ lions_session: httpOnly, sameSite lax, secure
 |
 v
Verification gate  ------------- verificationRequired ? -> /check-email
 |
 v
Authenticated Request  --------- getPendingUser() -> getCurrentUser()
 |
 v
Authorization  ----------------- requireUser() / requireAdmin() / ownership check
 |
 v
Protected Resource
```

### Which file implements which step

| Step | File | Function |
|---|---|---|
| Form | `app/(auth)/sign-in/page.tsx` | — |
| Action | `app/(auth)/actions.ts` | `signIn` |
| Validation | same | `signInSchema.safeParse` |
| Rate limit | `lib/auth-rate-limit.ts` | `getLoginRateLimitState`, `recordLoginFailure`, `clearLoginRateLimits` |
| Password check | `lib/auth.ts` | `verifyCredentials` |
| Session | `lib/auth.ts` | `createSession` |
| Read session | `lib/auth.ts` | `getPendingUser`, `getCurrentUser` |
| Gate | `lib/auth.ts` | `requireUser`, `requireAdmin` |
| Edge pre-check | `middleware.ts` | `middleware` |
| Sign out | `lib/auth.ts` + `app/(auth)/actions.ts` + `app/admin/actions.ts` | `destroySession`, `signOut`, `logout` |
| Redirect safety | `lib/auth.ts` | `safeNextPath` |

---
---

# PART 13 — API ROUTES

## 13.1 How many there are

**One.** `app/api/sync/igpl/route.ts`.

That is not an omission — it is the architecture. Reads happen inside Server
Components; writes happen inside Server Actions. An HTTP endpoint is only needed when
something *outside* the app has to call in. Exactly one thing does: a scheduled job.

## 13.2 API reference

| Route | Method | Purpose | Auth | Input | Validation | DB | Response |
|---|---|---|---|---|---|---|---|
| `/api/sync/igpl` | `GET` | IGPL data sync entry point | `Authorization: Bearer <CRON_SECRET>` | None (header only) | Secret comparison; env flag check | Three `count()` calls when enabled | `200` / `401` / `500` / `503` JSON |

## 13.3 The route, explained

```ts
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth   = req.headers.get("authorization");
  const production = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  // 1. Fail closed in production when no secret is configured.
  if (!secret && production) {
    return NextResponse.json({ ok: false, error: "sync authentication is not configured" },
                             { status: 500 });
  }

  // 2. Reject a wrong or missing bearer token.
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // 3. Refuse loudly unless the feature flag is on.
  if (process.env.IGPL_SYNC_ENABLED !== "true") {
    return NextResponse.json({ ok: false, disabled: true, note: "..." }, { status: 503 });
  }

  // 4. Enabled but unimplemented: report real row counts and say so.
  const counts = {
    fixtures:  await prisma.fixture.count(),
    scores:    await prisma.score.count(),
    standings: await prisma.standing.count(),
  };
  return NextResponse.json({ ok: true, syncedAt: new Date().toISOString(),
                             source: "no-op-stub", counts, note: "Sync enabled but no scraper attached. ..." });
}
```

### Response matrix

| Condition | Status | Body |
|---|---|---|
| Production, `CRON_SECRET` unset | `500` | `{ ok:false, error:"sync authentication is not configured" }` |
| Secret set, header wrong/absent | `401` | `{ ok:false, error:"unauthorized" }` |
| `IGPL_SYNC_ENABLED !== "true"` | `503` | `{ ok:false, disabled:true, note:"..." }` |
| Flag on | `200` | `{ ok:true, syncedAt, source:"no-op-stub", counts, note:"..." }` |

### Security considerations, and a fix from history

Commit `90b8b69` (*"fix: harden order and IGPL sync security"*) changed this route in
two ways:

**Before**
```ts
const key = req.nextUrl.searchParams.get("key");
if (secret && auth !== `Bearer ${secret}` && key !== secret) { /* 401 */ }
```

**After**
```ts
if (!secret && production) { /* 500 - fail closed */ }
if (secret && auth !== `Bearer ${secret}`) { /* 401 */ }
```

* **The `?key=` query-string fallback was removed.** A secret in a URL ends up in
  server access logs, proxy logs, browser history and any `Referer` header. A header
  does not.
* **It now fails closed.** Previously, a production deployment that simply forgot to
  set `CRON_SECRET` had an *open* endpoint, because `if (secret && ...)` is false when
  `secret` is undefined. Now that combination returns `500`.

`app/robots.ts` also disallows `/api/` for crawlers.

## 13.4 Why the rest of the app has no API routes

| What you might expect | What this project does instead |
|---|---|
| `GET /api/products` | `listProducts()` called inside `app/shop/page.tsx` |
| `POST /api/orders` | `placeOrderAction` Server Action |
| `POST /api/auth/login` | `signIn` Server Action |
| `POST /api/contact` | `submitContact` Server Action |
| `PATCH /api/admin/orders/:id` | `updateOrderStatusAction` Server Action |

The benefits: no hand-written request/response types, no fetch-and-parse boilerplate,
no separate auth middleware for the API surface, and — because Server Actions are
server code — no risk of accidentally trusting a client-supplied field that the
endpoint's schema happened to allow.

---
---

# PART 14 — SERVER ACTIONS

## 14.1 What a Server Action is

**Simple explanation.** A function marked `"use server"` that runs on the server but
can be *called* from client code as if it were a local function. Next.js registers an
endpoint for it, serialises the arguments, and returns the result. You never write the
fetch.

**Two ways to invoke one:**

```tsx
// 1. Progressive enhancement - works with JavaScript disabled
<form action={signIn}>...</form>

// 2. Called programmatically, usually inside a transition
startTransition(async () => {
  const res = await placeOrderAction(fd);
});
```

**The security fact that governs everything below:** a Server Action endpoint is
reachable by anyone who can construct a POST. It is *not* protected by the page that
renders the form. Therefore **every action authenticates and validates for itself**.

## 14.2 Inventory — 17 files, 48 exported functions

### Public / account

| Action | File | Who can call | Validation | Writes | Revalidates | Returns |
|---|---|---|---|---|---|---|
| `signIn` | `app/(auth)/actions.ts` | anyone | zod + rate limit | `Session` | — | `redirect()` |
| `signUp` | same | anyone | zod | `User`, `Session`, `EmailVerificationToken` | — | `redirect()` |
| `signOut` | same | anyone | — | deletes `Session` | — | `redirect("/")` |
| `submitContact` | `app/contact/actions.ts` | anyone | zod, topic allow-list | `ContactMessage` | `/admin/messages` | `ContactResult` |
| `updateProfile` | `app/profile/actions.ts` | `requireUser` | zod + password pairing | `User` (+ token on email change) | `/profile` | `ProfileActionResult` |
| `resendVerificationEmailAction` | `app/profile/verification-actions.ts` | `requireUser` | none needed (no input) | `EmailVerificationToken` | `/profile` | `VerificationActionResult` |
| `requestPhoneOtpAction` | same | `requireUser` | `normalisePhone` | `PhoneOtp` | — | `VerificationActionResult` |
| `verifyPhoneOtpAction` | same | `requireUser` | digits only | `PhoneOtp`, `User` | `/profile` | `VerificationActionResult` |
| `resendPendingVerificationAction` | `app/check-email/actions.ts` | `getPendingUser`, gated only | — | `EmailVerificationToken` | — | `CheckEmailResult` |
| `changePendingEmailAction` | same | `getPendingUser`, gated only | zod email + uniqueness | `User`, tokens | — | `CheckEmailResult` |
| `confirmEmailAction` | `app/verify-email/actions.ts` | anyone with a valid token | token consume | `EmailVerificationToken`, `User`, `Session` | `/profile`, `/admin/users` | `ConfirmEmailResult` |
| `placeOrderAction` | `app/checkout/actions.ts` | `requireUser` | manual + server re-read | `Order`, `OrderItem`, `Product.stock`, maybe `Address` | 3 paths | `PlaceOrderResult` |

### Admin (every one begins `await requireAdmin()`)

| File | Actions |
|---|---|
| `app/admin/actions.ts` | `logout` |
| `app/admin/products/actions.ts` | `createProductAction`, `updateProductAction`, `deleteProductAction`, `setProductActiveAction`, `bulkUpdateStockAction` |
| `app/admin/orders/actions.ts` | `updateOrderStatusAction`, `updatePaymentStatusAction` |
| `app/admin/users/actions.ts` | `setRoleAction`, `revokeSessionsAction`, `deleteUserAction`, `sendVerificationLinkAction` |
| `app/admin/news/actions.ts` | `newDraftAction`, `updatePostAction`, `setStatusAction`, `deletePostAction`, `createOfficialNewsAction`, `updateOfficialNewsAction`, `setOfficialNewsStatusAction`, `setOfficialNewsFeaturedAction`, `deleteOfficialNewsAction` |
| `app/admin/media/actions.ts` | `createMediaCoverageAction`, `updateMediaCoverageAction`, `setMediaStatusAction`, `deleteMediaCoverageAction` |
| `app/admin/fixtures/actions.ts` | `createFixtureAction`, `updateFixtureAction`, `setFixtureStatusAction`, `deleteFixtureAction` |
| `app/admin/scores/actions.ts` | `createScoreAction`, `updateScoreAction`, `deleteScoreAction` |
| `app/admin/leaderboards/actions.ts` | `saveStandingAction`, `deleteStandingAction` |
| `app/admin/messages/actions.ts` | `setContactMessageStatusAction`, `deleteContactMessageAction` |

## 14.3 The five-step shape every action follows

```
1. AUTHENTICATE   await requireAdmin()   /  await requireUser("/path")
2. VALIDATE       zod .safeParse  or  an explicit allow-list check
3. AUTHORISE      ownership / self-lockout / transition legality
4. WRITE          through a lib/ data module (never inline Prisma in the action,
                  with the small exceptions of user role/session admin actions)
5. REVALIDATE     revalidatePath(every surface that reads this row)
   RETURN         a typed discriminated-union result
```

### Worked example — `setRoleAction`

```ts
export async function setRoleAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();                                // 1
  const id   = String(formData.get("id") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  if (role !== "USER" && role !== "ADMIN") return { ok:false, error:"That role is not valid." };  // 2
  if (!id) return { ok:false, error:"Missing user identifier." };
  if (id === admin.id) return { ok:false, error:"You cannot change your own role." };             // 3

  const target = await prisma.user.findUnique({ where:{ id }, select:{ id:true, name:true, role:true } });
  if (!target) return { ok:false, error:"That account no longer exists." };
  if (target.role === role) return { ok:true, message:`${target.name} is already ${role.toLowerCase()}.` };

  if (role === "USER") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) return { ok:false, error:"There must always be at least one admin." };       // 3
  }

  await prisma.user.update({ where:{ id }, data:{ role } });          // 4
  revalidatePath("/admin/users");                                     // 5
  return { ok:true, message: /* ... */ };
}
```

Two authorisation guards that are easy to forget and are present here: **you cannot
demote yourself**, and **you cannot remove the last admin**. Either would lock the
organisation out of its own console.

## 14.4 Why actions return results instead of redirecting

`lib/admin-action-result.ts` states the rule:

> Actions never `redirect()` on failure — that throws NEXT_REDIRECT, which a client
> form cannot tell apart from a crash, and it discards everything the admin typed.
> Returning a value lets the form keep its input, show the server's own message
> inline, and decide where to go on success.

`app/profile/actions.ts` records the same migration for the account form: it used to
`redirect("/profile?error=...")`, which meant *"a full navigation and an error carried
in the URL, with no way to show a loading, inline-validation or success state."*

`signIn` / `signUp` still redirect — but those *are* navigations, and the error is
carried as a code (`?error=creds`) that the page maps to a message, never the raw
input.

## 14.5 UI to database and back

```
CLIENT COMPONENT
  |  <form action={submitContact}>   or   startTransition(() => action(fd))
  v
[ Next.js serialises FormData -> POST to the action endpoint ]
  v
SERVER ACTION  ("use server")
  |- requireUser() / requireAdmin()        <- session read from the cookie
  |- zod .safeParse(...)                   <- shape + limits
  |- ownership / legality checks
  v
lib/*.ts  (server-only)
  |- prisma.$transaction / update / create
  v
POSTGRESQL
  v
revalidatePath("/x")  -> Next.js drops the cached render of /x
  v
return { ok: true | false, ... }
  v
CLIENT COMPONENT
  ok  -> toast + router.push / reset form
  !ok -> inline error, input preserved
```

## 14.6 Error handling inside actions

Three deliberate patterns.

**Typed errors caught and mapped** (`placeOrderAction`):

```ts
catch (e) {
  if (e instanceof EmptyCartError)        return { ok:false, code:"EMPTY_CART", error:"Your cart is empty." };
  if (e instanceof InvalidAddressError)   return { ok:false, code:"INVALID_ADDRESS", error:"That delivery address is invalid." };
  if (e instanceof InsufficientStockError) return { ok:false, code:"INSUFFICIENT_STOCK",
        error: e.available === 0 ? "One of the items in your cart just went out of stock."
                                 : `One of the items in your cart only has ${e.available} left. ...`,
        insufficient: { productId: e.productId, requested: e.requested, available: e.available } };
  console.error("[placeOrderAction] unknown error while placing order", e);
  return { ok:false, code:"SERVER", error:"Something went wrong placing your order. Please try again." };
}
```

The last branch is the important one: **the raw error is logged, never returned**. A
Prisma error message can contain table names, column names and sometimes values.

**Prisma error codes mapped to written messages** (`deleteUserAction`):

```ts
if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
  // foreign-key violation - created between our pre-check and the delete
}
if (... err.code === "P2025") return { ok:false, error:"That account no longer exists." };
```

**Best-effort side effects isolated** (`submitContact`):

```ts
const [userMail, adminMail] = await Promise.allSettled([
  sendContactConfirmationToUser(mailInput),
  sendContactNotificationToAdmin(mailInput),
]);
```

`allSettled`, not `all` — one email failing must not affect the other, and neither
affects the already-saved row.

## 14.7 PII discipline in actions

`app/contact/actions.ts` carries an explicit note about a previous version:

> Nothing here logs name, email, phone, city or message — the previous version's
> `console.log("[contact]", {...})` on every submission put the entire enquiry, PII
> included, into server logs. Failures now log only a non-identifying diagnostic.

```ts
console.error("[contact] failed to save enquiry:", err instanceof Error ? err.message : "unknown error");
```

---
---

# PART 15 — E-COMMERCE

## 15.1 The whole flow

```
Product (DB row)
   |
   v
Product listing        /shop            listProducts()  - active rows only
   |
   v
Product details        /product/[id]    getProductById() - 404 if missing OR inactive
   |
   v
Cart                   /cart            zustand + localStorage "lions_cart"
   |
   v
Checkout               /checkout        requireUser() -> CheckoutFlow
   |
   v
Authentication         placeOrderAction re-runs requireUser("/checkout")
   |
   v
Server validation      email / phone / payment method / cart shape
   |
   v
Stock validation       inside the transaction, against live Product rows
   |
   v
Order creation         prisma.$transaction
   |
   v
Order items            nested create, with frozen snapshots
   |
   v
Email                  COD only: buyer confirmation + admin notification
   |
   v
Order history          /orders/[id], /profile/orders, /admin/orders
```

## 15.2 Cart state

`store/cart.ts` — a Zustand store persisted to `localStorage` under `lions_cart`.

```ts
export interface CartItem {
  id: string;     // productId
  name: string;
  price: number;
  img: string;    // "" when the product uses the fallback logo
  qty: number;
}
```

Operations: `add`, `inc`, `dec` (removes the line at zero), `remove`, `clear`. Helpers:
`cartCount`, `cartSubtotal`, `useCartHydrated`.

**The cart is a convenience, not a record.** Everything in it — including `price` — is
client-controlled and therefore untrusted. The server reads only `productId` and `qty`.

## 15.3 Server-side totals

`lib/orders-totals.ts` is a pure module, deliberately shared by `/cart`, `/checkout`
and `placeOrderAction` so all three compute identically.

```ts
export const SHIPPING_FLAT_INR       = num(process.env.SHIPPING_FLAT_INR, 149);
export const SHIPPING_FREE_ABOVE_INR = num(process.env.SHIPPING_FREE_ABOVE_INR, 2000);
export const GST_RATE                = num(process.env.GST_RATE, 18) / 100;

export function computeTotals(lines: OrderableLine[]): OrderTotals {
  const subtotal = lines.reduce((sum, l) =>
    sum + Math.max(0, Math.round(l.price)) * Math.max(0, Math.round(l.qty)), 0);
  const shipping = subtotal === 0 ? 0
                 : subtotal >= SHIPPING_FREE_ABOVE_INR ? 0
                 : SHIPPING_FLAT_INR;
  const tax   = Math.round(subtotal * GST_RATE);
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}
```

Three points worth absorbing:

* **All money is integer rupees.** `Product.price`, `Order.subtotal`, `shipping`, `tax`
  and `total` are all `Int` in the schema. No floats, so no floating-point drift.
* **Thresholds are env-overridable** without a code change.
* **The client's preview and the server's authority use the same function** — but the
  client feeds it cart prices, and the server feeds it prices re-read from the database.

## 15.4 Price validation — the rule

From `app/checkout/actions.ts`:

> **NEVER trust client prices or totals.** The client posts a cart snapshot as an array
> of `{productId, qty}`; the transaction inside `placeOrder()` re-reads authoritative
> Product rows and computes totals from those. Any manipulated JSON just gets ignored —
> the DB is the source of truth.

The parser enforces the shape:

```ts
function parseCart(raw: FormDataEntryValue | null): RawCartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((it) => ({
        productId: String((it as { productId?: unknown }).productId ?? "").trim(),
        qty: Math.max(0, Math.round(Number((it as { qty?: unknown }).qty ?? 0))),
      }))
      .filter((it) => it.productId && it.qty > 0);
  } catch { return []; }
}
```

Any `price`, `total` or `discount` field the client invents is simply not read.

Then, inside the transaction:

```ts
const products = await tx.product.findMany({ where: { id: { in: ids } } });
// ...
lines.push({
  productId, productName: p.name, productImage: image,
  unitPrice: p.price,              // <- from the DATABASE
  qty, lineTotal: p.price * qty,
});
const totals = computeTotals(lines.map((l) => ({ price: l.unitPrice, qty: l.qty })));
```

## 15.5 Stock validation and the atomic decrement

Quantities are de-duplicated first (a client could send the same product twice):

```ts
const merged = new Map<string, number>();
for (const it of input.items) {
  const qty = Math.max(0, Math.round(it.qty));
  if (qty === 0) continue;
  merged.set(it.productId, (merged.get(it.productId) ?? 0) + qty);
}
```

Then, per line: a missing product, an inactive product, or `p.stock < qty` each throw
`InsufficientStockError` and roll the transaction back.

Then the decrement — **one statement, whatever the cart size**:

```sql
UPDATE "Product" AS p
   SET stock = p.stock - v.qty, "updatedAt" = NOW()
  FROM (VALUES ('slug-a'::text, 2::int), ('slug-b'::text, 1::int)) AS v(id, qty)
 WHERE p.id = v.id
   AND p.active = true
   AND p.stock >= v.qty
RETURNING p.id
```

```ts
if (applied.length !== lines.length) {
  // snapshot went stale between read and write - abort
  const appliedIds = new Set(applied.map((r) => r.id));
  const failed = lines.filter((l) => !appliedIds.has(l.productId));
  const fresh  = await tx.product.findMany({ where: { id: { in: failed.map(f => f.productId) } },
                                             select: { id: true, stock: true } });
  throw new InsufficientStockError(failed[0].productId, failed[0].qty,
                                   freshById.get(failed[0].productId) ?? 0);
}
```

**Why this cannot oversell.** The `stock >= v.qty` condition is evaluated by Postgres,
row by row, at write time, inside the transaction. Two concurrent checkouts for the
last unit cannot both satisfy it. The one that loses gets `applied.length < lines.length`
and rolls back entirely — including any rows that *did* decrement.

**Why one statement rather than a loop** — the latency budget documented in **Part 10.6**.

## 15.6 Idempotency

The problem: a customer double-clicks Confirm, or their connection times out and the
browser retries. Without protection, that is two orders and two stock decrements.

**Client** (`CheckoutFlow`): one UUID per mount, via a lazy `useState` initialiser,
resubmitted unchanged on every retry of that attempt. A fresh page load gets a fresh
key, so a genuinely new order is never mistaken for a repeat.

**Server**, two layers:

```ts
// Layer 1 - a plain read, outside any transaction, BEFORE touching stock.
if (requestId) {
  const existing = await prisma.order.findUnique({ where: { clientRequestId: requestId } });
  if (existing && existing.userId === input.userId) {
    return { id: existing.id, orderNumber: existing.orderNumber };
  }
}
```

This resolves the common case: two requests arriving milliseconds apart are still
*sequential*.

```ts
// Layer 2 - the @unique constraint, for a genuine concurrent race.
catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    const target = /* ... e.meta.target ... */;
    if (target.some((t) => t.includes("clientRequestId"))) {
      throw new DuplicateClientRequestError();   // roll back, including the stock decrement
    }
    continue;   // otherwise it was an orderNumber collision - retry with a new one
  }
  throw e;
}
```

```ts
// Outside the transaction: hand back whichever order actually won.
if (e instanceof DuplicateClientRequestError && requestId) {
  const winner = await prisma.order.findFirst({
    where: { clientRequestId: requestId, userId: input.userId },
  });
  if (winner) return { id: winner.id, orderNumber: winner.orderNumber };
}
```

**Note the `userId` in that `findFirst`.** It was added in commit `90b8b69`. Before,
the lookup was `findUnique({ where: { clientRequestId } })` — which would have returned
*someone else's* order id if a client request id ever collided across accounts.

**A subtlety the code handles and most implementations do not.** Because
`placeOrderAction` can now legitimately run twice for the same order, it can no longer
assume "fresh order therefore emails not yet sent". So each COD email is gated on its
own database column:

```ts
if (!full.codUserEmailSentAt) { /* send, then recordCodEmailSent(id, "user") */ }
if (!full.codAdminEmailSentAt) { /* send, then recordCodEmailSent(id, "admin") */ }
```

The comment explains the scenario: *"a crash between the two sends... means a retry
sends only the one that is still missing, never both again."* And the columns are in
the database rather than in memory because *"an in-process flag is gone the moment the
server restarts or the request runs on a different serverless instance, which is
exactly when a retry is most likely to happen."*

## 15.7 Order creation

```ts
const paymentStatus: PaymentStatus =
  input.paymentMethod === "COD" ? "UNPAID"
  : input.paymentMethod === "OFFLINE_INVOICE" ? "PENDING"
  : "UNPAID";

for (let attempt = 0; attempt < 5; attempt++) {
  const orderNumber = generateOrderNumber();   // "VCL-YYMMDD-XXXXX"
  try {
    const created = await tx.order.create({
      data: { orderNumber, clientRequestId: requestId, userId, shippingAddressId,
              shippingSnapshot: snapshotSource, contactEmail, contactPhone,
              subtotal: totals.subtotal, shipping: totals.shipping,
              tax: totals.tax, total: totals.total,
              paymentMethod, paymentStatus, notes,
              items: { create: lines.map(/* frozen snapshots */) } },
    });
    return { id: created.id, orderNumber: created.orderNumber };
  } catch (e) { /* P2002 handling above */ }
}
```

`generateOrderNumber()` (`lib/orders-format.ts`) produces `VCL-260919-K7M2P`: a
date prefix plus five characters from an alphabet that **excludes O, 0, I and 1**, so a
number read aloud over the phone is unambiguous.

## 15.8 Historical product references — the snapshot principle

Two kinds of snapshot, for the same reason.

**Address** — frozen as `jsonb` on the order:

```ts
shippingSnapshot: snapshotSource   // { label, fullName, phone, line1, line2, city, state, postalCode, country }
```

Schema comment: *"freezes the delivery address at order time so later edits to the
source Address row don't retro-change history."* The FK is soft (`onDelete: SetNull`)
— delete the address and the order still knows where it went.

**Line items** — frozen on `OrderItem`:

```prisma
productName  String
productImage String?
unitPrice    Int      // frozen at time of order
qty          Int
lineTotal    Int      // denormalised
```

Rename a product, reprice it, or replace its photograph, and last month's order still
shows what was actually bought at what was actually paid. `OrderItem.productId` remains
as a `Restrict` link, so the historical connection survives too.

## 15.9 Order lifecycle

```ts
const FORWARD: Record<OrderStatus, OrderStatus[]> = {
  PENDING:         ["PAYMENT_PENDING", "PAID", "PROCESSING", "CANCELLED"],
  PAYMENT_PENDING: ["PAID", "CANCELLED"],
  PAID:            ["PROCESSING", "REFUNDED"],
  PROCESSING:      ["SHIPPED", "CANCELLED"],
  SHIPPED:         ["DELIVERED", "REFUNDED"],
  DELIVERED:       ["REFUNDED"],
  CANCELLED:       [],
  REFUNDED:        [],
};
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return FORWARD[from]?.includes(to) ?? false;
}
```

```
PENDING ──┬─► PAYMENT_PENDING ──► PAID ──► PROCESSING ──► SHIPPED ──► DELIVERED
          ├─► PAID                                                        │
          ├─► PROCESSING                                                  │
          └─► CANCELLED         (also from PAYMENT_PENDING, PROCESSING)   │
                                                                          │
              PAID / SHIPPED / DELIVERED ──► REFUNDED  ◄──────────────────┘

CANCELLED and REFUNDED are terminal.
```

## 15.10 Cancellation and restocking

**Who can cancel: admins only.** There is no user-facing cancel action anywhere in
`app/profile`, `app/orders` or `components/profile` — this was checked.

```ts
export async function cancelOrderAndRestock(id: string): Promise<Order | null> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!existing) return null;
    if (existing.status === "CANCELLED" || existing.status === "REFUNDED") return existing;  // idempotent
    if (!canTransition(existing.status, "CANCELLED")) return null;

    const claimed = await tx.order.updateMany({
      where: { id, status: existing.status },     // compare-and-set
      data:  { status: "CANCELLED" },
    });
    if (claimed.count !== 1) return null;

    if (existing.items.length > 0) {
      await tx.$executeRaw`
        UPDATE "Product" AS p SET stock = p.stock + v.qty, "updatedAt" = NOW()
          FROM (VALUES ${restock}) AS v(id, qty) WHERE p.id = v.id`;
    }
    return tx.order.findUnique({ where: { id } });
  });
}
```

The function's own comment names the attack it blocks:

> Refuses (returns null) unless the FORWARD table allows the current status to become
> CANCELLED... Without this check a forged form value could cancel a SHIPPED or
> DELIVERED order and put goods that already left the building back into stock.

The `claimed.count !== 1` guard (added in commit `90b8b69`) closes the remaining
window: two simultaneous cancels cannot both restock.

**Cancellation email**, from `updateOrderStatusAction`:

```ts
export function shouldSendCancellationEmail(previous, next, sentAt): boolean {
  return previous !== "CANCELLED" && next === "CANCELLED" && sentAt === null;
}
```

and it is recorded without overwriting a prior mark:

```ts
const result = await prisma.order.updateMany({
  where: { id, status: "CANCELLED", cancellationEmailSentAt: null },
  data:  { cancellationEmailSentAt: new Date() },
});
return result.count === 1;
```

## 15.11 Payment

| Method | `PaymentStatus` on creation | Live? |
|---|---|---|
| `COD` | `UNPAID` | Yes — this is the working path |
| `OFFLINE_INVOICE` | `PENDING` | Yes — bank transfer reconciled by an admin |
| `ONLINE_TBD` | `UNPAID` | **No.** A scaffolded enum slot only |

The schema is explicit: *"Payment is deliberately un-live for M5 —
`PaymentMethod.ONLINE_TBD` is a scaffolded slot so a future Razorpay/Stripe hook is a
swap not a rewrite. Today the buyer picks COD or OFFLINE_INVOICE only."*

`CheckoutFlow` types its state as `useState<"COD" | "OFFLINE_INVOICE">("COD")`, so the
UI never offers the third option. `Order.paymentRef` exists for a future gateway
reference.

**There is no payment gateway integration in this repository.** No Razorpay, no Stripe,
no PayPal, no webhook handler.

## 15.12 Order ownership

```ts
// Buyer - app/orders/[id]/page.tsx
const user  = await requireUser(`/orders/${id}`);
const order = await getOrderById(user.id, id);
if (!order) notFound();
```

The page comment explains the 404: *"another user asking for the same URL sees a 404,
not a redirect (avoids leaking that the id exists)."*

Admins use a separate helper, `getOrderByIdForAdmin(id)`, with no user scoping — which
is why the two are distinct functions rather than one function with an optional
argument.

## 15.13 Security summary for commerce

| Concern | How it is addressed |
|---|---|
| Price tampering | Prices re-read from `Product` inside the transaction; client prices never read |
| Quantity tampering | Coerced with `Math.max(0, Math.round(...))`, deduplicated, validated against live stock |
| Overselling | `stock >= v.qty` enforced by Postgres inside the transaction, with `RETURNING` verification |
| Double submission | `clientRequestId` short-circuit plus a `@unique` constraint |
| Duplicate emails | Per-email timestamp columns on the order row |
| Buying a hidden product | `p.active` checked in the transaction; `/product/[id]` 404s on inactive |
| Using someone else's address | `addr.userId !== input.userId` throws |
| Reading someone else's order | `getOrderById(userId, id)` returns null; page 404s |
| Illegal status change | `FORWARD` table plus compare-and-set |
| Restocking shipped goods | `canTransition(status, "CANCELLED")` refuses |
| Stale session at submit | `requireUser()` re-runs inside the action |
| Leaking internals in errors | Unknown errors logged server-side, generic message returned |

## 15.14 The test harness

`scripts/test-checkout-phase-5-3.ts`, run with `npm run test:checkout`. Five
Prisma-testable checkout scenarios against a real Postgres URL. It snapshots every
product row it will touch, runs, then restores and deletes the `Order` / `Address` rows
it created — *"leaving the target DB byte-identical to how it started."* It prints a
masked connection host at startup so you can eyeball the target.

It needs the three `scripts/harness-server-only-*` files, which stub out
`import "server-only"` so `lib/orders.ts` can be imported by a plain `tsx` process.

**This is the only automated test in the repository.** There is no unit-test runner, no
Jest/Vitest config and no CI test workflow.

---
---

# PART 16 — ADMIN SYSTEM

## 16.1 What exists

Twenty pages under `/admin`, in ten functional areas.

| Area | Routes | What an admin can do |
|---|---|---|
| **Dashboard** | `/admin` | Counts and attention items: pending / payment-pending / processing orders, new messages, out-of-stock and low-stock products, draft news, live and next fixture, recent orders and messages |
| **Products** | `/admin/products`, `/admin/products/[id]/edit` | Create, edit, delete (or hide), upload a primary image |
| **Inventory** | `/admin/inventory` | Bulk stock editing across the catalogue |
| **Orders** | `/admin/orders`, `/admin/orders/[id]` | Paged, searchable list; advance status; set payment status and reference; cancel with restock |
| **Users** | `/admin/users` | Grant / revoke ADMIN, revoke sessions, delete, send a verification link |
| **Messages** | `/admin/messages` | Read enquiries, mark READ / RESOLVED, delete |
| **News** | `/admin/news`, `/admin/news/new`, `/admin/news/[id]/edit`, `/admin/news/editorial` | TipTap article editor, draft / publish / archive, official-news desk, feature-on-home toggle |
| **Media** | `/admin/media`, `/admin/media/new`, `/admin/media/[id]/edit` | Curate third-party press and social coverage |
| **Fixtures** | `/admin/fixtures`, `/admin/fixtures/new`, `/admin/fixtures/[id]/edit` | The season calendar |
| **Scores** | `/admin/scores` | Hand-key round scores per fixture |
| **Leaderboards** | `/admin/leaderboards` | Standings rows for the three boards |

**Note against `CLAUDE.md`:** that file still describes `/admin/news` as a
*"scaffold for a rich-text editor (TipTap/Quill) — pending"*. It is implemented —
`components/admin/PostEditor.tsx` is a working TipTap editor. `CLAUDE.md` also
describes an `/admin/igpl-sync` manual-override console; **that route does not exist.**

## 16.2 How non-admins are kept out

Four layers, described in **Part 12.10**. The one that actually matters:

```ts
export async function someAdminAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();          // <- first statement, no exceptions
  // ...
}
```

This was verified across every admin action file: `products`, `orders`, `users`,
`messages`, `news`, `media`, `fixtures`, `scores`, `leaderboards`. Every exported
action begins with `await requireAdmin()`.

**Why that is the load-bearing check.** Server Action endpoints are reachable by a
crafted POST. Somebody who never loads `/admin/products` can still try to call
`deleteProductAction`. Middleware does not see it as `/admin/*`, and the page guard
never runs. Only the check inside the action does.

## 16.3 The `requireAdmin()` contract

```ts
export async function requireAdmin(): Promise<SafeUser> {
  const pending = await getPendingUser();
  if (pending?.verificationRequired) redirect("/check-email?next=%2Fadmin");
  if (!pending) redirect("/sign-in?next=/admin");
  if (pending.role !== "ADMIN") redirect("/?denied=admin");
  return pending;
}
```

* It **returns the admin**, so actions can use `admin.id` for self-lockout guards.
* The role comes from the database every time — never from the cookie.
* A non-admin is sent home with `?denied=admin` rather than to sign-in, because they
  *are* signed in; signing in again would not help.

## 16.4 Authorization checks worth knowing

| Check | File | Prevents |
|---|---|---|
| `id === admin.id` on role change | `users/actions.ts` | Demoting yourself and losing the console |
| `admins <= 1` before demotion | `users/actions.ts` | Removing the last admin |
| `id === admin.id` on delete | `users/actions.ts` | Deleting your own account |
| `id === admin.id` on session revoke | `users/actions.ts` | Accidentally signing yourself out (points at Sign out instead) |
| `orderCount > 0` before user delete | `users/actions.ts` | Orphaning order history (also enforced by the DB's RESTRICT) |
| `orderItem.count > 0` before product delete | `lib/db.ts` | Breaking historical order lines (also RESTRICT) |
| `canTransition(from, to)` | `orders/actions.ts` + `lib/orders.ts` | Illegal status jumps, and restocking shipped goods |
| **No action sets `emailVerifiedAt`** | `users/actions.ts` | An admin bypassing verification. The comment is explicit: *"an admin can prompt verification, not bypass it"* |
| Verification link reads the stored address | `users/actions.ts` | Turning the admin console into a mail relay for arbitrary addresses |

## 16.5 The admin shell

`app/admin/layout.tsx`:

```tsx
export const dynamic = "force-dynamic";     // badge counts must be live
export const metadata: Metadata = {
  title: { default: "Lions Admin", template: "%s - Lions Admin" },
  robots: { index: false, follow: false },  // never indexed
};

export default async function AdminLayout({ children }) {
  const user   = await requireAdmin();
  const badges = await getAdminBadges().catch(() => ({
    pendingOrders: 0, newMessages: 0, outOfStock: 0, draftNews: 0,
  }));
  return (
    <AdminChrome email={user.email} name={user.name} badges={badges} signOut={logout}>
      {children}
    </AdminChrome>
  );
}
```

The `.catch()` fallback means a database hiccup shows zeroed badges rather than taking
the whole console down.

Badge queries (`lib/admin-dashboard.ts`) run in parallel and count only things that
need attention:

```ts
const [pendingOrders, newMessages, outOfStock, draftNews] = await Promise.all([
  prisma.order.count({ where: { status: { in: ["PENDING", "PAYMENT_PENDING"] } } }),
  prisma.contactMessage.count({ where: { status: "NEW" } }),
  prisma.product.count({ where: { active: true, stock: { lte: 0 } } }),
  prisma.mediaCoverage.count({ where: { kind: "OFFICIAL", status: "DRAFT" } }),
]);
```

Its header records the discipline: *"the dashboard shows what needs an operator's
attention, not vanity totals. Nothing is estimated."*

## 16.6 Content management

**Articles (`Post`).** TipTap in `PostEditor`. Saves `bodyHtml` and `bodyJson`
together. Statuses DRAFT / PUBLISHED / ARCHIVED, and the public helpers
(`listPublishedPosts`, `getPublishedPostBySlug`) are the only ones the public pages may
call — `getPublishedPostBySlug` returns `null` for a non-published row even if the slug
matches.

**Coverage (`MediaCoverage`).** Curated links to other people's publications, never a
copy of the article. The schema says why: *"we never host the source article, we only
link out."* `kind` is set explicitly by the admin — `OFFICIAL`, `ARTICLE` or `SOCIAL` —
and `lib/news-desk.ts` notes that *"Nothing is inferred from a title or a URL."*

**HTML sanitisation.** `/news/[slug]` renders the body with
`dangerouslySetInnerHTML`, and the sanitiser is applied at render time:

```tsx
<div dangerouslySetInnerHTML={{ __html: sanitizeNewsHtml(post.bodyHtml) }} />
```

`lib/news-html.ts` allows 15 tags, only `href` on `<a>` and `src`/`alt` on `<img>`,
schemes limited to http/https/mailto, `allowProtocolRelative: false`, and
`disallowedTagsMode: "discard"`. That means no `<script>`, no `onclick`, no
`javascript:` URL.

## 16.7 The admin UI contract

Every form action returns `ActionResult`, and the client renders it:

```
ok: true   -> adminToast(message, "ok"),     possibly router.push
ok: false  -> adminToast(error, "danger"),   form keeps every value the admin typed
```

Destructive actions go through `ConfirmDeleteButton` / `ConfirmActionButton`, and the
delete dialog keeps the server's message on screen — so "this product appears on
existing orders" stays visible with the suggestion to hide instead.

Admin toasts are a **separate store** from public toasts, and the reason is in the
code:

> the public store renders its message as HTML (it is built from product names we
> control), whereas admin toasts carry server-returned text that may quote admin input,
> so they are always rendered as plain text.

---
---

# PART 17 — VALIDATION + SECURITY

## 17.1 Validation layers

```
1. HTML attributes        required, type="email", maxLength   (fastest feedback, zero trust)
2. Client-side checks     validateStep1() in CheckoutFlow, LIMITS in ContactForm
3. Server-side (zod)      the real gate
4. Business rules         ownership, transition legality, uniqueness
5. Database constraints   @unique, foreign keys, NOT NULL  (the last line)
```

Layers 1 and 2 exist only for UX. `components/contact/ContactForm.tsx` says so:
*"Mirrors the server's own limits (app/contact/actions.ts) so the field stops the
visitor before the round trip, not after it."*

## 17.2 Zod in practice

```ts
// app/contact/actions.ts - bounded on every field
const contactSchema = z.object({
  name:    z.string().trim().min(1, "Please add your name.").max(120, "Name is too long (120 characters max)."),
  email:   z.string().trim().min(1).max(254).email("Enter a valid email address."),
  phone:   z.string().trim().max(32).optional().or(z.literal("")),
  city:    z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more - at least 10 characters.")
                          .max(4000, "Message is too long (4,000 characters max)."),
});
```

Every string has a maximum. That is not cosmetic: without it, a 50 MB `message` reaches
the database.

Errors are mapped to a per-field object so the form can highlight the right input:

```ts
const fieldErrors: ContactFieldErrors = {};
for (const issue of parsed.error.issues) {
  const key = issue.path[0] as keyof ContactFieldErrors;
  if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
}
```

**Allow-list validation for constrained values**, rather than trusting a select:

```ts
function toCategory(raw: FormDataEntryValue | null): string {
  const s = String(raw ?? "").trim();
  const match = (CONTACT_TOPICS as readonly string[]).find((t) => t.toLowerCase() === s.toLowerCase());
  return match ?? CONTACT_TOPICS[0];     // unknown value falls back, never passes through
}
```

## 17.3 Security measures, by category

### HTTP headers — `next.config.mjs`

| Header | Value | Protects against |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | MIME-type confusion |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Leaking full URLs to third parties |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self), fullscreen=(self)` | Unwanted feature access and FLoC |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Downgrade attacks — **production only** |
| `poweredByHeader: false` | — | Removes `X-Powered-By` |

The HSTS conditional carries its reason: *"Only enable HSTS in prod — sending it in
local dev bricks http://localhost."*

**Content-Security-Policy is not implemented.** The config says so honestly and states
why it was deferred: a strict CSP with nonces needs the styling refactored off inline
`style` attributes first, and *"Keeping the two changes in separate PRs keeps
blast-radius small if something regresses."*

### Authentication and session security

Covered in **Part 12**: bcrypt(10), 256-bit opaque tokens, httpOnly + sameSite=lax +
secure cookies, DB-backed revocable sessions, timing-safe user lookup, SHA-256-hashed
verification secrets, constant-time OTP comparison, conditional single-use claims.

### CSRF

No explicit CSRF token exists. What is relied upon instead:

* **`sameSite: "lax"` on the session cookie.** A cross-site POST does not carry it, so
  a forged form on another origin arrives unauthenticated.
* **Next.js Server Actions** post to opaque, build-generated action ids rather than
  guessable URLs, and Next.js performs its own origin checks on action requests.
* **`X-Frame-Options: DENY`** removes the framed-UI variant.

**Assessment:** adequate for this application's risk profile, and it is the framework's
intended posture. A dedicated token would be a defence-in-depth addition, not a
correction. Noted as an improvement opportunity, not a defect.

### Injection

| Vector | Status |
|---|---|
| SQL injection | Prisma parameterises everything. The three raw queries use tagged templates with `Prisma.sql` / `Prisma.join` — values are bound, not concatenated |
| XSS via article bodies | `sanitizeNewsHtml()` allow-list at render time |
| XSS via toasts | Admin toasts are plain text; the public toast takes a `ReactNode`, which React escapes |
| XSS via email | Every interpolated value passes through `escapeHtml` in `lib/email-templates.ts` |
| Open redirect | `safeNextPath()` on every `?next=`, applied again when a verification link is consumed |

### Race conditions and transactions

Detailed in **Part 10.6** and **Part 15**. Summary:

| Race | Guard |
|---|---|
| Overselling | `stock >= v.qty` inside the transaction, `RETURNING` count checked |
| Double order | `clientRequestId` read plus `@unique` constraint |
| Double email | Per-email timestamp columns |
| Token replay | `updateMany WHERE usedAt IS NULL`, `count !== 1` |
| Concurrent status edits | `updateMany WHERE id AND status = expected` |
| Concurrent login failures | `INSERT ... ON CONFLICT DO UPDATE` |
| Two default addresses | Unflag-then-set inside one transaction |

### Safe error handling

* Unknown errors: logged server-side, generic message returned.
* Prisma error codes mapped to written sentences (`P2002`, `P2003`, `P2025`, `P2028`).
* No stack trace or raw database message ever reaches a response body.

### Sensitive files and environment variables

* `.env`, `.env*.local`, `prisma/*.db*`, `public/uploads/`, `.vercel` are all
  git-ignored.
* `.env.example` documents every variable and contains no real value.
* `import "server-only"` prevents a secret-reading module from being bundled client-side.
* No secret is ever logged — verified in `lib/mail.ts`, `lib/cover-upload.ts`,
  `lib/verification.ts`, `lib/sms.ts`.

### API and cron protection

Bearer-token comparison, fail-closed in production, feature-flag gate. See **Part 13**.

### Email safety

Recipients are never taken from client input for admin-facing mail
(`CONTACT_NOTIFY_EMAIL`/`ORDER_NOTIFY_EMAIL` fall back to `ADMIN_EMAIL`).
Verification and welcome mail go only to the address stored on the account row.
`resolveFromAddress()` forces the `From:` header to match the authenticated SMTP user.
`verificationUrl()` refuses to build a link when the production origin is unset,
rather than emailing `http://localhost:3000`.

### File-upload safety

Covered in **Part 19**. The headline: **magic-number verification**, not just a MIME
check.

## 17.4 Security fixes visible in Git history

### A. IGPL sync endpoint — open in production, and secret-in-URL

*Commit `90b8b69`, "fix: harden order and IGPL sync security"*

**Problem.** `if (secret && auth !== ... && key !== secret)`. When `CRON_SECRET` was
unset, the whole condition was false and the endpoint was unauthenticated. Separately,
`?key=<secret>` was accepted.

**Risk.** A production deployment that forgot one env var exposed a database-touching
endpoint. And a secret in a query string lands in access logs, proxy logs and browser
history.

**Fix.** Return `500` in production when no secret is configured; drop the `?key=`
fallback entirely; accept only the `Authorization: Bearer` header.

**Why it works.** Missing configuration now fails closed instead of open, and the
credential travels only in a header that is not logged by default.

**Avoiding regression.** Never write `if (secret && ...)` as the only guard — always
handle "no secret configured" explicitly, and always fail closed in production.

### B. Idempotency lookup not scoped to the user

*Same commit.*

**Problem.** `prisma.order.findUnique({ where: { clientRequestId } })` in the
duplicate-race recovery path.

**Risk.** If a `clientRequestId` ever collided across accounts, the losing request
would be handed **another user's** order id and order number.

**Fix.** `findFirst({ where: { clientRequestId: requestId, userId: input.userId } })`.

**Why it works.** The lookup can now only return a row belonging to the caller.

**Avoiding regression.** Any query that resolves a user-scoped resource must carry the
`userId` in its `where`. The codebase enforces this by making `userId` a required
parameter of `getOrderById` and `getAddress`.

### C. Status updates could clobber a concurrent change

*Same commit.*

**Problem.** `prisma.order.update({ where: { id }, data: { status: next } })` — matched
on the primary key alone.

**Risk.** Two admins acting seconds apart: the second write silently overwrites the
first, with no indication. In `cancelOrderAndRestock`, two simultaneous cancels could
both restock, inflating inventory.

**Fix.** Compare-and-set with `updateMany({ where: { id, status: existing.status } })`
and a `count !== 1` check, in both `setOrderStatus` and `cancelOrderAndRestock`.

**Why it works.** The expected current value is part of the `WHERE`, so the write
applies only if nothing moved. The loser is told to reload.

**Avoiding regression.** For any state machine, put the expected current state in the
`WHERE` clause. `update()` is for writes where a lost update does not matter.

### D. No brute-force protection on login

*Commit `501d174`, "feat(auth): implement login rate limiting with email and IP tracking"*

**Problem.** `signIn` had no throttle.

**Risk.** Unlimited password guessing, and — because bcrypt is slow — a cheap
resource-exhaustion vector.

**Fix.** The `AuthRateLimit` model plus `lib/auth-rate-limit.ts`: 5 failures per email
and 10 per IP in a 15-minute window, 15-minute lockout, counters keyed by SHA-256 so
the table holds no raw address or IP, atomic `ON CONFLICT DO UPDATE`.

**Why it works.** The counter is in the database, so it survives restarts and is shared
across serverless instances; the upsert is atomic, so concurrent failures cannot lose
increments; and a blocked attempt returns the same message as a wrong password, so the
lockout does not confirm the address exists.

**Avoiding regression.** Rate-limit state must never live in module scope in a
serverless runtime — each instance would have its own copy.

### E. Unsanitised article HTML

*Same commit.*

**Problem.** `Post.bodyHtml` was rendered with `dangerouslySetInnerHTML` unsanitised.

**Risk.** Stored XSS. The editor is admin-only, which narrows it — but `bodyHtml` is a
database column, and a compromised admin account or any future import path would be
enough.

**Fix.** `sanitize-html` and `lib/news-html.ts`, applied at render time in
`app/news/[slug]/page.tsx`.

**Why it works.** An allow-list drops anything not named. `<script>`, event-handler
attributes and `javascript:` URLs cannot survive it. Applying it at *render* also
protects rows written before the fix.

**Avoiding regression.** Sanitise at render, not only at write. Existing rows and
future write paths are then both covered.

### F. Toast messages rendered as HTML

*Same commit.*

**Problem.** `store/toast.ts` held a raw HTML string.

**Fix.** It now holds a `ReactNode`; `AddToCartButton` and `QtyAddToCart` pass React
fragments. `store/admin-toast.ts` is a separate store rendering plain text, for the
reason quoted in **Part 16.7**.

**Why it works.** React escapes interpolated values by default. Removing the HTML path
removes the injection surface entirely.

### G. PII in server logs

*Visible as a comment in `app/contact/actions.ts`.*

**Problem.** `console.log("[contact]", {...})` on every submission wrote the entire
enquiry — name, email, phone, city, message — into server logs.

**Risk.** Logs are retained, aggregated and often accessible to more people than the
database. This is a data-protection exposure, not a bug.

**Fix.** Nothing logs submitted content. Failures log only a non-identifying
diagnostic.

**Avoiding regression.** When logging a failure, log *what failed*, never *what was
submitted*.

### H. Product saves silently wiping M5 columns

*Visible as a comment in `lib/db.ts` `updateProduct`.*

**Problem.** The pre-M5 admin form submitted seven fields. An unconditional update
reset `stock` to 0 and wiped `images`, `sku` and `weightGrams` on every save.

**Fix.** Conditional spreads — only touch a column the caller explicitly provided.

**Why it works.** `undefined` now means "leave untouched" and `null` means "clear",
and the two are distinguished.

### I. Transaction timeout on larger carts

*Visible as a comment in `lib/orders.ts`.*

**Problem.** One `updateMany` per cart line inside an interactive transaction. At
~290ms per round-trip against `us-east-2`, Prisma's 5000ms budget was exhausted at
about six cart lines, and `tx.order.create` then failed with P2028 "Transaction already
closed".

**Fix.** One `UPDATE ... FROM (VALUES ...) RETURNING` for any cart size.

**Why it works.** Round-trip count is constant. The semantics are unchanged: the same
`active AND stock >= qty` guard is applied per row by the database.

**Avoiding regression.** Adding another query inside that transaction re-opens the
budget problem. Keep the transaction to a constant number of round-trips.

### J. Unsupported financial claims in page copy

*Commit `197cb00`, "content: remove unsupported financial claims"*

Not a code vulnerability — a data-integrity fix, and it belongs in this list because
the project treats invented numbers as a defect class. Files changed:
`app/invest/page.tsx`, `app/vimtra-ventures/page.tsx`, `components/home/Sections.tsx`.

**Avoiding regression:** follow `CLAUDE.md` Part 7 — before redesigning any page, list
every number on it, name the source of each, and delete any that no source supports.

### K. A document exposed in `public/`

*Commit `90b8b69` also deleted* `public/assets/Tejeswara Chary Relieving Letter.pdf`.
Anything under `public/` is served to anyone who guesses the URL. Nothing personal or
internal belongs there.

---
---

# PART 18 — EMAIL SYSTEM

## 18.1 What Nodemailer and SMTP are

**SMTP** (Simple Mail Transfer Protocol) is how mail servers accept and relay
messages. **Nodemailer** is the Node.js client: you create a *transport* with the
server's host, port and credentials, then call `sendMail()`.

**Gmail App Password.** Google will not accept your normal account password over SMTP.
You enable 2-Step Verification, then generate a 16-character App Password at
`myaccount.google.com/apppasswords`. That string goes in `SMTP_PASSWORD` — in the
deployment environment, never in the repository.

## 18.2 Configuration

| Variable | Value / meaning |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` (implicit TLS) |
| `SMTP_SECURE` | `true` for port 465 |
| `SMTP_USER` | The Gmail address that sends |
| `SMTP_PASSWORD` | The App Password |
| `MAIL_FROM` | The `From:` address — normally identical to `SMTP_USER` |
| `CONTACT_NOTIFY_EMAIL` | Enquiry notifications. Falls back to `ADMIN_EMAIL` |
| `ORDER_NOTIFY_EMAIL` | COD order notifications. Falls back to `ADMIN_EMAIL` |

## 18.3 The gate

```ts
function isContactSmtpConfigured(): boolean {
  const host = (process.env.SMTP_HOST ?? "").trim();
  const user = (process.env.SMTP_USER ?? "").trim();
  const pass = process.env.SMTP_PASSWORD ?? "";
  const from = (process.env.MAIL_FROM ?? "").trim();
  return Boolean(host && user && pass && from);
}
```

All four, or nothing is sent. The comment: *"Gmail requires authentication — an
unauthenticated relay is not a supported mode here."*

**The behaviour without configuration is the important part:** sending is *skipped*.
Not attempted, not thrown. The caller receives
`{ sent: false, reason: "not-configured" }`, and `app/contact/actions.ts` treats that
as normal and still reports success — because the enquiry was already saved.

## 18.4 The transport

```ts
let cachedTransporter: Transporter | null = null;

function getContactTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;
  const port   = Number(process.env.SMTP_PORT ?? 465);
  const secure = (process.env.SMTP_SECURE ?? "true").trim().toLowerCase() !== "false";
  cachedTransporter = nodemailer.createTransport({
    host: (process.env.SMTP_HOST ?? "").trim(),
    port, secure,
    auth: { user: (process.env.SMTP_USER ?? "").trim(),
            pass: process.env.SMTP_PASSWORD ?? "" },
  });
  return cachedTransporter;
}
```

One per process, built lazily and only after the config check passes — *"never
constructed (and so never validated) when it isn't."*

## 18.5 The From: header guard

```ts
function resolveFromAddress(): string {
  const mailFrom = (process.env.MAIL_FROM ?? "").trim();
  const smtpUser = (process.env.SMTP_USER ?? "").trim();
  if (mailFrom && smtpUser && mailFrom !== smtpUser) {
    console.error("[mail] MAIL_FROM does not match SMTP_USER - Gmail may reject or rewrite the sender; using SMTP_USER.");
    return smtpUser;
  }
  return mailFrom || smtpUser;
}
```

Gmail only accepts a `From:` that is the authenticated account or a verified alias. A
mismatch is either rejected or silently rewritten. This function makes the failure
**loud in the log and harmless in practice** — and it logs the *fact* of the mismatch,
never the addresses.

## 18.6 The send path

```ts
async function sendMail(opts: SendMailOptions): Promise<MailResult> {
  if (!isContactSmtpConfigured()) return { sent: false, reason: "not-configured" };
  try {
    await getContactTransporter().sendMail({
      from: resolveFromAddress(),
      to: opts.to, subject: opts.subject,
      text: opts.text, html: opts.html, replyTo: opts.replyTo,
    });
    return { sent: true, provider: "smtp" };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown transport error.";
    console.error("[mail] send failed:", detail);
    return { sent: false, reason: "error", detail };
  }
}
```

**Never throws.** And what it logs is spelled out in the comment: *"only the
transport's own error message (e.g. 'Invalid login: 535-5.7.8 Username and Password not
accepted'), which Gmail's SMTP server itself never echoes the password back into."*

## 18.7 The senders

| Function | Recipient | Reply-To | Triggered from |
|---|---|---|---|
| `sendContactConfirmationToUser` | the enquirer | the franchise's own address | `submitContact` |
| `sendContactNotificationToAdmin` | `CONTACT_NOTIFY_EMAIL` or `ADMIN_EMAIL` | the enquirer | `submitContact` |
| `sendWelcomeEmail` | the new member | the franchise | `signUp` only — **never** `signIn` |
| `sendVerificationEmail` | the account's stored address | the franchise | `signUp`, profile resend, check-email resend/change, admin `sendVerificationLinkAction` |
| `sendCodOrderConfirmationToUser` | the buyer | the franchise | `placeOrderAction`, COD only |
| `sendCodOrderNotificationToAdmin` | `ORDER_NOTIFY_EMAIL` or `ADMIN_EMAIL` | the buyer | `placeOrderAction`, COD only |
| `sendOrderCancellationEmail` | the buyer | the franchise | `updateOrderStatusAction` on transition to CANCELLED |
| `sendOrderReceipt` | — | — | **Dormant stub. Both branches return `sent: false`. It never sends.** |

**The Reply-To asymmetry is deliberate.** On the confirmation, Reply-To is the
franchise, so a visitor who hits Reply reaches a real inbox. On the admin notification,
Reply-To is the enquirer, so replying from the franchise inbox goes straight back to
them.

## 18.8 Templates

`lib/email-templates.ts` — 744 lines of **pure functions**. Each returns
`{ subject, text, html }`. No I/O, no environment reads, no Prisma.

* Table-based HTML, for mail-client compatibility.
* Branded to the site tokens: ink `#0E0B0A`, crimson `#BD2227`, gold `#B8904B`, ivory
  `#F5EFE4`.
* **`escapeHtml()` on every interpolated value** — verified across the file: names,
  emails, categories, product names, prices and every address line.
* A hidden preview-text div, a shared `emailShell()`, and `nl2br()` (which escapes
  first, then converts newlines).
* Both a `text` and an `html` part on every message.

## 18.9 Verification-link construction

```ts
export function verificationUrl(token: string, next?: string): string {
  const sp = new URLSearchParams({ token });
  if (next && next.startsWith("/") && !next.startsWith("//")) sp.set("next", next);
  return `${getSiteOrigin()}/verify-email?${sp.toString()}`;
}
```

`getSiteOrigin()` (`lib/site-url.ts`) resolves `NEXT_PUBLIC_SITE_URL`, falls back to
`http://localhost:3000` **in development only**, tries Vercel's
`VERCEL_PROJECT_PRODUCTION_URL` in production with a loud warning, and otherwise throws
`SiteUrlError`. `sendVerificationEmail` catches that and **refuses to send**:

```ts
if (err instanceof SiteUrlError) {
  console.error("[mail] verification email NOT sent:", err.message);
  return { sent: false, reason: "error", detail: err.message };
}
```

The reasoning, from the file header: *"a verification link pointing at
http://localhost:3000 is a dead link in a real inbox, so this module never fabricates
one silently there."*

## 18.10 Failure handling — the rule

**Email never rolls back a database write.**

* `submitContact` — the row is saved first; both emails run under
  `Promise.allSettled`; the visitor sees success either way.
* `signUp` — the account exists before any mail is attempted. *"a mail failure must not
  fail signup or leave the person without an account."*
* `placeOrderAction` — *"The order row already exists at this point — nothing below can
  undo it, and nothing below is allowed to try."*
* `updateOrderStatusAction` — the cancellation and restock have already committed.

The one place where a failure **is** surfaced honestly is the verification resend,
because there the user is waiting for something to arrive:

```ts
if (mail.reason === "not-configured")
  return { ok: false, error: "Email is not configured on this deployment, so no message was sent." };
return { ok: false, error: "We could not send the verification email just now. Please try again shortly." };
```

Its comment: *"Say so plainly rather than claiming a delivery that did not happen."*

## 18.11 Deliverability

All messages are transactional: fixed subjects, no marketing copy, no external links,
no images, no tracking pixels. `CLAUDE.md` records this as a deliberate deliverability
choice.

## 18.12 To turn real delivery on

1. Enable 2-Step Verification on the sending Gmail account.
2. Generate an App Password.
3. In **Vercel project settings** (not `.env` in git), set `SMTP_USER`,
   `SMTP_PASSWORD`, `MAIL_FROM`, and optionally `CONTACT_NOTIFY_EMAIL` /
   `ORDER_NOTIFY_EMAIL`.
4. Leave `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` at their `.env.example` defaults.
5. Ensure `NEXT_PUBLIC_SITE_URL` is set, or verification links will not be sent at all.

Nothing else changes — the app sends whenever it sees a complete configuration.

---
---

# PART 19 — FILES / IMAGES / BLOB STORAGE

## 19.1 Three kinds of image

| Kind | Lives in | Managed by |
|---|---|---|
| Brand and editorial photography | `public/assets/`, `public/players/` | Committed to git |
| Admin uploads | Vercel Blob (prod) or `public/uploads/` (dev) | `lib/cover-upload.ts` |
| Remote product thumbnails | External hosts | Allow-listed in `next.config.mjs` |

## 19.2 Public assets

`public/` is served at the site root: `public/assets/logo-lion.png` becomes
`/assets/logo-lion.png`.

**Security lesson, recorded in history.** Commit `90b8b69` deleted
`public/assets/Tejeswara Chary Relieving Letter.pdf`. Everything in `public/` is
world-readable to anyone who knows or guesses the path — there is no access control.
Personal documents, internal PDFs and working files must never be placed there.

**Optimised derivatives.** `scripts/optimize-images.mjs` generates `-web` versions
(a 6–7 MB player portrait becomes roughly 160 KB). Rather than rewriting database rows,
the mapping is applied **at render time** by `lib/image-src.ts`:

```ts
const DERIVATIVES: Record<string, string> = {
  "/players/gaganjeet-bhullar.jpg": "/players/gaganjeet-bhullar-web.jpg",
  "/assets/prod-tshirt.png":        "/assets/prod-tshirt-web.jpg",
  // hero-golfer.png is a transparent cutout - it renders as an empty tile
  // under object-fit: cover, so any record still pointing at it is sent to
  // a real photograph instead.
  "/assets/hero-golfer.png":        "/assets/car-2-web.jpg",
  // ...
};

export function webSrc<T extends string | null | undefined>(src: T): T {
  if (!src) return src;
  return (DERIVATIVES[src] ?? src) as T;
}
```

The reasoning in the header is worth internalising: *"Rewriting every row would leave
admin-entered paths broken again the next time someone pastes an original filename, so
the mapping is applied at render time instead: any known original resolves to its
derivative, and anything unknown is returned untouched."*

## 19.3 The upload path

`lib/cover-upload.ts` is *the* image-storage mechanism — for news covers, media
coverage covers and product images alike. Its header states why there is only one:
*"so the Blob/local fallback rule lives in exactly one place."*

```ts
export const COVER_MAX_BYTES = 5 * 1024 * 1024;              // 5 MB
export const COVER_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export type UploadFolder = "news" | "media" | "products";
export class CoverUploadError extends Error {}
```

Validation order in `storeCoverImage()`:

1. Declared MIME type must be in the allow-list.
2. Size must be `<= 5 MB` and `> 0`.
3. Read the bytes and **detect the real format from its binary signature**.
4. The detected type must match the declared type.
5. Store.

```ts
export function detectImageType(bytes: Uint8Array): SupportedImageType | null {
  if (bytes.length >= 3 && hasPrefix(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (bytes.length >= 8 && hasPrefix(bytes, [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])) return "image/png";
  if (bytes.length >= 12 && ascii(bytes,0,4) === "RIFF" && ascii(bytes,8,4) === "WEBP") return "image/webp";
  if (isAvif(bytes)) return "image/avif";
  return null;
}
```

**Why steps 3 and 4 matter.** `File.type` is supplied by the browser and is trivially
forged. A PHP or HTML payload renamed `photo.jpg` with a declared type of `image/jpeg`
passes a MIME check and fails a magic-number check. `isAvif()` even handles both the
32-bit and extended 64-bit ISO-BMFF box sizes rather than assuming a fixed offset.

## 19.4 Storage branches

```ts
const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
if (token) {
  const blob = await put(`${folder}/${fileName}`, bytes, {
    access: "public", contentType: actualType, token, addRandomSuffix: false,
  });
  return blob.url;
}
if (requiresBlobStorage()) {       // NODE_ENV === "production" || VERCEL === "1"
  throw new CoverUploadError("Image storage is unavailable in this deployment. Configure Vercel Blob and try again.");
}
// local dev only
const dir = path.join(process.cwd(), "public", "uploads", folder);
await mkdir(dir, { recursive: true });
await writeFile(path.join(dir, fileName), bytes);
return `/uploads/${folder}/${fileName}`;
```

Three things to note:

* **Filenames are `randomUUID()` plus a mapped extension.** The user's filename is
  never used, so path traversal (`../../etc/passwd`) and filename collisions are both
  impossible by construction.
* **`contentType` is the *detected* type**, not the declared one — so the stored object
  is served with a header that matches its actual bytes.
* **Production refuses to fall back to disk.** The comment: *"on Vercel the filesystem
  is read-only and ephemeral, which is exactly why the Blob branch exists."* Failing
  loudly beats writing to a directory that disappears on the next deploy.

**The token never leaves the server.** It is read inside a `server-only` module, passed
to `put()`, and explicitly excluded from every error message.

## 19.5 Resolving the form's three fields

```ts
export async function resolveCoverImage(formData: FormData, folder: UploadFolder): Promise<string | null> {
  const file    = formData.get("coverFile");
  const remove  = String(formData.get("removeCover") ?? "") === "1";
  const current = String(formData.get("currentCover") ?? "").trim() || null;

  if (file instanceof File && file.size > 0) return storeCoverImage(file, folder);
  if (remove) return null;
  return current;
}
```

The comment records why it never returns `undefined`: *"Returning `undefined` would
mean 'leave untouched', but every path here resolves to an explicit value so the row
never silently keeps a cover the admin thought they removed."*

## 19.6 Rendering

`next.config.mjs`:

```js
images: {
  remotePatterns: [
    { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
    { protocol: "https", hostname: "images.unsplash.com" },
    // Vercel Blob - every store gets its own subdomain, hence the wildcard;
    // the path is left open because object names are random UUIDs under a
    // per-feature prefix.
    { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
  ],
  formats: ["image/avif", "image/webp"],
},
```

The allow-list is a security control: without it, `next/image` would proxy and cache
arbitrary remote URLs on your domain.

**Product image resolution** (`lib/products.ts`):

```ts
export function productImage(p: Pick<Product, "images" | "img">): string {
  if (p.images && p.images.length > 0) return webSrc(p.images[0]);
  return webSrc(p.img) || FALLBACK_LOGO;     // "/assets/logo-lion.png"
}
```

Priority: `images[0]`, then legacy `img`, then the franchise crest. All three
rendering surfaces (`/shop`, `/product/[id]`, `/cart`) must use it — that is a rule in
`CLAUDE.md`.

## 19.7 Body-size limit

```js
experimental: {
  serverActions: { bodySizeLimit: "6mb" },   // 5 MB file + multipart overhead
},
```

The application limit (5 MB) sits *inside* the transport limit (6 MB), so an
over-limit file produces the written `CoverUploadError` message rather than an opaque
413.

## 19.8 Security lessons, summarised

1. `public/` is public. Audit what is committed there.
2. Never trust a client-declared MIME type; verify the bytes.
3. Never use a client-supplied filename; generate one.
4. Serve with the *detected* content type.
5. Bound the size at both the application and transport layers.
6. Keep storage credentials inside `server-only` modules and out of every error path.
7. Allow-list remote image hosts.
8. Fail loudly when production storage is unavailable rather than writing somewhere
   ephemeral.

---
---

# PART 20 — GSAP + ANIMATION SYSTEM

## 20.1 Three animation systems, and when each is used

| System | Mechanism | Used for |
|---|---|---|
| `Reveal.tsx` | `IntersectionObserver` adds `.is-in`; CSS transitions do the work | Simple scroll fades on any element |
| `AeText.tsx` | Text split at render; `.is-in` toggles CSS | Display headings: word, mask or character stagger |
| GSAP (`motion/gsap.ts`) | JavaScript tweens plus ScrollTrigger | Choreographed, scroll-linked sequences |

## 20.2 GSAP from scratch

**What GSAP is.** A JavaScript animation library. You tell it a target, a set of
properties, and a duration; it interpolates every frame.

**`gsap.to(target, vars)`** animates *to* the given values.
**`gsap.from(target, vars)`** animates *from* them to the current state.
**`gsap.fromTo(target, fromVars, toVars)`** states both ends explicitly — and it is
what this project uses almost exclusively, because it is deterministic under React
re-renders.

**ScrollTrigger** is a plugin. Adding `scrollTrigger: { trigger, start, once }` to a
tween makes it fire when the trigger element reaches a scroll position.

**`start: "top 80%"`** reads as *"when the top of the trigger reaches 80% down the
viewport"*.

**`once: true`** means play once and never again.

**`scrub: 0.8`** ties progress to scroll position (used only for parallax here) with
0.8s of smoothing.

**`gsap.context(fn, scope)`** records every tween and ScrollTrigger created inside
`fn`; `ctx.revert()` undoes all of them. It is the React cleanup story.

## 20.3 The project's primitives

`components/motion/gsap.ts`. One registration point:

```ts
let registered = false;
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}
export const EASE = "power3.out";
```

| Primitive | What it does |
|---|---|
| `revealImage(target, {duration, from})` | Clip-path wipe, left or bottom |
| `revealLines(targets, {stagger, duration})` | Masked display lines slide up from behind their own baseline |
| `rise(targets, {y, stagger, duration})` | Soft rise plus fade — metadata, copy, CTAs |
| `riseOnScroll(targets, trigger, opts)` | `rise`, scroll-triggered, `once: true` |
| `revealLinesOnScroll(targets, trigger, opts)` | `revealLines`, scroll-triggered |
| `revealImageOnScroll(target, trigger, opts)` | `revealImage`, scroll-triggered |
| `countUp(el, to, suffix)` | Animates a numeral to its final value |
| `parallax(target, trigger, amount)` | Gentle scrubbed depth. *"Small amounts only — depth, not sliding."* |

### A detail worth copying — clearing the clip

```ts
return gsap.fromTo(target,
  { clipPath: o.from === "bottom" ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)" },
  { clipPath: "inset(0% 0% 0% 0%)", duration: o.duration ?? 1.1, ease: EASE,
    clearProps: "clipPath" });
```

The comment explains `clearProps`:

> The clip is cleared on completion rather than left sitting at
> `inset(0% 0% 0% 0%)`. A clip-path clips everything the element paints, box-shadow
> included — so a figure that had been revealed this way could never show a shadow,
> even though the clip was a no-op by then.

## 20.4 Reduced motion

```ts
export function reduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
```

**Every primitive checks it and returns early.** No tween is created at all — the
element simply sits in its final state.

`countUp` is the instructive case: instead of skipping, it writes the final value
immediately, so the number is still correct:

```ts
export function countUp(el: HTMLElement, to: number, suffix = "") {
  if (reduced()) { el.textContent = `${to}${suffix}`; return; }
  // ...
}
```

The module header states the invariant that makes all of this safe:

> Content is never hidden by CSS alone — the "from" state is always set by GSAP — so if
> JS fails the page still renders completely.

That is the right architecture. If you animate *from* `opacity: 0` set in CSS and the
JavaScript never runs, your content is invisible. Here it cannot be.

The same discipline appears in `globals.css`:

```css
/* Masked line of display type. GSAP animates the inner span; if JS never
   runs the span simply sits at rest, so content is never hidden by CSS. */
.mq-line { display: block; overflow: hidden; /* ... */ }
```

## 20.5 Cleanup

```tsx
useEffect(() => {
  registerGsap();
  const el = root.current;
  if (!el) return;
  const ctx = gsap.context(() => { /* create tweens */ }, el);
  return () => ctx.revert();
}, [withImage]);
```

**Why this matters in React.** Without `ctx.revert()`, every remount (hot reload,
client navigation back to the page, Strict Mode's double-invoke in development) would
create another set of ScrollTriggers on the same elements. They accumulate, fight each
other, and eventually degrade scroll performance.

## 20.6 The opt-in data-attribute architecture

Sections do not import animation components. They mark elements:

| Attribute | Effect |
|---|---|
| `data-rise` | Included in the section's `riseOnScroll` batch |
| `data-line` | Its inner `<span>` joins the masked-line reveal |
| `data-fig` | Image clip-path reveal |
| `data-bleed` | Parallax |
| `data-count="2026"` | Number counts up |

and one hook wires them:

```tsx
if (el.querySelector("[data-rise]")) riseOnScroll("[data-rise]", el, { y: 22, stagger: 0.08 });
```

**This is why the animation cleanup was a one-line-per-element change.** No components
were rewritten; attributes were removed.

## 20.7 The P1-4 animation consistency work

*Commit `c0fb931`, "refactor: streamline page animations", 18 September 2026.*

**Scope:** 9 files, 131 insertions, 133 deletions.

| File | +/- |
|---|---|
| `app/fixtures/page.tsx` | 20 |
| `app/golf-development/page.tsx` | 31 |
| `app/invest/page.tsx` | 52 |
| `app/the-club/page.tsx` | 6 |
| `app/the-pride/page.tsx` | 16 |
| `app/vimtra-ventures/page.tsx` | 32 |
| `components/home/Sections.tsx` | 48 |
| `components/news/DayInTheDen.tsx` | 37 |
| `components/news/OfficialNews.tsx` | 22 |

**What changed.** `data-rise` attributes were removed from supporting elements —
eyebrows, body paragraphs, text links, list items — while being retained on the
element that leads each section. From the diff:

```diff
-          <p className="hp-index" data-rise>
+          <p className="hp-index">
             03 <span>The Season</span>
           </p>
```

```diff
-            <li key={f.slug} data-rise>
+            <li key={f.slug}>
```

**Why.** Because reveals were applied per element, a section could stagger eight or ten
separate items. The effect was that ordinary body copy animated in as though it were a
headline, and content on a fast scroll appeared piecemeal. Consolidating to
**group-level reveals** means the section arrives as one composed moment.

**What was intentionally preserved.** Looking at the retained attributes in
`components/home/Sections.tsx` after the change:

* `data-rise` on the section's lead element (`hp-index` on Statement, the `h2`).
* `data-line` masked-line reveals on display headings — untouched.
* `data-count` numerals — untouched.
* `data-fig` image reveals and `data-bleed` parallax — untouched.
* Every `reduced()` guard and every `prefers-reduced-motion` block — untouched.

**On performance claims.** The commit message is `refactor: streamline page
animations`. It makes no performance claim, and neither the commit nor any file
comment describes a bug. **The repository does not record this as a bug fix, and it is
not presented as one here.** It was a consistency and composition change. Any claim
about measured frame rates or production verification would be an invention — not
confirmed from the repository.

## 20.8 The CSS-driven systems

**`Reveal.tsx`** — one `IntersectionObserver` per element, `threshold: 0.18`,
`rootMargin: "0px 0px -60px 0px"` (so an element must be 60px into the viewport), an
optional delay, then `.is-in`. It unobserves after firing. It also degrades: if
`IntersectionObserver` is unavailable, it sets `inView` immediately.

**`AeText.tsx`** — splits the text **at render**, not in an effect:

```tsx
inner = [...text].map((c, i) => (
  <span key={i} className="ae-char" style={{ transitionDelay: `${i * 35}ms` }}>
    {c === " " ? " " : c}
  </span>
));
```

Splitting up front is what keeps the SSR markup identical to the client markup — a
post-mount DOM split would cause a hydration mismatch.

## 20.9 Adding an animation

1. Decide which system fits: `Reveal` for a simple fade; `AeText` for display type;
   GSAP for choreography.
2. For GSAP, **reuse a primitive** from `motion/gsap.ts`. Add a new one there only if
   the motion language genuinely needs it — the file exists to stop the codebase
   accumulating one-off tweens.
3. Mark elements with data attributes; let the section hook wire them.
4. Confirm the `reduced()` guard applies.
5. Never set the "from" state in CSS. GSAP sets it, so a JS failure leaves content
   visible.
6. Confirm cleanup: `gsap.context` plus `ctx.revert()`.
7. Test with **Reduce motion** enabled in your OS settings.

---
---

# PART 21 — ACCESSIBILITY

## 21.1 Semantic structure

`app/layout.tsx`:

```tsx
<a href="#main-content" className="gs-skip-link">Skip to main content</a>
<PublicChrome><Loader /><Nav user={user} /></PublicChrome>
<main id="main-content" tabIndex={-1}>{children}</main>
<PublicChrome><Footer /><ScrollToTop /></PublicChrome>
```

The `tabIndex={-1}` is the part people forget. Without it, activating the skip link
moves the *scroll* but not the *focus*, so the next Tab continues from the nav. With
it, focus genuinely lands in the main region.

The skip link is hidden until focused (`.gs-skip-link` in `globals.css`) and has a
44px minimum height.

Pages use landmarks throughout — `<section aria-label="Catalogue">`,
`<section aria-labelledby="st-h">` pointing at the section's own `h2`, `<ol>`/`<li>`
for the fixture calendar.

## 21.2 Labels, `htmlFor` and IDs

*Commit `aea5582`, "fix: improve customer form accessibility", 16 September 2026.*

**Before**
```tsx
<div className="field">
  <label>Email</label>
  <input type="email" name="email" required autoComplete="username" />
</div>
```

**After**
```tsx
<div className="field">
  <label htmlFor="sign-in-email">Email</label>
  <input id="sign-in-email" type="email" name="email" required autoComplete="username" />
</div>
```

A `<label>` with no `htmlFor` and no wrapped input is, to a screen reader, just text
near a box. The input is announced as "edit, blank".

Files changed: `app/(auth)/sign-in/page.tsx`, `app/(auth)/sign-up/page.tsx`,
`components/contact/ContactForm.tsx`, `components/profile/PasswordField.tsx`,
`components/shop/CheckoutFlow.tsx` (the largest share, 54 lines).

`PasswordField` had to take an `id` prop so the page could wire `htmlFor` to the real
input inside it — a small API change with a real accessibility payoff.

## 21.3 ARIA

### Error announcement

```tsx
// app/(auth)/sign-in/page.tsx - from the same commit
{error && (
  <div role="alert" className="...">{ERRORS[error] ?? "Could not sign you in."}</div>
)}
```

`role="alert"` carries an implicit `aria-live="assertive"`, so the message is announced
as soon as it appears.

```tsx
// app/error.tsx
<div role="alert" aria-live="assertive"> ... </div>
```

### Status announcement

```tsx
// app/loading.tsx
<div role="status" aria-live="polite"> ... </div>
```

```tsx
// components/contact/ContactForm.tsx - the success panel
<div ref={okRef} className="hp-panel cf-success" role="status">
```

`polite` waits for a pause; `assertive` interrupts. Loading is polite; errors are
assertive. That is the correct pairing.

### A corrected ARIA pattern

Also from `aea5582`:

```diff
-<div className="flex gap-2 flex-wrap mb-[22px]" role="tablist" aria-label="Enquiry topic">
+<div className="flex gap-2 flex-wrap mb-[22px]" role="group" aria-label="Enquiry topic">
   {CONTACT_TOPICS.map((t) => (
     <button
       type="button"
-      role="tab"
-      aria-selected={topic === t}
+      aria-pressed={topic === t}
```

This is a genuinely instructive fix. `role="tablist"` / `role="tab"` promises a
specific interaction contract: arrow-key navigation between tabs, and each tab
controlling a `tabpanel` via `aria-controls`. Neither existed here — these are toggle
buttons that set a form value. `role="group"` plus `aria-pressed` describes what the
control actually is, so assistive technology's expectations match the behaviour.

**The lesson:** an ARIA role is a promise about behaviour. Do not use a role whose
contract you have not implemented.

### Decorative icons

`aria-hidden` throughout, so icon glyphs are not announced:

```tsx
<AlertTriangle className="h-6 w-6" aria-hidden />
<span className="hp-arrow" aria-hidden>→</span>
```

### Labelled icon buttons

```tsx
<button onClick={scrollToTop} className="scroll-to-top" aria-label="Scroll to top" type="button">
  <ArrowUp aria-hidden />
</button>
```

The icon is hidden from the accessibility tree and the button carries the name — the
correct pairing.

## 21.4 Focus management

* `app/error.tsx` focuses its heading on mount (`ref` plus `tabIndex={-1}`).
* `<main id="main-content" tabIndex={-1}>` receives focus from the skip link.
* `.gs-skip-link:focus` / `:focus-visible` make the link visible.
* Buttons and links use native elements throughout, so they are keyboard-operable by
  default.

## 21.5 Forms

| Practice | Where |
|---|---|
| Explicit `htmlFor` / `id` | All customer-facing forms (post-`aea5582`) |
| `type="email"` / `type="tel"` | Sign-in, contact, checkout |
| `autoComplete="username"` / `"current-password"` / `"new-password"` | Auth forms — lets password managers work |
| `required` | Where the server also requires it |
| `maxLength` mirroring server limits | `ContactForm` via its `LIMITS` constant |
| Per-field error messages | `ContactResult.fieldErrors` |
| Duplicate-submit guard | `inFlightRef` in `ContactForm` |
| Type buttons explicitly | `type="button"` on non-submitting buttons |

## 21.6 Alt text

`next/image` requires `alt`. The project's practice is that decorative imagery gets
`alt=""` (or `aria-hidden` on the wrapper) and meaningful imagery gets a description.

Commit `7196592` (`refactor(players): update hero photograph description...`) was
partly about exactly this.

## 21.7 Motion

Covered in **Part 20.4**: 22 `prefers-reduced-motion` blocks in `globals.css`, 5 in
`admin.css`, and a `reduced()` early return in every GSAP primitive.

## 21.8 Colour contrast

Two commits in the record:

* **`06c5db2`** — *"fix: improve gold contrast on light surfaces"*, which introduced
  `--v-gold-on-light: #7a5c24` for gold **text** on ivory, leaving `--v-gold` as the
  brand gold for gold on ink.
* The `--gs-text-secondary: #5f574f` token carries the comment *"WCAG AA normal on
  cream"*.

Contrast is treated as a token-level decision rather than a per-component judgement —
which is what the `--v-on-ink` / `--v-on-ivory` text-role tokens are for.

## 21.9 What is not confirmed from the repository

* No automated accessibility testing (no axe, no Lighthouse CI, no pa11y config).
* No recorded screen-reader testing pass.
* No documented WCAG conformance level claim.

The accessibility work visible here is real and deliberate, but it is developer-applied
rather than audited. Treat a formal audit as outstanding.

---
---

# PART 22 — SEO

## 22.1 One origin, one source of truth

`app/robots.ts` resolves and **exports** the origin:

```ts
export const SITE_URL = getSiteOrigin({ strict: false });
```

`app/layout.tsx` imports it rather than re-deriving it, and its comment says why:

> `app/robots.ts` already derives it from NEXT_PUBLIC_SITE_URL (with a localhost dev
> fallback) and uses it for the sitemap URL, so it is imported rather than re-declared
> — two fallbacks that disagree would emit canonicals pointing at a different host than
> the sitemap advertises.

`app/sitemap.ts` imports the same constant. Three surfaces, one value.

## 22.2 How the production URL is resolved

`lib/site-url.ts`:

```
NEXT_PUBLIC_SITE_URL set?            -> use it (trailing slash stripped)
       |
       v  no
Not production?                      -> http://localhost:3000
       |
       v  production
VERCEL_PROJECT_PRODUCTION_URL set?   -> https://<that host>, with a console.error
       |
       v  no
strict ?  -> throw SiteUrlError      -> callers refuse to send a dead link
          -> otherwise localhost, with a console.error
```

`strict` defaults to `true`. `robots.ts` passes `strict: false` because a sitemap host
is informational and a missing variable should log rather than crash the site.
`verificationUrl()` uses the strict default, because emailing a link to
`http://localhost:3000` is worse than not sending at all.

## 22.3 `metadataBase`

```tsx
metadataBase: new URL(SITE_URL),
```

This is what makes every relative URL in the metadata resolve to an absolute address —
the Open Graph image and each page's `alternates.canonical`. Without it, Next.js emits
relative social URLs that crawlers cannot follow, and logs a build-time warning.

## 22.4 Titles and descriptions

```tsx
title: {
  default:  "Vimtra Chennai Lions GC - AM Green IGPL - Season 2026",
  template: "%s - Vimtra Chennai Lions GC",
},
description: "Chennai's franchise in the AM Green Indian Golf Premier League. Owned by Vimtra Ventures. A team built for the long game.",
applicationName: "Vimtra Chennai Lions GC",
icons: { icon: "/assets/logo-lion.png" },
```

A page then sets only its own name:

```tsx
// app/shop/page.tsx
export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: "Shop",
  description: "Official Chennai Lions merchandise. Match-day kit, performance apparel, and tour-tested accessories - ship anywhere in India.",
};
```

The rendered title becomes `Shop - Vimtra Chennai Lions GC`. Change the suffix once,
in the layout, and every page follows.

## 22.5 Canonical URLs

`alternates: { canonical: "/<path>" }` on each public page — resolved absolute by
`metadataBase`. Verified on `/fixtures`, `/scores`, `/leaderboards`, `/shop` and the
other editorial routes.

## 22.6 Open Graph and Twitter

```tsx
openGraph: {
  type: "website",
  siteName: SITE_NAME,
  locale: "en_IN",
  images: [{ url: "/assets/logo-full.png", alt: "Vimtra Chennai Lions GC crest" }],
},
twitter: { card: "summary_large_image", images: ["/assets/logo-full.png"] },
```

And the deliberate omission, quoted directly from the file:

> Deliberately NO `title`, `description` or `url` in these two objects. Next.js falls
> back to each page's own resolved title/description/canonical when they are absent —
> declaring them here instead pins every page's social card to the home page's wording,
> which is what a link to /invest or /players would then show. Only the genuinely
> site-wide parts (type, site name, locale, card style, fallback image) belong at this
> level.

`app/news/[slug]/page.tsx` overrides them locally so an article gets its own card.

## 22.7 Robots

```ts
rules: [{
  userAgent: "*",
  allow: "/",
  disallow: ["/admin", "/admin/", "/api/", "/sign-in", "/sign-up",
             "/profile", "/cart", "/checkout", "/orders", "/orders/"],
}],
sitemap: `${SITE_URL}/sitemap.xml`,
host: SITE_URL,
```

Every disallowed path is *"either authenticated, an internal API, or non-content."*

Belt and braces: authenticated and transactional pages **also** set page-level
`robots: { index: false, follow: false }` — `app/admin/layout.tsx`,
`app/cart/layout.tsx`, `app/checkout/page.tsx`, `app/orders/[id]/page.tsx`. `robots.txt`
is a request; the meta tag is what actually keeps a page out of an index if it is
reached another way.

## 22.8 Sitemap

Sixteen static routes with hand-set `changeFrequency` and `priority`, plus two dynamic
sets:

```ts
let productEntries: MetadataRoute.Sitemap = [];
try {
  const products = await listProducts();
  productEntries = products.map((p) => ({ url: `${SITE_URL}/product/${p.id}`, /* ... */ }));
} catch {
  // If the DB is not reachable at build time (e.g. first deploy before the
  // migration has run) omit product URLs rather than fail the whole sitemap.
  productEntries = [];
}
```

The same shape for published posts. Two independent `try/catch` blocks, so one failure
does not take out the other set or the static routes.

`listPublishedPosts()` — not `listPosts()` — so *"Drafts and Archived posts must never
enter the sitemap (or any public surface)."*

Priorities reflect real editorial intent: `/` at 1.0, `/shop` at 0.9,
`/fixtures` / `/news` / `/players` / `/the-club` / `/golf-development` at 0.8,
`/privacy` and `/terms` at 0.2. `changeFrequency` for `/scores` is `hourly`, for
`/leaderboards` `daily`.

## 22.9 Structured data

**Not implemented.** There is no JSON-LD anywhere in the repository — no `Product`,
`Organization`, `BreadcrumbList` or `SportsEvent` schema. This is an improvement
opportunity, not a defect; see **Part 35**.

---
---

# PART 23 — RESPONSIVE DESIGN

## 23.1 Two responsive systems

Matching the two styling systems:

* **Tailwind prefixes** (`sm:`, `md:`, `lg:`) in markup, for layout switches.
* **Media queries** in `globals.css`, for the design system.

## 23.2 Breakpoints actually in use

Tailwind's defaults: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.

In `globals.css`, counted:

| Query | Count | Role |
|---|---|---|
| `min-width: 1024px` | 118 | The main desktop switch |
| `min-width: 768px` | 103 | Tablet and up |
| `min-width: 900px` | 27 | An intermediate step |
| `min-width: 1280px` | 18 | Large desktop |
| `min-width: 640px` | 15 | Large phone |
| `min-width: 1440px` / `1600px` | 4 / 4 | Very wide displays |
| `max-width: 767px` | 8 | Phone-only overrides |
| `max-width: 640px` / `639px` | 4 / 3 | Small-phone overrides |
| others (`1023`, `899`, `760`, `699`, `520`, `519`, `480`) | 1–3 each | Targeted fixes |

**The dominant direction is mobile-first** (`min-width`, 289 occurrences versus about
28 `max-width`). Base styles are the phone layout; each `min-width` block adds
desktop capability.

## 23.3 Layout patterns

**Grid that collapses:**

```tsx
// components/shop/CheckoutFlow.tsx
<div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
```

One column on phones; at `lg` it becomes form-plus-summary in a 1.4:1 split.

**The shared container.** Every public page wraps content in `.hp-wrap` — 1360px
max-width with 22px / 40px gutters (documented in the `Nav.tsx` comment). The header
uses the same class, which is why the logo shares a left edge with each page's eyebrow,
heading and footer brand.

**Responsive spacing and type:**

```tsx
// app/loading.tsx
className="... px-6 py-5 ... md:px-8"
className="h-5 w-5 ... md:h-6 md:w-6"
className="text-sm ... md:text-base"
```

```tsx
// app/error.tsx
className="text-3xl ... md:text-5xl"
className="p-6 ... md:p-10"
```

**Editorial columns.** The `cm-track` 4 / 8 / 12 grid described in
`components/home/Sections.tsx` — one alignment system across the site, so no column is
left as an empty field.

## 23.4 Overflow prevention

```css
body {
  /* ... */
  overflow-x: hidden;
}
```

A global guard. Full-bleed sections, marquees and oversized display type can otherwise
each create a horizontal scrollbar on a narrow screen.

Individual patterns also guard themselves:

```css
.mq-line > span {
  display: block;
  white-space: nowrap;
  /* The mask needs overflow:hidden for the vertical reveal, which also clips
     horizontally. Guard against that: a line that cannot fit its column ... */
}
```

## 23.5 Typography

`max-width: prose` (720px) in the Tailwind config, plus `ch`-based measures in markup:

```tsx
className="mt-4 max-w-[52ch] font-[family:var(--font-manrope)] text-base leading-7 ..."
```

A `ch` measure caps the line at roughly 52 characters regardless of font size, which is
the right unit for readability.

## 23.6 Touch targets

```css
.gs-skip-link { min-height: 44px; display: inline-flex; align-items: center; }
```

44px is the standard minimum. Buttons throughout use generous padding
(`px-5 py-3` on the error page's actions) which lands in the same territory.

## 23.7 Images

`next/image` throughout, with `formats: ["image/avif", "image/webp"]` in
`next.config.mjs`, so a modern phone receives AVIF and everything else falls back.
Combined with `lib/image-src.ts`'s derivative mapping, a phone is not downloading a
7 MB master photograph.

## 23.8 Header behaviour

`FLOATING_HEADER_ROUTES` in `lib/nav.ts` decides whether the header floats over a
full-bleed hero. The hero itself reserves header height as top padding (`.cm-hero` /
`.hero` in `globals.css`), so *"nothing is ever covered"* — a detail that matters most
on a phone, where the header occupies a larger share of the viewport.

---
---

# PART 24 — PERFORMANCE

## 24.1 Current implementation

### Server Components

The largest win, and it is structural. Pages fetch on the server, so there is no
client-side fetch waterfall, no loading spinner for data, and no serialised query
library in the bundle.

```tsx
// app/page.tsx - three queries, in parallel, on the server
const [fixtures, coverage, products] = await Promise.all([...]);
```

### Client-component discipline

64 of the project’s files opt into the client. The boundary is pushed to the
interactive leaf: `app/shop/page.tsx` is server, `ShopBrowser` is client. TipTap —
easily the heaviest dependency — is imported only by `components/admin/PostEditor.tsx`,
so it is never in a public-page bundle. The `PostEditor` comment says so explicitly:
*"public /news and /news/[slug] stay editor-free."*

Similarly, `Post.bodyHtml` is pre-rendered at save time so the article page renders
HTML rather than loading an editor to interpret JSON.

### Rendering strategy

33 files declare `force-dynamic` (31 pages, the admin layout, the API route), each with a
stated reason. The remaining routes —
editorial pages with no database access — are prerendered.

### Database queries

| Technique | Where |
|---|---|
| Parallel reads | `Promise.all` in `app/page.tsx`, `app/leaderboards/page.tsx`, `getAdminBadges`, `searchOrdersForAdmin` |
| `select` projections | `getPendingUser`, `peekEmailVerificationToken`, admin user lookups |
| Joins instead of N+1 | `searchOrdersForAdmin` includes the buyer in one query |
| Indexes | `@@index` on `Session.userId`, `Score.fixtureId`, `Order.(userId, createdAt)`, `Order.(status, paymentStatus)`, `Post.(status, publishedAt)`, `MediaCoverage` three-way indexes, `ContactMessage.(status, createdAt)` |
| Bounded pagination | `pageSize` clamped to 100 |
| Round-trip minimisation | The single-statement stock decrement and restock |

One place where the project accepts a per-row query, with the reasoning written down —
`app/scores/page.tsx`:

> One read per fixture. Four rows today; the page is force-dynamic and these are
> indexed lookups on fixtureId.

And it is caught **per fixture** rather than with a bare `Promise.all`, so one failing
read does not blank the page.

### Connection management

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ /* ... */ });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Without the `globalThis` cache, every hot reload in development would create a new
client and a new pool, and you would exhaust connections within minutes.

In production, `DATABASE_URL` points at Neon's **pooler**, which is what makes
serverless concurrency viable.

### Images

`next/image` everywhere, AVIF/WebP negotiation, remote host allow-list, and the
render-time derivative mapping in `lib/image-src.ts` (6–7 MB portraits down to roughly
160 KB).

### Fonts

```tsx
const sora = Sora({ subsets: ["latin"], weight: [...], variable: "--font-sora", display: "swap" });
```

`next/font/google` **self-hosts** the font files at build time. No request to
`fonts.googleapis.com`, no extra DNS lookup and TLS handshake, and no layout shift —
the layout comment calls it *"Self-hosted, CLS-free font loading."*

Only the weights actually used are loaded: Sora 400–800, Manrope 400–700, Fraunces
400/500 with an italic style.

### Animation

Every GSAP primitive no-ops under reduced motion. `gsap.context` cleanup prevents
ScrollTrigger accumulation. `Reveal` unobserves each element after it fires, so
observers do not persist for the life of the page. `parallax` uses `scrub: 0.8`
smoothing rather than a per-frame layout-thrashing handler.

### CSS

One stylesheet for the public site (14,567 lines) and a separate one imported only by
the admin layout. Tailwind's `content` globs remove unused utilities at build time.

### Caching

`revalidatePath` after every write, so a cached page is dropped the moment its data
changes.

## 24.2 Potential future optimisation

Listed as opportunities only. **Nothing was changed.**

| Opportunity | Note |
|---|---|
| Split `globals.css` | 14,567 lines are sent to every visitor, including page-specific rules they will never use. Route-scoped stylesheets — the pattern `admin.css` already demonstrates — would trim it |
| Time-based revalidation | Some `force-dynamic` routes (`/fixtures`, `/shop`) could use `revalidate` with a short window instead of rendering per request, since `revalidatePath` already handles admin edits |
| `generateStaticParams` | `/product/[id]` and `/news/[slug]` could prerender known ids |
| Streaming with Suspense | Route-scoped `loading.tsx` plus `<Suspense>` boundaries would let a hero paint before the database resolves |
| Reduce `force-dynamic` breadth | A few routes may not need per-request rendering |
| Image `sizes` attributes | Worth auditing across the site so `next/image` picks tighter candidates on phones |
| Index review | `Standing` has no `@@index` beyond its `@@unique`; volume is low today |
| Bundle analysis | `@next/bundle-analyzer` is not installed; no measurement exists |

**No performance measurement exists in this repository** — no Lighthouse report, no
Web Vitals reporting, no bundle analysis, no load test. Everything above is reasoning
from the code, not from data.

---
---

# PART 25 — ERROR HANDLING

## 25.1 The layers

```
1. Loading state      app/loading.tsx  (root scope, inherited by every route)
2. Error boundary     app/error.tsx    (root scope)
3. Not found          app/not-found.tsx + notFound()
4. Route-level catch  .catch(() => []) on specific pages
5. Action results     typed { ok: false, ... } instead of throwing
6. Data-layer catch   try/catch returning null / undefined / an outcome string
7. Best-effort side effects  Promise.allSettled, never allowed to roll back
```

## 25.2 Loading

`app/loading.tsx` — a single root-level Suspense fallback with `role="status"` and
`aria-live="polite"`. There are no route-scoped loading files, so every route inherits
this one.

## 25.3 Error boundary

`app/error.tsx` — a Client Component receiving `{ error, reset }`. It renders
`role="alert"` / `aria-live="assertive"`, focuses its heading on mount, and offers two
recoveries: **Try again** (`reset()`) and **Back to home**.

It does **not** render `error.message` or `error.digest`. Those can leak internals.

## 25.4 Not found

`app/not-found.tsx`, reached via `notFound()` in `app/product/[id]`,
`app/news/[slug]` and `app/orders/[id]`. In the last two, 404 is also an information-
disclosure decision — see **Part 15.12**.

## 25.5 Route-level database fallbacks

*Commit `d027188`, "fix(fixtures, scores, shop): handle transient database failures
gracefully", 18 September 2026. Three files, 32 insertions, 4 deletions.*

### Why these exist

A `force-dynamic` page runs its query on every request. If the database is briefly
unreachable — a Neon cold start, a pool blip, a network hiccup — the query throws, the
error propagates, and the visitor gets a 500. For a marketing site, that is the worst
possible failure mode: the whole page disappears because one section's data did not
arrive.

### What they do

**`/shop`**

```ts
const products = await listProducts().catch(() => []);
const hasAnything = products.length > 0;
```

The comment is careful about exactly what the fallback can and cannot do:

> A transient database failure falls back to no rows, which routes into the catalogue's
> existing "between drops" empty state below rather than a 500. **Critically this
> cannot fabricate a catalogue:** the fallback is an empty list, so no product, price
> or stock figure is ever shown that did not come from the database. `lowestPrice`
> becomes null and the hero drops its "From" cell, exactly as it does for a genuinely
> empty catalogue.

**What the visitor sees:** the shop hero with real-but-zero counts, and the
`EmptyState` — *"The Chennai Lions store is between drops."* — with a contact link.

**`/fixtures`**

```ts
const fixtures = await listFixtures().catch(() => []);
```

**What the visitor sees:** the page and its hero, with the calendar's own empty state.
The two brochure-sourced constants (`SEASON_EVENTS`, `SEASON_FRANCHISES`) still render,
because they are not database values.

**`/scores`** — the most carefully built of the three:

```ts
// No card list rather than a 500 if the database is briefly unreachable.
const fixtures = await listFixtures().catch(() => []);

// Caught PER FIXTURE, deliberately: a bare Promise.all rejects the whole
// [batch if any single read fails]
```

**What the visitor sees:** the masthead reporting *"Scoring offline"* with Events 0 /
Live 0 — which the comment describes as *"the same honest position an empty Fixture
table produces"* — and `ScoreExperience` rendering nothing.

The per-fixture catch is the detail to copy. `Promise.all` rejects as soon as any
promise rejects, so one failed score read would blank every board. Catching each read
individually means three fixtures still show their boards while the fourth shows its
unlit state.

### Why this design is right for *this* project

It satisfies two constraints at once:

1. **Availability.** The page renders.
2. **Data integrity.** The fallback is an *empty* list. It cannot invent a product, a
   price, a fixture or a score. Every downstream count becomes a real zero, and the
   existing empty states — the same ones a genuinely empty table produces — take over.

A fallback that substituted cached or hard-coded rows would violate `CLAUDE.md`'s
first rule. A fallback that returns nothing cannot.

### Where the pattern is deliberately *not* applied

`app/leaderboards/page.tsx` has **no** `.catch()`:

```ts
const [boards, fixtures] = await Promise.all([listStandings(SEASON), listFixtures()]);
```

A database failure here produces the error boundary rather than an empty board. Whether
that is intentional or simply not yet extended is **not recorded in the repository**.
If you extend the pattern, `/leaderboards` is the obvious next candidate — and its
empty state is already written, which makes it a small change.

Elsewhere the pattern *is* applied: `app/page.tsx` catches all three of its queries;
`app/sitemap.ts` catches each of its two dynamic sets; `app/admin/layout.tsx` catches
its badge query.

## 25.6 Data-layer error handling

```ts
// lib/fixtures.ts, lib/scores.ts, lib/standings.ts - "not found or failed" collapse to null
export async function updateFixture(id: string, input: Partial<FixtureInput>): Promise<Fixture | null> {
  try { return await prisma.fixture.update({ where: { id }, data: input }); }
  catch { return null; }
}
```

```ts
// lib/db.ts - a richer outcome, because the caller needs to say something different per case
export type DeleteProductOutcome = "deleted" | "missing" | "referenced" | "error";
```

```ts
// lib/auth.ts - a DB failure is treated as "logged out", never as an exception
export async function getPendingUser(): Promise<SafeUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try { /* ... */ } catch { return null; }
}
```

That last one matters: it means a database blip signs people out rather than 500-ing
every page on the site, including the ones that do not need a user at all.

## 25.7 Never-throw side effects

```ts
// lib/orders.ts
export async function recordCodEmailSent(orderId: string, kind: CodEmailKind): Promise<void> {
  try { /* update */ }
  catch (err) {
    console.error(`[orders] failed to record COD ${kind} email as sent for order ${orderId}:`, /* message only */);
  }
}
```

The comment sets out the trade explicitly: *"Best-effort by design: if this write
itself fails, the worst outcome is a possible resend on a future retry, which is still
strictly better than the pre-fix behaviour of always resending. Never throws."*

That is the right way to document a deliberate imperfection — name the residual risk
and why it is acceptable.

## 25.8 What is never exposed

| Never shown to a user | Instead |
|---|---|
| Raw Prisma error messages | *"Something went wrong placing your order. Please try again."* |
| Stack traces | The error boundary's written copy |
| `error.digest` | Logged server-side only |
| Blob transport errors | *"The image could not be saved to storage. Nothing was changed."* |
| SMTP errors | Nothing — the visitor sees success, because the row saved |
| Whether an email address has an account | The same `?error=creds` for wrong password, unknown user and rate-limit lockout |
| Whether an order id exists | 404 |

---
---

# PART 26 — IGPL INTEGRATION

## 26.1 What is actually implemented

**One authenticated, flag-gated HTTP endpoint that performs no sync.**

That is the complete, accurate statement. There is no scraper, no parser, no
`cheerio` dependency, no scheduled job and no automated write path.

## 26.2 The official source

`CLAUDE.md` records an investigation dated 2026-09-02. `theigpl.com` is a Next.js app
— no WordPress REST API, no `sitemap.xml`, no RSS. It does expose a config endpoint
naming its own backends:

```bash
curl https://theigpl.com/api/config
# {"apiBase":"https://bknd.theigpl.com/api",
#  "scorecardApiBase":"https://bknd.golfpuppet.com"}
```

**Confirmed reachable, returning JSON:**

| Endpoint | Returns |
|---|---|
| `GET https://bknd.theigpl.com/api/franchises` | 10 franchises — `id, city, name, logo, color, cityIcon`. Chennai is `che` / "Vimtra Ventures" |
| `GET https://bknd.theigpl.com/api/players` | 46 players — `name, city, age, turned_pro, wins, img, nationality, bio, highlights` |

**Referenced by the official site's client bundle, not verified end to end by this
project:** static and round leaderboard endpoints on `scorecardApiBase` (with
`orgId=39`), and an SSE commentary stream.

**Known gaps, recorded rather than papered over:**

* No `standings` / `schedule` / `tournaments` collection endpoint responded on
  `bknd.theigpl.com/api`. Those pages are server-rendered, so there is no confirmed
  public JSON route.
* `/api/players` carries **no franchise field**, so it cannot by itself verify the
  four-player Chennai roster.

## 26.3 Why nothing is wired to it yet

`CLAUDE.md` section 5, verbatim in substance:

> These are the official site's **internal, undocumented** endpoints. They are publicly
> reachable and CORS-open, but they are not a published API with terms, versioning or a
> stability guarantee, and they can change or close without notice. **Get IGPL's
> agreement before wiring production to them**, and ask whether they will provide a
> documented feed or a per-franchise export. Until then: keep the verified-database
> fallback, and do not build an aggressive scraper.

That is the reason the endpoint is a stub. It is a deliberate, documented decision —
not an unfinished task someone forgot.

## 26.4 The endpoint

`app/api/sync/igpl/route.ts`, `export const dynamic = "force-dynamic"`, one `GET`.

**Authentication:** `Authorization: Bearer <CRON_SECRET>`. Fails closed in production
when `CRON_SECRET` is unset (returns `500`). The `?key=` query-string fallback was
removed in commit `90b8b69` — see **Part 17.4 A**.

**Feature flag:** `IGPL_SYNC_ENABLED`, default `false` in `.env.example`. Anything
other than the exact string `"true"` returns `503` with an explanatory `note`.

**Current no-op behaviour when enabled:** it counts existing rows and returns them,
labelled honestly.

```ts
return NextResponse.json({
  ok: true,
  syncedAt: new Date().toISOString(),
  source: "no-op-stub",
  counts: { fixtures, scores, standings },
  note: "Sync enabled but no scraper attached. Wire IGPL_URL + cheerio pipeline before relying on this endpoint.",
});
```

The route's own header explains the choice: *"the endpoint short-circuits with a 503 so
any accidental cron invocation is loud and honest instead of silently returning fake
success."*

## 26.5 Cron configuration

```json
// vercel.json
{ "$schema": "https://openapi.vercel.sh/vercel.json", "crons": [] }
```

**The cron array is empty. Nothing is scheduled.**

> **Documentation conflict.**
> **`CLAUDE.md` says:** *"`app/api/sync/igpl/route.ts` already exists as the sync entry
> point, gated behind `IGPL_SYNC_ENABLED` (default `false`) and scheduled by
> `vercel.json`"*, and elsewhere *"`vercel.json` — IGPL sync cron (\*/15)"*.
> **Current implementation:** `vercel.json` contains `"crons": []`. No schedule exists.
> `.env.example` is the accurate one: *"Until then the endpoint short-circuits and
> vercel.json has no cron entry."*

## 26.6 The intended architecture, when it is built

From the route's own comment:

```
1. fetch(process.env.IGPL_URL)                    -> HTML or JSON
2. parse to Fixture[], Score[], Standing[] shapes
3. zod-validate each row (reject the WHOLE BATCH if anything is off)
4. upsert into Prisma
5. revalidatePath("/fixtures"); revalidatePath("/scores"); revalidatePath("/leaderboards")
6. return { ok: true, counts }
```

And from `CLAUDE.md`, the non-negotiable properties:

* **No code edit required for new data.** The sync writes into the existing `Fixture`,
  `Score` and `Standing` tables. Every public page already renders those tables and
  their empty states, so nothing downstream changes.
* **Fail-closed.** On an unreachable or unparseable source it *"leaves existing rows
  untouched and writes nothing. A failed sync shows the last verified data or the empty
  state — never partial or guessed rows."*
* **Chennai-scoped**, except where a full field is required for a leaderboard.
* **Revalidate** the three public paths after a write.

## 26.7 How the data gets in today

By hand, through the admin console. The schema comment says so:

> Admins hand-key each of these today; a future scrape (gated by IGPL_SYNC_ENABLED)
> will upsert into the same tables.

`/admin/fixtures`, `/admin/scores` and `/admin/leaderboards` are the working surfaces.
`prisma/seed.ts` seeds four Season 2026 fixtures, with dates taken from the official
IGPL schedule rather than the brochure, and with every brochure/IGPL discrepancy
written down in the file.

## 26.8 Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `CRON_SECRET` | `change-me-too` in the example | Bearer token for the endpoint |
| `IGPL_SYNC_ENABLED` | `false` | Master switch |
| `IGPL_URL` | commented out | *"When wiring the real scraper"* |

## 26.9 What this document does **not** claim

There is no scraper. There is no scheduled job. There is no automated data flow from
`theigpl.com` into this database. `CLAUDE.md` also describes a manual-override console
at `/admin/igpl-sync` — **that route does not exist**; the equivalent manual editing
happens in the separate fixtures / scores / leaderboards admin pages.

---
---

# PART 27 — DEPLOYMENT

## 27.1 The pipeline

```
Local development
   npm run dev  ->  http://localhost:3000
        |
        v
Git
   git add / git commit   (on a branch, never straight to main)
        |
        v
GitHub
   git push Lions <branch>          <- the remote is named "Lions", not "origin"
        |
        v
Vercel
   1. npm install
   2. npm run build   ->  "prisma generate && next build"
   3. environment variables injected from project settings
        |
        v
Production
   Edge:      middleware.ts
   Node:      Server Components + Server Actions + the API route
   Database:  Neon Postgres (pooled URL at runtime)
   Storage:   Vercel Blob
   Mail:      Gmail SMTP
```

## 27.2 Why Vercel

`CLAUDE.md`: *"Targets **Vercel** (dynamic Next.js — Server Actions, the admin area,
middleware, and the IGPL cron all need a Node/serverless runtime). A GoDaddy domain can
later point its DNS at Vercel."*

A static export is not an option: 33 files declare `force-dynamic`, and Server Actions,
middleware and the API route all require a server.

## 27.3 The build

```json
"build": "prisma generate && next build"
```

`prisma generate` must run first. The generated client lives in `node_modules`, which
is not committed, so without it `import { PrismaClient } from "@prisma/client"` fails at
build time on a clean checkout.

**`npx next build` versus `npm run build`.** The brief asks about this. What the
repository shows: `npm run build` is the documented command in both `package.json` and
`CLAUDE.md`, and it includes `prisma generate`. `npx next build` runs *only* the Next.js
build. It is therefore a faster way to re-check a build when the Prisma client is
already generated and the schema has not changed — a pure TypeScript or component
change, for example.

**However:** no commit message, comment or documentation in this repository explains or
records the use of `npx next build`. That reasoning is **not confirmed from the
repository** and is offered here only as the mechanical difference between the two
commands.

**Use `npm run build`** whenever the schema may have changed, on a clean checkout, and
in CI — it is the one that matches what Vercel runs.

## 27.4 Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | **Yes** | Pooled Neon URL, used at runtime |
| `DIRECT_URL` | **Yes** | Direct Neon URL, used by `migrate deploy` |
| `NEXT_PUBLIC_SITE_URL` | **Yes in production** | Canonicals, sitemap, verification links. Without it, verification email is refused |
| `ADMIN_EMAIL` | Yes | Seed admin; fallback recipient for contact and order notifications |
| `ADMIN_PASSWORD` | Seed only | >= 12 characters. Rotate after first login |
| `BLOB_READ_WRITE_TOKEN` | Yes in production | Injected by Vercel when a Blob store is linked |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | For email | Gmail defaults are fine |
| `SMTP_USER` / `SMTP_PASSWORD` / `MAIL_FROM` | For email | App Password, never the login password |
| `CONTACT_NOTIFY_EMAIL` / `ORDER_NOTIFY_EMAIL` | Optional | Fall back to `ADMIN_EMAIL` |
| `CRON_SECRET` | Yes in production | Protects `/api/sync/igpl`; missing means the endpoint 500s |
| `IGPL_SYNC_ENABLED` | Optional | `false` |
| `IGPL_URL` | Not yet | For the future scraper |
| `SHIPPING_FLAT_INR` / `SHIPPING_FREE_ABOVE_INR` / `GST_RATE` | Optional | Override 149 / 2000 / 18 |
| `SMS_PROVIDER` / `SMS_FROM` / `SMS_ACCOUNT_SID` / `SMS_AUTH_TOKEN` | Not wired | Phone OTP has no transport |

**`NEXT_PUBLIC_` is a real prefix, not a convention.** It tells Next.js to inline the
value into the client bundle. `NEXT_PUBLIC_SITE_URL` is the only one here, and it is
public information. **Never** prefix a secret with it.

## 27.5 Migrations in deployment

**The build does not run migrations.** `prisma generate` only regenerates the client.

Deploy order:

```bash
# 1. Deploy the code (via git push; Vercel builds automatically)
# 2. Then, deliberately, with the production DIRECT_URL in the environment:
npx prisma migrate deploy
```

**Why this order for additive changes.** New code that reads a new column will fail
until the migration has run, so for a pure addition you can run the migration first.
The safe general rule is: make schema changes **backward compatible** so old and new
code both work during the window, and split a breaking change across two deployments
(add, backfill, switch, then drop).

`npm run db:seed` on production would rewrite the admin user. Do not include it in a
routine deploy.

## 27.6 Domain and SSL

Vercel issues and renews TLS certificates automatically for attached domains.
`CLAUDE.md` notes a GoDaddy domain can point its DNS at Vercel. HSTS is sent in
production only.

**The live production domain is not recorded in the repository.** `.env.example`
carries `http://localhost:3000` as the placeholder.

## 27.7 Pre-deployment checks

```bash
npx tsc --noEmit     # or: npm run typecheck
npm run lint
npm run build        # the same command Vercel runs
```

Then, by hand:

* Any new environment variable added to Vercel project settings?
* Any new migration committed alongside its schema change?
* Any new remote image host added to `next.config.mjs`?
* Any new public route added to `app/sitemap.ts`?
* Any new authenticated route added to the `disallow` list in `app/robots.ts`?

**There is no CI pipeline in this repository** — no `.github/workflows`, no
pre-commit hook. These checks are manual.

## 27.8 Safe deployment workflow

```
1. Branch:        git checkout -b feature/thing
2. Build locally: npx tsc --noEmit && npm run lint && npm run build
3. Commit:        isolated, descriptive
4. Push:          git push Lions feature/thing
5. Preview:       Vercel builds a preview deployment for the branch
6. Verify:        exercise the change on the preview URL
7. Merge:         open a PR into main
8. Migrate:       npx prisma migrate deploy against production (if the change needs it)
9. Verify:        exercise the change in production
10. Rollback:     Vercel dashboard -> promote the previous deployment
                  (a database migration does NOT roll back with it - plan that separately)
```

**The asymmetry in step 10 is the one to remember.** Code rollback is instant. Schema
rollback is not. That is why backward-compatible migrations matter.

---
---

# PART 28 — GIT WORKFLOW

## 28.1 Commands

| Command | Purpose |
|---|---|
| `git status` | What has changed, what is staged, which branch |
| `git diff` | Unstaged changes |
| `git diff --staged` | What a commit would contain |
| `git log --oneline` | History |
| `git log -1 --stat <sha>` | One commit's files and line counts |
| `git show <sha> -- <path>` | One file's diff in one commit |
| `git add <path>` | Stage |
| `git commit -m "..."` | Record |
| `git checkout -b <name>` | New branch |
| `git push Lions <branch>` | Push — **the remote is `Lions`** |
| `git revert <sha>` | Undo a commit with a new commit (safe on shared history) |
| `git reset --hard` | **Destructive.** Discards uncommitted work |

## 28.2 Conventions in force

**Branch by default.** Do not commit directly to `main`.

**The remote is `Lions`.** Not `origin`. `git push origin main` will fail.

**Conventional-commit prefixes** are used consistently in recent history:
`feat:`, `fix:`, `refactor:`, `chore:`, `content:`, `revert:`, with an optional scope —
`fix(fixtures, scores, shop):`, `refactor(players):`, `feat(auth):`.

**Isolated commits.** The strongest example is `90b8b69`, which touched exactly three
files and did one thing: harden two security issues. `d027188` touched exactly the
three pages that needed the database fallback.

**Commit messages carry rationale.** `501d174`'s body is a five-section changelog. This
is how the project records *why*, alongside the comments in the code.

## 28.3 Important commits, chronologically

*63 commits total. These are the architecturally significant ones, each verified with
`git show --stat`.*

| # | Commit | Date | Purpose | Files affected | Why it mattered |
|---|---|---|---|---|---|
| 1 | `b263ea0` | 2026-08-21 | `feat: add robots and sitemap generation for SEO` | +`app/robots.ts`, +`app/sitemap.ts`, +`app/terms`, +`app/vimtra-ventures`, +`components/contact/topics.ts`, first Prisma migration, **deleted 13 legacy `.html` files and `support.js` (1,583 lines)** | The migration from the static HTML harness completes. 136 files, +3,215 / -12,075 |
| 2 | `0027cbb` | 2026-08-22 | `feat: migrate database from SQLite to PostgreSQL` | `prisma/schema.prisma`, +`schema.sqlite.prisma`, consolidated Postgres baseline, `migrations_sqlite/`, `.env.example`, `CLAUDE.md` | Made real transactions, `jsonb` and `text[]` available — everything commerce needs |
| 3 | `a68a50b` | 2026-08-28 | `feat: complete M5 commerce and inventory` | Address / Order / OrderItem, stock, the checkout flow | The commerce milestone |
| 4 | `dabf4e4` | 2026-09-04 | `Add user profile and order history` | `/profile`, `/profile/orders` | Members can see what they bought |
| 5 | `89f4e3e` | 2026-09-04 | `Update site pages and contact management` | `/contact`, `ContactMessage`, `/admin/messages` | Enquiries become data rather than email |
| 6 | `4f37465` | 2026-09-04 | `Add Nodemailer dependency` | `package.json`, `lib/mail.ts` | Real SMTP |
| 7 | `b3a0096` | 2026-09-09 | `Add email verification and COD reliability updates` | `EmailVerificationToken`, `PhoneOtp`, `lib/verification.ts`, COD email tracking | Verify-before-activate |
| 8 | `a1a8194` | 2026-09-09 | `Implement verification and fix checkout timeout` | `lib/orders.ts` single-statement decrement | Fixed P2028 on carts above ~6 lines |
| 9 | `197cb00` | 2026-09-15 | `content: remove unsupported financial claims` | `app/invest`, `app/vimtra-ventures`, `components/home/Sections.tsx` | Data integrity applied to copy |
| 10 | `501d174` | 2026-09-15 | `feat(auth): login rate limiting` + HTML sanitisation + toast fix | +`lib/auth-rate-limit.ts`, +`lib/news-html.ts`, `AuthRateLimit` migration, `store/toast.ts`, `lib/cover-upload.ts` | Three security fixes: brute force, stored XSS, toast HTML injection. 14 files |
| 11 | `87148f1` | 2026-09-12 | `feat: add admin toast notification system` | +`store/admin-toast.ts` | Plain-text admin toasts, separate from the public store |
| 12 | `ae982b9` | 2026-09-15 | `fix(orders): send cancellation email after admin cancellation` | `orders/actions.ts`, `lib/mail.ts`, migration | Buyers learn their order was cancelled |
| 13 | `59304cc` | 2026-09-16 | `feat: simplify Lions navigation taxonomy` | `lib/nav.ts`, `Nav`, `Footer` | One taxonomy for header and footer |
| 14 | `dccd448` | 2026-09-16 | `revert: restore previous navigation and footer` | Nav, Footer | An honest revert — kept in history rather than rewritten |
| 15 | `90b8b69` | 2026-09-16 | `fix: harden order and IGPL sync security` | `app/api/sync/igpl/route.ts`, `lib/orders.ts`, **deleted a PDF from `public/assets/`** | Four fixes in 3 files — see **Part 17.4** |
| 16 | `fe097da` | 2026-09-16 | `fix: harden route error boundary accessibility` | +`app/error.tsx` (66 lines) | `role="alert"`, focus management |
| 17 | `8dfbc36` | 2026-09-16 | `fix: add route loading and not-found states` | +`app/loading.tsx`, +`app/not-found.tsx` | Suspense fallback and 404 |
| 18 | `aea5582` | 2026-09-16 | `fix: improve customer form accessibility` | sign-in, sign-up, `ContactForm`, `PasswordField`, `CheckoutFlow` | `htmlFor`/`id`, `role="alert"`, tablist → group |
| 19 | `385c2ac` | 2026-09-16 | `fix: update product page layout` | `app/product/[id]` | Layout cleanup |
| 20 | `68a6ae5` | 2026-09-16 | `chore: remove dead CSS and the undefined --v-muted token` | `app/globals.css` | Removing a token nothing defined |
| 21 | `0ae84ee` | 2026-09-17 | `fix(igpl): correct Season 2026 fixture dates and add live Order of Merit` | `prisma/seed.ts`, `data/players.ts` | Dates reconciled to the official IGPL schedule, discrepancies documented |
| 22 | `06c5db2` | 2026-09-18 | `fix: improve gold contrast on light surfaces` | `app/globals.css` | Introduced `--v-gold-on-light` |
| 23 | `d027188` | 2026-09-18 | `fix(fixtures, scores, shop): handle transient database failures gracefully` | 3 pages, +32 / -4 | Empty state instead of a 500 — see **Part 25.5** |
| 24 | `c0fb931` | 2026-09-18 | `refactor: streamline page animations` | 9 files, +131 / -133 | Group-level reveals — see **Part 20.7** |
| 25 | `7196592` | 2026-09-19 | `refactor(players): update hero photograph description and add marquee image` | `app/players`, assets | Current HEAD |

## 28.4 A pattern worth copying from this history

Look at `90b8b69` again. Four distinct fixes, three files, one commit, and every fix is
accompanied by a code comment explaining the reasoning — not just the change. Six
months later you can read `lib/orders.ts` and understand *why* `updateMany` is used
instead of `update`, without finding the commit.

**The comments are where the rationale lives; the commits are where the sequence
lives.** Both are maintained here. Keep it that way.

---
---

# PART 29 — DEBUGGING GUIDE

> **A standing rule for everything in this chapter:** when a problem might be
> database-related, your first move is to find out *which database you are pointed at*
> — never to run a Prisma command that writes. See **Part 11**.

---

## 29.1 "The page returns an error"

**Symptoms.** The `app/error.tsx` boundary appears: "Something went wrong."

**Possible causes.** A thrown exception in a Server Component, an unreachable database,
a missing environment variable, a `SiteUrlError`, a null dereference on an unexpected
row shape.

**How to investigate.**
1. The terminal running `npm run dev` — the real stack trace is there, not on screen.
2. In production: Vercel dashboard → the deployment → Runtime Logs. Match the
   `digest` value.
3. Isolate: does `/the-club` (no database) work while `/shop` (database) does not? That
   narrows it to data immediately.

**Safe commands.**
```bash
npx tsc --noEmit
npm run lint
```

**What NOT to do.** Do not run `prisma migrate reset` because "the data looks wrong".
Do not add a blanket `try/catch` that swallows the error — you will convert a visible
failure into a silent one.

**Likely fix.** A missing env var, or a `.catch()` fallback that the page should have
had (the pattern in **Part 25.5**).

---

## 29.2 "The page is blank"

**Symptoms.** Markup renders but content is missing, or the whole area is empty.

**Possible causes.**
1. **An empty state is doing its job** — the table genuinely has no rows.
2. A `.catch(() => [])` fallback swallowed a real database error.
3. A GSAP "from" state left content at `opacity: 0` because JavaScript failed.
4. A `hydrated &&` guard is stuck false.

**How to investigate.**
1. View source (Ctrl+U). If the text is in the HTML but invisible, it is a CSS or
   animation problem, not a data problem.
2. Browser console: any JavaScript error stops GSAP before it sets the "to" state.
3. Check the fallback: temporarily log inside the `.catch()`.
4. `npx prisma studio` — **read only** — to see whether rows exist.

**What NOT to do.** Do not "fix" it by hard-coding sample rows. That violates the
project's first rule.

**Likely fix.** If genuinely empty, nothing is broken. If the catch is hiding an error,
the log will name it.

---

## 29.3 "The database connection closes" / "Transaction already closed"

**Symptoms.** `P2028 Transaction already closed`; `P1001 Can't reach database server`;
intermittent timeouts under load.

**Possible causes.**
* **P2028** — an interactive transaction exceeded Prisma's 5000ms budget. This
  repository has hit exactly this: see the `placeOrder` comment quoted in **Part 10.6**.
  ~290ms per round-trip against `us-east-2` means roughly nine round-trips is the
  ceiling.
* **P1001** — wrong `DATABASE_URL`, Neon cold start, or network.
* **Connection exhaustion** — `DATABASE_URL` pointed at the direct URL instead of the
  pooled one, or a `PrismaClient` being constructed per request.

**How to investigate.**
1. Count the round-trips inside your transaction. Each `await tx.something()` is one.
2. Confirm `DATABASE_URL` contains `-pooler` and `DIRECT_URL` does not.
3. Confirm every import is `import { prisma } from "@/lib/prisma"` — never
   `new PrismaClient()`.

**Safe commands.**
```bash
npx prisma generate
```

**What NOT to do.** Do not raise the transaction timeout as a first response — it
treats the symptom. Do not add retries around a transaction that mutates stock.

**Likely fix.** Collapse the loop into one statement, exactly as `placeOrder` and
`cancelOrderAndRestock` do.

---

## 29.4 "A Prisma error"

| Code | Meaning | Where this project handles it |
|---|---|---|
| `P1001` | Cannot reach the database | Route-level `.catch()` fallbacks |
| `P2002` | Unique constraint violated | `placeOrder` distinguishes `clientRequestId` from `orderNumber` |
| `P2003` | Foreign-key violation | `deleteUserAction`, `deleteProduct` |
| `P2025` | Record not found | `deleteUserAction`, `deleteProduct` |
| `P2028` | Transaction already closed | Avoided by design in `placeOrder` |

**How to investigate.** Narrow the type and read `err.code` and `err.meta.target` — the
pattern is already in the codebase:

```ts
if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
  const target = Array.isArray(err.meta?.target) ? err.meta!.target as string[] : [];
}
```

**"Unknown field" or "model does not exist".** You changed `schema.prisma` and did not
regenerate:

```bash
npx prisma generate
```

**What NOT to do.** Do not run `prisma db push` to "make the error go away". It will
drop whatever the schema no longer mentions.

---

## 29.5 "Authentication fails"

**Symptoms.** Sign-in redirects back with `?error=creds`. Or you are signed in but the
nav says otherwise.

**Remember:** `?error=creds` means *any* of three things — wrong password, no such
account, or rate-limited. That ambiguity is deliberate (**Part 12.9**).

**How to investigate.**
1. **Rate limit?** Wait 15 minutes, or inspect `AuthRateLimit` in Studio (read only).
   Keys are hashed; you cannot search by plain email.
2. **Verification gate?** This is the most common confusion. If `emailVerifiedAt` is
   `null` **and** `createdAt >= 2026-09-11T12:00:00Z`, `getCurrentUser()` returns
   `null` — the account looks signed out everywhere except `/check-email`. That is
   working as designed.
3. **Session expired?** `Session.expiresAt` in the past.
4. **Cookie?** DevTools → Application → Cookies. Is `lions_session` present? On
   localhost, `secure` is false so it should be.

**Safe commands.** None needed — this is inspection.

**What NOT to do.** Do not add an action that sets `emailVerifiedAt` directly. The
codebase deliberately has none (**Part 16.4**). Use the resend action.

**Likely fix.** Verify the email, or wait out the lockout.

---

## 29.6 "Admin access fails"

**Symptoms.** Redirected to `/?denied=admin`, or bounced to `/sign-in` repeatedly.

**Walk the four layers in order:**

| Symptom | Layer | Meaning |
|---|---|---|
| Redirected to `/sign-in` from the edge | `middleware.ts` | No `lions_session` cookie at all |
| Redirected to `/check-email` | `requireAdmin` | Signed in, but email unverified and post-cutoff |
| Redirected to `/?denied=admin` | `requireAdmin` | Signed in and verified, but `role !== "ADMIN"` |
| Page loads, an action fails | the action's own `requireAdmin()` | Role changed mid-session |

**How to investigate.** Check `User.role` in Studio. Remember it is read fresh on every
request — a demotion takes effect immediately, without a sign-out.

**Likely fix.** Grant ADMIN from `/admin/users` (needs an existing admin), or re-run
`npm run db:seed` **only against a local database**.

---

## 29.7 "Order creation fails"

**Symptoms.** Checkout shows an error; no order appears.

**Read the `code` in the returned `PlaceOrderResult` — it tells you exactly which
branch fired:**

| `code` | Meaning | First thing to check |
|---|---|---|
| `EMPTY_CART` | Cart empty or every line coerced to 0 | Is `localStorage.lions_cart` populated? |
| `INVALID_ADDRESS` | Missing/invalid contact or address, or the address is not the buyer's | The `addr_*` form fields |
| `INSUFFICIENT_STOCK` | A product is inactive, missing, or has less stock than requested | `Product.stock` and `Product.active` |
| `INVALID_PAYMENT` | Payment method not in the allow-list | The submitted `paymentMethod` |
| `SERVER` | Anything else — **the real cause is in the server log** | `[placeOrderAction] unknown error while placing order` |

**How to investigate.** For `SERVER`, find that log line; the raw error is beside it. A
`P2028` there points straight at the transaction-budget issue in **29.3**.

**What NOT to do.** Do not retry by placing a second order to "see if it works" on
production — that is real stock. And do not remove the `clientRequestId` handling; it
is what makes a retry safe.

**Likely fix.** Usually genuinely insufficient stock. Check `/admin/inventory`.

---

## 29.8 "The email is not sent"

**Symptoms.** No confirmation, no welcome, no verification link.

**First: this is often not a failure.** Without all four of `SMTP_HOST`, `SMTP_USER`,
`SMTP_PASSWORD` and `MAIL_FROM`, sending is **skipped by design** and the caller gets
`{ sent: false, reason: "not-configured" }`. Contact submissions still succeed.

**How to investigate, in order.**
1. Are all four variables set *in the environment the app is actually running in*?
2. Server log — `[mail] send failed: <transport message>`. `Invalid login: 535-5.7.8`
   means the App Password is wrong or 2-Step Verification is off.
3. `[mail] MAIL_FROM does not match SMTP_USER` — Gmail may reject or rewrite;
   `resolveFromAddress()` is already compensating, but fix the config.
4. **Verification links specifically:** `[mail] verification email NOT sent:
   NEXT_PUBLIC_SITE_URL is not set...`. The send is *refused* rather than producing a
   dead localhost link.
5. Check the recipient's spam folder.
6. For admin notifications, confirm `CONTACT_NOTIFY_EMAIL` / `ORDER_NOTIFY_EMAIL` or
   `ADMIN_EMAIL` is set.

**What NOT to do.** Do not put the App Password in `.env.example` or any committed
file. Do not make the contact form fail when email fails — that inverts the design.

---

## 29.9 "Images do not load"

**Symptoms.** Broken images, or a `next/image` error page.

| Symptom | Cause | Fix |
|---|---|---|
| `Invalid src prop ... hostname not configured` | Remote host not allow-listed | Add it to `remotePatterns` in `next.config.mjs` |
| 404 on `/assets/...` | File not in `public/assets/`, or a case mismatch | Windows is case-insensitive locally, Vercel is **not** |
| Fallback crest where a photo should be | `images[]` and `img` both empty | Expected behaviour — see `productImage()` |
| Very slow image | Serving the original, not the `-web` derivative | Add the mapping to `lib/image-src.ts` |
| Uploaded image 404s in production | Stored under `/uploads/` from a local run | Local-disk paths do not exist on Vercel. Re-upload with `BLOB_READ_WRITE_TOKEN` set |
| Empty tile with `object-fit: cover` | A transparent cutout PNG | `lib/image-src.ts` already redirects `hero-golfer.png` for this reason |

---

## 29.10 "A GSAP animation does not appear"

**Symptoms.** No motion, or content that never becomes visible.

**How to investigate.**
1. **Is reduced motion enabled on your OS?** Every primitive no-ops. This is the most
   common answer and it is correct behaviour.
2. Console error — any exception before `ctx.revert()` registers leaves things half-set.
3. Is `registerGsap()` called? ScrollTrigger must be registered before use.
4. Does the element actually carry the data attribute the section hook queries?
5. Is the trigger element the right one? `start: "top 80%"` never fires if the trigger
   is already above the fold at load — and `once: true` means it will not retry.

**What NOT to do.** Do not set the "from" state in CSS. If you write
`opacity: 0` in the stylesheet and JavaScript fails, the content is gone. The project's
rule is that GSAP sets the from-state.

**Likely fix.** Reduced motion, a missing attribute, or a wrong trigger element.

---

## 29.11 "The mobile layout overflows"

**Symptoms.** Horizontal scroll on a phone, or content wider than the viewport.

**Note first:** `body { overflow-x: hidden }` in `globals.css` masks this globally. So
if you *see* overflow, something is escaping that guard, and the element may be
clipped rather than scrollable.

**How to investigate.**
```js
// paste in the console - lists every element wider than the viewport
[...document.querySelectorAll('*')].filter(e => e.scrollWidth > document.documentElement.clientWidth)
```

Common causes here: a fixed `min-width`, unwrapped display type with `white-space:
nowrap` (`.mq-line > span`), a full-bleed section using `100vw` where a scrollbar makes
`100vw > 100%`, a wide table, or a long unbroken string.

**Likely fix.** A `max-width: 100%`, a `clamp()` on the type, or an `overflow-x: auto`
wrapper for a table.

---

## 29.12 "The build fails"

**How to investigate.** Read the *first* error, not the last — later errors are usually
consequences.

| Error | Cause | Fix |
|---|---|---|
| `Cannot find module '@prisma/client'` | `prisma generate` did not run | `npm run build`, not `npx next build` |
| `You're importing a component that needs useState...` | A hook in a Server Component | Add `"use client"`, or move the hook into a leaf component |
| `server-only cannot be imported from a Client Component` | A client file imports a `lib/` data module | Import the `-format` sibling instead |
| `metadataBase property in metadata export is not set` | `SITE_URL` unresolved | Set `NEXT_PUBLIC_SITE_URL` |
| Type error in a `page.tsx` | `params` is a Promise in Next 15 | `const { id } = await params;` |
| Module not found, only on Vercel | Filename case | Windows is case-insensitive; Linux is not |

**Safe commands.**
```bash
npx tsc --noEmit
npm run lint
npm run build
```

**What NOT to do.** Do not add `// @ts-ignore` to get past a type error in the money
path. Do not disable `strict`.

---

## 29.13 "TypeScript fails"

```bash
npx tsc --noEmit
```

| Error | Meaning |
|---|---|
| `Property 'x' does not exist on type` | Either a typo, or a narrowing you have not done. After `if (res.ok)` you cannot read `res.error` — that is the union working |
| `Object is possibly 'null'` | `strict` doing its job. Handle the null; do not cast it away |
| `Type 'string' is not assignable to type 'OrderStatus'` | Validate against the allow-list first, then cast — the pattern in `updateOrderStatusAction` |
| A field is missing after a schema change | `npx prisma generate` |

---

## 29.14 "Lint fails"

```bash
npm run lint
```

Config is `next/core-web-vitals` with one rule disabled
(`@next/next/no-page-custom-font`). The most common findings:
`<img>` instead of `next/image`, `<a>` for an internal route instead of `next/link`, a
missing `key` in a list, and missing `useEffect` dependencies.

---

## 29.15 "The Vercel deployment fails"

**How to investigate.** Vercel dashboard → the deployment → **Build Logs** (build-time)
or **Runtime Logs** (request-time). They are different tabs and different problems.

| Symptom | Cause | Fix |
|---|---|---|
| Build fails, works locally | Missing env var in project settings, or filename case | Compare the Vercel env list to `.env.example` |
| Build succeeds, every page 500s | `DATABASE_URL` wrong or unreachable | Check Runtime Logs for `P1001` |
| Canonicals point at a Vercel preview host | `NEXT_PUBLIC_SITE_URL` unset | Set it; look for the `[site-url]` warning |
| Admin image upload fails | `BLOB_READ_WRITE_TOKEN` absent | Link a Blob store. Production refuses the disk fallback by design |
| `/api/sync/igpl` returns 500 | `CRON_SECRET` unset in production | Set it. Failing closed is intentional |
| New column missing at runtime | Migration not applied | `npx prisma migrate deploy` with the production `DIRECT_URL` |

**Rollback.** Vercel dashboard → Deployments → promote the previous one. **A database
migration does not roll back with the code** — plan schema changes to be backward
compatible.

---

## 29.16 Quick triage table

| Where the symptom appears | Look first |
|---|---|
| One page only | That page's `page.tsx` and its `lib/` call |
| Every page | `app/layout.tsx`, `lib/prisma.ts`, an env var |
| Only `/admin` | `requireAdmin`, `User.role`, `middleware.ts` |
| Only after sign-in | Verification gate, session expiry |
| Only in production | Environment variables, filename case, Blob token |
| Only on mobile | Media queries, overflow |
| Only with JS disabled / slow | GSAP from-state, hydration guards |
| Only under load | Transaction budget, connection pooling |

---
---

# PART 30 — HOW TO READ THIS PROJECT

A sequence that builds understanding rather than breadth. Budget roughly a day for
steps 1–6 and a second day for 7–12.

### STEP 1 — `package.json` and the configs (20 minutes)

`package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`,
`.env.example`.

**You should be able to answer:** What runs on `npm run build` and why is
`prisma generate` first? What does `@/` resolve to? Which remote image hosts are
allowed? Which environment variables are required?

### STEP 2 — `CLAUDE.md`, top section only (15 minutes)

Read the **DATA INTEGRITY** section. It governs every content decision you will make.

**You should be able to answer:** What do you render when a number is not available
from an approved source?

### STEP 3 — `app/layout.tsx` (20 minutes)

The whole request shape is visible here: fonts, metadata, `getCurrentUser()`, the skip
link, `PublicChrome`, `<main>`.

**You should be able to answer:** How does a page's title get its suffix? Why does
`/admin` not show the site nav? What is `metadataBase` for?

### STEP 4 — `app/page.tsx` and `components/home/Sections.tsx` (45 minutes)

A server page fetching three things in parallel and composing seven chapters; then the
client component with the motion hook.

**You should be able to answer:** Where does the hero's "next fixture" come from, and
what happens when there is none? How does a section opt into an animation?

### STEP 5 — `lib/prisma.ts`, then `prisma/schema.prisma` (60 minutes)

Read the schema **including the comments** — they carry most of the design rationale in
this project.

**You should be able to answer:** Why is `Order -> User` RESTRICT but `Session -> User`
CASCADE? Why do tokens live in their own tables? What is `shippingSnapshot`?

### STEP 6 — `lib/auth.ts` (45 minutes)

Every function, top to bottom.

**You should be able to answer:** What is the difference between `getPendingUser` and
`getCurrentUser`? Why does `verifyCredentials` compare against a dummy hash? What does
`safeNextPath` prevent?

### STEP 7 — One complete write path: contact (30 minutes)

`components/contact/ContactForm.tsx` → `app/contact/actions.ts` →
`lib/contact-messages.ts` → `lib/mail.ts` → `lib/email-templates.ts`.

This is the simplest end-to-end Server Action in the project and it demonstrates the
whole discipline: validate, persist, best-effort side effect, typed result.

**You should be able to answer:** Why is the row saved before the email? What happens
when SMTP is not configured?

### STEP 8 — The commerce path (2 hours — the densest part)

In order: `store/cart.ts` → `lib/orders-totals.ts` → `components/shop/CheckoutFlow.tsx`
→ `app/checkout/actions.ts` → `lib/orders.ts` (`placeOrder`).

Read `placeOrder` twice. The comments are as important as the code.

**You should be able to answer:** Why are client prices ignored? How does the stock
decrement avoid overselling? What exactly does `clientRequestId` protect against, and
how do the two layers differ?

### STEP 9 — The admin pattern (45 minutes)

`app/admin/layout.tsx`, then `app/admin/users/actions.ts` (the richest set of
authorisation guards), then `lib/admin-action-result.ts`.

**You should be able to answer:** Why does `requireAdmin()` run in both the layout and
every page? Why do actions return results instead of redirecting? What stops an admin
locking everyone out?

### STEP 10 — The design system (45 minutes)

`tailwind.config.ts`, then `app/globals.css` — the `:root` blocks at lines ~10, ~1909
and ~3125. Skim the rest.

**You should be able to answer:** What is the difference between `--v-gold` and
`--v-gold-on-light`? Why must you use the `.field` wrapper on forms?

### STEP 11 — Data integrity in practice (30 minutes)

`app/scores/page.tsx`, `app/leaderboards/page.tsx` and the header of `data/players.ts`.

**You should be able to answer:** What does `/scores` render for a fixture with no
scores? How does `data/players.ts` handle a brochure/IGPL conflict?

### STEP 12 — Deployment and safety (30 minutes)

`vercel.json`, `.env.example` again, `prisma/migrations/`, and **Part 11** of this
document.

**You should be able to answer:** Which commands can destroy production data? What is
the difference between `DATABASE_URL` and `DIRECT_URL`?

---

### The four files that teach the most per minute

1. **`lib/orders.ts`** — transactions, idempotency, race safety, a documented
   performance fix.
2. **`lib/auth.ts`** — the whole auth model in 220 lines.
3. **`prisma/schema.prisma`** — the data model and, in its comments, the reasoning.
4. **`app/scores/page.tsx`** — what "never invent data" looks like in a real page.

---
---

# PART 31 — LEARNING ROADMAP

Five levels. Each names the concepts, the files in *this* repository to study, exercises
to attempt, and the questions you should be able to answer before moving on.

---

## LEVEL 1 — Foundations (HTML, CSS, JavaScript, React basics)

**Concepts.** Semantic HTML and landmarks; the box model, flexbox, grid; CSS custom
properties; media queries; JavaScript functions, `const`/`let`, arrow functions,
destructuring, template literals, array methods, Promises and `async`/`await`; React
components, props, `useState`, event handlers, lists and keys, conditional rendering.

**Files to study.**
* `app/not-found.tsx` — a small, complete component with no data.
* `app/loading.tsx` — Tailwind utilities, responsive prefixes, ARIA.
* `components/PublicChrome.tsx` — a 12-line component with a real job.
* `components/ScrollToTop.tsx` — state, effect, cleanup, conditional render.
* `app/globals.css` lines 1–120 — custom properties and base styles.
* `lib/orders-totals.ts` — pure functions, `reduce`, ternaries, `Math.round`.

**Exercises.** Change the copy on the 404 page. Change one Tailwind colour and see
where it applies. Trace `cartSubtotal` by hand for a two-item cart. Add a `console.log`
in `ScrollToTop`'s effect and watch the cleanup fire.

**Questions you should be able to answer.**
1. What does `className="md:text-base"` mean?
2. Why does `ScrollToTop`'s effect return a function?
3. What is the difference between `var(--v-ink)` and `#0e0b0a` in this project?
4. Why does `computeTotals` use `Math.round` on every input?

---

## LEVEL 2 — Next.js, TypeScript, Tailwind

**Concepts.** App Router and file-based routing; layouts; Server vs Client Components;
`"use client"`; dynamic segments and awaited `params`; metadata; `force-dynamic`;
`next/image` and `next/font`; TypeScript interfaces, unions, optional properties,
generics and inference; Tailwind config and design tokens.

**Files to study.**
* `app/layout.tsx` — fonts, metadata, the `getCurrentUser()` call.
* `app/shop/page.tsx` — the smallest complete server page.
* `app/product/[id]/page.tsx` — dynamic params, `generateMetadata`, `notFound()`.
* `components/shop/ShopBrowser.tsx` — the server/client boundary in practice.
* `lib/products.ts` — an interface and the helpers built on it.
* `lib/admin-action-result.ts` — a generic discriminated union in 17 lines.
* `tailwind.config.ts`.

**Exercises.** Add a new static page at `app/about-test/page.tsx` with metadata and a
canonical (then delete it). Trace why `/shop` needs `force-dynamic` and `/the-club`
does not. Add a field to the `Product` interface and watch `tsc` tell you everywhere it
breaks (then revert).

**Questions.**
1. Why can `app/shop/page.tsx` be `async` but `components/shop/ShopBrowser.tsx` not?
2. What breaks if you add `"use client"` to the top of `app/shop/page.tsx`?
3. Why is `params` a Promise in Next.js 15?
4. Why is `title` deliberately absent from the layout's `openGraph` object?

---

## LEVEL 3 — PostgreSQL, Prisma, authentication, APIs

**Concepts.** Relational modelling; primary keys, foreign keys, unique constraints,
indexes; Prisma schema, migrations, generated client; `findUnique` / `findMany` /
`create` / `update` / `updateMany` / `upsert` / `count`; nullable columns; enums;
transactions; password hashing; sessions and cookies; role-based and ownership-based
authorization; Server Actions; Zod.

**Files to study, in order.**
1. `lib/prisma.ts`
2. `prisma/schema.prisma` — the whole thing, comments included
3. `lib/db.ts` — CRUD with defaults and conditional updates
4. `lib/auth.ts` — the whole auth model
5. `lib/verification.ts` — tokens, hashing, conditional claims
6. `app/(auth)/actions.ts` — Zod plus redirects
7. `app/contact/actions.ts` — Zod plus a typed result
8. `app/api/sync/igpl/route.ts` — the only API route
9. `lib/auth-rate-limit.ts` — atomic upsert in raw SQL

**Exercises.** Draw the ER diagram from the schema without looking at **Part 10.5**.
Explain every `onDelete` choice. Trace a sign-in from form to cookie, naming every
file. Write (but do not run) a Prisma query returning the five most recent PUBLISHED
posts with only `title` and `slug`.

**Questions.**
1. Why is only `sha256(token)` stored, never the token?
2. Why is `updateMany` used where `update` would be simpler?
3. What does `import "server-only"` actually enforce?
4. Why does the rate-limit table store hashes instead of emails?
5. Why does `/api/sync/igpl` return 500 rather than 200 when `CRON_SECRET` is unset?

---

## LEVEL 4 — E-commerce, transactions, security, deployment

**Concepts.** Money as integers; server-authoritative pricing; atomic stock control;
idempotency; snapshot/immutability; state machines; compare-and-set; defence in depth;
input validation versus output encoding; file-upload security; transactional email;
environment management; migration discipline.

**Files to study, in order.**
1. `lib/orders-totals.ts`
2. `store/cart.ts`
3. `components/shop/CheckoutFlow.tsx`
4. `app/checkout/actions.ts`
5. **`lib/orders.ts` — read it twice**
6. `app/admin/orders/actions.ts`
7. `lib/cover-upload.ts`
8. `lib/mail.ts` and `lib/email-templates.ts`
9. `next.config.mjs` (headers) and `middleware.ts`
10. `.env.example` and `prisma/migrations/`

**Exercises.** Write out, step by step, what happens when two customers buy the last
unit simultaneously. Explain why `clientRequestId` needs *both* the pre-read and the
unique constraint. Identify every place a client-supplied value is used, and find its
validation. Design (on paper) the migration you would write to add a `discountCode`
column — and say why it must be nullable.

**Questions.**
1. What exactly stops a customer paying ₹1 for a ₹6,000 shirt?
2. Why is the address frozen as JSON rather than joined at render time?
3. Why can an admin cancel a PROCESSING order but not a SHIPPED one?
4. Why does `storeCoverImage` check magic numbers when it already checked the MIME
   type?
5. Why does `sendVerificationEmail` refuse to send rather than fall back to localhost?

---

## LEVEL 5 — Performance, architecture, production debugging

**Concepts.** Server/client bundle boundaries; database round-trip budgets; connection
pooling in serverless; caching and revalidation; image pipelines; animation
performance and cleanup; graceful degradation; observability; incident triage.

**Files to study.**
* `lib/orders.ts` — the round-trip-budget comment, as an engineering document.
* `app/scores/page.tsx` — per-item error isolation.
* `lib/image-src.ts` — render-time mapping rather than a data migration.
* `components/motion/gsap.ts` and the `useSectionMotion` hook.
* `lib/site-url.ts` — environment-dependent behaviour with honest failure.
* **Parts 11, 24, 25 and 29 of this document.**

**Exercises.** Count the database round-trips in a `/checkout` request. Identify every
place the project chose availability over strictness, and say whether you agree. Propose
a CSP for this app and list what would break. Write a runbook for "the shop shows an
empty catalogue in production".

**Questions.**
1. Why does the project use `force-dynamic` rather than time-based revalidation?
2. What happens to an in-memory rate limiter across serverless instances?
3. Why is the render-time image mapping better than rewriting the rows?
4. Which single change would most reduce the public CSS payload?
5. Which of the three route-level database fallbacks would you extend next, and why?

---
---

# PART 32 — PRACTICAL EXERCISES

> **Do not implement these as part of reading the guide.** They are here to be worked
> through deliberately, on a branch, against a local database.
> **Universal safety rules:** branch first; confirm `DATABASE_URL` is local; never run
> `migrate reset`, `db push` or `db:seed` against anything shared; `npx tsc --noEmit`
> and `npm run lint` before committing.

---

### Exercise 1 — Add a simple component

**Goal.** Create a reusable server component that renders a labelled statistic.

**Files to inspect.** `components/site/Section.tsx`, `components/shop/ShopHero.tsx`.

**Concepts.** Server Components, props, TypeScript prop interfaces, design-system
classes.

**Expected result.** A component you can drop into a page; no `"use client"` needed.

**Safety.** None — presentational only. But if you render a *number*, it must come from
a real row or a cited source. Do not hard-code a statistic.

---

### Exercise 2 — Add a new form field

**Goal.** Add an optional "Company" field to the contact form, end to end.

**Files to inspect.** `components/contact/ContactForm.tsx`, `app/contact/actions.ts`,
`lib/contact-messages.ts`, `prisma/schema.prisma` (`ContactMessage`).

**Concepts.** Controlled inputs, `.field` wrapper spacing, `htmlFor`/`id`, FormData,
schema change, migration.

**Expected result.** The value is validated, stored, and visible in `/admin/messages`.

**Safety.** The column must be **nullable** — existing rows have no value. Generate the
migration locally and read the SQL before committing. Remember the privacy note on
`ContactMessage`: collect only what is needed to answer the enquiry.

---

### Exercise 3 — Add validation

**Goal.** Enforce a maximum of 200 characters on the new field, on both sides.

**Files to inspect.** `app/contact/actions.ts` (`contactSchema`, `ContactFieldErrors`),
`components/contact/ContactForm.tsx` (`LIMITS`).

**Concepts.** Zod, per-field error mapping, mirroring limits client-side for feedback
only.

**Expected result.** Over-length input shows an inline message and never reaches the
database.

**Safety.** The client limit is UX. The server limit is the control. Add both.

---

### Exercise 4 — Add a Server Action

**Goal.** An admin action that toggles `Post.sortOrder` between 0 and 100 ("pin" /
"unpin").

**Files to inspect.** `app/admin/news/actions.ts`, `lib/posts.ts`,
`lib/admin-action-result.ts`.

**Concepts.** `"use server"`, `requireAdmin()`, input validation, `revalidatePath`,
typed results.

**Expected result.** A working toggle with an admin toast.

**Safety.** `await requireAdmin()` must be the **first statement**. Revalidate `/news`
*and* the admin list. Never `redirect()` on failure.

---

### Exercise 5 — Read data with Prisma

**Goal.** Add a "Recent enquiries by category" count to the admin dashboard.

**Files to inspect.** `lib/admin-dashboard.ts`, `lib/contact-messages.ts`,
`app/admin/page.tsx`.

**Concepts.** `groupBy` or `count` with a `where`, parallel queries, projections.

**Expected result.** Real counts on the dashboard.

**Safety.** Read-only. Keep it inside the existing `Promise.all` so you do not add a
serial round-trip.

---

### Exercise 6 — Create a protected route

**Goal.** A `/profile/addresses` page listing the signed-in user's address book.

**Files to inspect.** `app/profile/page.tsx`, `lib/addresses.ts` (`listAddresses`),
`lib/auth.ts` (`requireUser`).

**Concepts.** Auth gating, ownership-scoped queries, `force-dynamic`,
`robots: { index: false }`.

**Expected result.** Signed-out visitors are redirected with a working `?next=`.

**Safety.** Call `listAddresses(user.id)` — never a query without the user id. Add the
path to the `disallow` list in `app/robots.ts` and set page-level `noindex`.

---

### Exercise 7 — Add an admin check

**Goal.** Review every admin action and confirm `requireAdmin()` is the first line.

**Files to inspect.** All nine files under `app/admin/*/actions.ts`.

**Concepts.** Defence in depth; why the action-level check is the real gate.

**Expected result.** A short written audit. (You will find they all pass — the value is
in understanding *why* each one needs it independently.)

**Safety.** Read-only.

---

### Exercise 8 — Add a product

**Goal.** Create a product through `/admin/products`, including an image.

**Files to inspect.** `components/admin/ProductForm.tsx`,
`app/admin/products/actions.ts`, `lib/db.ts` (`createProduct`),
`lib/cover-upload.ts`.

**Concepts.** Multipart Server Actions, image validation, slug generation, the
`stock -> 0` default on creation.

**Expected result.** The product appears on `/shop` — out of stock until you set stock
in `/admin/inventory`.

**Safety.** Local database only. Note `CLAUDE.md`'s warning: a row created in local
SQLite exists only there. Try uploading a `.txt` renamed to `.jpg` and watch the
magic-number check reject it.

---

### Exercise 9 — Modify cart behaviour

**Goal.** Add a per-line maximum quantity of 10 in the cart UI.

**Files to inspect.** `store/cart.ts`, `components/shop/QtyAddToCart.tsx`,
`app/cart/page.tsx`.

**Concepts.** Zustand updates, persistence, hydration guards.

**Expected result.** The stepper stops at 10.

**Safety.** **This is a UX limit only.** The server still validates against real stock —
and must continue to. Do not treat a client cap as a control. Test with an existing
`lions_cart` in localStorage to confirm you have not broken rehydration.

---

### Exercise 10 — Add an email template

**Goal.** A "your order has shipped" email, triggered on the transition to SHIPPED.

**Files to inspect.** `lib/email-templates.ts` (`orderCancellationEmail` is the closest
model), `lib/mail.ts`, `app/admin/orders/actions.ts`,
`prisma/schema.prisma` (`cancellationEmailSentAt` as the pattern for a sent-marker).

**Concepts.** Pure template functions, `escapeHtml` on every value, transport gating,
best-effort sending, idempotent send tracking.

**Expected result.** One email per order, never two.

**Safety.** `escapeHtml` every interpolated value. Add a `shippedEmailSentAt` column and
gate on it — copy `shouldSendCancellationEmail` / `recordCancellationEmailSent`. Never
let a mail failure roll back the status change.

---

### Exercise 11 — Add a GSAP animation

**Goal.** Give an existing section a scroll-triggered image reveal.

**Files to inspect.** `components/motion/gsap.ts`, `components/home/Sections.tsx`
(`useSectionMotion`).

**Concepts.** Reusing primitives, data-attribute opt-in, `gsap.context` cleanup,
reduced motion.

**Expected result.** The image wipes in once; with **Reduce motion** enabled, it is
simply visible.

**Safety.** Do not set the "from" state in CSS. Reuse `revealImageOnScroll` rather than
writing a new tween. Test with reduced motion on.

---

### Exercise 12 — Add an accessible form

**Goal.** Build a small newsletter-signup form to the project's accessibility standard.

**Files to inspect.** `app/(auth)/sign-in/page.tsx` (post-`aea5582`),
`components/contact/ContactForm.tsx`, the `.field` and `label` rules in `globals.css`.

**Concepts.** `htmlFor`/`id`, `autoComplete`, `role="alert"` for errors,
`role="status"` for success, `type="button"` on non-submitters, duplicate-submit
guarding.

**Expected result.** Fully operable by keyboard; errors announced by a screen reader.

**Safety.** Use the `.field` wrapper — Tailwind preflight has already reset the margins.
Do not use `role="tab"` for toggle buttons; the project fixed exactly that mistake in
`aea5582`.

---
---

# PART 33 — CODE WALKTHROUGHS

Fifteen flows, each with: starting file, the function or component, data flow,
validation, database/API interaction, response, UI result.

---

## A. Homepage rendering

1. **Starting file.** `app/page.tsx` (Server Component, `force-dynamic`).
2. **Function.** `HomePage()`.
3. **Data flow.**
   ```tsx
   const [fixtures, coverage, products] = await Promise.all([
     listFixtures().catch(() => []),
     listActiveMediaCoverage("OFFICIAL").catch(() => []),
     listProducts().catch(() => []),
   ]);
   ```
   Then three derivations: `stories` (featured official news, `.filter(m => m.featuredOnHome).slice(0,1)`),
   `store` (`{ items: products.length, categories: new Set(products.map(p => p.cat)).size }`),
   and `seasonRows` (upcoming first, then past, capped at 5).
4. **Validation.** None needed — no user input. The integrity constraint is different
   here: every number is counted from rows.
5. **Database.** Three parallel Prisma reads, each individually caught.
6. **Response.** Server-rendered HTML plus the RSC payload.
7. **UI result.** `<Hero next={next} />` then seven chapters. The hero's "Next" rail is
   `null` when nothing is upcoming, and the rail disappears rather than showing a stale
   event. `Media` renders nothing if no story is featured. GSAP choreography attaches on
   the client via `useSectionMotion`.

---

## B. User registration

1. **Starting file.** `app/(auth)/sign-up/page.tsx` → `<form action={signUp}>`.
2. **Function.** `signUp(formData)` in `app/(auth)/actions.ts`.
3. **Data flow.** `name`, `email`, `password`, optional `next`.
4. **Validation.** `safeNext()`, then
   `signUpSchema` (name >= 2, valid email, password >= 8). On failure:
   `redirect("/sign-up?error=<message>")`.
5. **Database.** `registerUser()` → `findUnique` on email, `bcrypt.hash(pw, 10)`,
   `prisma.user.create`. Then `issueEmailVerificationToken()` inserts a hashed token.
   Then `createSession()` inserts a `Session` row.
6. **Side effects.** `sendWelcomeEmail` and `sendVerificationEmail`, both awaited, both
   best-effort, both wrapped so a throw cannot escape.
7. **Response.** `redirect("/check-email?next=…&verify=sent|failed")`.
8. **UI result.** The check-your-email panel, stating honestly whether a link was
   actually sent. The account exists but `getCurrentUser()` reports it as signed out
   until the address is confirmed.

---

## C. User login

1. **Starting file.** `app/(auth)/sign-in/page.tsx`.
2. **Function.** `signIn(formData)`.
3. **Data flow.** `email`, `password`, optional `next`.
4. **Validation.** `signInSchema.safeParse` → `?error=invalid`.
5. **Rate limit.** `getLoginRateLimitState(email, clientIp)`. Blocked → `?error=creds`
   (the same message as a wrong password).
6. **Credentials.** `verifyCredentials()` — dummy bcrypt compare when there is no user.
   On failure: `recordLoginFailure()` then `?error=creds`.
7. **Success.** `clearLoginRateLimits()`, `createSession()` (new `Session` row + cookie).
8. **Response.** `/check-email` if gated, else `next ?? (ADMIN ? "/admin" : "/profile")`.
9. **UI result.** `app/layout.tsx` calls `getCurrentUser()` on the next request and
   `<Nav>` switches to the signed-in state.

---

## D. Authentication / session verification

Runs on **every** request that needs a user.

1. **Starting file.** `lib/auth.ts`.
2. **Functions.** `getPendingUser()` → `getCurrentUser()` → `requireUser()` /
   `requireAdmin()`.
3. **Data flow.**
   ```
   cookies().get("lions_session")?.value
        |  none -> null
        v
   prisma.session.findUnique({ where: { token }, include: { user: true } })
        |  none, or expiresAt < now -> null
        |  any DB error -> caught -> null   (treated as logged out, never a 500)
        v
   toSafe(session.user)   ->  SafeUser (no passwordHash)
        v
   getCurrentUser(): verificationRequired ? null : user
        v
   requireUser(next):  gated -> /check-email  |  absent -> /sign-in?next=
   requireAdmin():     gated -> /check-email  |  absent -> /sign-in  |  not ADMIN -> /?denied=admin
   ```
4. **Database.** One indexed read per call.
5. **UI result.** Either the protected page renders, or a redirect occurs.

---

## E. Product listing

1. **Starting file.** `app/shop/page.tsx`.
2. **Function.** `ShopPage()`.
3. **Data flow.** `listProducts().catch(() => [])` → `where: { active: true }`,
   `orderBy: { createdAt: "asc" }` → `rows.map(toProduct)`.
4. **Derivations.** `categoryCount` from a `Set`; `lowestPrice` via `reduce`, or `null`
   when there is nothing.
5. **Response.** `<ShopHero>` plus either `<ShopBrowser products={products} />` or the
   `EmptyState`.
6. **UI result.** Cards resolve their image through `productImage()` → `images[0]` →
   `img` → `FALLBACK_LOGO`, each passed through `webSrc()` for the optimised derivative.

---

## F. Add to cart

1. **Starting file.** `app/product/[id]/page.tsx` (server) renders
   `components/shop/QtyAddToCart.tsx` (client).
2. **Function.** `useCart((s) => s.add)`.
3. **Data flow.** `add({ id, name, price, img }, qty)` → merges with an existing line or
   appends → Zustand `persist` writes `localStorage["lions_cart"]`.
4. **Validation.** None client-side beyond the stepper — **deliberately**, because the
   cart is intent, not authority.
5. **Database.** None.
6. **UI result.** The nav cart count updates (behind `useCartHydrated()`), and a toast
   appears via `store/toast.ts`.

---

## G. Checkout

1. **Starting file.** `app/checkout/page.tsx`.
2. **Server work.** `requireUser("/checkout")` then `listAddresses(user.id)`.
3. **Component.** `<CheckoutFlow user={user} savedAddresses={savedAddresses} />`.
4. **Client state.** `step`, `addressChoice`, `inline`, `saveAddress`, `contactEmail`,
   `contactPhone`, `paymentMethod`, `notes`, `error`, and `clientRequestId` (generated
   once on mount).
5. **Step 1 validation.** `validateStep1(...)` — surfaced as a banner; not a control.
6. **Step 2.** Payment method, review, confirm.
7. **Submit.** Builds FormData, serialises the cart as
   `JSON.stringify(items.map(i => ({ productId: i.id, qty: i.qty })))` — note: **no
   prices** — and calls `placeOrderAction` inside `startTransition`.
8. **UI result.** On success: `clearCart()` then `router.push("/orders/<id>")`. On
   `INSUFFICIENT_STOCK`: the error is shown and the flow returns to step 1.

---

## H. Order creation

1. **Starting file.** `app/checkout/actions.ts`.
2. **Function.** `placeOrderAction(formData)`.
3. **Auth.** `requireUser("/checkout")` — re-checked so a stale form cannot post after
   the session lapsed.
4. **Parse.** `parseCart()` keeps only `{productId, qty>0}`. Contact email must match
   `/^\S+@\S+\.\S+$/`; phone must have >= 7 digits; payment method must be in
   `PAYMENT_METHODS`.
5. **Address.** If inline and "save" was ticked, `createAddress()` runs **before** the
   order transaction — *"so a downstream order failure doesn't leave the user with a
   partially-formed record they have to re-enter."* If that fails, it falls through to
   shipping inline.
6. **`placeOrder()`.**
   ```
   merge quantities per productId
   idempotency read on clientRequestId (scoped to userId)
   BEGIN
     resolve address -> snapshot (ownership checked for a saved address)
     re-read Product rows                     <- authoritative
     per line: exists? active? stock >= qty?  <- else InsufficientStockError
     ONE UPDATE ... FROM (VALUES ...) WHERE active AND stock >= qty RETURNING id
     applied.length !== lines.length -> InsufficientStockError (rollback)
     computeTotals(lines)
     order.create + nested items  (retry <=5 on orderNumber collision;
                                   P2002 on clientRequestId -> DuplicateClientRequestError)
   COMMIT
   ```
7. **Emails.** COD only, each gated on its own `codUserEmailSentAt` /
   `codAdminEmailSentAt` column and recorded only after a real `sent: true`.
8. **Revalidate.** `/profile/orders`, `/orders/<id>`, `/admin/orders`.
9. **Response.** `{ ok: true, orderId, orderNumber }`.
10. **UI result.** The order confirmation page, showing the frozen snapshot.

---

## I. Order cancellation

**Admin-only. There is no user-facing cancellation in this repository.**

1. **Starting file.** `app/admin/orders/[id]/page.tsx` → a status form.
2. **Function.** `updateOrderStatusAction(formData)`.
3. **Auth.** `requireAdmin()`.
4. **Validation.** `id` present; `status` in `ORDER_STATUSES`; order exists;
   `canTransition(order.status, "CANCELLED")` — which refuses SHIPPED and DELIVERED.
5. **Database.** Routed to `cancelOrderAndRestock(id)`:
   ```
   BEGIN
     read order + items
     already CANCELLED/REFUNDED -> return unchanged (idempotent)
     canTransition? -> else null
     updateMany WHERE id AND status = expected      <- compare-and-set
     count !== 1 -> null (lost the race)
     ONE UPDATE ... SET stock = stock + v.qty
   COMMIT
   ```
6. **Email.** `shouldSendCancellationEmail(prev, next, sentAt)` →
   `sendOrderCancellationEmail` → `recordCancellationEmailSent` (itself guarded by
   `cancellationEmailSentAt: null` in the `where`).
7. **Revalidate.** Both admin and buyer surfaces.
8. **Response.** `{ ok: true, message: "<orderNumber> cancelled and its items returned to stock." }`.
9. **UI result.** An admin toast; the buyer's order page reflects CANCELLED; stock is
   back.

---

## J. Admin authorization

1. **Request.** `GET /admin/products`.
2. **Edge.** `middleware.ts` — matcher `/admin/:path*`. No cookie →
   `/sign-in?next=%2Fadmin%2Fproducts`.
3. **Layout.** `app/admin/layout.tsx` → `requireAdmin()` → `getAdminBadges()` →
   `<AdminChrome>`.
4. **Page.** `app/admin/products/page.tsx` → `requireAdmin()` again. This is the real
   gate, because layouts do not re-render on client navigation.
5. **Action.** `createProductAction` / `updateProductAction` / etc. → `requireAdmin()`
   as the first statement. This is what protects against a POST that never loaded a page.
6. **Role source.** `prisma.session.findUnique(...).include({ user: true })` — the
   database, on every request. A demotion takes effect immediately.

---

## K. Contact form submission

1. **Starting file.** `app/contact/page.tsx` → `components/contact/ContactForm.tsx`.
2. **Client.** `onSubmit` with `e.preventDefault()`, an `inFlightRef` duplicate guard,
   `fd.set("topic", topic)`, then `await submitContact(fd)`.
3. **Function.** `submitContact(formData)` in `app/contact/actions.ts`.
4. **Validation.** `toCategory()` matches against `CONTACT_TOPICS` case-insensitively
   and falls back to the first topic. `contactSchema.safeParse` validates five fields
   with explicit maxima. Failure → `{ ok: false, message, fieldErrors }`.
5. **Database.** `createContactMessage({...})` — **first**, before any email.
6. **Emails.** `Promise.allSettled([confirmation, notification])`. Neither outcome
   changes the return value. `reason === "not-configured"` is not logged as an error.
7. **Revalidate.** `/admin/messages`.
8. **Response.** `{ ok: true, message: "Roger. We'll be back to you within two working days." }`.
9. **UI result.** The form swaps to a `role="status"` success panel with a "Send another
   message" button, and scrolls it into view.

---

## L. Email sending

1. **Entry.** Any of the seven live senders in `lib/mail.ts`.
2. **Template.** A pure function in `lib/email-templates.ts` returns
   `{ subject, text, html }`, with `escapeHtml()` on every interpolated value.
3. **Gate.** `isContactSmtpConfigured()` — all four variables, or
   `{ sent: false, reason: "not-configured" }` with no attempt.
4. **Transport.** `getContactTransporter()` — one cached Nodemailer transport per
   process, `smtp.gmail.com:465`, `secure: true`.
5. **From.** `resolveFromAddress()` forces the header to match `SMTP_USER`, logging a
   mismatch without printing either address.
6. **Send.** `transporter.sendMail(...)` inside `try/catch`. Never throws.
7. **Result.** `{ sent: true, provider: "smtp" }` or
   `{ sent: false, reason: "error", detail }`.
8. **Caller behaviour.** Logs a real error; never rolls back the database write; the
   verification resend is the one place that reports the failure to the user.

---

## M. The IGPL endpoint

1. **Starting file.** `app/api/sync/igpl/route.ts`.
2. **Function.** `GET(req: NextRequest)`.
3. **Auth.**
   ```
   !CRON_SECRET && production                 -> 500 "sync authentication is not configured"
   CRON_SECRET && auth !== "Bearer <secret>"  -> 401 "unauthorized"
   ```
4. **Flag.** `IGPL_SYNC_ENABLED !== "true"` → `503 { disabled: true, note }`.
5. **Database.** When enabled: three `count()` calls only.
6. **Response.** `{ ok: true, syncedAt, source: "no-op-stub", counts, note }`.
7. **UI result.** None — there is no UI. `vercel.json` has `"crons": []`, so nothing
   calls it on a schedule.

---

## N. Fixture loading

1. **Starting file.** `app/fixtures/page.tsx` (`force-dynamic`).
2. **Data.** `listFixtures().catch(() => [])` →
   `orderBy: [{ sortOrder: "asc" }, { dateStart: "asc" }]`.
3. **Transform.** `byMonth(fixtures)` groups into month buckets preserving query order;
   `statusOf(f)` maps `FixtureStatus` to a label and a CSS class.
4. **Constants.** Exactly two hard-coded numbers, both cited to brochure p. 05.
5. **Render.** A month-grouped editorial calendar. No venue photography — the page
   carries a long comment explaining that the real venues' photographs are copyrighted,
   that Wikimedia has nothing for them, and that a generic stock course photograph under
   a named real place would be the misleading imagery the brief forbids.
6. **Empty / failure.** No rows → the calendar's own empty state, never a 500.

---

## O. Scores loading

1. **Starting file.** `app/scores/page.tsx` (`force-dynamic`).
2. **Data.**
   ```ts
   const fixtures = await listFixtures().catch(() => []);
   // then one listScoresForFixture per fixture, caught PER FIXTURE
   ```
   The per-fixture catch is deliberate: *"a bare Promise.all rejects the whole"* batch
   if any single read fails.
3. **Transform.**
   * `ROSTER_NAMES` — a `Set` of lowercased roster names, used to mark the franchise's
     own rows (the `is-lions` marker).
   * `positionRank()` — reorders golf positions correctly, because `Score.position` is a
     `String` column that Postgres would sort lexically (`1, 4, 5, 6, T2, T2`).
   * `splitName()`, `placeOf()` — presentation helpers.
4. **Masthead.** Counts real rows: fixtures on the card, and how many have a published
   card. *"Both are computed here, not typed in."*
5. **Render.** `<ScoreExperience>` draws each board. A fixture with no scores gets an
   **unlit** board.
6. **Failure.** Empty list → masthead reports "Scoring offline", Events 0 / Live 0 —
   *"the same honest position an empty Fixture table produces."*

---
---

# PART 34 — IMPORTANT DESIGN DECISIONS

Each entry: the decision, the reason as recorded in the repository, the alternative,
why the alternative was not used, and the trade-off. Nothing here is inferred where the
repository is silent — silence is marked.

---

### 1. Custom authentication instead of Clerk or Auth.js

**Reason.** Not stated as a rationale anywhere; what exists is the implementation.
`CLAUDE.md` describes the custom system accurately in its *Accounts & Authentication*
section, while a stale line under *Component Guidelines* still recommends Clerk or
Auth.js.

**Alternative.** A managed provider.

**Why not.** **Not confirmed from the repository.** What the implementation *buys* is
visible: instant revocation by deleting a row, a role read fresh from the database on
every request, and no third-party dependency in the auth path.

**Trade-off.** Roughly 220 lines to own and maintain, and no OAuth, MFA or
password-reset flow out of the box. `CLAUDE.md` lists password reset as optional
remaining work.

---

### 2. Opaque session tokens instead of JWTs

**Reason.** From `lib/auth.ts`: *"Sessions are random opaque tokens stored in the
Session table... Deleting the row signs the user out everywhere."*

**Alternative.** A signed JWT in the cookie.

**Why not.** A JWT cannot be revoked before it expires, and a role cached inside one
goes stale. This project explicitly relies on the opposite: *"role is checked separately
by requireAdmin() on every request, not cached in the session."*

**Trade-off.** One database read per authenticated request, versus a signature check.

---

### 3. A 90-day session, up from 30

**Reason, verbatim.** *"A merch/fan account carries no payment-instrument or
admin-by-default risk on its own... a longer 'stay signed in' window trades a little
session lifetime for meaningfully fewer forced re-logins — 90 days, not indefinite."*

**Alternative.** 30 days, or a rolling refresh.

**Trade-off.** A stolen cookie is useful for longer. Mitigated by httpOnly, the
server-side expiry check, and the admin's session-revoke action.

---

### 4. Verify-before-activate with a date cutoff instead of a column

**Reason, verbatim.** *"A date rather than a new column so no migration is needed; the
schema already records createdAt and emailVerifiedAt."* And: legacy accounts *"keep the
behaviour they always had — sign-in works, verification stays optional"* so nobody was
locked out when the rule landed.

**Alternative.** A `requiresVerification` boolean backfilled per user.

**Why not.** A migration plus a backfill, and a decision to make about every existing
row.

**Trade-off.** The cutoff is a constant in code. Changing the policy means a deploy.

---

### 5. Integer rupees everywhere

**Reason.** Consistent across the schema (`price Int`, `subtotal Int`, `total Int`) and
noted in `lib/orders-totals.ts`: *"All values are integer INR (whole rupees) — same
convention as the Product.price and Order.* fields in Prisma."*

**Alternative.** `Decimal`, or floats.

**Why not.** Floats cannot represent money exactly. `Decimal` would work but adds
conversion friction everywhere, and the smallest unit in use here is the rupee.

**Trade-off.** No sub-rupee pricing. Currently not needed.

---

### 6. Snapshotting the address and line items

**Reason, verbatim.** *"freezes the delivery address at order time so later edits to the
source Address row don't retro-change history"* and *"Frozen snapshots — never
re-derived from Product later."*

**Alternative.** Join to the live rows at render time.

**Why not.** Renaming a product or correcting an address would rewrite history.

**Trade-off.** Duplicated data, and a `Json` column that needs a typed accessor
(`readShippingSnapshot`) with a fallback for every field.

---

### 7. One raw SQL statement for the stock decrement

**Reason.** The measured latency budget, documented in full in the code: ~290ms per
round-trip, ~1.2s for BEGIN/COMMIT, Prisma's 5000ms budget exhausted at about nine
round-trips, `P2028` at roughly six cart lines.

**Alternative.** One `updateMany` per line (the previous implementation).

**Why not.** It broke on real carts.

**Trade-off.** Postgres-specific SQL in an otherwise ORM-only codebase. The comment
notes the semantics are deliberately unchanged.

---

### 8. Two-layer idempotency

**Reason.** The comment distinguishes the cases precisely: the pre-transaction read
handles *"the common case [of] two requests that arrive sequentially (even
'simultaneous' clicks are milliseconds apart over the network)"*; the `@unique`
constraint is *"what still makes this correct for a genuine concurrent race, not just
the sequential case."*

**Alternative.** Either layer alone.

**Why not.** The read alone loses a true race; the constraint alone starts a second
transaction and a second stock decrement before failing.

**Trade-off.** More code, and a `clientRequestId` that must be threaded from the client.

---

### 9. Database columns for email-sent tracking

**Reason, verbatim.** *"an in-process flag is gone the moment the server restarts or the
request runs on a different serverless instance, which is exactly when a retry is most
likely to happen."*

**Alternative.** An in-memory set.

**Trade-off.** Three extra nullable columns on `Order`.

---

### 10. Email as a best-effort side effect

**Reason.** Stated in several places, most clearly in `app/contact/actions.ts`: *"a
missing mail transport must never be the reason an enquiry that already saved to the
database looks like it failed."*

**Alternative.** Transactional email, or a queue.

**Why not.** SMTP cannot join a database transaction, and a queue is infrastructure this
project does not have.

**Trade-off.** A send can be lost with no retry. Mitigated by the sent-marker columns
and, for verification, by an explicit resend action.

---

### 11. `force-dynamic` plus `revalidatePath`, not ISR

**Reason.** Per-route comments: *"Always resolve against the current DB row set so admin
edits are reflected immediately"*; *"Live rounds change every few minutes during a
tournament week."*

**Alternative.** `export const revalidate = 60`.

**Why not.** **Not explicitly compared in the repository.** What the chosen approach
buys is that an admin edit is visible on the very next request with no stale window.

**Trade-off.** Every request hits the database. `app/fixtures/page.tsx` acknowledges it:
*"Fixtures are low-volume so the extra request cost is trivial."*

---

### 12. Empty states instead of placeholder data

**Reason.** The project's first rule. Enforced in `/scores`, `/leaderboards`,
`/fixtures`, `/shop` and the route-level fallbacks.

**Alternative.** Sample rows, cached data, or "coming soon" numbers.

**Why not.** The site publishes official sport results. A plausible-looking wrong number
is worse than a blank.

**Trade-off.** Pages can look sparse early in a season. The project treats that as
correct, and writes counted, honest copy for it.

---

### 13. Render-time image derivative mapping

**Reason, verbatim.** *"Rewriting every row would leave admin-entered paths broken again
the next time someone pastes an original filename, so the mapping is applied at render
time instead."*

**Alternative.** A data migration rewriting stored paths.

**Trade-off.** A hand-maintained lookup table in `lib/image-src.ts`.

---

### 14. One image-storage module for three features

**Reason, verbatim.** *"one storage path for every admin image, so the Blob/local
fallback rule lives in exactly one place."*

**Trade-off.** The `UploadFolder` union has to be extended for each new namespace — a
deliberate, visible change rather than a new copy of the logic.

---

### 15. Pre-rendering article HTML at save time

**Reason.** From `schema.prisma`: *"bodyJson round-trips the TipTap editor state;
bodyHtml is pre-rendered so the public page never loads editor libraries."*

**Alternative.** Store JSON only and render it on the public page.

**Why not.** That would put TipTap in the public bundle.

**Trade-off.** Two representations to keep in sync, and sanitisation must be applied at
render (which it is) so pre-existing rows are covered.

---

### 16. Splitting `-format` modules out of `server-only` data modules

**Reason.** From `lib/orders-format.ts`: *"Kept out of lib/orders.ts so client
components can import them without pulling in the server-only Prisma surface."*

**Trade-off.** More files. In exchange, `import "server-only"` can stay on every data
module without blocking the client.

---

### 17. Actions return results; they do not redirect on failure

**Reason, verbatim.** *"that throws NEXT_REDIRECT, which a client form cannot tell apart
from a crash, and it discards everything the admin typed."*

**Trade-off.** Every call site must handle the result. That is also the benefit — the
type system forces it.

---

### 18. Deferring Content-Security-Policy

**Reason, verbatim.** A strict CSP with nonces is *"scheduled for the design-system
consolidation milestone once the styling is refactored off inline style attributes...
Keeping the two changes in separate PRs keeps blast-radius small if something
regresses."*

**Trade-off.** No CSP today. The other baseline headers are in place. This is
**intentionally deferred work**, documented at the point of decision — not an oversight.

---

### 19. Keeping a SQLite escape hatch

**Reason.** `CLAUDE.md` describes it as a preserved local-offline path.

**Current state.** `prisma/schema.sqlite.prisma` has **9 models and 6 enums** versus
Postgres's **15 and 9**. It has no `Address`, `Order`, `OrderItem`, `AuthRateLimit`,
`EmailVerificationToken` or `PhoneOtp`.

**Trade-off, as it stands.** The escape hatch cannot run commerce, login rate limiting
or verification. See **Part 35**.

---

### 20. Not building the IGPL scraper yet

**Reason, verbatim.** The endpoints *"are not a published API with terms, versioning or
a stability guarantee, and they can change or close without notice. Get IGPL's agreement
before wiring production to them."*

**Alternative.** Scrape now.

**Why not.** Legal and relationship risk, plus fragility.

**Trade-off.** Fixtures, scores and standings are hand-keyed. The schema and the public
pages are already shaped so that switching the sync on requires no downstream change.

---
---

# PART 35 — KNOWN LIMITATIONS / FUTURE WORK

Four categories, kept strictly separate. **Nothing in this chapter is a claim that the
system is broken.**

---

## 35.1 CONFIRMED ISSUES

*Verifiable discrepancies between the repository's own documentation and its code, or
between two parts of the code. Each is a fact, not an opinion.*

### 1. `vercel.json` has no cron, but `CLAUDE.md` says it does

**DOCUMENTATION:** *"gated behind `IGPL_SYNC_ENABLED` (default `false`) and scheduled by
`vercel.json`"* and *"`vercel.json` — IGPL sync cron (\*/15)"*.

**CURRENT IMPLEMENTATION:** `{ "$schema": "...", "crons": [] }`. Nothing is scheduled.

`.env.example` is the accurate one: *"the endpoint short-circuits and vercel.json has no
cron entry."* Practically harmless — the endpoint is a no-op anyway — but the guide is
wrong.

### 2. `prisma/schema.sqlite.prisma` has drifted

| | Postgres | SQLite |
|---|---|---|
| Models | 15 | 9 |
| Enums | 9 | 6 |
| Missing from SQLite | — | `Address`, `Order`, `OrderItem`, `AuthRateLimit`, `EmailVerificationToken`, `PhoneOtp`, `OrderStatus`, `PaymentStatus`, `PaymentMethod` |

**DOCUMENTATION:** *"two Prisma schemas that share identical model definitions and
differ only in the datasource provider"*, with *"the same 8 models"* and *"the same 5
enums"*.

**CURRENT IMPLEMENTATION:** Neither count matches either schema, and the two schemas are
not equivalent. The documented `npm run db:sqlite:*` path cannot run commerce, login
rate limiting or verification.

### 3. `CLAUDE.md` model and enum counts are stale

It states **8 models** and **5 enums**. The Postgres schema has **15 and 9**.

### 4. `CLAUDE.md` route count is stale

It states *"42 routes and growing"*. There are **47 page routes** (27 public, 20 admin)
plus one API route.

### 5. `CLAUDE.md` describes the news editor as pending

**DOCUMENTATION:** *"News (`/admin/news`): scaffold for a rich-text editor (TipTap/Quill)
— pending"*, and under *Remaining Work*: *"News editor: add the rich-text UI + a `Post`
model."*

**CURRENT IMPLEMENTATION:** `components/admin/PostEditor.tsx` is a working TipTap editor
with a toolbar, the `Post` model exists with the full DRAFT/PUBLISHED/ARCHIVED workflow,
and `/news` plus `/news/[slug]` render from it.

### 6. `CLAUDE.md` recommends Clerk or Auth.js

**DOCUMENTATION:** under *Component Guidelines*: *"Use **Clerk** or **Auth.js** to secure
member and admin routes."*

**CURRENT IMPLEMENTATION:** Neither is installed. Authentication is custom
(`lib/auth.ts`). The same file documents the custom system correctly elsewhere, so this
is an internally inconsistent line.

### 7. `/admin/igpl-sync` does not exist

`CLAUDE.md` describes a *"Manual Override Console"* at that path. There is no such
route. The equivalent manual editing is spread across `/admin/fixtures`,
`/admin/scores` and `/admin/leaderboards`.

### 8. `package.json` references a missing script

```json
"stage:t6:snapshot": "tsx scripts/stage-t6-stock.ts snapshot",
"stage:t6:restore":  "tsx scripts/stage-t6-stock.ts restore"
```

`scripts/stage-t6-stock.ts` is not present. Both commands will fail.

### 9. `.env.example` has a stray character

```
#   DIRECT_URL   — the DIRECT Neon connection (no "-pooler" in hostname);c
```

Trailing `c` in a comment. Cosmetic.

---

## 35.2 CURRENT LIMITATIONS

*Real constraints on what the system can do today. All are known and, in most cases,
deliberately scoped.*

| # | Limitation | Detail |
|---|---|---|
| 1 | **No online payment** | Only COD and OFFLINE_INVOICE are live. `ONLINE_TBD` is a scaffolded enum slot; `Order.paymentRef` awaits a gateway. No Razorpay, Stripe or webhook handler exists |
| 2 | **No SMS transport** | Phone OTP logic is complete, but `lib/sms.ts` reports `not-configured`. India additionally requires DLT registration and an approved template — noted in `.env.example` |
| 3 | **No IGPL automation** | Hand-keyed through the admin console. See **Part 26** |
| 4 | **No password reset** | Listed as optional remaining work in `CLAUDE.md` |
| 5 | **No session rotation on password change** | Also listed as optional remaining work |
| 6 | **No user-facing order cancellation** | Admin-only |
| 7 | **No Content-Security-Policy** | Intentionally deferred; see **Part 34.18** |
| 8 | **No automated test suite** | One integration harness (`npm run test:checkout`) and no unit-test runner |
| 9 | **No CI** | No `.github/workflows`. Type-check, lint and build are manual |
| 10 | **No structured data** | No JSON-LD anywhere |
| 11 | **No performance measurement** | No Lighthouse report, Web Vitals reporting, bundle analysis or load test |
| 12 | **No accessibility audit** | Real, deliberate a11y work exists (**Part 21**) but no axe/pa11y/Lighthouse config and no recorded screen-reader pass |
| 13 | **`sendOrderReceipt` is dormant** | Both branches return `sent: false`. Non-COD orders therefore get no email |
| 14 | **`/leaderboards` has no DB fallback** | Unlike `/fixtures`, `/scores` and `/shop`. A database failure there reaches the error boundary. Whether this is intentional is not recorded |
| 15 | **One root `loading.tsx` and one root `error.tsx`** | No route-scoped variants, so no partial streaming |
| 16 | **Single admin role** | `Role` is `USER \| ADMIN`. No editor/operator distinction |
| 17 | **Global CSS payload** | 14,567 lines shipped to every visitor |
| 18 | **`lib/image-src.ts` is hand-maintained** | A new original needs a new map entry |

---

## 35.3 INTENTIONALLY DEFERRED WORK

*Decided, documented, and waiting on something specific.*

| Item | Waiting on | Recorded where |
|---|---|---|
| Content-Security-Policy | The design-system consolidation milestone (styling off inline `style` attributes) | `next.config.mjs`, `CLAUDE.md` |
| IGPL sync | IGPL's agreement on a documented feed or per-franchise export | `CLAUDE.md` section 5 |
| Online payment | A chosen gateway. The enum slot is pre-built so it is *"a swap not a rewrite"* | `prisma/schema.prisma` |
| SMS delivery | A provider, plus DLT registration for India | `lib/sms.ts`, `.env.example` |
| `sendOrderReceipt` | A transport decision for non-COD orders | `lib/mail.ts`, `CLAUDE.md` |
| Password reset / email verification extras | Marked "Optional" | `CLAUDE.md` |

---

## 35.4 CURRENTLY WORKING BEHAVIOUR

*Stated explicitly so nothing above is mistaken for a defect.*

* Public editorial site — all 27 public routes render.
* Accounts: sign-up, sign-in, sign-out, profile editing, email verification.
* Verify-before-activate gating.
* Login rate limiting, per email and per IP.
* Full commerce: catalogue, product pages, cart, two-step checkout, COD and offline
  invoice, order confirmation, order history.
* Server-authoritative pricing and atomic stock control.
* Idempotent order placement.
* COD confirmation and admin notification emails, with duplicate-send protection.
* Admin cancellation with restock and a cancellation email.
* The complete admin console: products, inventory, orders, users, messages, news
  (TipTap), media, fixtures, scores, leaderboards.
* Image upload with magic-number validation, to Blob or local disk.
* Contact form: persistence plus two emails.
* Welcome and verification emails.
* SEO: metadata, canonicals, robots, a dynamic sitemap.
* Graceful database fallbacks on `/`, `/fixtures`, `/scores`, `/shop`, the sitemap and
  the admin badges.
* Baseline security headers, and the edge plus server admin gate.
* The GSAP and CSS animation systems, with reduced-motion support throughout.

---

## 35.5 FUTURE IMPROVEMENTS

*Opportunities, ordered by value. None is required for the system to work.*

### High value

1. **Update `CLAUDE.md`** to match the code — the counts, the news editor, the Clerk
   line, `/admin/igpl-sync`, and the cron claim. It is the first file a new developer
   reads, and six of the nine confirmed issues above are in it.
2. **Bring `schema.sqlite.prisma` back into sync, or retire it.** A half-working escape
   hatch is worse than a documented Postgres-only requirement.
3. **Add CI** — `tsc --noEmit`, `lint` and `build` on every push. Cheap, and it catches
   the case-sensitivity class of bug that only appears on Vercel.
4. **Add the missing `scripts/stage-t6-stock.ts`**, or remove the two npm scripts.
5. **Extend the database fallback to `/leaderboards`** — the empty state already exists.

### Medium value

6. **Content-Security-Policy**, once the styling refactor lands.
7. **A unit-test runner** (Vitest) for the pure modules first: `orders-totals`,
   `orders-format`, `news-desk`, `image-src`, `verification`'s `normalisePhone`. These
   are pure functions with clear contracts — the easiest high-value coverage available.
8. **Structured data** — `Product` on `/product/[id]`, `Organization` on `/`,
   `BreadcrumbList` on the shop.
9. **Password reset.**
10. **Session rotation on password change.**
11. **Route-scoped `loading.tsx`** on the database-heavy routes, for streaming.
12. **A user-facing cancel** for orders still in PENDING, reusing
    `cancelOrderAndRestock` behind an ownership check.

### Lower value / longer horizon

13. Split `globals.css` by route.
14. An online-payment integration.
15. An SMS provider.
16. The IGPL sync, once agreement is in place.
17. A finer-grained role model.
18. Wire `sendOrderReceipt` for non-COD orders.
19. Automated accessibility checks in CI.
20. Bundle analysis and a Web Vitals baseline.

---

## 35.6 What this document could not determine

Stated plainly, per the brief:

* **The production domain.** Not recorded in the repository.
* **Whether `/leaderboards` lacking a `.catch()` is intentional.** No comment either way.
* **Why `npx next build` was sometimes used instead of `npm run build`.** No commit
  message, comment or documentation mentions it. **Part 27.3** gives only the mechanical
  difference between the two commands.
* **Neon runtime behaviour beyond pooling and the measured latency figures.** Cold-start
  and autosuspend behaviour is not documented here.
* **Whether any accessibility or performance testing was ever performed.** No artefacts
  exist in the repository.
* **The contents of `components/` files not read in full.** Roughly 30 of the 100+
  components were read end to end; the rest were read for their exports, props and
  boundaries. Nothing in this document describes their internals beyond that.
* **Runtime data.** No database was queried. Row counts, order volumes and catalogue
  size are unknown.

---
---

# PART 36 — FINAL CHEAT SHEET

## Commands

```bash
# Development
npm run dev                 # http://localhost:3000
npm run build               # prisma generate && next build  <- what Vercel runs
npm run start               # serve a production build
npm run lint                # eslint (next/core-web-vitals)
npm run typecheck           # tsc --noEmit
npx tsc --noEmit            # same thing, directly

# Database - SAFE
npx prisma generate         # regenerate the client. Touches no data
npm run db:studio           # GUI. Read freely; every edit is live
npm run db:deploy           # prisma migrate deploy - production migrations

# Database - DANGEROUS (see Part 11)
npm run db:migrate          # migrate dev - LOCAL ONLY. May offer to reset
npm run db:seed             # rewrites the admin user
npx prisma db push          # NO migration file. Drops columns silently
npx prisma migrate reset    # DESTROYS EVERYTHING

# Scripts
npm run test:checkout               # 5 checkout scenarios. NEVER against production
npm run db:sync-product-assets      # align product image paths with disk

# SQLite escape hatch (schema is STALE - see Part 35.1)
npm run db:sqlite:generate
npm run db:sqlite:migrate
npm run db:sqlite:seed

# Git - remote is "Lions", not "origin"
git status
git diff
git checkout -b feature/thing
git push Lions feature/thing
git log --oneline
git show --stat <sha>
```

## Folders

| Folder | Contains |
|---|---|
| `app/` | Routes, layouts, Server Actions, `globals.css` |
| `components/` | React components, grouped by feature |
| `lib/` | Business logic and data access — the real backend |
| `data/` | Code-owned content: `products.json`, `players.ts` |
| `store/` | Zustand: `cart`, `toast`, `admin-toast` |
| `prisma/` | Schema, migrations, seed |
| `scripts/` | Operational and test scripts |
| `public/` | Static assets — **world-readable** |

## Files that matter most

| File | Why |
|---|---|
| `prisma/schema.prisma` | The data model, and its reasoning in the comments |
| `lib/auth.ts` | The whole auth system |
| `lib/orders.ts` | Transactions, idempotency, race safety |
| `lib/db.ts` | Catalogue CRUD |
| `lib/mail.ts` | Every email sender |
| `lib/verification.ts` | Tokens and OTPs |
| `lib/prisma.ts` | The single client |
| `app/layout.tsx` | Fonts, metadata, auth, chrome |
| `app/checkout/actions.ts` | The commerce entry point |
| `middleware.ts` | Edge admin gate |
| `next.config.mjs` | Headers, image hosts, body limit |
| `tailwind.config.ts` | Brand tokens |
| `app/globals.css` | The design system |
| `CLAUDE.md` | Project rules — **cross-check against Part 35.1** |
| `.env.example` | Every environment variable, documented |

## Public routes

```
/  /the-club  /the-pride  /players  /golf-development  /vimtra-ventures
/invest  /partners  /news  /news/[slug]  /contact  /privacy  /terms
/fixtures  /scores  /leaderboards
/shop  /product/[id]  /cart  /checkout  /orders/[id]
/sign-in  /sign-up  /check-email  /verify-email  /profile  /profile/orders
```

## Admin routes

```
/admin
/admin/products  /admin/products/[id]/edit
/admin/inventory
/admin/orders    /admin/orders/[id]
/admin/users
/admin/messages
/admin/news      /admin/news/new  /admin/news/[id]/edit  /admin/news/editorial
/admin/media     /admin/media/new  /admin/media/[id]/edit
/admin/fixtures  /admin/fixtures/new  /admin/fixtures/[id]/edit
/admin/scores
/admin/leaderboards
```

## API routes

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/sync/igpl` | `GET` | `Authorization: Bearer <CRON_SECRET>` | Flag-gated no-op stub |

## Database models

```
Identity   User  Session  AuthRateLimit  EmailVerificationToken  PhoneOtp
Commerce   Product  Address  Order  OrderItem
Season     Fixture  Score  Standing
Content    Post  MediaCoverage  ContactMessage
```

**Enums:** `Role` `FixtureStatus` `StandingBoard` `PostStatus` `MediaKind`
`ContactStatus` `OrderStatus` `PaymentStatus` `PaymentMethod`

## Environment variables

```
REQUIRED IN PRODUCTION
  DATABASE_URL            pooled Neon URL (runtime)
  DIRECT_URL              direct Neon URL (migrations)
  NEXT_PUBLIC_SITE_URL    canonicals, sitemap, verification links
  ADMIN_EMAIL             seed admin + fallback notification recipient
  CRON_SECRET             protects /api/sync/igpl (missing -> 500)
  BLOB_READ_WRITE_TOKEN   image uploads (injected by Vercel)

EMAIL (all four, or sending is skipped)
  SMTP_HOST  SMTP_USER  SMTP_PASSWORD  MAIL_FROM
  SMTP_PORT  SMTP_SECURE  CONTACT_NOTIFY_EMAIL  ORDER_NOTIFY_EMAIL

SEED ONLY
  ADMIN_PASSWORD          >= 12 chars. Rotate after first login

OPTIONAL
  SHIPPING_FLAT_INR (149)  SHIPPING_FREE_ABOVE_INR (2000)  GST_RATE (18)
  IGPL_SYNC_ENABLED (false)  IGPL_URL

NOT WIRED
  SMS_PROVIDER  SMS_FROM  SMS_ACCOUNT_SID  SMS_AUTH_TOKEN
```

## Security rules

1. **Never invent data.** Empty state, always.
2. `await requireAdmin()` is the **first** line of every admin action.
3. `requireUser()` runs in the action, not only in the page.
4. Never trust client prices, totals or stock. Re-read from the database.
5. Validate every input server-side (Zod or an allow-list).
6. Ownership goes in the `where` clause, not in an `if` after the query.
7. Log failures, never submitted content and never secrets.
8. Return generic errors; log the real one.
9. Sanitise HTML at render time.
10. Verify uploads by magic number, and generate the filename yourself.
11. `safeNextPath()` every `?next=`.
12. Put the expected current state in the `WHERE` clause of a state transition.
13. Email is best-effort and never rolls back a write.
14. Never put a secret behind `NEXT_PUBLIC_`.
15. Nothing private goes in `public/`.

## Deployment rules

1. Branch. Never commit to `main`.
2. `npx tsc --noEmit && npm run lint && npm run build` before pushing.
3. `npm run build`, not `npx next build`, when the schema may have changed.
4. The remote is **`Lions`**.
5. New env var? Add it to Vercel project settings.
6. New migration? Commit it with its schema change; deploy it with
   `npx prisma migrate deploy` and the production `DIRECT_URL`.
7. Make schema changes **backward compatible** — code rolls back instantly, schema does
   not.
8. Never run `db:seed`, `db push` or `migrate reset` against production.
9. Verify on the Vercel preview URL before merging.

## Debugging commands

```bash
# Types, lint, build
npx tsc --noEmit
npm run lint
npm run build

# Which database am I pointed at? (read the HOST, never print the URL)
# Inspect .env directly, or read the host from DATABASE_URL in a loaded shell.

# Prisma client out of date after a schema edit
npx prisma generate

# Inspect data - READ ONLY
npm run db:studio

# Find overflow on mobile (browser console)
[...document.querySelectorAll('*')].filter(e => e.scrollWidth > document.documentElement.clientWidth)

# Git archaeology
git log --oneline
git log -1 --stat <sha>
git show <sha> -- path/to/file
git log -S "searchTerm" --oneline      # when was this string introduced?
```

## Error codes to recognise

| Code | Meaning | First move |
|---|---|---|
| `P1001` | Cannot reach the database | Check `DATABASE_URL` |
| `P2002` | Unique constraint | Which column? Check `err.meta.target` |
| `P2003` | Foreign key | A RESTRICT relation is protecting history |
| `P2025` | Record not found | The row was deleted between read and write |
| `P2028` | Transaction closed | Too many round-trips — see Part 29.3 |
| `?error=creds` | Wrong password **or** no such user **or** rate-limited | Deliberately ambiguous |
| `?denied=admin` | Signed in, verified, not ADMIN | Check `User.role` |

---

*End of guide.*
