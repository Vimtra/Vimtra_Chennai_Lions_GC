"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitContact, type ContactResult } from "@/app/contact/actions";
import { CONTACT_TOPICS, type ContactTopic } from "./topics";

/** Mirrors the server's own limits (app/contact/actions.ts) so the field
 *  stops the visitor before the round trip, not after it. */
const LIMITS = { name: 120, phone: 32, city: 120, message: 4000 } as const;

export default function ContactForm({
  initialTopic = CONTACT_TOPICS[0],
}: {
  initialTopic?: ContactTopic;
}) {
  const [topic, setTopic] = useState<ContactTopic>(initialTopic);
  const [result, setResult] = useState<ContactResult | null>(null);
  const [pending, setPending] = useState(false);
  const okRef = useRef<HTMLDivElement>(null);
  // A ref guard, not just the `disabled` prop: a second Enter-key submit
  // fired in the same tick as the first can land before React re-renders
  // the button disabled, so state alone isn't a reliable duplicate guard.
  const inFlightRef = useRef(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("topic", topic);
    setPending(true);
    try {
      const res = await submitContact(fd);
      setResult(res);
      if (res.ok) {
        form.reset();
        setTopic(CONTACT_TOPICS[0]);
        requestAnimationFrame(() =>
          okRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        );
      }
    } finally {
      inFlightRef.current = false;
      setPending(false);
    }
  };

  const sendAnother = () => setResult(null);

  const fieldError = result?.fieldErrors;

  if (result?.ok) {
    return (
      <div
        ref={okRef}
        className="bg-cream-50 border border-black/[0.07] rounded-[24px] p-11 text-center"
        role="status"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(14,138,79,0.10)]">
          <CheckCircle2 className="h-7 w-7" style={{ color: "#0E8A4F" }} aria-hidden />
        </div>
        <h2 className="mt-5 mb-2 font-sora font-extrabold text-[26px] tracking-[-0.02em]">
          Message sent.
        </h2>
        <p className="font-manrope text-[14.5px] leading-[1.6] text-muted max-w-[42ch] mx-auto">
          {result.message}
        </p>
        <button
          type="button"
          onClick={sendAnother}
          className="mt-6 font-manrope font-bold text-[13px] text-crimson-600 uppercase tracking-[0.08em]"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 border border-black/[0.07] rounded-[24px] p-11">
      <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
        What&apos;s on your mind?
      </div>
      <h2 className="mt-[10px] mb-[22px] font-sora font-extrabold text-[34px] tracking-[-0.02em]">
        Drop us a line.
      </h2>

      <div className="flex gap-2 flex-wrap mb-[22px]" role="tablist" aria-label="Enquiry topic">
        {CONTACT_TOPICS.map((t) => (
          <button
            type="button"
            role="tab"
            aria-selected={topic === t}
            key={t}
            className={`chip ${topic === t ? "on" : ""}`}
            onClick={() => setTopic(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="cf-name">Full Name</label>
            <input
              id="cf-name"
              type="text"
              name="name"
              required
              maxLength={LIMITS.name}
              placeholder="Your name"
              autoComplete="name"
              aria-invalid={fieldError?.name ? true : undefined}
              aria-describedby={fieldError?.name ? "cf-name-err" : undefined}
            />
            {fieldError?.name && <FieldError id="cf-name-err" text={fieldError.name} />}
          </div>
          <div className="field">
            <label htmlFor="cf-email">Email</label>
            <input
              id="cf-email"
              type="email"
              name="email"
              required
              maxLength={254}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={fieldError?.email ? true : undefined}
              aria-describedby={fieldError?.email ? "cf-email-err" : undefined}
            />
            {fieldError?.email && <FieldError id="cf-email-err" text={fieldError.email} />}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="cf-phone">Phone</label>
            <input
              id="cf-phone"
              type="tel"
              name="phone"
              maxLength={LIMITS.phone}
              placeholder="+91"
              autoComplete="tel"
              aria-invalid={fieldError?.phone ? true : undefined}
              aria-describedby={fieldError?.phone ? "cf-phone-err" : undefined}
            />
            {fieldError?.phone && <FieldError id="cf-phone-err" text={fieldError.phone} />}
          </div>
          <div className="field">
            <label htmlFor="cf-city">City</label>
            <input
              id="cf-city"
              type="text"
              name="city"
              maxLength={LIMITS.city}
              placeholder="Chennai"
              autoComplete="address-level2"
              aria-invalid={fieldError?.city ? true : undefined}
              aria-describedby={fieldError?.city ? "cf-city-err" : undefined}
            />
            {fieldError?.city && <FieldError id="cf-city-err" text={fieldError.city} />}
          </div>
        </div>
        <div className="field">
          <label htmlFor="cf-message">Message</label>
          <textarea
            id="cf-message"
            name="message"
            required
            maxLength={LIMITS.message}
            placeholder="Tell us what you're thinking about..."
            aria-invalid={fieldError?.message ? true : undefined}
            aria-describedby={fieldError?.message ? "cf-message-err" : undefined}
          />
          {fieldError?.message && <FieldError id="cf-message-err" text={fieldError.message} />}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="cta-gold press justify-self-start disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          style={{ padding: 14, fontSize: 14, letterSpacing: "0.06em" }}
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {pending ? "SENDING…" : "SEND TO THE DEN"}
        </button>
      </form>

      {result && !result.ok && (
        <div
          className="mt-5 p-[14px] rounded-[14px] font-manrope font-semibold text-[14px]"
          role="alert"
          style={{ background: "rgba(196,32,42,0.10)", color: "#C4202A" }}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}

function FieldError({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} role="alert" className="mt-[6px] font-manrope text-[12.5px]" style={{ color: "#C4202A" }}>
      {text}
    </p>
  );
}
