"use client";

import { useEffect, useRef } from "react";

/**
 * Members dashboard ambience — flowing air-current light in forest greens.
 * Vanilla WebGL2 fragment shader on a transparent canvas layered over the
 * CSS aurora blobs (which double as the fallback), same architecture as
 * WebGLBackground.tsx: no three.js, capped DPR, pauses when off-screen or
 * the tab is hidden, and skips WebGL entirely under prefers-reduced-motion
 * or when WebGL2 is unavailable.
 */

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

// Home-hero palette: liquid gold, cream, midnight
const vec3 CREAM     = vec3(0.957, 0.914, 0.784);   // #F4E9C8 gold-pale
const vec3 GOLD      = vec3(0.788, 0.659, 0.298);   // #C9A84C liquid-gold
const vec3 INK_TINT  = vec3(0.110, 0.137, 0.251);   // #1C2340 midnight-tint
const vec3 GOLD_LITE = vec3(0.910, 0.788, 0.416);   // #E8C96A

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
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  vec2 p  = uv;
  p.x *= u_resolution.x / u_resolution.y;

  // The canvas spans the whole (very tall) section, so normalise to a
  // fixed ~1400px feature scale instead of canvas height — otherwise one
  // noise band blankets the entire viewport as a flat wash.
  float px_scale = u_resolution.y / 1400.0;
  p *= px_scale;

  float t = u_time * 0.05;

  // Air current: the whole field slides gently sideways while the warp
  // churns, so the filaments read as streamlines rather than boiling noise.
  vec2 wind = vec2(-t * 1.15, -t * 0.12);
  vec2 fp = p * vec2(0.9, 1.3) + wind;

  vec2 q = vec2(
    fbm(fp + vec2(0.0, t)),
    fbm(fp + vec2(5.2, t * 0.7))
  );
  vec2 r = vec2(
    fbm(fp * 1.2 + 2.0 * q + vec2(1.7, 9.2)),
    fbm(fp * 1.2 + 2.0 * q + vec2(8.3, 2.8))
  );
  float f = fbm(fp + 1.8 * r);
  f = f * 0.5 + 0.5;

  // Premultiplied accumulation: every layer adds colour·weight to rgb and
  // the same weight to alpha, so the composite is a pure tint of brand
  // greens over the page — overlaps can never turn muddy or dark.
  vec3 acc = vec3(0.0);
  float a = 0.0;

  // Two narrow ribbons of light pulled from different heights of the warp
  // field — sparse streamlines, not an all-over wash.
  float ribbonA = smoothstep(0.52, 0.60, f) * (1.0 - smoothstep(0.60, 0.68, f));
  float ribbonB = smoothstep(0.70, 0.77, f) * (1.0 - smoothstep(0.77, 0.85, f));
  acc += GOLD * (ribbonA * 0.11);
  a += ribbonA * 0.11;
  acc += GOLD_LITE * (ribbonB * 0.10);
  a += ribbonB * 0.10;

  // A whisper of midnight where the warp is strongest, for body.
  float body = smoothstep(0.6, 1.0, length(r) * 0.6) * 0.025;
  acc += INK_TINT * body;
  a += body;

  // Drifting lights: three soft orbs riding the wind on sine paths.
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float speed = 0.030 + fi * 0.011;
    float phase = fi * 2.4;
    vec2 lp = vec2(
      fract(u_time * speed + fi * 0.37) * 1.3 - 0.15,
      0.5 + 0.24 * sin(u_time * (0.10 + fi * 0.035) + phase)
    );
    lp.x *= u_resolution.x / u_resolution.y;
    lp *= px_scale; // same normalised space as p
    float d = length(p - lp);
    float orb  = exp(-d * d * 46.0) * 0.30;   // tight core
    float halo = exp(-d * d * 7.0) * 0.10;    // wide bloom
    acc += GOLD_LITE * orb + GOLD * halo;
    a += orb + halo;
  }

  // The brightest gold on the very peaks of the warp field.
  float shimmer = smoothstep(0.88, 0.98, f) * 0.05;
  acc += GOLD_LITE * shimmer;
  a += shimmer;

  // Fade at the section's top and bottom edges so the canvas never ends
  // on a hard line.
  float mask = smoothstep(0.0, 0.16, uv.y) * (1.0 - smoothstep(0.82, 1.0, uv.y));
  acc *= mask;
  a *= mask;

  // Cap total coverage, scaling rgb with it to keep the tint colour true.
  float capped = min(a, 0.35);
  acc *= capped / max(a, 1e-4);

  outColor = vec4(acc, capped);
}`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[DashboardFlow] shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function DashboardFlow() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reduced motion / no WebGL2: leave the canvas transparent — the CSS
    // aurora blobs underneath are the fallback.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[DashboardFlow] program link failed:", gl.getProgramInfoLog(program));
      return;
    }

    // Fullscreen triangle
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    gl.useProgram(program);

    const resize = () => {
      // Ambience layer sits behind heavy backdrop-blur, so a lower DPR cap
      // than the hero shader is invisible and cheaper on phones.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      const pw = Math.max(1, Math.floor(w * dpr));
      const ph = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
        gl.viewport(0, 0, pw, ph);
      }
    };
    resize();

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Pause when off-screen or the tab is hidden.
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);
    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    let raf = 0;
    const start = performance.now();
    let faded = false;

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      if (!faded) {
        // First real frame: fade the canvas in over the CSS blobs.
        canvas.style.opacity = "1";
        faded = true;
      }
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="dash-flow-canvas"
      aria-hidden="true"
      role="presentation"
    />
  );
}
