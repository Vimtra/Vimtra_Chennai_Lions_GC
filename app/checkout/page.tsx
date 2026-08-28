import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listAddresses } from "@/lib/addresses";
import CheckoutFlow from "@/components/shop/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout · Vimtra Chennai Lions GC",
  robots: { index: false, follow: false },
};

// The checkout page is auth-gated and personalised — resolve at request time.
export const dynamic = "force-dynamic";

/**
 * Auth-gated checkout entry.
 *
 * requireUser("/checkout") sends signed-out visitors to /sign-in with a
 * next-back-to-checkout. Signed-in visitors load their saved address
 * book here (server-side) and hand it to the client flow so no extra
 * round-trip is needed to render Step 1.
 */
export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const savedAddresses = await listAddresses(user.id);

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
            Checkout · Signed in as {user.name}
          </div>
          <h1
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{
              fontSize: "clamp(44px,6.4vw,86px)",
              lineHeight: 0.92,
              letterSpacing: "-0.035em",
            }}
          >
            SECURE CHECKOUT
          </h1>
        </div>
      </section>

      <section className="bg-cream-100 px-8 pt-14 pb-24">
        <CheckoutFlow user={user} savedAddresses={savedAddresses} />
      </section>
    </>
  );
}
