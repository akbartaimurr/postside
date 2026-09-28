// Pixelated ending under the mesh hero. The pixels are windows onto a copy of the mesh itself,
// lined up to continue from the real mesh's bottom edge, so every block shows the mesh's actual
// (blurred, brightened) colour at that spot. Dense at the top, thinning out row by row into the
// white page below. The block pattern is seeded, so server and client render the same thing, and
// it's a fixed-size mask centred on the band, so blocks stay square at any width.

const PX = 20; // block size, CSS px
const COLS = 160; // covers up to 3200px wide
const ROWS = 7;
// Chance a block is filled, per row (top → bottom)
const DENSITY = [1, 0.85, 0.66, 0.48, 0.32, 0.18, 0.07];

// Small seeded PRNG (mulberry32)
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The block pattern as an SVG data URI, used as a CSS mask (opaque blocks = mesh shows through)
function buildMask() {
  const rand = rng(7);
  let rects = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (rand() <= DENSITY[r]) rects += `<rect x='${c * PX}' y='${r * PX}' width='${PX}' height='${PX}'/>`;
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${COLS * PX}' height='${ROWS * PX}' shape-rendering='crispEdges'>${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const MASK = buildMask();
const BAND = ROWS * PX; // px

export default function PixelEdge({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{
        height: BAND,
        maskImage: MASK,
        WebkitMaskImage: MASK,
        maskSize: `${COLS * PX}px ${BAND}px`,
        WebkitMaskSize: `${COLS * PX}px ${BAND}px`,
        maskPosition: "center top",
        WebkitMaskPosition: "center top",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    >
      {/* A copy of the pinned mesh, positioned so its "bottom of the screen" line (exactly where the
          real mesh is cut off at the end of the hero) sits at the top of this band: the first row
          continues the colours right above it, and the rows below show the mesh's 5rem overscan */}
      <div className="absolute inset-x-0 top-[-100dvh] h-[100dvh]">
        <div className="hero-mesh hero-mesh--pinned" />
      </div>
    </div>
  );
}
