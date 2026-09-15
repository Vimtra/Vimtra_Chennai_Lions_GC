"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div
      className="min-h-[60vh] px-5 py-16 text-[#F5EFE4]"
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto max-w-[760px] rounded-[32px] border border-[#BD2227]/30 bg-[#0E0B0A] p-6 shadow-[0_18px_54px_rgba(14,11,10,0.35)] md:p-10">
        <div className="mb-5 flex items-center gap-3 text-[#E6C57E]">
          <AlertTriangle className="h-6 w-6" aria-hidden />
          <span className="font-[family:var(--font-sora)] text-[0.72rem] font-semibold uppercase tracking-[0.22em]">
            Route unavailable
          </span>
        </div>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-[family:var(--font-sora)] text-3xl font-bold uppercase tracking-[-0.04em] text-[#F5EFE4] outline-none md:text-5xl"
        >
          Something went wrong
        </h1>

        <p className="mt-4 max-w-[52ch] font-[family:var(--font-manrope)] text-base leading-7 text-[#F5EFE4]/80 md:text-lg">
          This page could not be loaded. The Lions experience is still available, but this particular route needs a quick retry.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6C57E] bg-[#B8904B] px-5 py-3 font-[family:var(--font-sora)] text-xs font-semibold uppercase tracking-[0.18em] text-[#0E0B0A] transition hover:bg-[#E6C57E]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#F5EFE4]/20 bg-transparent px-5 py-3 font-[family:var(--font-sora)] text-xs font-semibold uppercase tracking-[0.18em] text-[#F5EFE4] transition hover:border-[#E6C57E]/70 hover:text-[#E6C57E]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
