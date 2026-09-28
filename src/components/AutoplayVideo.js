"use client";

import { useEffect, useRef } from "react";

// Muted, looping, inline video that reliably autoplays. React doesn't put `muted` into the
// server-rendered HTML, so browsers can block autoplay on first load; this sets it and starts
// playback once mounted.
export default function AutoplayVideo({ src, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  return <video ref={ref} src={src} muted loop playsInline preload="auto" className={className} />;
}
