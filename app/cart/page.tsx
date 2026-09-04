"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, cartCount, useCartHydrated } from "@/store/cart";
import { FALLBACK_LOGO, inr } from "@/lib/products";
import { computeTotals, shippingExplainer } from "@/lib/orders-totals";
import StoryHero from "@/components/site/StoryHero";
import { Section, EmptyState } from "@/components/site/Section";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const remove = useCart((s) => s.remove);
  const hydrated = useCartHydrated();

  // Totals delegated to the shared calculator so /cart, /checkout, and the
  // server-side placeOrderAction always compute the same numbers.
  const { subtotal, shipping, tax, total } = computeTotals(
    items.map((i) => ({ price: i.price, qty: i.qty }))
  );
  const count = hydrated ? cartCount(items) : 0;

  return (
    <>
      <StoryHero
        eyebrow="Your Bag"
        title={["YOUR CART"]}
        line={
          hydrated && count > 0
            ? `${count} item${count === 1 ? "" : "s"} · review and check out below.`
            : undefined
        }
      />

      <Section surface="ivory" size="tight">
        <div className="cart-grid">
          <div data-rise>
            {!hydrated ? null : items.length === 0 ? (
              <EmptyState
                eyebrow="Your Bag"
                title="Your cart is empty"
                body="Pick up Lions match kit, performance polos, and tour accessories at the shop."
              >
                <Link href="/shop" className="hp-btn hp-btn-primary">
                  GO TO SHOP
                </Link>
              </EmptyState>
            ) : (
              <div className="cart-list">
                {items.map((it) => (
                  <div className="cart-row" key={it.id}>
                    <div className="thumb">
                      <Image
                        src={it.img || FALLBACK_LOGO}
                        alt={it.name}
                        width={68}
                        height={68}
                        className="w-full h-full object-contain"
                        style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
                      />
                    </div>
                    <div>
                      <div className="cart-row-name">{it.name}</div>
                      <div className="cart-row-unit">{inr(it.price)} each</div>
                    </div>
                    <div className="qty">
                      <button onClick={() => dec(it.id)} aria-label="Decrease">
                        −
                      </button>
                      <span>{it.qty}</span>
                      <button onClick={() => inc(it.id)} aria-label="Increase">
                        +
                      </button>
                    </div>
                    <div className="cart-row-total">{inr(it.price * it.qty)}</div>
                    <button
                      className="remove"
                      onClick={() => remove(it.id)}
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="summary" data-rise>
            <h3>Order Summary</h3>
            <div className="line">
              <span>Subtotal</span>
              <span>{inr(subtotal)}</span>
            </div>
            <div className="line">
              <span>Shipping</span>
              <span>{shippingExplainer(subtotal)}</span>
            </div>
            <div className="line">
              <span>GST (18%)</span>
              <span>{inr(tax)}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>{inr(total)}</span>
            </div>
            {hydrated && items.length > 0 ? (
              <Link
                href="/checkout"
                className="hp-btn hp-btn-primary w-full mt-[22px] justify-center"
              >
                PROCEED TO CHECKOUT
              </Link>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="hp-btn hp-btn-primary w-full mt-[22px] justify-center opacity-60 cursor-not-allowed"
              >
                CART IS EMPTY
              </button>
            )}
            <div className="mt-4 font-manrope text-[12px] text-white/55 leading-[1.55]">
              You&apos;ll sign in on the next screen (or create an account) to
              confirm delivery details.
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
