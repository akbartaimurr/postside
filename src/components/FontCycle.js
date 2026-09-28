"use client";

import { useEffect, useState } from "react";
import { viralFonts } from "@/app/fonts";

// Swaps its text through a list of fonts on a loop; holds still for reduced-motion users.
// Every variant is stacked in one grid cell (only the active one visible), so the word
// always takes the width of the widest font and the rest of the line never shifts.
export default function FontCycle({ children, interval = 450 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % viralFonts.length), interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <span className="inline-grid items-baseline justify-items-center">
      {viralFonts.map((font, i) => (
        <span
          key={i}
          aria-hidden={i !== index}
          className={`${font.className} [grid-area:1/1] ${i === index ? "" : "invisible"}`}
        >
          {children}
        </span>
      ))}
    </span>
  );
}
