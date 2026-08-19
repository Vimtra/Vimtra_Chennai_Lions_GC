"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useCart, cartSubtotal, useCartHydrated } from "@/store/cart";
import { FALLBACK_LOGO, inr } from "@/lib/products";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const hydrated = useCartHydrated();
  const [placed, setPlaced] = useState(false);

  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= 2000 || subtotal === 0 ? 0 : 149;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const checkout = () => {
    if (!items.length) return;
    clear();
    setPlaced(true);
  };

  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-16 pb-14"
        style={{
          background:
            "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)",
        }}
      >
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
            Checkout
          </div>
          <h1
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{
              fontSize: "clamp(48px,7vw,98px)",
              lineHeight: 0.92,
              letterSpacing: "-0.035em",
            }}
          >
            YOUR CART
          </h1>
        </div>
      </section>

      <section className="bg-cream-100 px-8 pt-14 pb-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-[30px] items-start">
          <div>
            {!hydrated ? null : placed ? (
              <EmptyOrPlaced
                title="Order confirmed!"
                body="Thank you for backing the Lions. A confirmation has been sent to your email."
              />
            ) : items.length === 0 ? (
              <EmptyOrPlaced
                title="Your cart is empty"
                body="Pick up Lions match kit, performance polos, and tour accessories at the shop."
              />
            ) : (
              items.map((it) => (
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
                    <div className="font-sora font-bold text-[16px]">{it.name}</div>
                    <div className="font-manrope text-[13px] text-muted mt-1">
                      {inr(it.price)} each
                    </div>
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
                  <div className="font-sora font-extrabold text-[18px] text-crimson-600">
                    {inr(it.price * it.qty)}
                  </div>
                  <button
                    className="remove"
                    onClick={() => remove(it.id)}
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="summary">
            <h3>Order Summary</h3>
            <div className="line">
              <span>Subtotal</span>
              <span>{inr(subtotal)}</span>
            </div>
            <div className="line">
              <span>Shipping</span>
              <span>
                {subtotal === 0 ? "Free over ₹2,000" : shipping === 0 ? "Free" : inr(shipping)}
              </span>
            </div>
            <div className="line">
              <span>GST (18%)</span>
              <span>{inr(tax)}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>{inr(total)}</span>
            </div>
            <button
              className="cta-gold press w-full mt-[22px] py-[14px] text-[13.5px] tracking-[0.06em] justify-center"
              onClick={checkout}
            >
              PROCEED TO CHECKOUT
            </button>
            <div className="mt-4 font-manrope text-[12px] text-white/55 leading-[1.55]">
              Members of the Pride get an automatic 10% off — sign in on your{" "}
              <Link href="/profile" className="text-[#E9CB8E]">
                profile
              </Link>
              .
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyOrPlaced({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-cream-50 border border-black/[0.07] rounded-[22px] p-[60px] text-center">
      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-crimson-600 opacity-70" />
      <div className="font-sora font-extrabold text-[32px] text-ink tracking-[-0.02em]">
        {title}
      </div>
      <p className="font-manrope text-[14px] text-muted my-[10px] mb-[22px]">{body}</p>
      <Link href="/shop" className="cta-gold">
        GO TO SHOP
      </Link>
    </div>
  );
}
