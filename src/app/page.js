import Image from "next/image";
import ArrowIcon from "@/components/ArrowIcon";
import EarlyAccessForm from "@/components/EarlyAccessForm";
// eslint-disable-next-line no-unused-vars -- TEMP: flags hidden in the hero for comparison
import { Flag, RotatingFlag } from "@/components/Flag";
import FontCycle from "@/components/FontCycle";
import PhoneStory from "@/components/PhoneStory";
import PixelEdge from "@/components/PixelEdge";
import HowItWorks from "@/components/HowItWorks";

const navLinks = [
  { label: "How it works", href: "#how-it-works" }, // rent a US cloud phone monthly, post from anywhere
  { label: "Results", href: "#results" }, // real reach from accounts posting through Postside
];

export default function Home() {
  return (
    // Full-width page (the old framed column with side hairlines is removed for now, so the mesh
    // runs edge to edge). The navbar's side padding absorbs the frame's old margins + its two 1px
    // lines, so the logo and button sit exactly where they did.
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col bg-white">
        <header className="flex h-16 items-center justify-between bg-white px-[calc(2.5rem+2px)] sm:px-[calc(4rem+2px)] lg:px-[calc(13rem+2px)]">
          <div className="flex items-center gap-[1.4375rem]">
            <a href="/" className="flex items-center gap-1 font-display text-[1.375rem] font-semibold">
              <Image src="/logo.png" alt="" width={736} height={646} priority className="h-4 w-auto" />
              Postside
            </a>

            <nav className="hidden items-center gap-6 text-[1.01875rem] font-medium text-muted md:flex">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="hover:text-[#454545]">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="text-base font-medium">
            <a
              href="#waitlist"
              className="flex h-9 items-center gap-1.5 squircle bg-foreground px-4 font-semibold text-surface hover:bg-neutral-700"
            >
              Join the waitlist
              <ArrowIcon />
            </a>
          </div>
        </header>

        {/* Bottom padding = the gap under the pinned phone stage (see PhoneStory: stage top
            (100dvh-48rem)/2, desktop 7.06875rem, and the same gap below it). That way <main> reaches
            the bottom of the screen exactly when the phone unpins, so the mesh (and the pixel band
            under it) start scrolling on the same frame as the phone. */}
        <main className="relative isolate flex flex-1 flex-col items-center overflow-clip pt-[8.9375rem] pb-[max(0.5rem,calc((100dvh-48rem)/2))] text-center sm:pt-[11.9375rem] lg:pb-[7.06875rem]">
          {/* Mesh pinned to the viewport while the phone story plays out over it. The sticky box sits
              on a track spanning exactly <main>, so it unpins when the story ends (main's bottom
              reaches the screen's bottom) and the mesh then scrolls away with the page, ending in
              the pixel band below. */}
          {/* Track starts below main's top padding (pt-[8.9375rem] / sm:pt-[11.9375rem]) so the
              mesh starts and pins exactly where the old in-flow anchor did */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[8.9375rem] bottom-0 -z-10 sm:top-[11.9375rem]"
          >
            <div className="sticky top-0 h-[100dvh] w-full">
              <div className="hero-mesh hero-mesh--pinned" />
            </div>
          </div>
          <h1 className="max-w-4xl px-6 font-display text-5xl lg:h-[2.1em] font-[450] leading-[1.05] tracking-[-0.035em] sm:text-7xl">
            Go <FontCycle>viral</FontCycle> in America
            {/* TEMP: flags hidden to compare — restore by uncommenting */}
            {/* <Flag code="us" className="ml-[0.22em]" /> */}
            <br />
            from anywhere
            {/* <RotatingFlag className="ml-[0.22em]" /> */}
          </h1>

          <div className="relative z-10 mt-[2.125rem] flex items-center gap-3 text-base font-medium">
            <EarlyAccessForm />
          </div>

          {/* Phone scrolls up with the hero, pins centred, and reveals the feature callouts */}
          <PhoneStory />

          {/* TODO(footer): CC BY 4.0 requires crediting the phone model — add to the footer:
              "iPhone model by MajdyModels · CC BY 4.0"
              https://sketchfab.com/3d-models/iphone-16-pro-max-41a071ae12794b668502f58d1e0fd1a3 */}
        </main>

        {/* The mesh's pixelated ending, dissolving into the white page below */}
        <PixelEdge />

        <HowItWorks />
      </div>
    </div>
  );
}
