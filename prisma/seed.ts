import { PrismaClient, type FixtureStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

// -----------------------------------------------------------------------
// Season 2026 fixture seed — brochure p. 12 verbatim.
//
// Only the four events the brochure names appear here. Any additional
// event on the site must land through the admin surface (or the future
// IGPL sync when IGPL_SYNC_ENABLED flips on) — never fabricated.
// -----------------------------------------------------------------------
const SEASON_2026_FIXTURES: {
  slug: string;
  name: string;
  leg: string | null;
  presentedBy: string | null;
  dateStart: Date;
  dateEnd: Date;
  city: string;
  country: string;
  courseName: string;
  status: FixtureStatus;
  note: string | null;
  sortOrder: number;
}[] = [
  {
    slug: "igpl-invitational-mauritius-2026",
    name: "IGPL Invitational 2026 · Mauritius",
    leg: "African Swing",
    presentedBy: null,
    dateStart: new Date("2026-04-09T00:00:00Z"),
    dateEnd: new Date("2026-04-12T00:00:00Z"),
    city: "Mauritius",
    country: "Mauritius",
    courseName: "Anahita Golf Course",
    status: "COMPLETED",
    note: "Hosted by Leander Paes",
    sortOrder: 10,
  },
  {
    slug: "am-green-igpl-johannesburg-2026",
    name: "Am Green IGPL Invitational 2026 · Johannesburg",
    leg: "African Swing · South Africa Leg",
    presentedBy: null,
    dateStart: new Date("2026-04-15T00:00:00Z"),
    dateEnd: new Date("2026-04-18T00:00:00Z"),
    city: "Johannesburg",
    country: "South Africa",
    courseName: "Royal Johannesburg · West Course",
    status: "COMPLETED",
    note: null,
    sortOrder: 20,
  },
  {
    slug: "am-green-igpl-lubumbashi-2026",
    name: "Am Green IGPL Invitational 2026 · Lubumbashi",
    leg: "African Swing · Fourth Stop",
    presentedBy: null,
    dateStart: new Date("2026-04-21T00:00:00Z"),
    dateEnd: new Date("2026-04-24T00:00:00Z"),
    city: "Lubumbashi",
    country: "Congo",
    courseName: "Golf Club de Lubumbashi",
    status: "COMPLETED",
    note: null,
    sortOrder: 30,
  },
  {
    slug: "am-green-igpl-al-hamra-2026",
    name: "Am Green IGPL Invitational 2026 · Al Hamra",
    leg: "Season Opener",
    presentedBy: "Vimtra Chennai Lions GC",
    dateStart: new Date("2026-09-23T00:00:00Z"),
    dateEnd: new Date("2026-09-25T00:00:00Z"),
    city: "Ras Al Khaimah",
    country: "UAE",
    courseName: "Al Hamra Golf Club",
    status: "UPCOMING",
    note: null,
    sortOrder: 40,
  },
];

function normalizeImg(img?: string): string | null {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("/")) return img;
  return "/" + img.replace(/^\.?\/?/, "");
}

interface SeedProduct {
  id: string;
  name: string;
  cat: string;
  price: number;
  glyph: string;
  img?: string;
  range: string;
  desc: string;
}

async function main() {
  // Products
  const file = path.join(process.cwd(), "data", "products.json");
  const products: SeedProduct[] = JSON.parse(readFileSync(file, "utf8"));
  for (const p of products) {
    const data = {
      name: p.name,
      cat: p.cat,
      price: p.price,
      glyph: p.glyph,
      img: normalizeImg(p.img),
      range: p.range,
      desc: p.desc,
    };
    await prisma.product.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });
  }
  console.log(`✔ Seeded ${products.length} products`);

  // Fixtures — only the brochure-verified Season 2026 events (see the
  // SEASON_2026_FIXTURES comment above for the source citation).
  for (const f of SEASON_2026_FIXTURES) {
    await prisma.fixture.upsert({
      where: { slug: f.slug },
      update: f,
      create: f,
    });
  }
  console.log(`✔ Seeded ${SEASON_2026_FIXTURES.length} fixtures (brochure-verified)`);

  // Media Coverage — third-party press mentions. Each summary is our own
  // short original attribution — we do not reproduce article text.
  // sourceUrl values were supplied verbatim by the operator; titles reflect
  // the headline as printed by the source. publishedAt is left null when a
  // date is not verified on the source.
  // Cover image choices are constrained to on-disk assets that are
  // *genuinely relevant* to the subject of each article. Four of the
  // five entries are Bhullar-centred and reuse the franchise-owned
  // Bhullar player photo. The fifth is a franchise-wide squad story
  // and uses a tournament-golf photograph. hero-golfer.png is a
  // transparent cutout and renders as an empty tile under object-cover.
  // No stock,
  // no AI, no scraped publisher images.
  const BHULLAR = "/players/gaganjeet-bhullar-web.jpg";
  const SQUAD = "/assets/car-2-web.jpg";
  const MEDIA: {
    sourceName: string;
    sourceUrl: string;
    title: string;
    summary: string;
    coverImage: string | null;
    sortOrder: number;
  }[] = [
    {
      sourceName: "Times of India",
      sourceUrl:
        "https://timesofindia.indiatimes.com/sports/golf/asiad-medal-will-be-huge-for-indian-golf-gaganjeet-bhullar/amp_articleshow/133247638.cms",
      title: "Asian Games medal will be huge for Indian golf: Bhullar",
      summary:
        "Speaking on the sidelines of a Vimtra Chennai Lions event, Bhullar tells the Times of India that an Asian Games medal would give Indian golf the impetus it needs, and backs the next generation of Indian pros to rise on the international stage.",
      coverImage: BHULLAR,
      sortOrder: 50,
    },
    {
      sourceName: "The Hindu",
      sourceUrl:
        "https://www.thehindu.com/sport/other-sports/important-to-perform-well-in-multi-sport-events-gaganjeet-bhullar/article71347158.ece",
      title: "Important to perform well in multi-sport events: Bhullar",
      summary:
        "The Hindu covers Bhullar — Chennai Lions marquee and 11-time Asian Tour winner — on the importance of rising to the occasion at multi-sport showpieces like the Asian Games.",
      coverImage: BHULLAR,
      sortOrder: 40,
    },
    {
      sourceName: "Sportstar",
      sourceUrl:
        "https://sportstar.thehindu.com/golf/gaganjeet-bhullar-india-asian-games-2026-medal-prospect-igpl-season-2/article71345096.ece/amp/",
      title:
        "Gaganjeet Bhullar: India's Asian Games 2026 medal prospect on IGPL Season 2",
      summary:
        "Sportstar profiles the Chennai Lions marquee ahead of the Asian Games and the second IGPL season.",
      coverImage: BHULLAR,
      sortOrder: 30,
    },
    {
      sourceName: "Sports Now",
      sourceUrl:
        "https://www.sports-now.com/other-sports/gaganjeet-bhullar-multi-sport-events-performance-article-155632202",
      title: "Bhullar hopes youngsters can step up in Asiad",
      summary:
        "Sports Now reports Bhullar backing the next wave of Indian pros — including Yuvraj Sandhu and Sapthak Talwar — to perform outside India as the Asian Games approach.",
      coverImage: BHULLAR,
      sortOrder: 20,
    },
    {
      sourceName: "Breathe Golf",
      sourceUrl:
        "https://breathe.golf/vimtra-chennai-lions-gc-unveils-squad-sets-sights-on-building-chennais-golfing-legacy/",
      title:
        "Vimtra Chennai Lions GC unveils squad, sets sights on building Chennai's golfing legacy",
      summary:
        "Breathe Golf covers the Vimtra Chennai Lions squad reveal and the franchise's long-term vision for Chennai golf.",
      coverImage: SQUAD,
      sortOrder: 10,
    },
  ];
  for (const m of MEDIA) {
    // Upsert by sourceUrl as the natural key so re-runs stay idempotent.
    const existing = await prisma.mediaCoverage.findFirst({
      where: { sourceUrl: m.sourceUrl },
    });
    const data = {
      kind: "ARTICLE" as const,
      sourceName: m.sourceName,
      sourceUrl: m.sourceUrl,
      title: m.title,
      summary: m.summary,
      coverImage: m.coverImage,
      sortOrder: m.sortOrder,
      active: true,
    };
    if (existing) {
      await prisma.mediaCoverage.update({ where: { id: existing.id }, data });
    } else {
      await prisma.mediaCoverage.create({ data });
    }
  }
  console.log(`✔ Seeded ${MEDIA.length} media coverage entries (ARTICLE)`);
  // NOTE: The Instagram post at instagram.com/p/DcMmRHBE6fW/ is intentionally
  // NOT seeded. Instagram blocks anonymous OG-metadata fetches, and per the
  // operator's own rule ("do not invent title/date/event/people/claims"),
  // creating that row without verified caption + image would be invention.
  // The admin UI now supports MediaKind.SOCIAL — add the row via /admin/media
  // once a screenshot + verified caption are supplied.

  // Admin user — both credentials must be provided via env. No defaults are
  // baked in; a leaked "lions2026"-style default would compromise every
  // deployment that ever ran the seed.
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) {
    throw new Error(
      "Refusing to seed: set ADMIN_EMAIL and ADMIN_PASSWORD in the environment before running `npm run db:seed`."
    );
  }
  if (password.length < 12) {
    throw new Error("Refusing to seed: ADMIN_PASSWORD must be at least 12 characters.");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const configuredUser = await prisma.user.findUnique({ where: { email } });
  const existingAdmin =
    configuredUser ?? (await prisma.user.findFirst({ where: { role: "ADMIN" } }));
  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { email, role: "ADMIN", passwordHash },
    });
  } else {
    await prisma.user.create({
      data: { email, name: "Lions Admin", passwordHash, role: "ADMIN" },
    });
  }
  console.log(`✔ Admin ready: ${email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
