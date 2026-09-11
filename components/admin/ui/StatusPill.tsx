import type {
  OrderStatus,
  PaymentStatus,
  PostStatus,
  FixtureStatus,
  ContactStatus,
  MediaKind,
  Role,
} from "@prisma/client";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orders-format";

export type PillTone = "ok" | "warn" | "danger" | "info" | "neutral" | "ink" | "gold" | "live";

/**
 * One status vocabulary for the whole console. Every enum on the site maps
 * to a semantic tone here, so a "needs action" state always looks the same
 * whether it is an order, an enquiry or a draft.
 */
export function StatusPill({
  tone,
  children,
  dotless,
  title,
}: {
  tone: PillTone;
  children: React.ReactNode;
  dotless?: boolean;
  title?: string;
}) {
  return (
    <span className={`adm-pill ${dotless ? "is-dotless" : ""}`} data-tone={tone} title={title}>
      {children}
    </span>
  );
}

export function orderTone(s: OrderStatus): PillTone {
  switch (s) {
    case "PENDING":
      return "warn";
    case "PAYMENT_PENDING":
      return "warn";
    case "PAID":
      return "ok";
    case "PROCESSING":
      return "info";
    case "SHIPPED":
      return "info";
    case "DELIVERED":
      return "ok";
    case "CANCELLED":
      return "neutral";
    case "REFUNDED":
      return "neutral";
  }
}
export function OrderPill({ status }: { status: OrderStatus }) {
  return <StatusPill tone={orderTone(status)}>{orderStatusLabel(status)}</StatusPill>;
}

export function paymentTone(s: PaymentStatus): PillTone {
  switch (s) {
    case "PAID":
      return "ok";
    case "PENDING":
      return "warn";
    case "UNPAID":
      return "neutral";
    case "FAILED":
      return "danger";
    case "REFUNDED":
      return "neutral";
  }
}
export function PaymentPill({ status }: { status: PaymentStatus }) {
  return <StatusPill tone={paymentTone(status)}>{paymentStatusLabel(status)}</StatusPill>;
}

export function postTone(s: PostStatus): PillTone {
  return s === "PUBLISHED" ? "ok" : s === "DRAFT" ? "warn" : "neutral";
}
export function PostPill({ status }: { status: PostStatus }) {
  return <StatusPill tone={postTone(status)}>{status.toLowerCase()}</StatusPill>;
}

export function fixtureTone(s: FixtureStatus): PillTone {
  switch (s) {
    case "LIVE":
      return "live";
    case "UPCOMING":
      return "info";
    case "COMPLETED":
      return "neutral";
    case "CANCELLED":
      return "danger";
  }
}
export function FixturePill({ status }: { status: FixtureStatus }) {
  return <StatusPill tone={fixtureTone(status)}>{status.toLowerCase()}</StatusPill>;
}

export function contactTone(s: ContactStatus): PillTone {
  return s === "NEW" ? "danger" : s === "READ" ? "warn" : "ok";
}
export function ContactPill({ status }: { status: ContactStatus }) {
  return <StatusPill tone={contactTone(status)}>{status.toLowerCase()}</StatusPill>;
}

export function KindPill({ kind }: { kind: MediaKind }) {
  return (
    <StatusPill tone={kind === "OFFICIAL" ? "ink" : kind === "SOCIAL" ? "gold" : "neutral"} dotless>
      {kind.toLowerCase()}
    </StatusPill>
  );
}

export function RolePill({ role }: { role: Role }) {
  return (
    <StatusPill tone={role === "ADMIN" ? "ink" : "neutral"} dotless>
      {role.toLowerCase()}
    </StatusPill>
  );
}

export function StockPill({ stock, active }: { stock: number; active: boolean }) {
  if (!active) return <StatusPill tone="neutral">hidden</StatusPill>;
  if (stock <= 0) return <StatusPill tone="danger">out of stock</StatusPill>;
  if (stock <= 5) return <StatusPill tone="warn">low · {stock}</StatusPill>;
  return <StatusPill tone="ok">in stock · {stock}</StatusPill>;
}
