/**
 * Hero background wrapper.
 *
 * In production: imports the WebGLBackground component from the main site's
 * shared components directory. The path below assumes the file lives at
 * `@/components/WebGLBackground` — adjust if your repo organises it
 * differently.
 *
 * Falls back to the SVG approximation from the v5 demo if WebGL is
 * unavailable. The WebGLBackground component itself ALSO has its own
 * internal fallback for prefers-reduced-motion and WebGL2 unavailability;
 * this is the outermost safety net.
 */

'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { C } from './ui';

// Dynamically import to avoid SSR — WebGL needs the browser.
//
// IMPORTANT: This path assumes `WebGLBackground.tsx` already lives at
// `components/WebGLBackground.tsx` in the main site repo (as confirmed at the
// start of Phase 2). If your repo organises shared components elsewhere
// (e.g. `src/components/` or `app/_components/`), update the path below.
//
// The @ts-expect-error below silences the typecheck error in this standalone
// build context where the file isn't present. Remove the directive when
// dropping this code into the main site repo where the component actually
// exists.
//
const WebGLBackground = dynamic(() => import('@/app/components/WebGLBackground'), {
  ssr: false,
  loading: () => <SvgFallback />,
});

export function HeroBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Suspense fallback={<SvgFallback />}>
        <WebGLBackground />
      </Suspense>
    </div>
  );
}

/**
 * Static SVG approximation. Used while the WebGL component loads or if it
 * fails to mount. Matches the v5 demo's HeroBackground exactly.
 */
function SvgFallback() {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <defs>
        <radialGradient id="cmGoldGlow" cx="82%" cy="18%" r="40%">
          <stop offset="0%" stopColor={C.gold} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C.ink} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cmInkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={C.inkTint} />
          <stop offset="100%" stopColor={C.inkDeep} />
        </linearGradient>
        <filter id="cmGoo">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#cmInkGrad)" />
      <g opacity="0.4" filter="url(#cmGoo)">
        <path
          d="M0,400 Q300,300 600,420 T1200,380 L1200,440 Q900,500 600,460 T0,460 Z"
          fill={C.gold}
          opacity="0.12"
        />
        <path
          d="M0,200 Q400,150 800,220 T1200,200"
          stroke={C.gold}
          strokeWidth="1.5"
          fill="none"
          opacity="0.25"
        />
        <path
          d="M200,600 Q500,550 900,640"
          stroke={C.gold}
          strokeWidth="1"
          fill="none"
          opacity="0.18"
        />
      </g>
      <rect width="100%" height="100%" fill="url(#cmGoldGlow)" />
      <rect
        width="100%"
        height="100%"
        fill="radial-gradient(ellipse at center, transparent 0%, rgba(10,15,28,0.55) 100%)"
      />
    </svg>
  );
}
