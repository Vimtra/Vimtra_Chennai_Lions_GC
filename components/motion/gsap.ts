"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Shared GSAP motion system for the home page.
 *
 * One registration point plus a small set of REUSABLE choreography
 * primitives, so the motion language stays coherent instead of becoming
 * dozens of one-off tweens.
 *
 * Every primitive is a no-op under `prefers-reduced-motion`: the element is
 * left in its final, fully-visible state and no tween is created. Content is
 * never hidden by CSS alone — the "from" state is always set by GSAP — so if
 * JS fails the page still renders completely.
 */

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export function reduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const EASE = "power3.out";

/** Wipe an image open with clip-path. */
export function revealImage(
  target: gsap.TweenTarget,
  o: { duration?: number; from?: "left" | "bottom" } = {}
) {
  if (reduced()) return null;
  return gsap.fromTo(
    target,
    { clipPath: o.from === "bottom" ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: o.duration ?? 1.1,
      ease: EASE,
    }
  );
}

/**
 * Slide masked lines of display type up from behind their own baseline.
 * Expects `.mq-line` (overflow hidden) wrapping a block-level child.
 */
export function revealLines(
  targets: gsap.TweenTarget,
  o: { stagger?: number; duration?: number } = {}
) {
  if (reduced()) return null;
  return gsap.fromTo(
    targets,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: o.duration ?? 0.95,
      ease: EASE,
      stagger: o.stagger ?? 0.09,
    }
  );
}

/** Soft rise + fade — metadata, copy, CTAs. */
export function rise(
  targets: gsap.TweenTarget,
  o: { y?: number; stagger?: number; duration?: number } = {}
) {
  if (reduced()) return null;
  return gsap.fromTo(
    targets,
    { y: o.y ?? 18, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: o.duration ?? 0.7,
      ease: EASE,
      stagger: o.stagger ?? 0.07,
    }
  );
}

// --------------------------------------------------------------------------
// Scroll-triggered variants

export function riseOnScroll(
  targets: gsap.TweenTarget,
  trigger: Element,
  o: { y?: number; stagger?: number; start?: string } = {}
) {
  if (reduced()) return;
  gsap.fromTo(
    targets,
    { y: o.y ?? 26, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: EASE,
      stagger: o.stagger ?? 0.08,
      scrollTrigger: { trigger, start: o.start ?? "top 80%", once: true },
    }
  );
}

export function revealLinesOnScroll(
  targets: gsap.TweenTarget,
  trigger: Element,
  o: { stagger?: number; start?: string } = {}
) {
  if (reduced()) return;
  gsap.fromTo(
    targets,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: 1,
      ease: EASE,
      stagger: o.stagger ?? 0.1,
      scrollTrigger: { trigger, start: o.start ?? "top 78%", once: true },
    }
  );
}

export function revealImageOnScroll(
  target: gsap.TweenTarget,
  trigger: Element,
  o: { start?: string } = {}
) {
  if (reduced()) return;
  gsap.fromTo(
    target,
    { clipPath: "inset(0 0 100% 0)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.15,
      ease: EASE,
      scrollTrigger: { trigger, start: o.start ?? "top 82%", once: true },
    }
  );
}

/** Count a numeral up to its final value as it scrolls into view. */
export function countUp(el: HTMLElement, to: number, suffix = "") {
  if (reduced()) {
    el.textContent = `${to}${suffix}`;
    return;
  }
  const state = { v: 0 };
  gsap.to(state, {
    v: to,
    duration: 1.6,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 88%", once: true },
    onUpdate: () => {
      el.textContent = `${Math.round(state.v)}${suffix}`;
    },
  });
}

/** Gentle depth on a large image. Small amounts only — depth, not sliding. */
export function parallax(target: gsap.TweenTarget, trigger: Element, amount = 6) {
  if (reduced()) return;
  gsap.fromTo(
    target,
    { yPercent: amount },
    {
      yPercent: -amount,
      ease: "none",
      scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: 0.8 },
    }
  );
}

export { gsap, ScrollTrigger };
