import { prisma } from "@/lib/prisma";
import { SEED_PRODUCTS } from "@/lib/products";

async function main() {
  let updated = 0;
  let missing = 0;

  for (const product of SEED_PRODUCTS) {
    const image = product.img;
    if (!image || !image.startsWith("/assets/")) {
      missing += 1;
      console.warn(`Skipping ${product.id}: no canonical asset path`);
      continue;
    }

    const result = await prisma.product.updateMany({
      where: { id: product.id },
      data: { img: image, images: [image] },
    });
    updated += result.count;
  }

  console.log(`Synced ${updated} product image row(s); skipped ${missing}.`);
}

main()
  .catch((error) => {
    console.error("Product asset sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });