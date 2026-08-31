import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listAddresses } from "@/lib/addresses";
import CheckoutFlow from "@/components/shop/CheckoutFlow";
import PageHero from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";

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
      <PageHero
        variant="compact"
        eyebrow={`Checkout · Signed in as ${user.name}`}
        title={["SECURE", "CHECKOUT"]}
      />

      <Section surface="ivory" size="tight">
        <CheckoutFlow user={user} savedAddresses={savedAddresses} />
      </Section>
    </>
  );
}
