import type { Metadata } from "next";

/* `app/cart/page.tsx` is a Client Component — it reads the persisted zustand
   cart — and a Client Component cannot export `metadata`. This layout is the
   standard way to give the route its title, and it marks the page noindex:
   a cart is per-visitor and transactional, with nothing for a crawler. */
export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
