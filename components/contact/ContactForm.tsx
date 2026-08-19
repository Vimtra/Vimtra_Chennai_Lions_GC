"use client";

import { useRef, useState } from "react";
import { submitContact, type ContactResult } from "@/app/contact/actions";

const TOPICS = ["Membership", "Partnership", "Press", "Academy", "Tickets", "Other"];

export default function ContactForm() {
  const [topic, setTopic] = useState("Membership");
  const [result, setResult] = useState<ContactResult | null>(null);
  const [pending, setPending] = useState(false);
  const okRef = useRef<HTMLDivElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("topic", topic);
    setPending(true);
    try {
      const res = await submitContact(fd);
      setResult(res);
      if (res.ok) {
        form.reset();
        requestAnimationFrame(() =>
          okRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        );
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="bg-cream-50 border border-black/[0.07] rounded-[24px] p-11">
      <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
        What&apos;s on your mind?
      </div>
      <h2 className="mt-[10px] mb-[22px] font-sora font-extrabold text-[34px] tracking-[-0.02em]">
        Drop us a line.
      </h2>

      <div className="flex gap-2 flex-wrap mb-[22px]">
        {TOPICS.map((t) => (
          <button
            type="button"
            key={t}
            className={`chip ${topic === t ? "on" : ""}`}
            onClick={() => setTopic(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field">
            <label>Full Name</label>
            <input type="text" name="name" required placeholder="Your name" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" name="email" required placeholder="you@example.com" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field">
            <label>Phone</label>
            <input type="tel" name="phone" placeholder="+91" />
          </div>
          <div className="field">
            <label>City</label>
            <input type="text" name="city" placeholder="Chennai" />
          </div>
        </div>
        <div className="field">
          <label>Message</label>
          <textarea name="message" required placeholder="Tell us what you're thinking about..." />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="cta-gold press justify-self-start disabled:opacity-60"
          style={{ padding: 14, fontSize: 14, letterSpacing: "0.06em" }}
        >
          {pending ? "SENDING…" : "SEND TO THE DEN"}
        </button>
      </form>

      {result && (
        <div
          ref={okRef}
          className="mt-5 p-[14px] rounded-[14px] font-manrope font-semibold text-[14px]"
          style={
            result.ok
              ? { background: "rgba(14,138,79,0.10)", color: "#0E8A4F" }
              : { background: "rgba(196,32,42,0.10)", color: "#C4202A" }
          }
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
