/**
 * Shared brand tokens + UI primitives for /ai-readiness pages.
 *
 * Extracted from the v5 demo. Same colours, same fonts, same components.
 * Used by AssessmentClient, the result page, and the WebGL hero fallback.
 *
 * NOTE: This file uses inline `style={}` objects rather than CSS classes,
 * matching the v5 demo. If the main site migrates to Tailwind, these can be
 * mechanically translated later -- the design is the source of truth, not
 * the implementation style.
 */

'use client';

import React from 'react';

// ── Brand colours ────────────────────────────────────────────────────────────
export const C = {
  ink: '#0F1526',
  inkDeep: '#0A0F1C',
  inkTint: '#1C2340',
  cream: '#F5F0E8',
  creamDeeper: '#EBE3D2',
  gold: '#C9A84C',
  slate: '#2B2E3B',
  slateMute: '#5A5E70',
  forest: '#3D7A5F',
  border: '#D9D0BD',
} as const;

// ── Typography presets ───────────────────────────────────────────────────────
export const F = {
  display: {
    fontFamily: 'var(--font-cormorant-garamond), "Cormorant Garamond", "Cormorant", Georgia, serif',
    fontWeight: 300,
  },
  section: {
    fontFamily: 'var(--font-cormorant-garamond), "Cormorant Garamond", "Cormorant", Georgia, serif',
    fontWeight: 400,
  },
  ui: {
    fontFamily: 'var(--font-syne), Syne, "Helvetica Neue", Arial, sans-serif',
    fontWeight: 400,
  },
  label: {
    fontFamily: 'var(--font-dm-mono), "DM Mono", "JetBrains Mono", ui-monospace, monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
  },
  cta: {
    fontFamily: 'var(--font-syne), Syne, sans-serif',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
  },
} as const;

// ── Inline icon component ────────────────────────────────────────────────────
type IconProps = {
  path: React.ReactNode;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

const Icon = ({
  path,
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.75,
  style = {},
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {path}
  </svg>
);

type IconComponentProps = Omit<IconProps, 'path'>;

export const Icons = {
  ChevronLeft: (props: IconComponentProps) => (
    <Icon {...props} path={<polyline points="15 18 9 12 15 6" />} />
  ),
  ChevronRight: (props: IconComponentProps) => (
    <Icon {...props} path={<polyline points="9 18 15 12 9 6" />} />
  ),
  ArrowRight: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={
        <>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </>
      }
    />
  ),
  Check: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="9 12 11.5 14.5 16 9.5" />
        </>
      }
    />
  ),
  Target: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={
        <>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </>
      }
    />
  ),
  Shield: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={<path d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4z" />}
    />
  ),
  Sparkles: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={
        <>
          <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
          <path d="M19 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
        </>
      }
    />
  ),
  Cpu: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={
        <>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </>
      }
    />
  ),
  Lock: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </>
      }
    />
  ),
  Mail: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={
        <>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <polyline points="22,6 12,13 2,6" />
        </>
      }
    />
  ),
  Calendar: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      }
    />
  ),
  Copy: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={
        <>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </>
      }
    />
  ),
  Linkedin: (props: IconComponentProps) => (
    <Icon
      {...props}
      path={
        <>
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </>
      }
    />
  ),
};

// ── Pillar icon mapping ──────────────────────────────────────────────────────
// Maps lib/readiness PillarKey to its display icon component.
import type { PillarKey } from '@/lib/readiness/types';

export const PILLAR_ICONS: Record<PillarKey, (props: IconComponentProps) => React.JSX.Element> = {
  strategy: Icons.Target,
  data: Icons.Shield,
  culture: Icons.Sparkles,
  technology: Icons.Cpu,
  governance: Icons.Lock,
};

// ── Shared button styles ─────────────────────────────────────────────────────
export const goldButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '14px 28px',
  fontSize: '12px',
  cursor: 'pointer',
  border: 'none',
  background: C.gold,
  color: C.ink,
  ...F.cta,
  transition: 'opacity 0.2s',
};

export const inkButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '11px 24px',
  fontSize: '11px',
  cursor: 'pointer',
  border: 'none',
  background: C.ink,
  color: C.cream,
  ...F.cta,
  transition: 'opacity 0.2s',
};

// ── Ghost button ─────────────────────────────────────────────────────────────
export function GhostButton({
  children,
  onClick,
  disabled,
  dark = false,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  dark?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 20px',
        fontSize: '11px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        background: 'transparent',
        color: dark ? C.cream : C.slate,
        border: `1px solid ${dark ? 'rgba(245,240,232,0.25)' : C.border}`,
        ...F.cta,
      }}
    >
      {children}
    </button>
  );
}

// ── Label ────────────────────────────────────────────────────────────────────
export function Label({
  children,
  color = C.gold,
  size = '10px',
}: {
  children: React.ReactNode;
  color?: string;
  size?: string;
}) {
  return (
    <span style={{ ...F.label, fontSize: size, color }}>{children}</span>
  );
}

// ── Site nav (lightweight, just for the assessment pages) ────────────────────
// In production this likely lives in a shared layout component on the main
// site. Reproducing here so the page works in isolation until then.
export function SiteNav({ onDark = true }: { onDark?: boolean }) {
  const navItems = ['What we build', 'Work', 'Process', 'Pricing', 'Insights'];
  return (
    <nav
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: C.gold,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: C.ink, fontSize: '12px', fontWeight: 700 }}>
            ◐
          </span>
        </div>
        <span style={{ ...F.cta, color: onDark ? C.cream : C.ink, fontSize: '13px' }}>
          Creative Milk
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '36px', flexWrap: 'wrap' }}>
        {navItems.map((item) => (
          <span
            key={item}
            style={{
              ...F.cta,
              color: onDark ? 'rgba(245,240,232,0.6)' : C.slate,
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            {item}
          </span>
        ))}
      </div>
      <button
        style={{
          padding: '10px 20px',
          fontSize: '11px',
          cursor: 'pointer',
          border: 'none',
          background: C.gold,
          color: C.ink,
          ...F.cta,
        }}
      >
        AI Readiness Test
      </button>
    </nav>
  );
}

// ── Font import block ────────────────────────────────────────────────────────
// Fonts are self-hosted globally via next/font in app/layout.tsx; this
// component is kept only so existing call sites don't break.
export function AiReadinessFontLink() {
  return null;
}
