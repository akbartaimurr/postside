// Placeholder short-form videos until real creator content is wired in
const reels = [
  {
    handle: "@creator",
    // Real reel: 22.5K likes / 135 comments; views estimated at a ~4% like rate
    views: "560K",
    href: "https://www.instagram.com/reels/DQUQjvbEXmY/",
    // image: "/reels/DQUQjvbEXmY.jpg", // drop a thumbnail in public/reels/ and uncomment
    from: "#38bdf8",
    to: "#0b74c9",
  },
  { handle: "@lagos.eats", views: "2.4M", from: "#f59e0b", to: "#b45309" },
  { handle: "@manila.fits", views: "860K", from: "#f472b6", to: "#9d174d" },
  { handle: "@cairo.tech", views: "1.1M", from: "#34d399", to: "#047857" },
  { handle: "@delhi.dance", views: "4.7M", from: "#fb7185", to: "#be123c" },
  { handle: "@bogota.vlogs", views: "530K", from: "#60a5fa", to: "#1e40af" },
  { handle: "@karachi.comedy", views: "3.2M", from: "#a3e635", to: "#4d7c0f" },
  { handle: "@nairobi.style", views: "1.8M", from: "#fbbf24", to: "#c2410c" },
  { handle: "@jakarta.food", views: "940K", from: "#2dd4bf", to: "#0f766e" },
];

// Desktop: height = viewport minus everything stacked above/below the reels (navbar 4 +
// hero top padding 11.9375 + heading 9.45 + gaps 2.125 & 4.375 + email form 2.75 + bottom padding 0.5,
// all rem), so the hero always fits the screen exactly. Update it if that spacing changes.
function ReelCard({ handle, views, href, image, from, to }) {
  const Tag = href ? "a" : "div";
  const linkProps = href ? { href, target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Tag
      {...linkProps}
      className="relative mr-2 aspect-[9/16] w-56 shrink-0 overflow-hidden rounded-2xl shadow-[0_0.0625rem_0.1875rem_rgb(15_23_42_/_0.08),0_0.25rem_0.625rem_-0.25rem_rgb(15_23_42_/_0.18)] sm:w-72 lg:h-[calc(100dvh-35.1375rem)] lg:w-auto"
      style={{
        background: image
          ? `center / cover url(${image})`
          : `linear-gradient(160deg, ${from}, ${to})`,
      }}
    >
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 text-left text-white">
        <p className="text-base font-medium">{handle}</p>
        <p className="text-sm text-white/75">{views} views</p>
      </div>
    </Tag>
  );
}

export default function ReelCarousel() {
  return (
    <div className="w-full overflow-x-clip">
      {/* List is rendered twice so the 0 → -50% loop is seamless; spacing is per-card margin (not gap) so both halves are exactly equal */}
      <div className="reel-track flex w-max">
        {[...reels, ...reels].map((reel, i) => (
          <ReelCard key={i} {...reel} />
        ))}
      </div>
    </div>
  );
}
