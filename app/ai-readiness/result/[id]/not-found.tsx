/**
 * not-found for /ai-readiness/result/[id]
 * Renders when the result page calls notFound() (deleted or unknown id).
 */

import Link from 'next/link';
import { C, F, Label, SiteNav, goldButtonStyle, AiReadinessFontLink } from '../../_components/ui';
import { HeroBackground } from '../../_components/HeroBackground';

export default function ResultNotFound() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: C.ink,
        color: C.cream,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AiReadinessFontLink />
      <HeroBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <SiteNav />
      </div>
      <div
        style={{
          flex: 1,
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '520px' }}>
          <div style={{ marginBottom: '24px' }}>
            <Label>— Result not found</Label>
          </div>
          <h1
            style={{
              ...F.section,
              fontSize: 'clamp(40px, 6vw, 64px)',
              lineHeight: 1.1,
              color: C.cream,
              margin: '0 0 24px',
            }}
          >
            We couldn&rsquo;t find that result.
          </h1>
          <p
            style={{
              ...F.ui,
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'rgba(245,240,232,0.75)',
              margin: '0 0 40px',
            }}
          >
            The link may be wrong, or the result may have been removed. You can take the assessment from scratch — it only takes five minutes.
          </p>
          <Link href="/ai-readiness" style={{ textDecoration: 'none' }}>
            <span style={goldButtonStyle}>Start a new assessment</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
