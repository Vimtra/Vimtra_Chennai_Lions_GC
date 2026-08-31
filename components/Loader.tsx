"use client";

import { useEffect, useState } from "react";

const WORD = "VIMTRA CHENNAI LIONS".split(" ");
const SEEN_KEY = "lions_splash_seen";

/**
 * Brand splash.
 *
 * Shown once per browser session on a cold entry, then never again — a
 * full-screen curtain in front of the hero on every refresh reads as a
 * slow site, not a premium one. It is also skipped entirely under
 * `prefers-reduced-motion`.
 *
 * Rendering starts hidden and only turns on after the session check, so
 * the hero is never covered on a repeat visit even for a frame.
 */
export default function Loader() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Private mode / storage blocked — treat as seen so we never trap
      // the visitor behind a curtain we cannot dismiss state for.
      seen = true;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || reduced) return;

    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* non-fatal */
    }

    setGone(false);
    setShow(true);

    const t1 = setTimeout(() => setLeaving(true), 850);
    const t2 = setTimeout(() => setGone(true), 1450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone || !show) return null;

  return (
    <div id="lions-loader" className={leaving ? "is-leaving" : ""} aria-hidden>
      <div className="loader-ring delay" />
      <div className="loader-ring" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo-lion.png" alt="" className="loader-logo" />
      <div className="loader-wordmark">
        {WORD.map((w, i) => (
          <span className="w" key={i}>
            <span style={{ animationDelay: `${i * 90}ms` }}>{w}</span>
          </span>
        ))}
      </div>
      <div className="loader-tag">GOLF&nbsp;CLUB&nbsp;·&nbsp;GC</div>
      <div className="loader-bar" />
    </div>
  );
}
