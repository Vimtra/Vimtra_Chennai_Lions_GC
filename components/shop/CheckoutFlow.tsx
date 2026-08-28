"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Address } from "@prisma/client";
import type { SafeUser } from "@/lib/auth";
import { useCart, cartCount, useCartHydrated } from "@/store/cart";
import { computeTotals, shippingExplainer } from "@/lib/orders-totals";
import { FALLBACK_LOGO, inr } from "@/lib/products";
import { placeOrderAction, type PlaceOrderResult } from "@/app/checkout/actions";

/**
 * Two-step checkout client UI.
 *
 *   Step 1 — Contact + Delivery Address
 *   Step 2 — Payment Method + Review + Confirm
 *
 * The `<CheckoutFlow>` component owns all form state. On confirm it
 * serialises the current cart as JSON, submits via placeOrderAction,
 * and — on success — clears the client cart + navigates to /orders/[id].
 *
 * The cart snapshot is intent, not authority. The server transaction
 * re-reads products and computes totals from Product.price + stock
 * columns, so any tampered client payload just gets ignored.
 */
export default function CheckoutFlow({
  user,
  savedAddresses,
}: {
  user: SafeUser;
  savedAddresses: Address[];
}) {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);

  // Address state --------------------------------------------------------
  const defaultSaved =
    savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null;
  const [addressChoice, setAddressChoice] = useState<string>(
    defaultSaved ? defaultSaved.id : "new"
  );
  const [inline, setInline] = useState({
    label: "",
    fullName: user.name ?? "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [saveAddress, setSaveAddress] = useState(true);

  // Contact state --------------------------------------------------------
  const [contactEmail, setContactEmail] = useState(user.email);
  const [contactPhone, setContactPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "OFFLINE_INVOICE">("COD");
  const [notes, setNotes] = useState("");

  // Derived totals (server will recompute authoritatively) ---------------
  const totals = useMemo(
    () => computeTotals(items.map((i) => ({ price: i.price, qty: i.qty }))),
    [items]
  );
  const count = hydrated ? cartCount(items) : 0;

  // Step-1 validation ----------------------------------------------------
  const step1Errors = validateStep1({
    contactEmail,
    contactPhone,
    addressChoice,
    inline,
  });

  const onContinue = () => {
    if (!hydrated) return;
    if (items.length === 0) {
      setError("Your cart is empty. Add something to the cart before checking out.");
      return;
    }
    if (step1Errors.length > 0) {
      setError(step1Errors[0]);
      return;
    }
    setError(null);
    setStep(2);
  };

  const onConfirm = () => {
    if (!hydrated || items.length === 0) return;
    setError(null);
    const fd = new FormData();
    fd.set(
      "cart",
      JSON.stringify(items.map((i) => ({ productId: i.id, qty: i.qty })))
    );
    fd.set("contactEmail", contactEmail);
    fd.set("contactPhone", contactPhone);
    fd.set("paymentMethod", paymentMethod);
    if (notes) fd.set("notes", notes);
    if (addressChoice === "new") {
      fd.set("addr_label", inline.label);
      fd.set("addr_fullName", inline.fullName);
      fd.set("addr_phone", inline.phone || contactPhone);
      fd.set("addr_line1", inline.line1);
      fd.set("addr_line2", inline.line2);
      fd.set("addr_city", inline.city);
      fd.set("addr_state", inline.state);
      fd.set("addr_postalCode", inline.postalCode);
      fd.set("addr_country", inline.country);
      if (saveAddress) fd.set("saveAddress", "on");
    } else {
      fd.set("shippingAddressId", addressChoice);
    }
    startTransition(async () => {
      const res: PlaceOrderResult = await placeOrderAction(fd);
      if (res.ok) {
        clearCart();
        router.push(`/orders/${res.orderId}`);
        return;
      }
      setError(res.error);
      // If insufficient stock was reported, send the buyer back to
      // step 1 to reconsider the cart.
      if (res.code === "INSUFFICIENT_STOCK") setStep(1);
    });
  };

  // Rendered ---------------------------------------------------------------
  return (
    <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
      <div>
        <StepBar step={step} />
        {error && <ErrorBanner message={error} />}

        {hydrated && items.length === 0 && (
          <div className="mt-6 rounded-[16px] border border-dashed border-black/[0.18] bg-cream-50 p-8 text-center">
            <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
              Empty Cart
            </div>
            <div className="mt-2 font-sora font-bold text-[22px] text-ink">
              Nothing to check out yet.
            </div>
            <p className="mt-2 font-manrope text-[13.5px] text-muted">
              Add merchandise to your cart, then come back.
            </p>
            <Link
              href="/shop"
              className="cta-gold press inline-flex mt-5"
              style={{ padding: "10px 22px", fontSize: 13 }}
            >
              GO TO SHOP
            </Link>
          </div>
        )}

        {hydrated && items.length > 0 && step === 1 && (
          <StepOne
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            savedAddresses={savedAddresses}
            addressChoice={addressChoice}
            setAddressChoice={setAddressChoice}
            inline={inline}
            setInline={setInline}
            saveAddress={saveAddress}
            setSaveAddress={setSaveAddress}
            onContinue={onContinue}
          />
        )}

        {hydrated && items.length > 0 && step === 2 && (
          <StepTwo
            items={items}
            totals={totals}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            notes={notes}
            setNotes={setNotes}
            addressPreview={renderAddressPreview({
              addressChoice,
              savedAddresses,
              inline,
            })}
            contactEmail={contactEmail}
            contactPhone={contactPhone}
            onBack={() => setStep(1)}
            onConfirm={onConfirm}
            pending={pending}
          />
        )}
      </div>

      {/* Sticky order summary — reuses the cart .summary styling
          (crimson gradient panel) for visual continuity. */}
      <aside className="lg:sticky lg:top-24">
        <div className="summary">
          <h3>Order Summary</h3>
          {hydrated && items.length > 0 && (
            <div className="mb-4 max-h-[180px] overflow-y-auto pr-1 flex flex-col gap-2">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 text-white/90 font-manrope text-[13px]"
                >
                  <span
                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold"
                    aria-hidden
                  >
                    {it.qty}
                  </span>
                  <span className="flex-1 truncate">{it.name}</span>
                  <span className="font-sora font-bold text-white">
                    {inr(it.price * it.qty)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="line">
            <span>Subtotal ({count})</span>
            <span>{inr(totals.subtotal)}</span>
          </div>
          <div className="line">
            <span>Shipping</span>
            <span>{shippingExplainer(totals.subtotal)}</span>
          </div>
          <div className="line">
            <span>GST (18%)</span>
            <span>{inr(totals.tax)}</span>
          </div>
          <div className="total">
            <span>Total</span>
            <span>{inr(totals.total)}</span>
          </div>
          <div className="mt-4 font-manrope text-[12px] text-white/60 leading-[1.55]">
            Server recomputes totals from live product prices — displayed
            values are indicative.
          </div>
        </div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step components

function StepBar({ step }: { step: 1 | 2 }) {
  const rows = [
    { n: 1, label: "Contact & Address" },
    { n: 2, label: "Payment & Review" },
  ] as const;
  return (
    <ol className="flex items-center gap-3 mb-6">
      {rows.map((r, i) => {
        const active = step === r.n;
        const done = step > r.n;
        return (
          <li key={r.n} className="flex items-center gap-3">
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-sora font-extrabold text-[13px] ${
                done
                  ? "bg-crimson-600 text-white"
                  : active
                    ? "bg-ink text-white"
                    : "bg-cream-50 text-muted border border-black/[0.1]"
              }`}
            >
              {done ? "✓" : r.n}
            </span>
            <span
              className={`font-manrope font-bold text-[12.5px] tracking-[0.12em] uppercase ${
                active || done ? "text-ink" : "text-muted"
              }`}
            >
              {r.label}
            </span>
            {i < rows.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted/60" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-4 p-4 rounded-[14px] font-manrope text-[13.5px] font-semibold border"
      style={{
        background: "rgba(196,32,42,0.08)",
        color: "#C4202A",
        borderColor: "rgba(196,32,42,0.35)",
      }}
    >
      {message}
    </div>
  );
}

interface InlineAddress {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

function StepOne({
  contactEmail,
  setContactEmail,
  contactPhone,
  setContactPhone,
  savedAddresses,
  addressChoice,
  setAddressChoice,
  inline,
  setInline,
  saveAddress,
  setSaveAddress,
  onContinue,
}: {
  contactEmail: string;
  setContactEmail: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  savedAddresses: Address[];
  addressChoice: string;
  setAddressChoice: (v: string) => void;
  inline: InlineAddress;
  setInline: (v: InlineAddress) => void;
  saveAddress: boolean;
  setSaveAddress: (v: boolean) => void;
  onContinue: () => void;
}) {
  const showInline = addressChoice === "new";
  return (
    <div className="grid gap-6">
      <SectionCard title="Contact details" subtitle="How we'll confirm your order and delivery.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="co-email">Email</label>
            <input
              id="co-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="co-phone">Phone (with country code)</label>
            <input
              id="co-phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+91"
              required
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Delivery address" subtitle="Where should we ship?">
        {savedAddresses.length > 0 && (
          <div className="grid gap-3 mb-4">
            {savedAddresses.map((a) => (
              <label
                key={a.id}
                className={`flex items-start gap-3 cursor-pointer rounded-[14px] px-4 py-3 border transition-colors ${
                  addressChoice === a.id
                    ? "bg-white border-crimson-600"
                    : "bg-cream-50 border-black/[0.08] hover:border-black/[0.2]"
                }`}
              >
                <input
                  type="radio"
                  name="addressChoice"
                  checked={addressChoice === a.id}
                  onChange={() => setAddressChoice(a.id)}
                  className="mt-1"
                  aria-label={`Ship to ${a.label ?? a.fullName}`}
                />
                <div className="font-manrope text-[13.5px] leading-[1.5] text-ink">
                  <div className="font-bold flex items-center gap-2">
                    {a.label && (
                      <span className="text-[10.5px] tracking-[0.18em] uppercase text-crimson-600">
                        {a.label}
                      </span>
                    )}
                    {a.fullName}
                    {a.isDefault && (
                      <span className="text-[10.5px] tracking-[0.18em] uppercase text-muted">
                        · Default
                      </span>
                    )}
                  </div>
                  <div className="text-muted">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state}{" "}
                    {a.postalCode}, {a.country}
                  </div>
                  <div className="text-muted text-[12.5px] mt-0.5">
                    {a.phone}
                  </div>
                </div>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer rounded-[14px] px-4 py-3 border border-dashed border-black/[0.14] font-manrope text-[13.5px] text-muted hover:text-ink hover:border-ink">
              <input
                type="radio"
                name="addressChoice"
                checked={addressChoice === "new"}
                onChange={() => setAddressChoice("new")}
              />
              Use a new address
            </label>
          </div>
        )}

        {(savedAddresses.length === 0 || showInline) && (
          <InlineAddressForm
            value={inline}
            onChange={setInline}
            saveAddress={saveAddress}
            setSaveAddress={setSaveAddress}
            showSaveToggle={true}
          />
        )}
      </SectionCard>

      <div className="flex justify-end gap-3">
        <Link href="/cart" className="btn-ghost inline-flex items-center gap-1">
          <ChevronLeft className="w-[13px] h-[13px]" /> Back to cart
        </Link>
        <button
          type="button"
          onClick={onContinue}
          className="cta-gold press inline-flex items-center gap-1"
          style={{ padding: "12px 24px", fontSize: 13.5 }}
        >
          CONTINUE TO REVIEW <ChevronRight className="w-[13px] h-[13px]" />
        </button>
      </div>
    </div>
  );
}

function InlineAddressForm({
  value,
  onChange,
  saveAddress,
  setSaveAddress,
  showSaveToggle,
}: {
  value: InlineAddress;
  onChange: (v: InlineAddress) => void;
  saveAddress: boolean;
  setSaveAddress: (v: boolean) => void;
  showSaveToggle: boolean;
}) {
  const set = (patch: Partial<InlineAddress>) => onChange({ ...value, ...patch });
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="field">
          <label>Full name</label>
          <input
            value={value.fullName}
            onChange={(e) => set({ fullName: e.target.value })}
            autoComplete="name"
            required
          />
        </div>
        <div className="field">
          <label>Phone (address-only)</label>
          <input
            type="tel"
            value={value.phone}
            onChange={(e) => set({ phone: e.target.value })}
            autoComplete="tel"
            placeholder="Same as contact if blank"
          />
        </div>
      </div>
      <div className="field">
        <label>Address line 1</label>
        <input
          value={value.line1}
          onChange={(e) => set({ line1: e.target.value })}
          autoComplete="address-line1"
          required
        />
      </div>
      <div className="field">
        <label>Address line 2 (optional)</label>
        <input
          value={value.line2}
          onChange={(e) => set({ line2: e.target.value })}
          autoComplete="address-line2"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="field">
          <label>City</label>
          <input
            value={value.city}
            onChange={(e) => set({ city: e.target.value })}
            autoComplete="address-level2"
            required
          />
        </div>
        <div className="field">
          <label>State</label>
          <input
            value={value.state}
            onChange={(e) => set({ state: e.target.value })}
            autoComplete="address-level1"
            required
          />
        </div>
        <div className="field">
          <label>Postal code</label>
          <input
            value={value.postalCode}
            onChange={(e) => set({ postalCode: e.target.value })}
            autoComplete="postal-code"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="field">
          <label>Country</label>
          <input
            value={value.country}
            onChange={(e) => set({ country: e.target.value })}
            autoComplete="country-name"
          />
        </div>
        <div className="field">
          <label>Label (optional — e.g. Home or Office)</label>
          <input
            value={value.label}
            onChange={(e) => set({ label: e.target.value })}
          />
        </div>
      </div>
      {showSaveToggle && (
        <label className="inline-flex items-center gap-2 font-manrope text-[13px] text-ink">
          <input
            type="checkbox"
            checked={saveAddress}
            onChange={(e) => setSaveAddress(e.target.checked)}
          />
          Save this address to my address book for future orders.
        </label>
      )}
    </div>
  );
}

function StepTwo({
  items,
  totals,
  paymentMethod,
  setPaymentMethod,
  notes,
  setNotes,
  addressPreview,
  contactEmail,
  contactPhone,
  onBack,
  onConfirm,
  pending,
}: {
  items: { id: string; name: string; price: number; img: string; qty: number }[];
  totals: { subtotal: number; shipping: number; tax: number; total: number };
  paymentMethod: "COD" | "OFFLINE_INVOICE";
  setPaymentMethod: (m: "COD" | "OFFLINE_INVOICE") => void;
  notes: string;
  setNotes: (v: string) => void;
  addressPreview: React.ReactNode;
  contactEmail: string;
  contactPhone: string;
  onBack: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <div className="grid gap-6">
      <SectionCard title="Payment method" subtitle="Pick how you'd like to pay.">
        <div className="grid gap-3">
          <PayRadio
            label="Cash on delivery"
            detail="Pay in cash when the order is delivered to your address."
            checked={paymentMethod === "COD"}
            onChange={() => setPaymentMethod("COD")}
          />
          <PayRadio
            label="Offline invoice (bank transfer)"
            detail="We'll email an invoice with bank-transfer details. Your order enters 'Awaiting payment' until we receive the transfer."
            checked={paymentMethod === "OFFLINE_INVOICE"}
            onChange={() => setPaymentMethod("OFFLINE_INVOICE")}
          />
          <div
            className="opacity-50 select-none rounded-[14px] px-4 py-3 border border-dashed border-black/[0.14] font-manrope text-[13px] text-muted"
            title="Online payment lands in a future milestone"
          >
            Online payment · <em>coming soon</em>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Review your order">
        <div className="grid gap-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center gap-4 py-2 border-b border-black/[0.06] last:border-b-0"
            >
              <div className="relative w-[54px] h-[54px] rounded-[10px] overflow-hidden bg-cream-100 shrink-0 flex items-center justify-center">
                <Image
                  src={it.img || FALLBACK_LOGO}
                  alt={it.name}
                  width={54}
                  height={54}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex-1">
                <div className="font-sora font-bold text-[14px] text-ink">
                  {it.name}
                </div>
                <div className="font-manrope text-[12.5px] text-muted">
                  {inr(it.price)} × {it.qty}
                </div>
              </div>
              <div className="font-sora font-extrabold text-[15px] text-crimson-600">
                {inr(it.price * it.qty)}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Delivery + contact">
        <div className="grid gap-3 font-manrope text-[13.5px] text-ink">
          <div>
            <div className="font-bold text-[10.5px] tracking-[0.24em] text-crimson-600 uppercase mb-1">
              Ship to
            </div>
            {addressPreview}
          </div>
          <div>
            <div className="font-bold text-[10.5px] tracking-[0.24em] text-crimson-600 uppercase mb-1">
              Contact
            </div>
            <div className="text-muted">
              {contactEmail} · {contactPhone}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notes for the team (optional)">
        <div className="field !m-0">
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any delivery instructions, gift note, etc."
          />
        </div>
      </SectionCard>

      <div className="flex justify-between items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost inline-flex items-center gap-1"
          disabled={pending}
        >
          <ChevronLeft className="w-[13px] h-[13px]" /> Back to details
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="cta-gold press inline-flex items-center gap-2"
          style={{ padding: "14px 30px", fontSize: 14 }}
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          {pending ? "PLACING ORDER…" : `CONFIRM · PAY ${inr(totals.total)} ${paymentMethod === "COD" ? "ON DELIVERY" : "OFFLINE"}`}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small building blocks

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-cream-50 border border-black/[0.07] rounded-[20px] p-6">
      <div className="mb-4">
        <div className="font-sora font-extrabold text-[18px] tracking-[-0.005em] text-ink">
          {title}
        </div>
        {subtitle && (
          <div className="font-manrope text-[12.5px] text-muted mt-1">
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

function PayRadio({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer rounded-[14px] px-4 py-3 border transition-colors ${
        checked
          ? "bg-white border-crimson-600"
          : "bg-cream-50 border-black/[0.08] hover:border-black/[0.2]"
      }`}
    >
      <input
        type="radio"
        name="paymentMethod"
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <div>
        <div className="font-sora font-bold text-[14px] text-ink">{label}</div>
        <div className="font-manrope text-[12.5px] text-muted mt-1 leading-[1.5]">
          {detail}
        </div>
      </div>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Helpers

function validateStep1(args: {
  contactEmail: string;
  contactPhone: string;
  addressChoice: string;
  inline: InlineAddress;
}): string[] {
  const errs: string[] = [];
  if (!args.contactEmail || !/^\S+@\S+\.\S+$/.test(args.contactEmail)) {
    errs.push("Please enter a valid contact email.");
  }
  if (
    !args.contactPhone ||
    args.contactPhone.replace(/\D/g, "").length < 7
  ) {
    errs.push("Please enter a valid contact phone (at least 7 digits).");
  }
  if (args.addressChoice === "new") {
    const a = args.inline;
    if (
      !a.fullName.trim() ||
      !a.line1.trim() ||
      !a.city.trim() ||
      !a.state.trim() ||
      !a.postalCode.trim()
    ) {
      errs.push("Please complete all required delivery address fields.");
    }
  }
  return errs;
}

function renderAddressPreview({
  addressChoice,
  savedAddresses,
  inline,
}: {
  addressChoice: string;
  savedAddresses: Address[];
  inline: InlineAddress;
}): React.ReactNode {
  if (addressChoice !== "new") {
    const a = savedAddresses.find((x) => x.id === addressChoice);
    if (a) {
      return (
        <div className="text-muted leading-[1.55]">
          <div className="font-bold text-ink">{a.fullName}</div>
          <div>
            {a.line1}
            {a.line2 ? `, ${a.line2}` : ""}
          </div>
          <div>
            {a.city}, {a.state} {a.postalCode}, {a.country}
          </div>
          <div>{a.phone}</div>
        </div>
      );
    }
  }
  return (
    <div className="text-muted leading-[1.55]">
      <div className="font-bold text-ink">{inline.fullName}</div>
      <div>
        {inline.line1}
        {inline.line2 ? `, ${inline.line2}` : ""}
      </div>
      <div>
        {inline.city}, {inline.state} {inline.postalCode}, {inline.country}
      </div>
      <div>{inline.phone}</div>
    </div>
  );
}
