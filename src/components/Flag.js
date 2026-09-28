"use client";

import { useEffect, useState } from "react";

// Real flag artwork from flagcdn.com (SVG), not emoji (Windows doesn't render flag emoji).
// Shown inline with headline text: a fixed 4:3 box sized in em so it scales with the font.
const FLAG_BOX = "flag-squircle inline-block h-[0.6em] w-[0.8em] object-cover shadow-[0_0.03em_0.12em_rgb(0_0_0_/_0.16)]";
const flagSrc = (code) => `https://flagcdn.com/${code}.svg`;

export function Flag({ code, className = "" }) {
  // eslint-disable-next-line @next/next/no-img-element -- external SVG from the flag CDN
  return <img src={flagSrc(code)} alt="" aria-hidden className={`${FLAG_BOX} ${className}`} />;
}

// Countries whose creators commonly want US reach (ISO 3166 alpha-2)
const ROTATING = ["ae", "au", "gb", "de", "fr", "it", "es", "nl", "pl", "ua", "in", "pk", "ng", "ph", "br"];

// Cycles through ROTATING. All flags are stacked in one spot and preloaded, with only the
// active one visible, so each swap is instant (no load flicker, no width change).
export function RotatingFlag({ interval = 900, className = "" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % ROTATING.length), interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <span aria-hidden className={`inline-grid align-baseline ${className}`}>
      {ROTATING.map((code, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- external SVG from the flag CDN
        <img
          key={code}
          src={flagSrc(code)}
          alt=""
          className={`${FLAG_BOX} [grid-area:1/1] transition-opacity duration-200 ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </span>
  );
}
