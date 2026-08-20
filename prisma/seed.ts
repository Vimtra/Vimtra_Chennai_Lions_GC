import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

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
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash },
    create: { email, name: "Lions Admin", passwordHash, role: "ADMIN" },
  });
  console.log(`✔ Admin ready: ${email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
