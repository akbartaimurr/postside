"use client";

import { useEffect, useRef, useState } from "react";
import PhoneShowcase from "@/components/PhoneShowcase";

// Callouts revealed one by one while the phone is pinned. `at` = pinned-scroll progress (0–1)
// at which each appears; `y` = vertical position within the stage; `body` = lines, each shown
// unwrapped on its own row, so keep them short (≲ 46 characters) or the card outgrows the column.
const CALLOUTS = [
  {
    side: "right",
    y: "28%",
    at: 0.06,
    title: "A real cloud phone",
    icon: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z",
    body: [
      "A physical phone in the cloud, yours monthly",
      "No extra phones to buy or manage",
      "Use TikTok, Instagram and YouTube like normal",
    ],
  },
  {
    side: "left",
    y: "44%",
    at: 0.34,
    title: "Real US IPs and SIMs",
    icon: "M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
    body: [
      "Residential US connection, not a datacenter",
      "A real US SIM card in every phone",
      "Reach US and Canadian audiences",
      "Built to keep shadowban risk minimal",
    ],
  },
  {
    side: "right",
    y: "60%",
    at: 0.62,
    title: "Accounts warmed up for you",
    icon: "M1 20V19C1 15.134 4.13401 12 8 12V12C11.866 12 15 15.134 15 19V20M13 14V14C13 11.2386 15.2386 9 18 9V9C20.7614 9 23 11.2386 23 14V14.5M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12ZM18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 7.65685 16.3431 9 18 9Z",
    body: [
      "Every phone comes with its own warm-upper",
      "They scroll and engage like a real US user",
      "You just post, no warming up yourself",
    ],
  },
  {
    side: "left",
    y: "72%",
    at: 0.93, // last card lands near the end, so the phone unpins right after it
    title: "A feed that matches the US",
    icon: "M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
    body: [
      "A For You page like a real US viewer's",
      "Trends, sounds and creators from the US",
      "The algorithm sees a local, not a bot",
    ],
  },
];

// `light`: for cards on the left, where the mesh behind is darker; a deeper grey holds its
// contrast there better than a lighter one
// Heading with its outline icon in front, sized (1em) and coloured (currentColor) like the text
function CalloutTitle({ icon, title }) {
  return (
    <p className="flex items-center gap-2.5 text-2xl font-medium tracking-tight">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden className="size-[1em] shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {title}
    </p>
  );
}

function CalloutBody({ lines, light = false }) {
  return (
    <div className="mt-3 space-y-2.5">
      {lines.map((line) => (
        <p key={line} className={`text-lg leading-snug lg:whitespace-nowrap ${light ? "text-[#4a4a4a]" : "text-muted"}`}>
          {line}
        </p>
      ))}
    </div>
  );
}

// Frosted tint like the email field: translucent, blurred backdrop, no border. Inter (font-sans).
const CARD = "squircle bg-black/[0.05] px-7 py-6 text-left font-sans backdrop-blur-xl";

// Enter: soft blur-in that settles (expo ease-out). Exit: quick fade/blur, no delay, so the next
// card never waits on the previous one.
const EASE_OUT_EXPO = "ease-[cubic-bezier(0.16,1,0.3,1)]";
const CARD_IN = `opacity-100 blur-none scale-100 translate-y-0 duration-700 ${EASE_OUT_EXPO}`;
const CARD_OUT = "opacity-0 blur-md scale-[0.97] translate-y-2 duration-200 ease-in";

function Callout({ side, y, title, icon, body, visible }) {
  const right = side === "right";
  return (
    // Starts just past the enlarged (centred) phone's edge; line, a small gap (the line never
    // touches the card), then the card sized to its unwrapped lines
    <div
      className={`pointer-events-none absolute hidden w-max -translate-y-1/2 items-center gap-3 lg:flex ${
        right ? "left-[calc(50%+12.5rem)] flex-row" : "right-[calc(50%+12.5rem)] flex-row-reverse"
      }`}
      style={{ top: y }}
    >
      {/* Connector: draws out from the phone's edge first, then the card settles in at its end */}
      <span
        className={`h-px w-28 shrink-0 bg-black/25 transition-transform ${right ? "origin-left" : "origin-right"} ${
          visible ? `scale-x-100 duration-500 ${EASE_OUT_EXPO}` : "scale-x-0 duration-200 ease-in"
        }`}
      />

      <div className={`${CARD} transition-all ${visible ? `${CARD_IN} delay-200` : CARD_OUT}`}>
        <CalloutTitle icon={icon} title={title} />
        <CalloutBody lines={body} light={!right} />
      </div>
    </div>
  );
}

// Mobile: no room beside the phone, so the current callout shows as a card under it. Keyed by
// title so each new callout remounts and plays the same blur-in as desktop.
function MobileCallout({ callout }) {
  if (!callout) return null;
  return (
    <div
      key={callout.title}
      className={`pointer-events-none absolute inset-x-4 bottom-[6rem] ${CARD} animate-[callout-in_700ms_cubic-bezier(0.16,1,0.3,1)] lg:hidden`}
    >
      <CalloutTitle icon={callout.icon} title={callout.title} />
      <CalloutBody lines={callout.body} />
    </div>
  );
}

// Pinned-scroll progress over which the phone grows/straightens after it pins
const FOCUS_RAMP = 0.1;
// Index of the callout from which the phone opens TikTok (the warm-up one)
const OPEN_APP_AT = 2;
// …and waits this long after that card appears before opening
const OPEN_APP_DELAY_MS = 200;
// Minimum time each callout stays up when the scroll races ahead of it
const MIN_DWELL_MS = 450;

// The phone scrolls up with the hero, pins in the middle of the viewport, and while pinned the
// callouts appear one at a time (each replaces the previous). The section is the stage height +
// 280dvh tall; the sticky stage stays put for that extra distance.
export default function PhoneStory({ className = "" }) {
  const section = useRef(null);
  const stage = useRef(null);
  const focus = useRef(0); // 0 = hero pose, 1 = centred pose; read by the 3D scene every frame
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = section.current.getBoundingClientRect();
      const pinTop = parseFloat(getComputedStyle(stage.current).top) || 0;
      const pinDistance = box.height - stage.current.offsetHeight;
      const p = Math.min(1, Math.max(0, (pinTop - box.top) / pinDistance));
      focus.current = Math.min(1, p / FOCUS_RAMP);
      setProgress(p);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // The callout the scroll position asks for (-1 = none yet)
  const target = CALLOUTS.findLastIndex((c) => progress >= c.at);

  // What's actually shown steps towards `target` one callout at a time with a minimum dwell,
  // so a fast scroll still plays every card instead of skipping to the last. Scrolling back
  // up jumps straight there.
  const [shown, setShown] = useState(-1);
  useEffect(() => {
    if (shown === target) return;
    if (target < shown) {
      setShown(target);
      return;
    }
    const id = setTimeout(() => setShown((s) => s + 1), shown === -1 ? 0 : MIN_DWELL_MS);
    return () => clearTimeout(id);
  }, [shown, target]);
  const current = CALLOUTS[shown];

  // From "Accounts warmed up for you" onwards the phone opens TikTok and scrolls the feed. It
  // opens only once that card has fully come in (not as the section is arriving); scrolling
  // back above it closes the app straight away.
  const appOpen = useRef(false);
  useEffect(() => {
    if (shown < OPEN_APP_AT) {
      appOpen.current = false;
      return;
    }
    const id = setTimeout(() => {
      appOpen.current = true;
    }, OPEN_APP_DELAY_MS);
    return () => clearTimeout(id);
  }, [shown]);

  return (
    // Stage = the old phone slot (36rem mobile; desktop: viewport minus the hero stack above it,
    // see ReelCarousel.js) + 12rem of headroom (6rem above/below) so the phone can grow when
    // centred. Top margin = the old 2.5rem gap minus that 6rem headroom, so the phone sits where
    // it did (the form above is z-raised so the overlapping canvas can't block it).
    // Pin distance: 280dvh (~78dvh of scroll per callout, ~28dvh after the last before unpinning).
    <section
      ref={section}
      className={`relative -mt-[3.5rem] w-full h-[calc(48rem+280dvh)] lg:h-[calc(100dvh-14.1375rem+280dvh)] ${className}`}
    >
      <div
        ref={stage}
        className="sticky top-[calc((100dvh-48rem)/2)] h-[48rem] w-full lg:top-[7.06875rem] lg:h-[calc(100dvh-14.1375rem)]"
      >
        {/* Square canvas (not full width: that's mostly empty pixels). It must not be narrower than
            it is tall, or the camera fit becomes width-limited and the phone shrinks. */}
        <PhoneShowcase className="mx-auto aspect-square h-full max-w-full" focusRef={focus} appRef={appOpen} />

        {CALLOUTS.map((c) => (
          <Callout key={c.title} {...c} visible={c === current} />
        ))}
        <MobileCallout callout={current} />
      </div>

    </section>
  );
}
