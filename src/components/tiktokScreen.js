// The phone's live "TikTok" screen: an iOS-style app launch from the home-screen icon, then a For
// You feed that auto-swipes through the clips in /public/feed. Drawn into a canvas in the same
// 390×835 device-px space as the home screen (the caller sets the canvas scale).
import { appIconRect, drawCover, drawStatusBar, SCREEN_H, SCREEN_W, SEARCH_ICON } from "@/components/drawPhoneScreen";

const W = SCREEN_W;
const H = SCREEN_H;

// Feed clips (compressed to 432×768, 6s, no audio) with made-up US creators for the overlay
const FEED = [
  { src: "/feed/feed-1.mp4", handle: "@brooklyn.bites", caption: "best slice in NYC? 🍕", likes: "184K", comments: "2,318", saves: "12.4K" },
  { src: "/feed/feed-2.mp4", handle: "@miami.drip", caption: "fit check before the beach", likes: "92.1K", comments: "1,044", saves: "6,210" },
  { src: "/feed/feed-3.mp4", handle: "@austin.tech", caption: "day in my life as a dev", likes: "56.7K", comments: "873", saves: "4,902" },
  { src: "/feed/feed-4.mp4", handle: "@la.daily", caption: "sunset from the canyon 🌅", likes: "311K", comments: "5,629", saves: "22.8K" },
  { src: "/feed/feed-5.mp4", handle: "@nyc.street", caption: "asking strangers one question", likes: "148K", comments: "3,907", saves: "9,316" },
  { src: "/feed/feed-6.mp4", handle: "@chicago.laughs", caption: "wait for it 😭", likes: "402K", comments: "7,751", saves: "31.2K" },
  { src: "/feed/feed-7.mp4", handle: "@sf.startup", caption: "we shipped it 🚀", likes: "38.5K", comments: "612", saves: "2,875" },
  { src: "/feed/feed-8.mp4", handle: "@texas.eats", caption: "brisket that took 14 hours", likes: "226K", comments: "4,480", saves: "17.9K" },
];

const OPEN = 0.5; // s — the icon grows, untilts and morphs into the full screen
const FEED_IN_START = 0.6; // s — splash holds briefly, then the feed fades in…
const FEED_IN = 0.2; // s — …over this long
const CLOSE = 0.5; // s — full close (reverse of the opening)
const FEED_OUT = 0.12; // s — feed fades off at the start of closing, revealing the splash
const CLIP_TIME = 1.8; // s each clip plays before swiping to the next (loops back to the first)
const SWIPE = 0.3; // s swipe duration

const ICON_PATHS = {
  heart:
    "M12 21s-7.5-4.6-10-9.3C.3 8.3 2.4 4 6.4 4c2.2 0 3.7 1.2 5.6 3.3C13.9 5.2 15.4 4 17.6 4c4 0 6.1 4.3 4.4 7.7C19.5 16.4 12 21 12 21Z",
  comment:
    "M12 3C6.5 3 2 6.8 2 11.5c0 2.3 1.1 4.4 2.9 5.9L4 21l4.2-1.9c1.2.4 2.5.6 3.8.6 5.5 0 10-3.8 10-8.5S17.5 3 12 3Z",
  bookmark: "M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z",
  share: "M14 4v4C6 9 3 14 2 20c2.5-3.5 6-5.1 12-5.1V19l8-7.5L14 4Z",
};

// Bottom tab bar icons (24×24, stroked)
const TAB_ICON_PATHS = {
  Home: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  Friends:
    "M1 20V19C1 15.134 4.13401 12 8 12V12C11.866 12 15 15.134 15 19V20M13 14V14C13 11.2386 15.2386 9 18 9V9C20.7614 9 23 11.2386 23 14V14.5M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12ZM18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 7.65685 16.3431 9 18 9Z",
  Inbox:
    "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75",
  Profile:
    "M5 20V19C5 15.134 8.13401 12 12 12V12C15.866 12 19 15.134 19 19V20M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z",
};

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeOutQuint = (t) => 1 - (1 - t) ** 5;

const ICON_SQUIRCLE_N = 4; // matches the home-screen icons' squircle (SQUIRCLE_N in drawPhoneScreen.js)
const HOME_RECEDE = 0.06; // home screen shrinks back by this much behind the opening app

function label(ctx, text, x, y, { size = 13, weight = 600, color = "#fff", align = "left", font }) {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
}

export function createTikTokScreen({ homeCanvas, tiktokIcon, splashLogo, font }) {
  const icons = Object.fromEntries(Object.entries(ICON_PATHS).map(([k, d]) => [k, new Path2D(d)]));
  const tabIcons = Object.fromEntries(Object.entries(TAB_ICON_PATHS).map(([k, d]) => [k, new Path2D(d)]));
  const plusIcon = new Path2D("M6 12H12M18 12H12M12 12V6M12 12V18");
  const searchIcon = new Path2D(SEARCH_ICON);
  const iconRect = appIconRect("TikTok");

  let phase = "home"; // home → opening → app → closing → home
  let phaseStart = 0;
  let videos = null; // created on first open (all 8 clips are ~2MB total)
  let playing = -1; // clip currently on screen
  let prepped = -1; // next clip, already rewound + playing because its swipe has started
  let animating = false; // opening/closing/swiping → caller redraws every frame

  function ensureVideos() {
    videos ??= FEED.map(({ src }) => {
      const v = document.createElement("video");
      Object.assign(v, { src, muted: true, playsInline: true, loop: true, preload: "auto" });
      return v;
    });
  }

  function start(v) {
    v.currentTime = 0;
    v.play().catch(() => {});
  }

  // Keeps the on-screen clip playing. The next clip is rewound and started as soon as its swipe
  // begins, so it's already moving while it slides in and is never re-seeked when it lands (a
  // seek blanks the frame for a moment — that was the "refresh" flash).
  function syncPlayback(index, next, swiping) {
    if (swiping && prepped !== next) {
      start(videos[next]);
      prepped = next;
    }
    if (playing !== index) {
      if (playing !== -1 && playing !== next) videos[playing].pause();
      if (prepped === index) prepped = -1;
      else start(videos[index]);
      playing = index;
    } else if (videos[index].paused) {
      videos[index].play().catch(() => {});
    }
    // Once the swipe has finished, the clip that slid away can stop
    videos.forEach((v, j) => {
      if (j !== index && j !== prepped && !v.paused) v.pause();
    });
  }

  // ---- Opening: the icon grows into the full screen over a zooming, dimming home screen.
  // `k` is linear 0 (icon) → 1 (full screen). iOS-style, no overshoot/tilt: the window starts as
  // exactly the home-screen icon's squircle, morphs into a not-quite-square shape as its height
  // pulls ahead of its width, and keeps growing until it fills the screen. The home screen
  // recedes behind it.
  function drawLaunch(ctx, k) {
    const grow = easeOutQuint(k);
    const shape = easeOutCubic(k);

    // Home screen behind: shrinks back slightly (around the screen centre) and dims
    const zoom = 1 - HOME_RECEDE * grow;
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(homeCanvas, 0, 0, W, H);
    ctx.restore();
    ctx.fillStyle = `rgb(0 0 0 / ${0.45 * grow})`;
    ctx.fillRect(0, 0, W, H);

    // Height leads width, so the square icon becomes a taller, not-quite-square shape on its way
    // to the screen's proportions
    const growH = easeOutQuint(Math.min(1, k * 1.25));
    const w = lerp(iconRect.size, W, grow);
    const h = lerp(iconRect.size, H, growH);
    const centerX = lerp(iconRect.x + iconRect.size / 2, W / 2, grow);
    const centerY = lerp(iconRect.y + iconRect.size / 2, H / 2, growH);
    const corner = lerp(ICON_SQUIRCLE_N, 12, shape); // icon squircle → screen's soft-cornered rect

    ctx.save();
    ctx.translate(centerX, centerY);
    squircleRectPath(ctx, w, h, corner);
    ctx.clip();
    ctx.fillStyle = "#000";
    ctx.fillRect(-w, -h, w * 2, h * 2);
    // Splash: starts as the home-screen icon art (so the launch is continuous) and crossfades
    // into the TikTok preload logo, centred at its own aspect ratio
    const iconFade = clamp01(1 - grow / 0.45);
    if (iconFade > 0) {
      const size = lerp(iconRect.size, 80, grow);
      ctx.globalAlpha = iconFade;
      drawCover(ctx, tiktokIcon, -size / 2, -size / 2, size, size);
    }
    ctx.globalAlpha = 1 - iconFade;
    const logoH = lerp(40, 76, grow);
    const logoW = logoH * (splashLogo.width / splashLogo.height);
    ctx.drawImage(splashLogo, -logoW / 2, -logoH / 2, logoW, logoH);
    ctx.restore();
  }

  // Window outline centred on (0, 0): a superellipse w×h with exponent `n` (4 = the home-screen
  // icon's squircle, 12 ≈ a rectangle with soft corners)
  function squircleRectPath(ctx, w, h, n) {
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const x = (w / 2) * Math.sign(c) * Math.abs(c) ** (2 / n);
      const y = (h / 2) * Math.sign(s) * Math.abs(s) ** (2 / n);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  // ---- For You feed
  function drawClipOverlay(ctx, item, offsetY) {
    ctx.save();
    ctx.translate(0, offsetY);

    const shade = ctx.createLinearGradient(0, H * 0.55, 0, H);
    shade.addColorStop(0, "rgb(0 0 0 / 0)");
    shade.addColorStop(1, "rgb(0 0 0 / 0.55)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);

    // Right-hand rail: like, comment, save, share
    const railX = W - 34;
    [
      ["heart", item.likes, "#fff"],
      ["comment", item.comments, "#fff"],
      ["bookmark", item.saves, "#fff"],
      ["share", "Share", "#fff"],
    ].forEach(([name, count, color], i) => {
      const y = 470 + i * 60;
      ctx.save();
      ctx.translate(railX - 16, y - 16);
      ctx.scale(32 / 24, 32 / 24);
      ctx.fillStyle = color;
      ctx.shadowColor = "rgb(0 0 0 / 0.3)";
      ctx.shadowBlur = 4;
      ctx.fill(icons[name]);
      ctx.restore();
      label(ctx, count, railX, y + 32, { size: 12, align: "center", font });
    });

    // Caption
    label(ctx, item.handle, 14, H - 138, { size: 16, weight: 700, font });
    label(ctx, item.caption, 14, H - 114, { size: 15, weight: 500, font });

    ctx.restore();
  }

  function drawFeedChrome(ctx) {
    // Top: status bar, Following / For You tabs, search
    drawStatusBar(ctx, font);
    label(ctx, "Following", W / 2 - 10, 92, { size: 17, color: "rgb(255 255 255 / 0.65)", align: "right", font });
    label(ctx, "For You", W / 2 + 10, 92, { size: 17, font });
    ctx.font = `600 17px ${font}`;
    const mid = W / 2 + 10 + ctx.measureText("For You").width / 2;
    ctx.fillStyle = "#fff";
    ctx.fillRect(mid - 14, 101, 28, 3);
    ctx.save();
    ctx.translate(W - 40, 72);
    ctx.scale(24 / 24, 24 / 24);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.stroke(searchIcon);
    ctx.restore();

    // Bottom tab bar + home indicator
    const barY = H - 83;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, barY, W, 83);
    ["Home", "Friends", null, "Inbox", "Profile"].forEach((name, i) => {
      const x = (W * (i + 0.5)) / 5;
      if (name) {
        const color = i === 0 ? "#fff" : "rgb(255 255 255 / 0.6)";
        const ICON_SIZE = 24;
        ctx.save();
        ctx.translate(x - ICON_SIZE / 2, barY + 10);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke(tabIcons[name]);
        ctx.restore();
        label(ctx, name, x, barY + 48, { size: 10, align: "center", color, font });
        return;
      }
      // Create button: white pill with cyan/red offsets, and a black "+" in the middle
      const PLUS_Y = barY + 12;
      [
        ["#25f4ee", -3],
        ["#fe2c55", 3],
        ["#fff", 0],
      ].forEach(([color, dx]) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x - 22 + dx, PLUS_Y, 44, 28, 8);
        ctx.fill();
      });
      ctx.save();
      ctx.translate(x - 10, PLUS_Y + 4); // 20px icon centred in the 44×28 pill
      ctx.scale(20 / 24, 20 / 24);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      ctx.stroke(plusIcon);
      ctx.restore();
    });
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 67, H - 13, 134, 5, 2.5);
    ctx.fill();
  }

  function drawClip(ctx, i, offsetY) {
    const v = videos[i];
    ctx.fillStyle = "#000";
    ctx.fillRect(0, offsetY, W, H);
    if (v.readyState >= 2) drawCover(ctx, v, 0, offsetY, W, H);
    drawClipOverlay(ctx, FEED[i], offsetY);
  }

  // `frozen`: draw the frame at `time` without touching playback (used while fading out on close)
  function drawFeed(ctx, time, frozen = false) {
    const n = FEED.length;
    const index = Math.floor(time / CLIP_TIME) % n;
    const within = time % CLIP_TIME;
    const next = (index + 1) % n;
    const swiping = within > CLIP_TIME - SWIPE;
    if (!frozen) {
      animating ||= swiping;
      syncPlayback(index, next, swiping);
    }

    const p = swiping ? easeInOutCubic((within - (CLIP_TIME - SWIPE)) / SWIPE) : 0;
    drawClip(ctx, index, -H * p);
    if (p > 0) drawClip(ctx, next, H * (1 - p));
    drawFeedChrome(ctx);
  }

  // Closing = the opening played backwards: the feed fades out fast, the splash (preload logo)
  // shows while the window shrinks, and the icon art takes over near the end. It starts from
  // wherever the opening had got to, and reopening mid-close resumes from there too.
  let closeFrom = 1; // launch progress k when closing began
  let feedTime = 0; // last feed time drawn (the feed freezes on this frame while fading out)
  let feedAlpha = 0; // feed opacity when closing began

  return {
    // Call every frame with the desired state; returns true while the live screen is needed
    setOpen(open, now) {
      if (open && phase === "home") {
        ensureVideos();
        phase = "opening";
        phaseStart = now;
      } else if (open && phase === "closing") {
        // Reverse mid-close: continue opening from the current size
        const k = clamp01(closeFrom - (now - phaseStart) / CLOSE);
        phase = "opening";
        phaseStart = now - k * OPEN;
      } else if (!open && (phase === "opening" || phase === "app")) {
        closeFrom = phase === "app" ? 1 : clamp01((now - phaseStart) / OPEN);
        phase = "closing";
        phaseStart = now;
        videos?.forEach((v) => v.pause());
        playing = -1;
        prepped = -1;
      }
      return phase !== "home";
    },

    // True while something is moving fast (open/close, swipe): redraw every frame then, since
    // 30fps looks steppy for motion; a clip just playing (24fps) is fine at 30
    isAnimating() {
      return animating;
    },

    draw(ctx, now) {
      const t = now - phaseStart;
      animating = phase === "opening" || phase === "closing";

      if (phase === "closing") {
        const k = closeFrom - t / CLOSE;
        if (k <= 0) {
          phase = "home";
          return;
        }
        drawLaunch(ctx, k);
        const fade = feedAlpha * (1 - t / FEED_OUT);
        if (fade > 0) {
          ctx.save();
          ctx.globalAlpha = fade;
          drawFeed(ctx, feedTime, true);
          ctx.restore();
        }
        return;
      }

      if (phase === "opening" && t >= FEED_IN_START + FEED_IN) phase = "app";

      if (phase === "opening") {
        drawLaunch(ctx, clamp01(t / OPEN));
        feedAlpha = clamp01((t - FEED_IN_START) / FEED_IN);
        if (feedAlpha > 0) {
          feedTime = Math.max(0, t - FEED_IN_START);
          ctx.save();
          ctx.globalAlpha = feedAlpha;
          drawFeed(ctx, feedTime);
          ctx.restore();
        }
        return;
      }

      // phase === "app"
      feedAlpha = 1;
      feedTime = t - FEED_IN_START;
      drawFeed(ctx, feedTime);
    },
  };
}
