import Image from "next/image";
import AutoplayVideo from "@/components/AutoplayVideo";

// "How Postside works": four steps, each a card with a small looping motion graphic on top
// (pure CSS/SVG, keyframes prefixed hiw- in globals.css) and a short title + line below.

function Panel({ children }) {
  return (
    <div className="squircle relative flex h-80 items-center justify-center overflow-hidden bg-white">{children}</div>
  );
}

function Check({ className = "", style }) {
  return (
    <span className={`flex size-5 items-center justify-center rounded-full bg-[#22c55e] ${className}`} style={style}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} className="size-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

// Big phone rising from the panel's bottom edge: only its top half shows. Shared by cards 1 and 3.
function TopHalfPhone({ children }) {
  return (
    <div className="absolute top-16 left-1/2 h-[26rem] w-[12.5rem] -translate-x-1/2 rounded-[2.4rem] bg-[#111] p-[0.4rem] shadow-[0_0.75rem_1.5rem_rgb(15_23_42_/_0.2)]">
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-black">
        {children}
        <span className="absolute top-2.5 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

// 1. A cloud phone coming online: a big phone rising from the bottom edge (only its top half
// shows), with signal rings pulsing out from it
function CloudPhoneVisual() {
  return (
    <Panel>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute top-[40%] left-1/2 size-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/50 animate-[hiw-ping_3s_ease-out_infinite]"
          style={{ animationDelay: `${i}s` }}
        />
      ))}
      <TopHalfPhone>
        <div className="absolute inset-0 bg-[url(/background.jpg)] bg-cover bg-top" />
      </TopHalfPhone>
    </Panel>
  );
}

// 2. Accounts signing in one after another
const ACCOUNTS = [
  { name: "TikTok", icon: "/tiktok.png" },
  { name: "Instagram", icon: "/instagram.jpg" },
  { name: "YouTube", icon: "/youtube.png" },
];

function LoginVisual() {
  return (
    <Panel>
      <div className="w-80 space-y-3">
        {ACCOUNTS.map(({ name, icon }, i) => (
          <div
            key={name}
            className="flex items-center gap-3.5 rounded-2xl bg-black/[0.03] px-4 py-3 text-left"
          >
            <Image src={icon} alt="" width={80} height={80} className="size-10 rounded-[0.7rem] object-cover" />
            <div className="flex-1">
              <p className="text-base font-medium">{name}</p>
              <p className="relative h-5 text-sm text-muted">
                {/* "Signing in…" swaps to "Signed in" in step with the check */}
                <span className="absolute inset-0 animate-[hiw-fade-out_4.5s_ease-in-out_infinite]" style={{ animationDelay: `${0.4 + i * 0.8}s` }}>
                  Signing in
                </span>
                <span className="absolute inset-0 opacity-0 animate-[hiw-fade-in_4.5s_ease-in-out_infinite]" style={{ animationDelay: `${0.4 + i * 0.8}s` }}>
                  Signed in
                </span>
              </p>
            </div>
            <Check className="opacity-0 animate-[hiw-pop_4.5s_ease-in-out_infinite]" style={{ animationDelay: `${0.4 + i * 0.8}s` }} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

// 3. The warm-up: the same top-half phone swiping up through the feed clips in /public/feed,
// pausing on each like a For You page
const FEED = Array.from({ length: 8 }, (_, i) => `/feed/feed-${i + 1}.mp4`);

function WarmupVisual() {
  return (
    <Panel>
      <TopHalfPhone>
        {/* 8 clips + the first again at the end; hiw-swipe8 steps up one clip at a time and the
            loop's jump back to the top lands on an identical frame. Each clip is one screen tall. */}
        <div className="absolute inset-x-0 top-0 h-[900%] animate-[hiw-swipe8_16s_ease-in-out_infinite]">
          {[...FEED, FEED[0]].map((src, i) => (
            <AutoplayVideo key={i} src={src} className="block h-[11.1111%] w-full object-cover" />
          ))}
        </div>
      </TopHalfPhone>
    </Panel>
  );
}

// 4. An agent chat: request, MCP tool call, confirmation, in sequence
function AgentVisual() {
  const step = (i) => ({ animationDelay: `${i * 1.3}s` });
  const seq = "opacity-0 animate-[hiw-seq_7s_ease-out_infinite]";
  return (
    <Panel>
      <div className="w-[22rem] space-y-3 text-left text-base">
        <div className={`ml-auto w-fit max-w-[18rem] rounded-2xl rounded-br-md bg-[#111] px-3.5 py-2.5 text-white ${seq}`} style={step(0)}>
          Post today&apos;s clip to TikTok at 6 PM ET
        </div>
        <div className={`flex w-fit items-center gap-2 rounded-xl bg-black/[0.04] px-3.5 py-2.5 font-mono text-sm ${seq}`} style={step(1)}>
          <span className="rounded bg-[#1d8fe8] px-1.5 py-0.5 font-sans text-[0.625rem] font-semibold text-white">MCP</span>
          postside.post_video
        </div>
        <div className={`flex w-fit items-center gap-2 rounded-2xl rounded-bl-md bg-black/[0.04] px-3.5 py-2.5 ${seq}`} style={step(2)}>
          <Check className="size-4" />
          Scheduled on your US phone
        </div>
      </div>
    </Panel>
  );
}

const STEPS = [
  {
    title: "Rent a cloud phone",
    body: "A real phone in the cloud with a US SIM and a residential US IP, yours for as long as your plan runs",
    Visual: CloudPhoneVisual,
  },
  {
    title: "Log in to your accounts",
    body: "Sign in to TikTok, Instagram and YouTube on it like on your own phone, and your accounts stay logged in",
    Visual: LoginVisual,
  },
  {
    title: "Auto warm-up and post",
    body: "It warms up each account like a US user would by scrolling and engaging, then posts your content on schedule",
    Visual: WarmupVisual,
  },
  {
    title: "Connect your agent",
    body: "Plug Postside into your AI agent with our MCP server and skill, and it posts with no shadowban risks",
    Visual: AgentVisual,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-8 px-[calc(2.5rem+2px)] py-24 sm:px-[calc(4rem+2px)] lg:px-[calc(13rem+2px)]"
    >
      <h2 className="text-center font-display text-4xl font-[450] leading-[1.05] tracking-[-0.035em] sm:text-6xl">
        How Postside works
      </h2>

      {/* Narrower than the page gutters so the 2×2 cards come out closer to square */}
      <ol className="mx-auto mt-9 grid max-w-[72rem] gap-4 lg:grid-cols-2">
        {STEPS.map(({ title, body, Visual }) => (
          <li key={title} className="squircle bg-black/[0.03] p-3 text-left">
            <Visual />
            <div className="px-3 pt-5 pb-3">
              {/* Same sizes as the phone-story callout cards (title 2xl, body lg) */}
              <h3 className="text-2xl font-medium tracking-tight">{title}</h3>
              <p className="mt-2 text-lg leading-snug text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
