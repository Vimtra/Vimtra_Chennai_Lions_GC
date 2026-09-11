import "server-only";
import { prisma } from "@/lib/prisma";
import type { AdminBadges } from "@/components/admin/shell/AdminChrome";

/**
 * Read-side queries for the admin dashboard and the sidebar badges.
 *
 * Everything here is a real count or a real row from the database — the
 * dashboard shows what needs an operator's attention, not vanity totals.
 * Nothing is estimated or derived from anything other than stored rows.
 */

export const LOW_STOCK_THRESHOLD = 5;

export async function getAdminBadges(): Promise<AdminBadges> {
  const [pendingOrders, newMessages, outOfStock, draftNews] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["PENDING", "PAYMENT_PENDING"] } } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.product.count({ where: { active: true, stock: { lte: 0 } } }),
    prisma.mediaCoverage.count({ where: { kind: "OFFICIAL", status: "DRAFT" } }),
  ]);
  return { pendingOrders, newMessages, outOfStock, draftNews };
}

export async function getDashboardData() {
  const [
    pendingOrders,
    paymentPendingOrders,
    processingOrders,
    newMessages,
    outOfStock,
    lowStock,
    draftNews,
    featuredNews,
    liveFixture,
    nextFixture,
    recentOrders,
    lowStockProducts,
    recentMessages,
    totals,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAYMENT_PENDING" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.product.count({ where: { active: true, stock: { lte: 0 } } }),
    prisma.product.count({ where: { active: true, stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } } }),
    prisma.mediaCoverage.count({ where: { kind: "OFFICIAL", status: "DRAFT" } }),
    prisma.mediaCoverage.count({ where: { kind: "OFFICIAL", status: "PUBLISHED", featuredOnHome: true } }),
    prisma.fixture.findFirst({ where: { status: "LIVE" }, orderBy: { dateStart: "asc" } }),
    prisma.fixture.findFirst({
      where: { status: "UPCOMING" },
      orderBy: { dateStart: "asc" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: { active: true, stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      take: 6,
    }),
    prisma.contactMessage.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count(),
      prisma.user.count(),
      prisma.mediaCoverage.count({ where: { kind: "OFFICIAL", status: "PUBLISHED" } }),
      prisma.mediaCoverage.count({ where: { kind: { in: ["ARTICLE", "SOCIAL"] }, status: "PUBLISHED" } }),
      prisma.fixture.count(),
    ]),
  ]);

  const [orderTotal, activeProducts, allProducts, userTotal, publishedNews, publishedMedia, fixtureTotal] = totals;

  return {
    attention: {
      pendingOrders,
      paymentPendingOrders,
      processingOrders,
      newMessages,
      outOfStock,
      lowStock,
      draftNews,
      featuredNews,
    },
    season: { liveFixture, nextFixture },
    recentOrders,
    lowStockProducts,
    recentMessages,
    facts: {
      orderTotal,
      activeProducts,
      allProducts,
      userTotal,
      publishedNews,
      publishedMedia,
      fixtureTotal,
    },
  };
}
