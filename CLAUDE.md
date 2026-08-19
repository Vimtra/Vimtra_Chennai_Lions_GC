# CLAUDE.md — Developer Guide

This file provides comprehensive guidelines for development, styling, and the in-progress migration to **Next.js & Tailwind CSS** for the **Vimtra Chennai Lions GC** website.

> **Status (migration started):** The site now runs as a **Next.js 15 (App Router) + React 18 + Tailwind CSS v3** application, in-place inside the `Vimtra Chennai Lions Golf` folder. The original static `*.html` files plus `assets/lions.js` / `assets/lions.css` are kept as **reference only** during the page-by-page port — they are not served by Next.js.

---

## 🛠️ Build and Development Commands

### Active Next.js App
*   **Install**: `npm install`
*   **Development Server**: `npm run dev` (http://localhost:3000)
*   **Production Build**: `npm run build`
*   **Start (after build)**: `npm run start`
*   **Linting Checks**: `npm run lint`
*   **Type Check**: `npx tsc --noEmit`

### Stack & Conventions
*   **Next.js 15 App Router**, React 18, TypeScript (`strict`), import alias `@/*` → project root.
*   **Tailwind CSS v3** via `tailwind.config.ts` (brand tokens under `theme.extend`). Existing arbitrary-value markup (e.g. `text-[#E9CB8E]`) keeps working.
*   **Fonts**: Sora + Manrope loaded via a Google Fonts `<link>` in `app/layout.tsx`, so the literal `'Sora'`/`'Manrope'` family names used throughout the design system resolve everywhere.
*   **Icons**: `lucide-react` (replaces the Lucide CDN).
*   **Animations**: AOS / AE-style behavior is reimplemented in React — `components/Reveal.tsx` (scroll reveals) and `components/AeText.tsx` (word/mask/char text reveals), driven by CSS in `app/globals.css`.
*   **Cart state**: `zustand` store in `store/cart.ts`, persisted to `localStorage` under key **`lions_cart`**. Read it only after `useCartHydrated()` to avoid hydration mismatches.
*   **Images**: use `next/image` against files in `public/assets/`. Stored product paths like `assets/x.png` are normalized to `/assets/x.png` in `lib/products.ts`.
*   **Global design system** (loader, navbar, footer, AE animations, store/cart styles) lives in `app/globals.css`, ported from `assets/lions.css`.

### Legacy Static Setup (reference only)
The original static pages can still be served with any static server (`python -m http.server 8000`); they depend on the Tailwind Play CDN, Lucide CDN, and AOS CDN. Do **not** add features here — port to the App Router instead.

---

## 🎨 Branding & Styling Tokens

Always adhere to the franchise's official color palette and typography rules:

### Colors
*   **Crimson (Primary)**: `#C4202A` (Hover states: `#B11C25`, `#A8181F`, `#871119`)
*   **Gold (Accent)**: `#C39A52` (Gradient start: `#E6C57E`)
*   **Cream (Background)**: `#F4F0E8` (Cards/Alternate backgrounds: `#FBF9F4`)
*   **Ink (Text/Dark UI)**: `#1A1513`
*   **Muted (Subtitles)**: `#6B635C`

### Typography
*   **Headers**: `Sora` (Weights: `700`, `800` for main statements; letter-spacing: `-0.02em` or `-0.035em`)
*   **Body Text**: `Manrope` (Weights: `400`, `500`, `600`, `700`)

### Form Styling Spacing Constraint
Tailwind's **preflight** resets input/label margins (true for both the legacy Play CDN and the current Tailwind v3 build). When building form fields (e.g. the `/profile` settings and the upcoming `/contact` port), do **not** rely on general spacing classes — use the explicit overrides below. These are already defined globally in `app/globals.css` (`label`, `.field`, plus `.profile-page`-scoped variants); reuse them via the `.field` wrapper rather than redefining inline:
```css
label {
  margin-bottom: 8px !important;
  line-height: 1.2 !important;
  font-weight: 600;
}
.field {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  margin-bottom: 20px !important;
}
```

---

## 📦 Products & Merchandising Data Model
Products are driven entirely by data without code changes. The catalog lives in **`data/products.json`** and is loaded/typed through **`lib/products.ts`** (which also exposes `getProducts`, `getProduct`, `productImage`, `inr`, and `FALLBACK_LOGO`). The legacy copy at `assets/products.json` is reference only.

### Product Object Schema
```typescript
interface Product {
  id: string;          // Unique URL-friendly slug (e.g., "tshirt-pride")
  name: string;        // Brand title (e.g., "Official Lions T-Shirt")
  cat: string;         // Category name (e.g., "Apparel", "Lifestyle")
  price: number;       // Integer unit price in INR
  glyph: string;       // 3-letter abbreviation code
  img?: string;        // Optional. Path to custom mockup.
  range: string;       // Corporate bulk quantities (e.g., "100 to 500 units")
  desc: string;        // Paragraph describing materials and fit.
}
```

### Fallback Logo Logic
If a product has no custom image (`img` is omitted or empty `""`), all rendering surfaces (`/shop`, `/product/[id]`, `/cart` — i.e. `components/shop/ProductCard.tsx`, `app/product/[id]/page.tsx`, `app/cart/page.tsx`) **MUST** use the fallback team logo, exposed as `FALLBACK_LOGO` (`/assets/logo-lion.png`) in `lib/products.ts`:
*   **Asset Path**: `public/assets/logo-lion.png` → served at `/assets/logo-lion.png`.
*   **Styling for Fallback**: Render centered inside the red-to-dark gradient card with `object-fit: contain` and a slight drop shadow.

---

## 🚀 Next.js App Router Migration

> **Hosting:** Targets **Vercel** (dynamic Next.js — Server Actions, the admin area, middleware, and the IGPL cron all need a Node/serverless runtime). A GoDaddy domain can later point its DNS at Vercel. Copy `.env.example` → `.env.local` and set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `CRON_SECRET` before deploying.

### Current Directory Layout — all 18 pages ported ✅
```text
Vimtra Chennai Lions Golf/
├── app/
│   ├── layout.tsx              # Global layout: fonts, Loader, Nav, Footer, ToastHost
│   ├── globals.css             # Ported design system + per-page styles
│   ├── page.tsx                # Home (index.html) incl. hero carousel
│   ├── shop, product/[id], cart, profile          # Commerce flow + member dashboard
│   ├── players, fixtures, scores, leaderboards     # Roster + IGPL data pages
│   ├── the-club, the-pride, news, gallery, partners, contact   # Content pages
│   ├── contact/actions.ts      # "use server" submitContact
│   ├── api/sync/igpl/route.ts  # IGPL sync endpoint (scaffold; Vercel cron)
│   └── admin/                  # 🔒 Protected console (see Admin Console below)
│       ├── page.tsx (dashboard), actions.ts (logout)
│       ├── users/(page, actions.ts)     # user management (RBAC)
│       ├── news/page.tsx                # editor scaffold
│       └── products/(page, actions.ts, [id]/edit/page.tsx)
├── app/(auth)/                # route group (no URL segment)
│   ├── actions.ts             # signIn / signUp / signOut server actions
│   ├── sign-in/page.tsx, sign-up/page.tsx
├── app/profile/(page, actions.ts)       # authenticated account + updateProfile
├── components/
│   ├── Nav (auth-aware), Footer, Loader, ToastHost, ComingSoon
│   ├── Reveal.tsx, AeText.tsx
│   ├── shop/, contact/, players/, fixtures/, gallery/, leaderboards/
│   ├── profile/ProfileClient
│   └── admin/ (AdminShell, ProductForm)
├── prisma/
│   ├── schema.prisma          # User (role), Session, Product
│   └── seed.ts                # products + admin user
├── lib/
│   ├── prisma.ts              # PrismaClient singleton
│   ├── auth.ts                # bcrypt + DB sessions + RBAC (server-only)
│   ├── db.ts                  # Prisma-backed catalog CRUD (server-only)
│   ├── products.ts            # types + helpers + SEED_PRODUCTS
│   └── nav.ts
├── store/ (cart.ts, toast.ts)
├── data/ (products.json, players.ts, fixtures.ts)
├── middleware.ts             # coarse /admin gate (Edge)
├── vercel.json               # IGPL sync cron (*/15)
└── public/assets/
```

### Accounts & Authentication
*   **Model**: `User { email, name, passwordHash, role: USER|ADMIN }`, `Session { token, userId, expiresAt }` (Prisma/Postgres).
*   **Passwords**: bcrypt (`bcryptjs`). **Sessions**: random opaque token in an httpOnly cookie `lions_session`, backed by the `Session` table — deleting the row signs out everywhere.
*   **Flows** (`app/(auth)/actions.ts`, zod-validated): **sign-up** (`/sign-up`, role USER + auto-login), **sign-in** (`/sign-in`, supports `?next=`), **sign-out**. The root layout loads `getCurrentUser()` and passes it to `Nav`, which shows account / sign-in / sign-out + an Admin link for admins.
*   **Authorization** (`lib/auth.ts`): `getCurrentUser`, `requireUser(next)` (→ `/sign-in`), `requireAdmin` (→ `/sign-in`, or home if not ADMIN). `middleware.ts` coarse-gates `/admin` by cookie presence.
*   **Account page** (`/profile`): gated to the signed-in user; `updateProfile` Server Action edits name / email / password.

### Admin Console (`/admin`, ADMIN role only)
*   **Product Manager** (`/admin/products`): list / create / edit / delete via Server Actions → `revalidatePath` shop, product, home. Catalog persists in Postgres (`lib/db.ts`).
*   **User Management** (`/admin/users`): list accounts, grant/revoke ADMIN, delete (with self-lockout guards).
*   **News** (`/admin/news`): scaffold for a rich-text editor (TipTap/Quill) — pending.

### Setup (Postgres required)
```bash
cp .env.example .env           # set DATABASE_URL (+ ADMIN_EMAIL/PASSWORD, CRON_SECRET)
npx prisma migrate dev --name init   # create tables
npm run db:seed                # seed products + admin user
npm run dev
```
Scripts: `db:migrate`, `db:deploy` (prod), `db:seed`, `db:studio`. `build` runs `prisma generate` first (Vercel-ready).

### Remaining Work
*   **News editor**: add the rich-text UI + a `Post` model (draft/publish/archive) feeding `/news`.
*   **IGPL scraper**: `app/api/sync/igpl/route.ts` is a cron-scheduled scaffold — implement the real `cheerio` scrape + DB write + revalidate.
*   **Contact + email**: `submitContact` validates + logs only — wire to email/DB; could persist as a `Message` model.
*   **Optional**: password reset / email verification; move fonts to `next/font`.

### Component Guidelines
1.  **State Management**: Use `Zustand` or React Context for managing the shopping cart globally across page navigations.
2.  **Server vs. Client Components**:
    *   *Server Components*: Keep pages server-side by default (especially `/players`, `/shop`, `/product/[id]`) to fetch catalog items or profiles directly from the database for peak SEO and performance.
    *   *Server Actions*: Implement form submissions (like editing profiles or adding products) using secure Next.js Server Actions.
3.  **Image Optimization**: Replace plain `<img>` tags with Next.js `<Image />` from `next/image` to automatically compress, format (to WebP/AVIF), and lazy-load assets.
4.  **Security / Authentication**:
    *   Use **Clerk** or **Auth.js** to secure member and admin routes.
    *   Protect the `/admin` path using Next.js Middleware. Verify that the session belongs to an authenticated administrator (e.g., matching allow-listed admin emails) before serving any route under `/admin`.

---

## 🔒 Admin Dashboard Specifications

The Admin Portal (`app/admin/`) will provide web-based forms to update the website database directly:

### 1. Product Manager (`/admin/products`)
*   **List View**: Displays all catalog items with "Edit" and "Delete" actions.
*   **Forms**: Standard Next.js server actions to create/update database records. Supports:
    *   Name, price (number), category, range text, description.
    *   Image file upload (saving to Cloudinary, AWS S3, or local public storage).

### 2. News & Notebook Editor (`/admin/news`)
*   **Editor**: A Rich Text Editor interface (e.g. TipTap or Quill).
*   **Features**:
    *   Upload images inline.
    *   Draft / Publish / Archive states.
    *   Post timestamps for proper chronological sorting on the `/news` feed.

---

## 🏆 IGPL Scoreboard & Fixture Integration Plan

Since an official developer API is not yet available from the IGPL team, the website will employ a **hybrid integration strategy**:

### 1. Automated Web Scraper (Primary)
*   **Technology**: Next.js serverless api route (`/api/sync/igpl`) scheduled via a cron job (e.g. Vercel Cron or a scheduled worker).
*   **Mechanism**:
    1.  Perform a server-side fetch of the public IGPL tournament page.
    2.  Use a parser like `cheerio` to query the HTML tables for:
        *   **Live Scores**: Parse the active matches scorecard component.
        *   **Fixtures**: Parse the upcoming match dates, times, and team matchups.
        *   **Rankings**: Parse the points table / leaderboard standings.
    3.  Save the parsed structures directly to your PostgreSQL database.
    4.  Set a dynamic revalidation tag (`revalidatePath('/scores')`, `revalidatePath('/fixtures')`, `revalidatePath('/leaderboards')`) to update the public views.

### 2. Manual Override Console (Fallback)
*   **Dashboard (`/admin/igpl-sync`)**:
    *   Displays current scraped scores/fixtures.
    *   Allows administrators to **disable auto-scraping** and manually override fixtures, write in live scores, or adjust leaderboard points directly in the database.
    *   Ensures the website remains 100% accurate even if the IGPL website layout changes and breaks the scraper.

