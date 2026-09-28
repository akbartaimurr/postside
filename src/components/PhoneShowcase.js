"use client";

import { Bounds, Environment, Float, Lightformer, PresentationControls, useBounds, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { drawHomeScreen, SCREEN_H, SCREEN_IMAGES, SCREEN_W } from "@/components/drawPhoneScreen";
import { createTikTokScreen } from "@/components/tiktokScreen";
import WebGLBoundary from "@/components/WebGLBoundary";

const MODEL_URL = "/models/iphone.glb";
const SCREEN_MATERIAL = "screen.001";
const TEXTURE_SCALE = 2; // static home screen: canvas px per device px (780×1670), crisp at hero size
// Live (animated) screen is redrawn + re-uploaded to the GPU every frame, so it's kept lighter
const LIVE_SCALE = 1.25; // 488×1044
const LIVE_FRAME = 1 / 30;

// Finds the screen mesh, works out which way the front faces, rebuilds its UVs (the model's own
// are skewed) so a canvas maps edge-to-edge, and gives it a live canvas texture. Idempotent, so
// Strict Mode / HMR re-runs are safe.
function setUpPhone(scene) {
  scene.updateMatrixWorld(true);
  const toScene = scene.matrixWorld.clone().invert();

  let screenMesh;
  scene.traverse((obj) => {
    if (!obj.isMesh) return;
    // userData flag: the material is swapped below, so re-runs can't match by name
    if (obj.userData.isScreen || obj.material.name === SCREEN_MATERIAL) {
      obj.userData.isScreen = true;
      screenMesh = obj;
    }
    if (obj.material.name === "apple_logo.001") obj.visible = false;
    if (obj.material.name === "glass.002" && obj.material.transmission) {
      // Transmission blurs what's behind it (our screen); use a clear glossy film instead
      Object.assign(obj.material, { transmission: 0, transparent: true, opacity: 0.12, roughness: 0.05, depthWrite: false });
    }
  });

  const phoneCenter = new THREE.Box3().setFromObject(scene).applyMatrix4(toScene).getCenter(new THREE.Vector3());
  const screenBox = new THREE.Box3().setFromObject(screenMesh).applyMatrix4(toScene);
  const size = screenBox.getSize(new THREE.Vector3());
  const center = screenBox.getCenter(new THREE.Vector3());

  // Front normal = the screen's thinnest axis, pointing away from the phone's middle
  const thin = ["x", "y", "z"].reduce((a, b) => (size[a] < size[b] ? a : b));
  const normal = new THREE.Vector3();
  normal[thin] = Math.sign(center[thin] - phoneCenter[thin]) || 1;
  const up = new THREE.Vector3(0, 1, 0); // phone stands along +Y
  const right = new THREE.Vector3().crossVectors(up, normal); // viewer's right, looking at the screen

  if (!screenMesh.userData.screenTexture) {
    // Planar UVs: u across the screen (left → right), v up it (bottom → top)
    const geometry = screenMesh.geometry.clone();
    const meshToScene = toScene.clone().multiply(screenMesh.matrixWorld);
    const pos = geometry.attributes.position;
    const p = new THREE.Vector3();
    const r = [];
    const u = [];
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).applyMatrix4(meshToScene);
      r.push(p.dot(right));
      u.push(p.dot(up));
    }
    const [rMin, rMax, uMin, uMax] = [Math.min(...r), Math.max(...r), Math.min(...u), Math.max(...u)];
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = (r[i] - rMin) / (rMax - rMin);
      uv[i * 2 + 1] = (u[i] - uMin) / (uMax - uMin);
    }
    geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    screenMesh.geometry = geometry;

    const makeTexture = (scale) => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(SCREEN_W * scale);
      canvas.height = Math.round(SCREEN_H * scale);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      return texture;
    };
    const texture = makeTexture(TEXTURE_SCALE);
    // Double-sided: the model's screen faces inward, so front-side-only would vanish
    screenMesh.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.DoubleSide });
    screenMesh.userData.screenTexture = texture;
    screenMesh.userData.liveTexture = makeTexture(LIVE_SCALE);
  }

  return {
    texture: screenMesh.userData.screenTexture,
    liveTexture: screenMesh.userData.liveTexture,
    material: screenMesh.material,
    faceCamera: -Math.atan2(normal.x, normal.z), // turn the model so the screen faces +Z
    offsetY: -phoneCenter.y,
  };
}

// Waits for the wallpaper, app icons and the page font, then draws the home screen into the
// texture. Resolves with the loaded images + font (reused by the TikTok screen), or null if cancelled.
async function paintHomeScreen(texture, isCancelled) {
  const entries = Object.entries(SCREEN_IMAGES).map(([key, src]) => {
    const img = new Image();
    img.src = src;
    return [key, img];
  });
  await Promise.all([...entries.map(([, img]) => img.decode()), document.fonts.ready]);
  if (isCancelled()) return null;

  const images = Object.fromEntries(entries);
  const font = getComputedStyle(document.body).fontFamily;
  const ctx = texture.image.getContext("2d");
  ctx.setTransform(TEXTURE_SCALE, 0, 0, TEXTURE_SCALE, 0, 0);
  drawHomeScreen(ctx, images, font);
  texture.needsUpdate = true;
  return { images, font };
}

// appRef.current (boolean) opens/closes the TikTok app on the phone's screen
function Phone({ appRef }) {
  const { scene } = useGLTF(MODEL_URL);
  const phone = useMemo(() => setUpPhone(scene), [scene]);

  // Once the model exists, frame the camera to it (the canvas size decides the scale)
  const bounds = useBounds();
  useEffect(() => {
    bounds.refresh().clip().fit();
  }, [bounds, phone]);

  // Mutable per-frame state (kept in a ref so the frame loop may update textures/material)
  const live = useRef({ app: null, sinceDraw: Infinity });

  // The home screen is static, so it's drawn once; the TikTok screen is set up alongside it
  useEffect(() => {
    let cancelled = false;
    paintHomeScreen(phone.texture, () => cancelled).then((assets) => {
      if (!assets) return;
      Object.assign(live.current, {
        app: createTikTokScreen({
          homeCanvas: phone.texture.image,
          tiktokIcon: assets.images.TikTok,
          splashLogo: assets.images.TikTokSplash,
          font: assets.font,
        }),
        material: phone.material,
        homeTexture: phone.texture,
        liveTexture: phone.liveTexture,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [phone]);

  // While the app is open (or animating), redraw the live screen at ~30fps and show it;
  // otherwise show the static home screen and do no per-frame work
  useFrame(({ clock }, delta) => {
    const s = live.current;
    if (!s.app) return;
    const now = clock.elapsedTime;
    if (!s.app.setOpen(Boolean(appRef?.current), now)) {
      if (s.material.map !== s.homeTexture) s.material.map = s.homeTexture;
      return;
    }
    s.sinceDraw += delta;
    // Every frame during fast motion (open/close, swipes); ~30fps while a clip just plays
    if (!s.app.isAnimating() && s.sinceDraw < LIVE_FRAME) return;
    s.sinceDraw = 0;
    const ctx = s.liveTexture.image.getContext("2d");
    ctx.setTransform(LIVE_SCALE, 0, 0, LIVE_SCALE, 0, 0);
    s.app.draw(ctx, now);
    s.liveTexture.needsUpdate = true;
    if (s.material.map !== s.liveTexture) s.material.map = s.liveTexture;
  });

  return (
    // Tilted back a little so the screen angles up towards the viewer
    <group rotation-x={-0.18}>
      <group position-y={phone.offsetY}>
        <group rotation-y={phone.faceCamera}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

// Keeps the phone turned towards the viewer's right, slowly swaying within that side
// (SWAY_CENTER ± SWAY_ANGLE, never past facing straight on). Positive Y rotation = facing right.
// Kept small enough that sway + drag + float can't turn the back towards the viewer.
const SWAY_CENTER = 0.35; // radians, ~20° to the right
const SWAY_ANGLE = 0.1; // radians either side of that, so it ranges ~14°–26° right
const SWAY_SPEED = 0.35; // radians of phase per second (~18s per full cycle)

function SlowSway({ children }) {
  const group = useRef();
  useFrame(({ clock }) => {
    group.current.rotation.y = SWAY_CENTER + Math.sin(clock.elapsedTime * SWAY_SPEED) * SWAY_ANGLE;
  });
  return <group ref={group}>{children}</group>;
}

// Hero pose → centred pose, driven by focusRef.current (0–1, set from scroll). Eased per frame
// so it glides rather than tracking scroll 1:1. "Straighten" partly undoes the right-facing
// sway and the backward tilt, without going fully straight on.
const FOCUS_SCALE = 0.35; // +35% size when centred (≈ the most the canvas headroom allows without clipping)
const FOCUS_STRAIGHTEN_Y = -0.12; // sway rests at +0.35 rad → ~0.23 rad (still facing right) when centred
const FOCUS_STRAIGHTEN_X = 0.1; // tilt -0.18 rad → -0.08 rad when centred

function FocusRig({ focusRef, children }) {
  const group = useRef();
  const eased = useRef(0);
  useFrame((_, delta) => {
    const target = focusRef?.current ?? 0;
    eased.current += (target - eased.current) * Math.min(1, delta * 4);
    const f = eased.current;
    group.current.scale.setScalar(1 + FOCUS_SCALE * f);
    group.current.rotation.set(FOCUS_STRAIGHTEN_X * f, FOCUS_STRAIGHTEN_Y * f, 0);
  });
  return <group ref={group}>{children}</group>;
}

// 3D iPhone with a JS-drawn home screen. Floats and sways gently; drag to turn it (limited so
// the back never shows) and it springs back on release. Fills its parent's size. Pass focusRef
// (ref holding 0–1) to grow and partly straighten it.
export default function PhoneShowcase({ className = "", focusRef, appRef }) {
  return (
    <div className={className}>
      <WebGLBoundary fallback={<FlatPhone />}>
      {/* resize.scroll off: otherwise every scroll re-measures the canvas and <Bounds observe>
          refits the camera mid-scroll, which shows up as jitter */}
      <Canvas resize={{ scroll: false }} camera={{ position: [0, 0, 4], fov: 30 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        {/* Key light from the upper left, cool rim from behind right, low fill */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[-3, 4, 5]} intensity={2.2} color="#fff7ed" />
        <directionalLight position={[4, 2, -3]} intensity={1.6} color="#bae6fd" />

        {/* Studio softboxes for reflections on the titanium frame (generated, no HDR download) */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={4} position={[-2, 4, 4]} scale={[5, 2.5, 1]} />
          <Lightformer form="rect" intensity={1.5} position={[0, -3, 3]} scale={[6, 1, 1]} />
          <Lightformer form="rect" intensity={2.5} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[1, 6, 1]} />
          <Lightformer form="rect" intensity={3} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[1, 6, 1]} color="#bae6fd" />
        </Environment>

        {/* Auto-frames the camera to the phone, refitting on resize. Margin 1.43 = the old 1.1 ×
            1.3, because the canvas now has ~30% extra height (headroom for the focus zoom), so
            the resting phone comes out the same size as before */}
        <Bounds fit clip observe margin={1.43} maxDuration={0}>
          <PresentationControls global cursor snap polar={[-0.15, 0.15]} azimuth={[-0.6, 0.6]} damping={0.2}>
            <FocusRig focusRef={focusRef}>
              {/* Floaty idle motion: gentle bob + wobble, plus a slow turn on the right side */}
              <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6} floatingRange={[-0.04, 0.04]}>
                <SlowSway>
                  <Suspense fallback={null}>
                    <Phone appRef={appRef} />
                  </Suspense>
                </SlowSway>
              </Float>
            </FocusRig>
          </PresentationControls>
        </Bounds>
      </Canvas>
      </WebGLBoundary>
    </div>
  );
}

// Shown when WebGL isn't available (disabled, blocked, GPU crashed): a flat phone showing the
// same drawn home screen as the 3D one, so the page still looks intentional instead of erroring
function FlatPhone() {
  const canvas = useRef(null);
  useEffect(() => {
    let cancelled = false;
    // paintHomeScreen only needs { image: canvas } plus a needsUpdate flag to set
    paintHomeScreen({ image: canvas.current }, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <canvas
        ref={canvas}
        width={SCREEN_W * TEXTURE_SCALE}
        height={SCREEN_H * TEXTURE_SCALE}
        className="aspect-[390/835] h-[68%] w-auto rounded-[2.75rem] border-[0.55rem] border-[#111] bg-[#111] shadow-[0_1.5rem_3rem_rgb(15_23_42_/_0.25)]"
      />
    </div>
  );
}

// Start fetching the model as soon as this module loads in the browser (not during SSR)
if (typeof window !== "undefined") useGLTF.preload(MODEL_URL);
