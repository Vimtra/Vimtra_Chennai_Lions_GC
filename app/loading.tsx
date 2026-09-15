import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[52vh] px-5 py-20 text-[#F5EFE4]">
      <div className="mx-auto flex max-w-[760px] items-center justify-center gap-4 rounded-[28px] border border-[#E6C57E]/30 bg-[#0E0B0A]/80 px-6 py-5 shadow-[0_18px_50px_rgba(14,11,10,0.35)] backdrop-blur-sm md:px-8" role="status" aria-live="polite">
        <LoaderCircle className="h-5 w-5 animate-spin text-[#E6C57E] md:h-6 md:w-6" aria-hidden="true" />
        <div className="flex flex-col gap-1 text-left">
          <span className="font-[family:var(--font-sora)] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#E6C57E]">
            Loading
          </span>
          <span className="font-[family:var(--font-manrope)] text-sm text-[#F5EFE4]/80 md:text-base">
            Preparing the Lions experience…
          </span>
        </div>
      </div>
    </div>
  );
}
