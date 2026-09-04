import Link from "next/link";
import type { OrderWithItems } from "@/lib/orders";
import { inr } from "@/lib/products";
import {
  formatOrderDate,
  orderStatusLabel,
  orderStatusStyle,
} from "@/lib/orders-format";

/**
 * Authenticated buyer's order list. Rows link to /orders/[id], which
 * re-checks ownership server-side before rendering detail.
 */
export default function OrdersList({ orders }: { orders: OrderWithItems[] }) {
  if (orders.length === 0) {
    return (
      <div className="hp-empty" data-rise>
        <p className="hp-empty-eyebrow">Orders</p>
        <h3 className="hp-empty-title">No orders yet</h3>
        <p className="hp-empty-body">
          When you place an order from the shop, it will appear here with its
          status and details.
        </p>
        <div className="hp-empty-actions">
          <Link href="/shop" className="cta-gold">
            GO TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="acct-order-list">
      {orders.map((order) => {
        const itemCount = order.items.reduce((sum, it) => sum + it.qty, 0);
        const summary = order.items
          .map((it) =>
            it.qty > 1 ? `${it.productName} ×${it.qty}` : it.productName
          )
          .join(" · ");
        const statusStyle = orderStatusStyle(order.status);

        return (
          <li key={order.id}>
            <Link href={`/orders/${order.id}`} className="acct-order-row">
              <div className="acct-order-main">
                <div className="acct-order-id">{order.orderNumber}</div>
                <div className="acct-order-meta">
                  {formatOrderDate(order.createdAt)}
                  <span aria-hidden> · </span>
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </div>
                <div className="acct-order-summary">{summary}</div>
              </div>
              <div className="acct-order-side">
                <div className="acct-order-total">{inr(order.total)}</div>
                <span className="acct-status" style={statusStyle}>
                  {orderStatusLabel(order.status)}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
