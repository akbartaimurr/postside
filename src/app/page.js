import EarlyAccessForm from "@/components/EarlyAccessForm";
// eslint-disable-next-line no-unused-vars -- TEMP: flags hidden in the hero for comparison
import { Flag, RotatingFlag } from "@/components/Flag";
import FontCycle from "@/components/FontCycle";
import HowItWorks from "@/components/HowItWorks";
import PhoneStory from "@/components/PhoneStory";
import PixelEdge from "@/components/PixelEdge";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import WaitlistCTA from "@/components/WaitlistCTA";

const TITLE = "Postside | Join the waitlist";
const DESCRIPTION = "Go viral in America from anywhere with Postside's cloud-based solutions.";

// The share image itself comes from app/opengraph-image.jpg + twitter-image.jpg (1200×630, made
// from public/banner.png); Next adds those tags with full URLs automatically
export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, siteName: "Postside", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function Home() {
  return (
    // Full-width page (the old framed column with side hairlines is removed for now, so the mesh
    // runs edge to edge). The navbar's side padding absorbs the frame's old margins + its two 1px
    // lines, so the logo and button sit exactly where they did.
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader />

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
            <EarlyAccessForm id="waitlist" />
          </div>

          {/* Phone scrolls up with the hero, pins centred, and reveals the feature callouts */}
          <PhoneStory />
        </main>

        {/* The mesh's pixelated ending, dissolving into the white page below */}
        <PixelEdge />

        <HowItWorks />

        <WaitlistCTA />

        {/* Includes the CC BY 4.0 credit for the phone model */}
        <SiteFooter />
      </div>
    </div>
  );
}
