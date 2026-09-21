"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  getAnimationPreference,
  getServerAnimationPreference,
  subscribeToAnimationPreference,
} from "@/lib/animation-preference";
import { createRippleField, type RippleField } from "@/lib/milk/ripples";
import { createDropletSystem } from "@/lib/milk/droplets";

/**
 * Creative Milk hero background.
 * Vanilla WebGL2 fragment shader - no three.js dependency.
 *
 * Effect: domain-warped fbm noise creating slow-flowing liquid striations
 * in midnight ink, with sparse liquid-gold filaments and a soft vignette.
 * Mouse parallax warps the field gently.
 *
 * On desktop the surface also ripples: pointer movement and the droplets it
 * flings press into a wave height field (lib/milk/ripples.ts) whose slope
 * refracts the striations below and catches cream and gold on the crests.
 *
 * Falls back to a static gradient div if WebGL2 is unavailable or the user
 * prefers reduced motion. Pauses rendering when not visible (IntersectionObserver).
 * Without ripples every ripple term in the shader is multiplied by zero, so
 * touch devices render exactly the background they rendered before.
 */

/** Below this width there is no mouse to ripple with, and no room for it. */
const MIN_RIPPLE_WIDTH = 1024;

/**
 * Overall strength of the ripple contribution in the shader. Scales the
 * refraction, the crest highlight and the wave body together, so it is the
 * single dial for how loud the water is against the hero copy.
 */
const RIPPLE_AMOUNT = 0.2;

/**
 * Fixed wave integration rate, and the most catch-up allowed per frame.
 * Stepped at 120Hz (two steps on a 60Hz display) because the wave advances
 * one texel per step, and one step a frame leaves the rings crawling.
 */
const WAVE_STEP = 1 / 120;
const MAX_WAVE_DEBT = 4 / 120;

/** Ignore sub-pixel pointer jitter so a resting cursor leaves the water still. */
const MIN_MOVE = 0.0015;

/** Per-axis cap on a single frame's pointer delta, in UV. */
const MAX_DELTA = 0.05;

/**
 * Minimum travel between cursor drops, in UV. Pressing every frame carves a
 * continuous trench; spacing the drops out leaves distinct rings that expand
 * and interfere, which is what reads as water.
 */
const DROP_SPACING = 0.1;

/** How hard the cursor presses into the surface, and how wide. */
const DROP_STRENGTH_SCALE = 0.035;
const DROP_STRENGTH_MAX = 0.12;
const DROP_RADIUS = 0.0004;

/**
 * Pointer speed, in UV per second, that starts throwing droplets. Set high
 * so an ordinary sweep leaves only a wake, and spray is reserved for a
 * deliberate flick.
 */
const FLICK_THRESHOLD = 2.8;

/** The ring a landing droplet leaves. */
const IMPACT_STRENGTH = 0.11;
const IMPACT_RADIUS = 0.00006;

const VERT_SRC = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;       // -1..1
uniform float u_scroll;      // 0..1

// Ripple height field: red is the surface now, green is one step ago.
// u_rippleAmount is 0 whenever ripples are off, and every ripple term below
// is multiplied by it, so a disabled field renders the original background
// exactly rather than approximately.
uniform sampler2D u_ripple;
uniform float u_rippleAmount;

// Light the crests catch. Points up and to the left, matching the existing
// top-right gold glow reading as the brighter side of the field.
const vec3 RIPPLE_LIGHT = normalize(vec3(-0.45, 0.62, 0.64));

// Brand colours
const vec3 INK       = vec3(0.059, 0.082, 0.149);   // #0F1526
const vec3 INK_DEEP  = vec3(0.039, 0.059, 0.110);   // #0A0F1C
const vec3 INK_TINT  = vec3(0.110, 0.137, 0.251);   // #1C2340
const vec3 GOLD      = vec3(0.788, 0.659, 0.298);   // #C9A84C
const vec3 GOLD_LITE = vec3(0.910, 0.788, 0.416);   // #E8C96A
const vec3 CREAM     = vec3(0.961, 0.941, 0.910);   // #F5F0E8

// 2D simplex-ish gradient noise (Inigo Quilez style)
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)),
           dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(
    dot(a, hash2(i)),
    dot(b, hash2(i + o)),
    dot(c, hash2(i + 1.0))
  );
  return dot(n, vec3(70.0));
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  vec2 p  = uv;
  // correct for aspect so noise doesn't squash on widescreen
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.045;

  // ── Surface ─────────────────────────────────────────────────
  // Central differences on the height field give the surface slope, which is
  // all the water needs: it bends what is underneath and catches the light.
  vec2 rTexel = 1.0 / vec2(textureSize(u_ripple, 0));
  float hL = texture(u_ripple, uv - vec2(rTexel.x, 0.0)).r;
  float hR = texture(u_ripple, uv + vec2(rTexel.x, 0.0)).r;
  float hB = texture(u_ripple, uv - vec2(0.0, rTexel.y)).r;
  float hT = texture(u_ripple, uv + vec2(0.0, rTexel.y)).r;
  float height = texture(u_ripple, uv).r * u_rippleAmount;
  vec2 slope = vec2(hR - hL, hT - hB) * u_rippleAmount;

  // Refraction: the striations below shift where the surface tilts.
  p += slope * 5.0;

  // Mouse parallax (very subtle)
  vec2 mouse = u_mouse * 0.06;

  // Domain-warped fbm - milk-like flowing curves
  vec2 q = vec2(
    fbm(p * 1.4 + vec2(0.0, t) + mouse),
    fbm(p * 1.4 + vec2(5.2, t * 0.8) - mouse)
  );

  vec2 r = vec2(
    fbm(p * 2.0 + 4.0 * q + vec2(1.7, 9.2) + t * 0.6),
    fbm(p * 2.0 + 4.0 * q + vec2(8.3, 2.8) + t * 0.5)
  );

  float f = fbm(p * 2.0 + 4.0 * r);
  f = smoothstep(-0.6, 0.9, f);

  // Base midnight gradient - deeper at bottom, slightly tinted top-right
  vec3 base = mix(INK_DEEP, INK_TINT, smoothstep(0.0, 1.0, uv.y));
  base = mix(base, INK, 0.4);

  // Cool desaturated mid layer driven by warp field
  vec3 col = mix(INK_DEEP, base, f);

  // Gold filaments - narrow band of high warp intensity
  float fil = smoothstep(0.55, 0.78, f) * (1.0 - smoothstep(0.78, 0.92, f));
  fil *= 0.9;
  col += GOLD * fil * 0.55;

  // Sparse gold highlights - peaks of secondary warp
  float peaks = smoothstep(0.72, 0.95, length(r) * 0.5 + f * 0.5);
  col += GOLD_LITE * peaks * 0.25;

  // Cream micro-bloom on the brightest peaks (very rare)
  float bloom = smoothstep(0.92, 1.0, peaks);
  col += CREAM * bloom * 0.18;

  // Soft top-right glow region (matches existing radial accents)
  vec2 glowPos = uv - vec2(0.82, 0.18);
  glowPos.x *= u_resolution.x / u_resolution.y;
  float glow = exp(-dot(glowPos, glowPos) * 4.0);
  col += GOLD * glow * 0.10;

  // ── Ripple lighting ─────────────────────────────────────────
  // Crests catch cream and pale gold, troughs sink. Both terms are scaled by
  // u_rippleAmount so a flat or disabled field contributes nothing at all.
  // A broad, low-exponent highlight on purpose. A tight specular only lights
  // the sharpest crest, and a ring's slope falls away as it expands, so the
  // rings would vanish a few frames after they formed.
  vec3 surfaceNormal = normalize(vec3(-slope * 60.0, 1.0));
  float crest = pow(max(dot(surfaceNormal, RIPPLE_LIGHT), 0.0), 6.0);
  crest = max(crest - 0.12, 0.0) * 1.14;
  col += mix(GOLD_LITE, CREAM, smoothstep(0.1, 0.6, crest)) * crest * 0.35 * u_rippleAmount;

  // Body of the wave: a lift on the rise, a sink in the hollow.
  // Kept low and unsaturated: at higher gain the whole disturbed area washes
  // out to flat grey and the rings inside it stop reading.
  col += CREAM * clamp(height * 2.5, 0.0, 1.0) * 0.05;
  col *= 1.0 - clamp(-height * 2.5, 0.0, 1.0) * 0.09;

  // Vignette
  vec2 vuv = uv - 0.5;
  float vig = 1.0 - dot(vuv, vuv) * 1.4;
  col *= clamp(vig, 0.65, 1.0);

  // Scroll fade - content takes over as user scrolls
  float scrollFade = 1.0 - clamp(u_scroll * 1.2, 0.0, 0.7);
  col = mix(INK_DEEP, col, scrollFade);

  // Subtle film grain to fight banding
  float grain = (fract(sin(dot(uv * u_resolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
  col += grain;

  outColor = vec4(col, 1.0);
}`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[WebGLBackground] shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);

  // Shared with the nav toggle. Reduced motion is already folded into the
  // preference's default, so it does not need a separate check here.
  const animate = useSyncExternalStore(
    subscribeToAnimationPreference,
    getAnimationPreference,
    getServerAnimationPreference
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;


    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });

    if (!gl) {
      if (fallbackRef.current) fallbackRef.current.style.opacity = "1";
      return;
    }

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vert || !frag) {
      if (fallbackRef.current) fallbackRef.current.style.opacity = "1";
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[WebGLBackground] program link failed:", gl.getProgramInfoLog(program));
      if (fallbackRef.current) fallbackRef.current.style.opacity = "1";
      return;
    }

    // Fullscreen triangle (covers viewport with one tri - faster than quad)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution   = gl.getUniformLocation(program, "u_resolution");
    const uTime         = gl.getUniformLocation(program, "u_time");
    const uMouse        = gl.getUniformLocation(program, "u_mouse");
    const uScroll       = gl.getUniformLocation(program, "u_scroll");
    const uRipple       = gl.getUniformLocation(program, "u_ripple");
    const uRippleAmount = gl.getUniformLocation(program, "u_rippleAmount");

    gl.useProgram(program);

    // Bound whenever ripples are off, so the sampler always has a real
    // texture and the shader's ripple terms evaluate to zero.
    const flatSurface = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, flatSurface);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    );

    // Declared ahead of the resize handler below, which runs immediately and
    // reallocates the height field when one exists.
    let ripples: RippleField | null = null;

    // ── Resize handling (capped DPR) ───────────────────────────
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
      const h = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;
      const pw = Math.max(1, Math.floor(w * dpr));
      const ph = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
        gl.viewport(0, 0, pw, ph);
        ripples?.resize();
      }
    };
    resize();

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // ── Ripples (desktop only) ─────────────────────────────────
    // Created on the first qualifying pointer move rather than up front: a
    // touch device never fires one, so it never pays for the height field,
    // and a window dragged wider starts rippling without a reload.
    const desktop = window.matchMedia(
      `(min-width: ${MIN_RIPPLE_WIDTH}px) and (hover: hover) and (pointer: fine)`
    );
    const droplets = createDropletSystem({
      emitSpeed: FLICK_THRESHOLD,
      gravity: 0.45,
      drag: 1.9,
      lifetime: 0.55,
      maxDroplets: 18,
      maxPerEmit: 4,
      throwFactor: 0.2,
    });

    // ── Mouse tracking (smoothed) ──────────────────────────────
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    // Surface-space pointer: UV with y up, matching the ripple field.
    const pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false, seen: false };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.ty = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!desktop.matches) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;

      // Only disturb the surface while the cursor is over the hero.
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        pointer.seen = false;
        return;
      }

      // First sample after entering has no meaningful delta; seed and wait.
      if (!pointer.seen) {
        pointer.seen = true;
        pointer.x = x;
        pointer.y = y;
        return;
      }

      if (Math.hypot(x - pointer.x, y - pointer.y) < MIN_MOVE) return;

      pointer.dx = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, x - pointer.x));
      pointer.dy = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, y - pointer.y));
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;

      if (!ripples) ripples = createRippleField(gl, canvas);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // ── Scroll progress ────────────────────────────────────────
    let scroll = 0;
    const onScroll = () => {
      const max = window.innerHeight;
      scroll = Math.min(1, Math.max(0, window.scrollY / max));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Visibility - pause when off-screen / tab hidden ────────
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) visible = false;
      else visible = true;
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ── Render loop ────────────────────────────────────────────
    let raf = 0;
    let start = performance.now();
    let last = start;

    // The wave step is a fixed-rate integration, so it is accumulated rather
    // than run once per frame: a 144Hz display must not expand rings twice as
    // fast as a 60Hz one.
    let waveDebt = 0;
    let travelled = 0;
    let lastDropX = 0;
    let lastDropY = 0;

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      if (!visible) return;

      // Smooth mouse
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3.5);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3.5);

      if (ripples) {
        if (pointer.moved) {
          pointer.moved = false;
          const speed = Math.hypot(pointer.dx, pointer.dy) / Math.max(dt, 1e-4);
          travelled += Math.hypot(pointer.x - lastDropX, pointer.y - lastDropY);

          if (travelled >= DROP_SPACING) {
            travelled = 0;
            lastDropX = pointer.x;
            lastDropY = pointer.y;
            // Faster strokes press harder, up to a ceiling.
            const force = Math.min(DROP_STRENGTH_MAX, speed * DROP_STRENGTH_SCALE);
            ripples.drop(pointer.x, pointer.y, force, DROP_RADIUS);
          }

          droplets.emit(pointer.x, pointer.y, pointer.dx / dt, pointer.dy / dt);
        }

        droplets.step(dt, (d) => {
          // A droplet that finished its flight has hit the water.
          ripples?.drop(d.x, d.y, IMPACT_STRENGTH * d.size, IMPACT_RADIUS);
        });

        waveDebt = Math.min(waveDebt + dt, MAX_WAVE_DEBT);
        while (waveDebt >= WAVE_STEP) {
          waveDebt -= WAVE_STEP;
          ripples.step();
        }

        // The ripple passes rebind the program and the array buffer, so the
        // background's own draw state has to be restored before it draws.
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
      }

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, ripples ? ripples.texture : flatSurface);
      gl.uniform1i(uRipple, 1);
      gl.uniform1f(uRippleAmount, ripples ? RIPPLE_AMOUNT : 0);

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      droplets.clear();
      ripples?.dispose();
      gl.deleteTexture(flatSurface);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [animate]);

  return (
    <>
      <div ref={fallbackRef} className="webgl-fallback" aria-hidden="true" />
      {/*
        Unmounted rather than paused when animation is off: a canvas holds
        its last drawn frame and sits above the fallback, so merely stopping
        the loop would leave a frozen render covering the static gradient.
        Unmounting also runs the effect's teardown, releasing the context.
      */}
      {animate && (
        <canvas
          ref={canvasRef}
          className="webgl-canvas"
          aria-hidden="true"
          role="presentation"
        />
      )}
    </>
  );
}
