import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] px-5 py-16 text-[#F5EFE4]">
      <div className="mx-auto max-w-[760px] rounded-[32px] border border-[#E6C57E]/25 bg-[#FBF9F4] p-6 text-[#0E0B0A] shadow-[0_18px_54px_rgba(14,11,10,0.08)] md:p-10">
        <div className="mb-5 flex items-center gap-3 text-[#BD2227]">
          <SearchX className="h-6 w-6" aria-hidden />
          <span className="font-[family:var(--font-sora)] text-[0.72rem] font-semibold uppercase tracking-[0.22em]">
            Not found
          </span>
        </div>

        <h1 className="font-[family:var(--font-sora)] text-3xl font-bold uppercase tracking-[-0.04em] md:text-5xl">
          This page is unavailable
        </h1>

        <p className="mt-4 max-w-[52ch] font-[family:var(--font-manrope)] text-base leading-7 text-[#1A1513]/80 md:text-lg">
          The route you requested is not available right now, or it may have moved. You can return to the main Lions site and continue from there.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#BD2227] px-5 py-3 font-[family:var(--font-sora)] text-xs font-semibold uppercase tracking-[0.18em] text-[#F5EFE4] transition hover:bg-[#A8181F]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
