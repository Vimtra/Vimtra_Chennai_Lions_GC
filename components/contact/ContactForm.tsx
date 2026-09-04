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
      <div ref={okRef} className="hp-panel cf-success" role="status">
        <div className="cf-success-icon">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="cf-success-title">Message sent.</h2>
        <p className="cf-success-body">{result.message}</p>
        <button type="button" onClick={sendAnother} className="cf-success-again">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="hp-panel">
      <div className="cf-eyebrow">What&apos;s on your mind?</div>
      <h2 className="cf-heading">Drop us a line.</h2>

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
          className="hp-btn hp-btn-primary justify-self-start disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {pending ? "SENDING…" : "SEND TO THE DEN"}
        </button>
      </form>

      {result && !result.ok && (
        <div className="cf-error-banner" role="alert">
          {result.message}
        </div>
      )}
    </div>
  );
}

function FieldError({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} role="alert" className="mt-[6px] font-manrope text-[12.5px]" style={{ color: "var(--hp-red)" }}>
      {text}
    </p>
  );
}
