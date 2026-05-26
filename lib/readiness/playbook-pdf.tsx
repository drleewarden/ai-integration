/**
 * Creative Milk — AI Readiness Playbook PDF Template
 *
 * React-PDF component. Takes a PlaybookComposition and renders the full
 * 11-page playbook PDF by looking up each content key in the library.
 *
 * Brand system (from brand mini-doc v1.0):
 *   Midnight Ink  #0F1526  — primary dark, hero backgrounds
 *   Warm Cream    #F5F0E8  — background base, light sections
 *   Liquid Gold   #C9A84C  — primary accent, CTAs, highlights
 *   Deep Slate    #2B2E3B  — body text on light
 *   Forest Signal #3D7A5F  — success/positive only
 *
 *   Display:  Cormorant Garamond Light/Regular
 *   Body/UI:  Syne Regular/SemiBold/Bold
 *   Labels:   DM Mono Regular
 *
 * Font files live in public/fonts/ as .ttf
 * Syne is a variable font — registered once, used across all weights.
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer';
import path from 'path';
import type { PlaybookComposition } from './composer-types';
import type { PillarKey } from './types';
import { PILLAR_KEYS } from './types';
import { PILLARS } from './pillars';
import { getContent, tryGetContent } from './content-library';

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

Font.register({
  family: 'CormorantGaramond',
  fonts: [
    { src: path.join(FONTS_DIR, 'CormorantGaramond-Light.ttf'), fontWeight: 300 },
    { src: path.join(FONTS_DIR, 'CormorantGaramond-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'CormorantGaramond-LightItalic.ttf'), fontWeight: 300, fontStyle: 'italic' },
    { src: path.join(FONTS_DIR, 'CormorantGaramond-Italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
  ],
});

Font.register({
  family: 'Syne',
  fonts: [
    { src: path.join(FONTS_DIR, 'Syne-Variable.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'Syne-Variable.ttf'), fontWeight: 600 },
    { src: path.join(FONTS_DIR, 'Syne-Variable.ttf'), fontWeight: 700 },
    { src: path.join(FONTS_DIR, 'Syne-Variable.ttf'), fontWeight: 800 },
  ],
});

Font.register({
  family: 'DMMono',
  fonts: [
    { src: path.join(FONTS_DIR, 'DMMono-Light.ttf'), fontWeight: 300 },
    { src: path.join(FONTS_DIR, 'DMMono-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'DMMono-Medium.ttf'), fontWeight: 500 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const C = {
  ink:         '#0F1526',
  cream:       '#F5F0E8',
  gold:        '#C9A84C',
  slate:       '#2B2E3B',
  forest:      '#3D7A5F',
  inkLight:    '#1a2035',
  creamMute:   '#D4CEBF',
  goldMute:    '#8a7033',
  border:      '#1e2840',
  borderLight: '#DDD8CE',
} as const;

const PAGE = {
  width:        595.28,
  height:       841.89,
  marginTop:    48,
  marginBottom: 48,
  marginLeft:   56,
  marginRight:  56,
} as const;

const CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight;

const S = StyleSheet.create({
  pageDark: {
    backgroundColor: C.ink,
    paddingTop: PAGE.marginTop,
    paddingBottom: PAGE.marginBottom,
    paddingLeft: PAGE.marginLeft,
    paddingRight: PAGE.marginRight,
    fontFamily: 'Syne',
  },
  pageLight: {
    backgroundColor: C.cream,
    paddingTop: PAGE.marginTop,
    paddingBottom: PAGE.marginBottom,
    paddingLeft: PAGE.marginLeft,
    paddingRight: PAGE.marginRight,
    fontFamily: 'Syne',
  },
  h1Dark: {
    fontFamily: 'CormorantGaramond',
    fontSize: 42,
    fontWeight: 300,
    color: C.cream,
    lineHeight: 1.1,
    marginBottom: 16,
  },
  h1Light: {
    fontFamily: 'CormorantGaramond',
    fontSize: 42,
    fontWeight: 300,
    color: C.slate,
    lineHeight: 1.1,
    marginBottom: 16,
  },
  labelDark: {
    fontFamily: 'DMMono',
    fontSize: 9,
    fontWeight: 400,
    color: C.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  labelLight: {
    fontFamily: 'DMMono',
    fontSize: 9,
    fontWeight: 400,
    color: C.goldMute,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bodyDark: {
    fontFamily: 'Syne',
    fontSize: 10,
    fontWeight: 400,
    color: C.creamMute,
    lineHeight: 1.75,
    marginBottom: 10,
  },
  bodyLight: {
    fontFamily: 'Syne',
    fontSize: 10,
    fontWeight: 400,
    color: C.slate,
    lineHeight: 1.75,
    marginBottom: 10,
  },
  subheadDark: {
    fontFamily: 'Syne',
    fontSize: 9,
    fontWeight: 600,
    color: C.cream,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 14,
  },
  subheadLight: {
    fontFamily: 'Syne',
    fontSize: 9,
    fontWeight: 600,
    color: C.slate,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 14,
  },
  row: { flexDirection: 'row' },
  dividerDark: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginVertical: 16,
  },
  dividerLight: {
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    marginVertical: 16,
  },
  calloutBox: {
    backgroundColor: C.inkLight,
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
    padding: 14,
    marginTop: 20,
  },
  calloutLabel: {
    fontFamily: 'DMMono',
    fontSize: 8,
    fontWeight: 400,
    color: C.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  calloutText: {
    fontFamily: 'Syne',
    fontSize: 10,
    fontWeight: 400,
    color: C.cream,
    lineHeight: 1.7,
  },
  scoreNumber: {
    fontFamily: 'CormorantGaramond',
    fontSize: 120,
    fontWeight: 300,
    color: C.gold,
    lineHeight: 1,
    letterSpacing: -3,
    textAlign: 'center',
  },
  scoreDenom: {
    fontFamily: 'DMMono',
    fontSize: 11,
    fontWeight: 400,
    color: C.creamMute,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: -8,
  },
  bandPill: {
    backgroundColor: C.inkLight,
    borderWidth: 1,
    borderColor: C.gold,
    paddingVertical: 5,
    paddingHorizontal: 14,
    alignSelf: 'center',
    marginTop: 12,
  },
  bandPillText: {
    fontFamily: 'DMMono',
    fontSize: 9,
    fontWeight: 400,
    color: C.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pillarLabel: {
    fontFamily: 'Syne',
    fontSize: 9,
    fontWeight: 600,
    color: C.slate,
    width: 90,
  },
  pillarBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: C.borderLight,
    borderRadius: 3,
    marginHorizontal: 8,
  },
  pillarScore: {
    fontFamily: 'DMMono',
    fontSize: 9,
    fontWeight: 400,
    color: C.slate,
    width: 36,
    textAlign: 'right',
  },
  focusNumber: {
    fontFamily: 'CormorantGaramond',
    fontSize: 48,
    fontWeight: 300,
    color: C.gold,
    lineHeight: 1,
    width: 52,
    marginRight: 12,
  },
  focusPillarLabel: {
    fontFamily: 'DMMono',
    fontSize: 8,
    fontWeight: 400,
    color: C.goldMute,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  weekBlockPrimary: {
    backgroundColor: C.inkLight,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
  },
  weekBlock: {
    backgroundColor: C.inkLight,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: C.border,
  },
  weekNumber: {
    fontFamily: 'DMMono',
    fontSize: 8,
    fontWeight: 400,
    color: C.gold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  weekText: {
    fontFamily: 'Syne',
    fontSize: 9.5,
    fontWeight: 400,
    color: C.creamMute,
    lineHeight: 1.65,
  },
  trapBlock: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  trapName: {
    fontFamily: 'Syne',
    fontSize: 11,
    fontWeight: 700,
    color: C.cream,
    marginBottom: 4,
  },
  trapText: {
    fontFamily: 'Syne',
    fontSize: 9.5,
    fontWeight: 400,
    color: C.creamMute,
    lineHeight: 1.65,
  },
  pathBlockActive: {
    marginBottom: 18,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: C.gold,
  },
  pathBlock: {
    marginBottom: 18,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: C.border,
  },
  pathTitle: {
    fontFamily: 'Syne',
    fontSize: 11,
    fontWeight: 700,
    color: C.cream,
    marginBottom: 4,
  },
  pathText: {
    fontFamily: 'Syne',
    fontSize: 9.5,
    fontWeight: 400,
    color: C.creamMute,
    lineHeight: 1.65,
  },
  ctaBox: {
    backgroundColor: C.inkLight,
    borderWidth: 1,
    borderColor: C.gold,
    padding: 20,
    marginTop: 16,
  },
  ctaText: {
    fontFamily: 'Syne',
    fontSize: 10,
    fontWeight: 400,
    color: C.cream,
    lineHeight: 1.75,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: PAGE.marginLeft,
    right: PAGE.marginRight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'DMMono',
    fontSize: 7.5,
    fontWeight: 400,
    color: C.creamMute,
    letterSpacing: 0.8,
  },
  footerTextLight: {
    fontFamily: 'DMMono',
    fontSize: 7.5,
    fontWeight: 400,
    color: C.goldMute,
    letterSpacing: 0.8,
  },
  citedText: {
    fontFamily: 'DMMono',
    fontSize: 7.5,
    fontWeight: 300,
    color: C.creamMute,
    lineHeight: 1.6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
});

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-\u2022]\s/gm, '\u2022 ')
    .trim();
}

function barColor(score: number): string {
  if (score >= 71) return C.gold;
  if (score >= 40) return C.slate;
  return C.creamMute;
}

function pillarLabel(key: PillarKey): string {
  return PILLARS[key]?.label ?? key;
}

function Footer({ pageNum, dark = true }: { pageNum: number; dark?: boolean }) {
  return (
    <View style={S.footer} fixed>
      <Text style={dark ? S.footerText : S.footerTextLight}>
        Creative Milk \u2014 AI Readiness Playbook
      </Text>
      <Text style={dark ? S.footerText : S.footerTextLight}>
        {pageNum} / 11
      </Text>
    </View>
  );
}

function CoverPage({ composition }: { composition: PlaybookComposition }) {
  const { cover } = composition;
  const date = new Date(cover.generatedAtIso).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return (
    <Page size="A4" style={S.pageDark}>
      <Text style={S.labelDark}>\u2014 AI Readiness Playbook</Text>
      <Text style={[S.h1Dark, { marginTop: 40, marginBottom: 0 }]}>Creative Milk</Text>
      <View style={{ marginTop: 48, alignItems: 'center' }}>
        <Text style={S.labelDark}>Your overall score</Text>
        <Text style={S.scoreNumber}>{cover.scoreNumber}</Text>
        <Text style={S.scoreDenom}>/ 100</Text>
        <View style={S.bandPill}>
          <Text style={S.bandPillText}>{cover.bandLabel}</Text>
        </View>
      </View>
      {(cover.readerName || cover.companyName) && (
        <View style={{ marginTop: 48, alignItems: 'center' }}>
          {cover.readerName && (
            <Text style={[S.bodyDark, { textAlign: 'center', marginBottom: 2 }]}>
              {cover.readerName}
            </Text>
          )}
          {cover.companyName && (
            <Text style={[S.labelDark, { textAlign: 'center' }]}>
              {cover.companyName}
            </Text>
          )}
        </View>
      )}
      <View style={{ position: 'absolute', bottom: 48, left: PAGE.marginLeft, right: PAGE.marginRight }}>
        <View style={S.dividerDark} />
        <View style={S.row}>
          <Text style={[S.footerText, { flex: 1 }]}>Generated {date}</Text>
          <Text style={S.footerText}>Prepared by Creative Milk</Text>
        </View>
      </View>
    </Page>
  );
}

function HonestReadPage({ composition }: { composition: PlaybookComposition }) {
  const { honestRead } = composition;
  return (
    <Page size="A4" style={S.pageDark}>
      <Text style={S.labelDark}>\u2014 The honest read</Text>
      <Text style={S.h1Dark}>Where you are right now.</Text>
      <View style={S.dividerDark} />
      <Text style={S.bodyDark}>{stripMarkdown(getContent(honestRead.honestReadKey))}</Text>
      <View style={S.calloutBox}>
        <Text style={S.calloutLabel}>If you only do one thing this week</Text>
        <Text style={S.calloutText}>{stripMarkdown(getContent(honestRead.tomorrowMorningKey))}</Text>
      </View>
      <Footer pageNum={2} dark />
    </Page>
  );
}

function PillarMapPage({ composition }: { composition: PlaybookComposition }) {
  const { pillarMap } = composition;
  return (
    <Page size="A4" style={S.pageLight}>
      <Text style={S.labelLight}>\u2014 Your pillar map</Text>
      <Text style={S.h1Light}>How you scored across the five pillars.</Text>
      <View style={S.dividerLight} />
      {PILLAR_KEYS.map((key) => {
        const { score } = pillarMap.diagnostics[key];
        const fillWidth = (score / 100) * (CONTENT_WIDTH - 90 - 44 - 16);
        return (
          <View key={key} style={S.pillarRow}>
            <Text style={S.pillarLabel}>{pillarLabel(key)}</Text>
            <View style={S.pillarBarTrack}>
              <View style={{ width: fillWidth, height: 6, backgroundColor: barColor(score), borderRadius: 3 }} />
            </View>
            <Text style={S.pillarScore}>{score}/100</Text>
          </View>
        );
      })}
      <View style={S.dividerLight} />
      {PILLAR_KEYS.map((key) => (
        <View key={key} style={{ marginBottom: 12 }}>
          <Text style={S.subheadLight}>{pillarLabel(key)}</Text>
          <Text style={S.bodyLight}>{stripMarkdown(getContent(pillarMap.diagnostics[key].contentKey))}</Text>
        </View>
      ))}
      <Footer pageNum={3} dark={false} />
    </Page>
  );
}

function FocusAreaPage({
  composition, focusIndex, pageNum,
}: {
  composition: PlaybookComposition; focusIndex: number; pageNum: number;
}) {
  const fa = composition.focusAreas[focusIndex];
  return (
    <Page size="A4" style={S.pageLight}>
      <View style={S.row}>
        <View style={{ flex: 1 }}>
          <Text style={S.labelLight}>\u2014 Focus area {String(focusIndex + 1).padStart(2, '0')}</Text>
          <Text style={S.h1Light}>{pillarLabel(fa.pillar)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <Text style={[S.focusPillarLabel, { textAlign: 'right' }]}>Score</Text>
          <Text style={[S.focusNumber, { width: 'auto', marginRight: 0 }]}>{fa.pillarScore}</Text>
        </View>
      </View>
      <View style={S.dividerLight} />
      <Text style={S.subheadLight}>What you're getting wrong</Text>
      <Text style={S.bodyLight}>{stripMarkdown(getContent(fa.whatWrongKey))}</Text>
      <Text style={S.subheadLight}>The minimum viable fix (2\u20134 weeks)</Text>
      <Text style={S.bodyLight}>{stripMarkdown(getContent(fa.minimumFixKey))}</Text>
      <Text style={S.subheadLight}>What good looks like at scale</Text>
      <Text style={S.bodyLight}>{stripMarkdown(getContent(fa.goodAtScaleKey))}</Text>
      <Text style={S.citedText}>{stripMarkdown(getContent(fa.citedClaimKey))}</Text>
      <Footer pageNum={pageNum} dark={false} />
    </Page>
  );
}

function StartingKitPage({ composition }: { composition: PlaybookComposition }) {
  const { startingKit } = composition;
  return (
    <Page size="A4" style={S.pageDark}>
      <Text style={S.labelDark}>\u2014 Your 30-day starting kit</Text>
      <Text style={S.h1Dark}>What to do on Monday.</Text>
      <View style={S.dividerDark} />
      {startingKit.weeks.map((week) => (
        <View key={week.weekNumber} style={week.isPrimary ? S.weekBlockPrimary : S.weekBlock}>
          <Text style={S.weekNumber}>Week {week.weekNumber} \u2014 {pillarLabel(week.pillar)}</Text>
          <Text style={S.weekText}>{stripMarkdown(tryGetContent(week.contentKey) ?? '')}</Text>
        </View>
      ))}
      <Footer pageNum={7} dark />
    </Page>
  );
}

function TrapsPage({ composition }: { composition: PlaybookComposition }) {
  const { traps } = composition;
  return (
    <Page size="A4" style={S.pageDark}>
      <Text style={S.labelDark}>\u2014 Common traps at your level</Text>
      <Text style={S.h1Dark}>The mistakes businesses like yours tend to make.</Text>
      <View style={S.dividerDark} />
      {traps.trapKeys.map((key, i) => {
        const stripped = stripMarkdown(tryGetContent(key) ?? '');
        const firstDot = stripped.indexOf('.');
        const trapName = firstDot > 0 ? stripped.slice(0, firstDot) : stripped;
        const trapBody = firstDot > 0 ? stripped.slice(firstDot + 1).trim() : '';
        return (
          <View key={i} style={S.trapBlock}>
            <Text style={S.trapName}>{trapName}</Text>
            {trapBody ? <Text style={S.trapText}>{trapBody}</Text> : null}
          </View>
        );
      })}
      <Footer pageNum={8} dark />
    </Page>
  );
}

function PathFramingPage({ composition }: { composition: PlaybookComposition }) {
  const { pathFraming } = composition;
  return (
    <Page size="A4" style={S.pageDark}>
      <Text style={S.labelDark}>\u2014 Where this usually goes next</Text>
      <Text style={S.h1Dark}>Three paths forward.</Text>
      <View style={S.dividerDark} />
      <View style={S.pathBlockActive}>
        <Text style={S.pathTitle}>Self-implement</Text>
        <Text style={S.pathText}>{stripMarkdown(getContent(pathFraming.selfImplementKey))}</Text>
      </View>
      <View style={S.pathBlock}>
        <Text style={S.pathTitle}>Hire internally</Text>
        <Text style={S.pathText}>{stripMarkdown(getContent(pathFraming.hireInternalKey))}</Text>
      </View>
      <View style={S.pathBlock}>
        <Text style={S.pathTitle}>Bring in a partner</Text>
        <Text style={S.pathText}>{stripMarkdown(getContent(pathFraming.bringPartnerKey))}</Text>
      </View>
      <Footer pageNum={9} dark />
    </Page>
  );
}

function AboutPage({ composition }: { composition: PlaybookComposition }) {
  const sections = stripMarkdown(getContent(composition.about.aboutKey)).split('\n\n').filter(Boolean);
  return (
    <Page size="A4" style={S.pageDark}>
      <Text style={S.labelDark}>\u2014 About</Text>
      <Text style={S.h1Dark}>Creative Milk.</Text>
      <View style={S.dividerDark} />
      {sections.map((section, i) => (
        <Text key={i} style={[S.bodyDark, { marginBottom: 14 }]}>{section}</Text>
      ))}
      <Footer pageNum={10} dark />
    </Page>
  );
}

function NextStepPage({ composition }: { composition: PlaybookComposition }) {
  const { nextStep } = composition;
  return (
    <Page size="A4" style={S.pageDark}>
      <Text style={S.labelDark}>\u2014 Next step</Text>
      <Text style={S.h1Dark}>Book a 30-minute call.</Text>
      <View style={S.dividerDark} />
      <View style={S.ctaBox}>
        <Text style={S.ctaText}>{stripMarkdown(getContent(nextStep.ctaKey))}</Text>
      </View>
      <View style={{ marginTop: 32 }}>
        <Text style={S.subheadDark}>Share this with your team</Text>
        <Text style={S.bodyDark}>
          Copy this link to share your result with colleagues who should see it:
        </Text>
        <Text style={[S.bodyDark, { color: C.gold }]}>{nextStep.shareMechanism.shareUrl}</Text>
        <View style={S.calloutBox}>
          <Text style={S.calloutLabel}>Pre-written share message</Text>
          <Text style={S.calloutText}>{nextStep.shareMechanism.shareText}</Text>
        </View>
      </View>
      <View style={{ position: 'absolute', bottom: 64, left: PAGE.marginLeft, right: PAGE.marginRight }}>
        <View style={S.dividerDark} />
        <Text style={S.footerText}>creative-milk.com.au</Text>
      </View>
      <Footer pageNum={11} dark />
    </Page>
  );
}

export function PlaybookDocument({ composition }: { composition: PlaybookComposition }) {
  return (
    <Document
      title="AI Readiness Playbook \u2014 Creative Milk"
      author="Creative Milk"
      subject={`AI Readiness Playbook \u2014 ${composition.cover.bandLabel} (${composition.cover.scoreNumber}/100)`}
      keywords="AI readiness, Creative Milk, strategy, data, culture, technology, governance"
    >
      <CoverPage composition={composition} />
      <HonestReadPage composition={composition} />
      <PillarMapPage composition={composition} />
      <FocusAreaPage composition={composition} focusIndex={0} pageNum={4} />
      <FocusAreaPage composition={composition} focusIndex={1} pageNum={5} />
      <FocusAreaPage composition={composition} focusIndex={2} pageNum={6} />
      <StartingKitPage composition={composition} />
      <TrapsPage composition={composition} />
      <PathFramingPage composition={composition} />
      <AboutPage composition={composition} />
      <NextStepPage composition={composition} />
    </Document>
  );
}

export async function renderPlaybookToBuffer(
  composition: PlaybookComposition
): Promise<Buffer> {
  const blob = await pdf(<PlaybookDocument composition={composition} />).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
