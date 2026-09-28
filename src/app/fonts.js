import {
  Bricolage_Grotesque,
  DM_Serif_Display,
  Fraunces,
  Instrument_Serif,
  Inter,
  Playfair_Display,
  Space_Grotesk,
  Syne,
} from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Fonts the hero's "viral" word cycles through, alternating sans and serif
const instrumentSerif = Instrument_Serif({ weight: "400", style: "italic", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const playfair = Playfair_Display({ style: "italic", subsets: ["latin"] });
const syne = Syne({ subsets: ["latin"] });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"] });
const fraunces = Fraunces({ subsets: ["latin"] });

export const viralFonts = [
  bricolage,
  instrumentSerif,
  spaceGrotesk,
  playfair,
  syne,
  dmSerif,
  fraunces,
];
