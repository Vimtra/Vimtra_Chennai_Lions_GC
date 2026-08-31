"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const SLIDES = [
  { img: "/assets/car-1-web.jpg", title: "Team Captain", sub: "Lead Pro · Chennai Lions" },
  { img: "/assets/car-2-web.jpg", title: "Lead Pro", sub: "Tour Roster · 2026" },
  { img: "/assets/car-3-web.jpg", title: "Tour Ambassador", sub: "IGPL Franchise Pro" },
];

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const start = useCallback(() => {
    timer.current = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 4500);
  }, []);

  useEffect(() => {
    start();
    return () => clearInterval(timer.current);
  }, [start]);

  const go = (n: number) => {
    setI(((n % SLIDES.length) + SLIDES.length) % SLIDES.length);
    clearInterval(timer.current);
    start();
  };

  return (
    <div className="relative z-[1] flex flex-col items-center">
      <div className="relative w-[380px] max-w-[90vw] h-[520px] rounded-[26px] overflow-hidden bg-gradient-to-b from-[#C9242E] to-[#871119] shadow-[0_46px_90px_-42px_rgba(26,21,19,0.55)]">
        <div className="absolute top-0 right-0 w-24 h-24 z-[3] opacity-90 bg-gradient-to-br from-[#E6C57E] to-[#C39A52] [clip-path:polygon(100%_0,0_0,100%_100%)]" />
        <div className="overflow-hidden w-full h-full">
          <div
            className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
            style={{ transform: `translateX(${-i * 100}%)` }}
          >
            {SLIDES.map((s) => (
              <div key={s.img} className="relative h-full shrink-0 basis-full">
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  sizes="380px"
                  className="object-cover"
                />
                <div className="absolute left-[18px] bottom-[18px] z-[2] rounded-[13px] px-[14px] py-[10px] bg-[rgba(24,12,12,0.55)] backdrop-blur-[8px] border border-white/20">
                  <div className="font-sora font-bold text-[14px] text-white">{s.title}</div>
                  <div className="font-manrope font-medium text-[11px] text-[#E9CB8E] mt-[2px]">
                    {s.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Controls i={i} go={go} />
    </div>
  );
}

function Controls({ i, go }: { i: number; go: (n: number) => void }) {
  return (
    <div className="flex items-center gap-[22px] mt-7">
      <button
        aria-label="Previous"
        onClick={() => go(i - 1)}
        className="press w-[50px] h-[50px] rounded-full border border-black/[0.18] bg-transparent text-ink text-[20px] flex items-center justify-center"
      >
        ‹
      </button>
      <div className="flex items-center gap-[9px]">
        {SLIDES.map((_, k) => (
          <button
            key={k}
            aria-label={`Slide ${k + 1}`}
            onClick={() => go(k)}
            className="dot"
            style={{
              height: 9,
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all .4s cubic-bezier(.2,.7,.2,1)",
              width: k === i ? 32 : 9,
              background: k === i ? "#C4202A" : "rgba(26,21,19,0.18)",
            }}
          />
        ))}
      </div>
      <button
        aria-label="Next"
        onClick={() => go(i + 1)}
        className="press w-[50px] h-[50px] rounded-full border-none bg-ink text-white text-[20px] flex items-center justify-center"
      >
        ›
      </button>
    </div>
  );
}
