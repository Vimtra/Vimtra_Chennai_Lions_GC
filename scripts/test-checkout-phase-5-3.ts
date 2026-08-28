/**
 * Phase 5.3 checkout harness.
 *
 * Runs the 5 Prisma-testable checkout scenarios against whichever
 * Postgres DATABASE_URL + DIRECT_URL are exported into the current
 * shell. Records a snapshot of every product row it will touch, runs
 * the tests, then restores the snapshot and deletes any Order/Address
 * rows it created — leaving the target DB byte-identical to how it
 * started.
 *
 * DO NOT run this against production. The script prints its
 * connection host (masked) at start so you can eyeball the target
 * before it does anything.
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL = "<staging pooled URL>"
 *   $env:DIRECT_URL   = "<staging direct URL>"
 *   $env:ADMIN_EMAIL  = "<the seeded staging admin email>"
 *   npx tsx scripts/test-checkout-phase-5-3.ts
 *
 * Requires: the M5 migration + seed already applied on the target
 * staging DB. Fails loudly if Order table is missing.
 */

import { PrismaClient } from "@prisma/client";
import {
  placeOrder,
  getOrderById,
  EmptyCartError,
  InsufficientStockError,
  InvalidAddressError,
} from "../lib/orders";
import { sendOrderReceipt } from "../lib/mail";

const prisma = new PrismaClient();

type Result = { name: string; ok: boolean; detail: string };
const results: Result[] = [];
function log(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  const stamp = ok ? "  ✔" : "  ✗";
  console.log(`${stamp} ${name}${detail ? " · " + detail : ""}`);
}

function maskHost(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//<hidden>@${u.hostname}${u.pathname}`;
  } catch {
    return "<unparseable>";
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();

  if (!dbUrl || !directUrl) {
    throw new Error(
      "DATABASE_URL and DIRECT_URL must be set in the environment for this script."
    );
  }
  if (!adminEmail) {
    throw new Error(
      "ADMIN_EMAIL must be set to the seeded admin email on the target DB."
    );
  }
  if (/prod/i.test(dbUrl) && !process.env.I_KNOW_THIS_IS_PRODUCTION) {
    throw new Error(
      "Refusing to run: DATABASE_URL contains 'prod'. Set I_KNOW_THIS_IS_PRODUCTION=1 to override (you almost certainly should not)."
    );
  }
  console.log(`\nTarget DATABASE_URL host: ${maskHost(dbUrl)}`);
  console.log(`Target DIRECT_URL   host: ${maskHost(directUrl)}\n`);

  // Sanity: M5 tables must exist. This will throw if they don't.
  const orderCountBefore = await prisma.order.count();
  console.log(`Order rows currently in target DB: ${orderCountBefore}\n`);

  // Resolve the seeded admin user we'll use as the buyer.
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) throw new Error(`No user with email ${adminEmail} in target DB.`);

  // Fetch a second user to test order-ownership isolation. If none exists,
  // create one for the test and record it in `createdUserIds` so we clean up.
  let otherUser = await prisma.user.findFirst({
    where: { email: { not: adminEmail } },
  });
  const createdUserIds: string[] = [];
  if (!otherUser) {
    otherUser = await prisma.user.create({
      data: {
        email: `phase-53-test-${Date.now()}@example.invalid`,
        name: "Phase 5.3 Test Buyer",
        // Bogus hash — this user will never sign in, just exists for the
        // ownership test.
        passwordHash: "$2a$10$dontusethisfake0000000000000000000000000000000",
      },
    });
    createdUserIds.push(otherUser.id);
  }

  // Two active products to work with — take the first two active ones by
  // creation order, snapshot their state, and always restore at the end.
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    take: 2,
  });
  if (products.length < 2) {
    throw new Error("Target DB needs at least 2 active products.");
  }
  const [productA, productB] = products;
  const snapshotA = { stock: productA.stock, active: productA.active };
  const snapshotB = { stock: productB.stock, active: productB.active };
  console.log(
    `Snapshotted ${productA.id}(stock=${snapshotA.stock},active=${snapshotA.active}) and ${productB.id}(stock=${snapshotB.stock},active=${snapshotB.active}).\n`
  );

  const createdOrderIds: string[] = [];
  const createdAddressIds: string[] = [];

  try {
    // ================================================================
    // Test 1 — Happy path
    // ================================================================
    // Ensure productA has plenty of stock, then place a small order.
    await prisma.product.update({
      where: { id: productA.id },
      data: { stock: 20, active: true },
    });
    const t1 = await placeOrder({
      userId: admin.id,
      contactEmail: adminEmail,
      contactPhone: "+919000000001",
      paymentMethod: "COD",
      shippingAddressInline: {
        fullName: "Test Buyer",
        phone: "+919000000001",
        line1: "1 Test Line",
        line2: null,
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "600001",
        country: "India",
      },
      items: [{ productId: productA.id, qty: 2 }],
    });
    createdOrderIds.push(t1.id);
    const afterA = await prisma.product.findUnique({ where: { id: productA.id } });
    const items1 = await prisma.orderItem.findMany({ where: { orderId: t1.id } });
    const item1 = items1[0];
    log(
      "T1 · happy path",
      afterA?.stock === 18 &&
        items1.length === 1 &&
        item1?.qty === 2 &&
        item1?.productName === productA.name &&
        item1?.unitPrice === productA.price,
      `stock ${snapshotA.stock}→${afterA?.stock}, order#${t1.orderNumber}, ${items1.length} item snapshot`
    );

    // ================================================================
    // Test 2 — Insufficient stock
    // ================================================================
    // Set productB to exactly 1 in stock, then try to order 2.
    await prisma.product.update({
      where: { id: productB.id },
      data: { stock: 1, active: true },
    });
    let t2ThrewCorrectly = false;
    try {
      await placeOrder({
        userId: admin.id,
        contactEmail: adminEmail,
        contactPhone: "+919000000002",
        paymentMethod: "COD",
        shippingAddressInline: {
          fullName: "Test Buyer",
          phone: "+919000000002",
          line1: "1 Test Line",
          city: "Chennai",
          state: "Tamil Nadu",
          postalCode: "600001",
        },
        items: [{ productId: productB.id, qty: 2 }],
      });
    } catch (e) {
      t2ThrewCorrectly =
        e instanceof InsufficientStockError && e.available === 1;
    }
    const afterB2 = await prisma.product.findUnique({ where: { id: productB.id } });
    log(
      "T2 · insufficient stock rejects + rolls back",
      t2ThrewCorrectly && afterB2?.stock === 1,
      `expected throw + stock=1 unchanged, saw stock=${afterB2?.stock}`
    );

    // ================================================================
    // Test 3 — Inactive product is unbuyable
    // ================================================================
    await prisma.product.update({
      where: { id: productB.id },
      data: { stock: 5, active: false },
    });
    let t3ThrewCorrectly = false;
    try {
      await placeOrder({
        userId: admin.id,
        contactEmail: adminEmail,
        contactPhone: "+919000000003",
        paymentMethod: "COD",
        shippingAddressInline: {
          fullName: "Test Buyer",
          phone: "+919000000003",
          line1: "1 Test Line",
          city: "Chennai",
          state: "Tamil Nadu",
          postalCode: "600001",
        },
        items: [{ productId: productB.id, qty: 1 }],
      });
    } catch (e) {
      t3ThrewCorrectly = e instanceof InsufficientStockError;
    }
    const afterB3 = await prisma.product.findUnique({ where: { id: productB.id } });
    log(
      "T3 · inactive product rejected",
      t3ThrewCorrectly && afterB3?.stock === 5,
      `expected throw + stock=5 unchanged, saw active=${afterB3?.active} stock=${afterB3?.stock}`
    );

    // ================================================================
    // Test 5 — Order ownership isolation
    // ================================================================
    // t1 was placed by admin — fetching it as otherUser must return null.
    const asOther = await getOrderById(otherUser.id, t1.id);
    const asAdmin = await getOrderById(admin.id, t1.id);
    log(
      "T5 · order ownership enforced",
      asOther === null && asAdmin?.id === t1.id,
      `otherUser sees ${asOther === null ? "null" : "row"}; owner sees ${asAdmin?.id ? "row" : "null"}`
    );

    // ================================================================
    // Test 7 — SMTP absent → receipt stub does not throw
    // ================================================================
    const smtpSaved = process.env.SMTP_HOST;
    delete process.env.SMTP_HOST;
    let t7Error = "";
    let t7Result;
    try {
      t7Result = await sendOrderReceipt({
        to: adminEmail,
        orderNumber: t1.orderNumber,
        totalRupees: 100,
        itemCount: 1,
        contactName: "Test Buyer",
      });
    } catch (err) {
      t7Error = (err as Error).message;
    }
    if (smtpSaved !== undefined) process.env.SMTP_HOST = smtpSaved;
    // Discriminated-union narrow: `.reason` is only on the not-sent variant.
    const t7Reason =
      t7Result && t7Result.sent === false ? t7Result.reason : null;
    log(
      "T7 · SMTP absent · receipt does not throw",
      !t7Error && t7Reason === "not-configured",
      t7Error ? `threw ${t7Error}` : `reason=${t7Reason ?? "sent"}`
    );
  } finally {
    // ================================================================
    // Cleanup — always run, whether tests passed or blew up.
    // ================================================================
    console.log("\nRestoring snapshot + deleting test rows…");
    for (const id of createdOrderIds) {
      // OrderItem cascades on Order delete.
      await prisma.order.delete({ where: { id } }).catch(() => {});
    }
    for (const id of createdAddressIds) {
      await prisma.address.delete({ where: { id } }).catch(() => {});
    }
    // Also clean up any orders auto-linked-then-orphaned to the test user.
    if (createdUserIds.length) {
      for (const uid of createdUserIds) {
        await prisma.order.deleteMany({ where: { userId: uid } }).catch(() => {});
        await prisma.address.deleteMany({ where: { userId: uid } }).catch(() => {});
        await prisma.session.deleteMany({ where: { userId: uid } }).catch(() => {});
        await prisma.user.delete({ where: { id: uid } }).catch(() => {});
      }
    }
    await prisma.product
      .update({ where: { id: productA.id }, data: snapshotA })
      .catch(() => {});
    await prisma.product
      .update({ where: { id: productB.id }, data: snapshotB })
      .catch(() => {});

    const orderCountAfter = await prisma.order.count();
    console.log(
      `Order rows now in target DB: ${orderCountAfter} (was ${orderCountBefore})${
        orderCountAfter === orderCountBefore ? " ✔" : " ✗ — investigate"
      }`
    );
  }

  // ================================================================
  // Summary
  // ================================================================
  console.log("\n===================================================");
  const passed = results.filter((r) => r.ok).length;
  const total = results.length;
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
  }
  console.log(`\n${passed} of ${total} passed`);
  if (passed !== total) process.exitCode = 1;

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\n[harness] fatal:", err);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
