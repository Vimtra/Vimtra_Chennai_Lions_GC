"use client";

import { useEffect, useState } from "react";

const WORD = "VIMTRA CHENNAI LIONS".split(" ");

/**
 * Brand loading screen, ported from the loader injected by assets/lions.js.
 * Shows on first mount, then plays the exit transition and unmounts.
 */
export default function Loader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1300);
    const t2 = setTimeout(() => setGone(true), 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div id="lions-loader" className={leaving ? "is-leaving" : ""}>
      <div className="loader-ring delay" />
      <div className="loader-ring" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo-lion.png" alt="" className="loader-logo" />
      <div className="loader-wordmark">
        {WORD.map((w, i) => (
          <span className="w" key={i}>
            <span style={{ animationDelay: `${i * 120}ms` }}>{w}</span>
          </span>
        ))}
      </div>
      <div className="loader-tag">GOLF&nbsp;CLUB&nbsp;·&nbsp;GC</div>
      <div className="loader-bar" />
    </div>
  );
}
