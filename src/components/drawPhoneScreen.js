// Draws the phone's screen: an iOS home screen over /public/background.jpg with three app
// icons (images in /public). Laid out in a 390×835 "device px" space (iPhone 16 Pro Max
// ratio); the caller sets the canvas scale.

export const SCREEN_W = 390;
export const SCREEN_H = 835;

export const SCREEN_IMAGES = {
  wallpaper: "/background.jpg",
  YouTube: "/youtube.png",
  Instagram: "/instagram.jpg",
  TikTok: "/tiktok.png",
  TikTokSplash: "/preloadicontiktok.png", // logo on the TikTok app's launch/splash screen
};
const APPS = ["YouTube", "Instagram", "TikTok"];

const ICON = 66; // app icon size
const ICON_ZOOM = 1.02; // 1 = whole image fits the squircle; a touch more crops the images' own corners
const COLUMN_X = [25, 116.3, 207.7]; // icon left edges on the iOS 4-column grid (left-aligned)
const ICON_ROW_Y = 92;
const SQUIRCLE_N = 4; // superellipse exponent: lower = rounder (iOS icons ≈ 5)

// Where an app's icon sits on the home screen (used by the app-launch animation)
export function appIconRect(name) {
  return { x: COLUMN_X[APPS.indexOf(name)], y: ICON_ROW_Y, size: ICON };
}

// Smooth continuous-corner square: |x|^n + |y|^n = 1, scaled to the icon
export function squirclePath(ctx, x, y, size) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;
  ctx.beginPath();
  for (let i = 0; i <= 96; i++) {
    const t = (i / 96) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const px = cx + r * Math.sign(c) * Math.abs(c) ** (2 / SQUIRCLE_N);
    const py = cy + r * Math.sign(s) * Math.abs(s) ** (2 / SQUIRCLE_N);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// Draws an image scaled to cover a box, centred, with extra zoom
// (works for images, canvases and videos — videos report their size as videoWidth/videoHeight)
export function drawCover(ctx, img, x, y, w, h, zoom = 1) {
  const iw = img.videoWidth || img.width;
  const ih = img.videoHeight || img.height;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export function drawStatusBar(ctx, font) {
  ctx.fillStyle = "#fff";
  ctx.font = `600 17px ${font}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("9:41", 40, 40);

  // Signal bars
  [4, 6.5, 9, 11.5].forEach((h, i) => {
    ctx.beginPath();
    ctx.roundRect(290 + i * 5, 36 - h, 3.5, h, 1);
    ctx.fill();
  });
  ctx.font = `600 13px ${font}`;
  ctx.fillText("5G", 313, 36);

  // Battery
  ctx.strokeStyle = "rgb(255 255 255 / 0.55)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(334, 25.5, 25, 12, 3.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(336, 27.5, 18, 8, 2);
  ctx.fill();
  ctx.fillStyle = "rgb(255 255 255 / 0.55)";
  ctx.beginPath();
  ctx.roundRect(360, 29.5, 1.8, 4, 1);
  ctx.fill();
}

function drawApp(ctx, img, x, y) {
  // Soft drop shadow, drawn from the squircle itself
  ctx.save();
  ctx.shadowColor = "rgb(0 0 0 / 0.2)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  squirclePath(ctx, x, y, ICON);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.restore();

  // Icon image clipped to the squircle
  ctx.save();
  squirclePath(ctx, x, y, ICON);
  ctx.clip();
  drawCover(ctx, img, x, y, ICON, ICON, ICON_ZOOM);
  ctx.restore();
}

// `images` = SCREEN_IMAGES keys → loaded HTMLImageElements
export function drawHomeScreen(ctx, images, font) {
  const W = SCREEN_W;
  const H = SCREEN_H;

  drawCover(ctx, images.wallpaper, 0, 0, W, H);
  drawStatusBar(ctx, font);

  APPS.forEach((name, i) => drawApp(ctx, images[name], COLUMN_X[i], ICON_ROW_Y));

  drawSearchPill(ctx, W / 2, H - 45, font);
}

// Heroicons magnifying glass (24×24, stroked)
export const SEARCH_ICON = "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z";

function drawSearchPill(ctx, cx, cy, font) {
  const ICON_SIZE = 14;
  const GAP = 5;
  const PAD = 14;
  const HEIGHT = 32;

  ctx.font = `600 14px ${font}`;
  const textW = ctx.measureText("Search").width;
  const width = PAD * 2 + ICON_SIZE + GAP + textW;
  const left = cx - width / 2;

  ctx.fillStyle = "rgb(255 255 255 / 0.28)";
  ctx.beginPath();
  ctx.roundRect(left, cy - HEIGHT / 2, width, HEIGHT, HEIGHT / 2);
  ctx.fill();

  // Icon
  ctx.save();
  ctx.translate(left + PAD, cy - ICON_SIZE / 2);
  ctx.scale(ICON_SIZE / 24, ICON_SIZE / 24);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.25; // in 24-unit icon space (~1.3px at this size)
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D(SEARCH_ICON));
  ctx.restore();

  // Label
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Search", left + PAD + ICON_SIZE + GAP, cy + 0.5);
}
