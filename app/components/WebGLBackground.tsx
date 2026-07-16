"use client";

import { useEffect, useRef } from "react";

/**
 * Creative Milk hero background.
 * Vanilla WebGL2 fragment shader -- no three.js dependency.
 *
 * Effect: domain-warped fbm noise creating slow-flowing liquid striations
 * in midnight ink, with sparse liquid-gold filaments and a soft vignette.
 * Mouse parallax warps the field gently.
 *
 * Falls back to a static gradient div if WebGL2 is unavailable or the user
 * prefers reduced motion. Pauses rendering when not visible (IntersectionObserver).
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
uniform vec2  u_mouse;       // -1..1
uniform float u_scroll;      // 0..1

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

  // Mouse parallax (very subtle)
  vec2 mouse = u_mouse * 0.06;

  // Domain-warped fbm -- milk-like flowing curves
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

  // Base midnight gradient -- deeper at bottom, slightly tinted top-right
  vec3 base = mix(INK_DEEP, INK_TINT, smoothstep(0.0, 1.0, uv.y));
  base = mix(base, INK, 0.4);

  // Cool desaturated mid layer driven by warp field
  vec3 col = mix(INK_DEEP, base, f);

  // Gold filaments -- narrow band of high warp intensity
  float fil = smoothstep(0.55, 0.78, f) * (1.0 - smoothstep(0.78, 0.92, f));
  fil *= 0.9;
  col += GOLD * fil * 0.55;

  // Sparse gold highlights -- peaks of secondary warp
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

  // Vignette
  vec2 vuv = uv - 0.5;
  float vig = 1.0 - dot(vuv, vuv) * 1.4;
  col *= clamp(vig, 0.65, 1.0);

  // Scroll fade -- content takes over as user scrolls
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      // Show fallback gradient, skip WebGL entirely
      if (fallbackRef.current) fallbackRef.current.style.opacity = "1";
      return;
    }

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

    // Fullscreen triangle (covers viewport with one tri -- faster than quad)
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

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime       = gl.getUniformLocation(program, "u_time");
    const uMouse      = gl.getUniformLocation(program, "u_mouse");
    const uScroll     = gl.getUniformLocation(program, "u_scroll");

    gl.useProgram(program);

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
      }
    };
    resize();

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // ── Mouse tracking (smoothed) ──────────────────────────────
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.ty = -((e.clientY - rect.top) / rect.height) * 2 + 1;
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

    // ── Visibility -- pause when off-screen / tab hidden ────────
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

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      if (!visible) return;

      // Smooth mouse
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3.5);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3.5);

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
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, []);

  return (
    <>
      <div ref={fallbackRef} className="webgl-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="webgl-canvas"
        aria-hidden="true"
        role="presentation"
      />
    </>
  );
}
