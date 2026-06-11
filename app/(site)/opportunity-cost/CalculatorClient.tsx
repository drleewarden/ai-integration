/**
 * Opportunity Cost Calculator — interactive client.
 *
 * A live "Cost of Delay" calculator: results recompute on every input change
 * (no gate), and an optional lead-capture CTA lets interested visitors have
 * Creative Milk walk them through the numbers. The maths lives in
 * `@/lib/opportunity-cost/model` so this file is purely presentation.
 *
 * Visual identity reuses the shared primitives from the /ai-readiness tool
 * (C, F, Icons, button styles) so the calculator feels native to the site.
 */

'use client';

import React, { useMemo, useState } from 'react';
import Nav from '@/app/components/Nav';
import Footer from '@/app/components/Footer';
import { pushEvent } from '@/app/lib/gtm';
import {
  calculate,
  formatCompact,
  formatCurrency,
  formatNumber,
  getBenchmark,
  DELAY_OPTIONS,
  DEFAULT_LOADED_SALARY,
  INDUSTRY_BENCHMARKS,
  REALISATION_FACTOR,
  IMPLEMENTATION_COST_FRACTION,
  PRODUCTIVE_HOURS_PER_YEAR,
  type CalculatorInputs,
  type CalculatorResult,
  type IndustryKey,
} from '@/app/lib/opportunity-cost/model';
import {
  C,
  F,
  Icons,
  Label,
  goldButtonStyle,
  AiReadinessFontLink,
} from '@/app/(site)/ai-readiness/_components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDUSTRY_KEYS = Object.keys(INDUSTRY_BENCHMARKS) as IndustryKey[];

export default function CalculatorClient() {
  const [industry, setIndustry] = useState<IndustryKey>('professional-services');
  const [annualRevenue, setAnnualRevenue] = useState<number>(2_000_000);
  const [employees, setEmployees] = useState<number>(15);
  const [avgSalary, setAvgSalary] = useState<number>(DEFAULT_LOADED_SALARY);
  const [automatablePct, setAutomatablePct] = useState<number>(
    INDUSTRY_BENCHMARKS['professional-services'].automatablePct,
  );
  const [delayMonths, setDelayMonths] = useState<number>(12);

  // When the industry changes, snap the automatable slider to that industry's
  // default so the starting point is sensible — the user can still override it.
  const onIndustryChange = (key: IndustryKey) => {
    setIndustry(key);
    setAutomatablePct(getBenchmark(key).automatablePct);
  };

  const inputs: CalculatorInputs = useMemo(
    () => ({
      annualRevenue,
      employees,
      avgSalary,
      automatablePct,
      industry,
      delayMonths,
    }),
    [annualRevenue, employees, avgSalary, automatablePct, industry, delayMonths],
  );

  const result = useMemo(() => calculate(inputs), [inputs]);

  return (
    <div style={{ background: C.cream, color: C.slate, minHeight: '100vh' }}>
      <AiReadinessFontLink />
      <style>{`
        body { margin: 0; font-family: Syne, sans-serif; }
        * { box-sizing: border-box; }
        button, input, select { font-family: inherit; }
        input[type=range].oc-slider {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 2px; background: ${C.border};
          outline: none; cursor: pointer;
        }
        input[type=range].oc-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: ${C.gold}; border: 2px solid ${C.ink}; cursor: pointer;
        }
        input[type=range].oc-slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: ${C.gold}; border: 2px solid ${C.ink}; cursor: pointer;
        }
        .oc-num:focus, .oc-select:focus { outline: none; border-color: ${C.ink}; }
      `}</style>

      <Hero />

      <main id="oc-main">
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '0 24px 80px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)',
              gap: '32px',
              alignItems: 'start',
            }}
            className="oc-grid"
          >
            <InputsPanel
              industry={industry}
              onIndustryChange={onIndustryChange}
              annualRevenue={annualRevenue}
              setAnnualRevenue={setAnnualRevenue}
              employees={employees}
              setEmployees={setEmployees}
              avgSalary={avgSalary}
              setAvgSalary={setAvgSalary}
              automatablePct={automatablePct}
              setAutomatablePct={setAutomatablePct}
              delayMonths={delayMonths}
              setDelayMonths={setDelayMonths}
            />

            <ResultsPanel result={result} delayMonths={delayMonths} />
          </div>

          <ProjectionSection result={result} delayMonths={delayMonths} />

          <MethodologyNote />
        </div>

        <LeversSection />
        <CompoundingSection />
        <PlanSection />
        <LeadCapture inputs={inputs} result={result} />
      </main>

      <Footer />

      {/* Stack the two panes on smaller screens. */}
      <style>{`
        @media (max-width: 880px) {
          .oc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <div style={{ position: 'relative', background: C.ink, color: C.cream }}>
      <Nav />
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '128px 24px 72px' }}>
        <div style={{ marginBottom: '28px' }}>
          <Label>-- Opportunity Cost Calculator</Label>
        </div>
        <h1
          style={{
            ...F.display,
            fontSize: 'clamp(44px, 7.5vw, 92px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: C.cream,
            margin: '0 0 28px',
            maxWidth: '15ch',
          }}
        >
          What is waiting{' '}
          <em style={{ color: C.gold, fontStyle: 'italic', fontWeight: 300 }}>
            actually
          </em>{' '}
          costing you?
        </h1>
        <p
          style={{
            ...F.ui,
            fontSize: '17px',
            lineHeight: 1.7,
            color: 'rgba(245,240,232,0.72)',
            maxWidth: '620px',
            margin: 0,
          }}
        >
          Every month without the right AI tools in place is value left on the
          table — hours your team burns on repetitive work, revenue you never
          capture, errors you keep paying to fix. Enter a few numbers you already
          know and see the cost of standing still.
        </p>
      </div>
    </div>
  );
}

// ── Inputs ───────────────────────────────────────────────────────────────────

function InputsPanel(props: {
  industry: IndustryKey;
  onIndustryChange: (k: IndustryKey) => void;
  annualRevenue: number;
  setAnnualRevenue: (n: number) => void;
  employees: number;
  setEmployees: (n: number) => void;
  avgSalary: number;
  setAvgSalary: (n: number) => void;
  automatablePct: number;
  setAutomatablePct: (n: number) => void;
  delayMonths: number;
  setDelayMonths: (n: number) => void;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        padding: '32px',
        position: 'sticky',
        top: '24px',
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <Label color={C.slateMute}>-- Your business</Label>
      </div>

      <FieldLabel label="Industry">
        <select
          className="oc-select"
          value={props.industry}
          onChange={(e) => props.onIndustryChange(e.target.value as IndustryKey)}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: C.cream,
            border: `1px solid ${C.border}`,
            color: C.slate,
            ...F.ui,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {INDUSTRY_KEYS.map((k) => (
            <option key={k} value={k}>
              {INDUSTRY_BENCHMARKS[k].label}
            </option>
          ))}
        </select>
      </FieldLabel>

      <NumberField
        label="Annual revenue (AUD)"
        value={props.annualRevenue}
        onChange={props.setAnnualRevenue}
        step={50_000}
        min={0}
      />

      <div style={{ display: 'flex', gap: '16px' }}>
        <NumberField
          label="Team size (FTE)"
          value={props.employees}
          onChange={props.setEmployees}
          step={1}
          min={0}
        />
        <NumberField
          label="Avg loaded salary"
          value={props.avgSalary}
          onChange={props.setAvgSalary}
          step={5_000}
          min={0}
        />
      </div>

      <FieldLabel
        label={`Repetitive / automatable work — ${Math.round(
          props.automatablePct * 100,
        )}%`}
      >
        <input
          type="range"
          className="oc-slider"
          min={0}
          max={60}
          step={1}
          value={Math.round(props.automatablePct * 100)}
          onChange={(e) => props.setAutomatablePct(Number(e.target.value) / 100)}
          aria-label="Share of working time spent on repetitive or automatable tasks"
        />
        <p style={{ ...F.ui, fontSize: '12px', color: C.slateMute, margin: '8px 0 0' }}>
          Share of your team&rsquo;s time spent on tasks AI could take on.
        </p>
      </FieldLabel>

      <FieldLabel label="How long until you act?">
        <div style={{ display: 'flex', gap: '8px' }}>
          {DELAY_OPTIONS.map((months) => {
            const active = props.delayMonths === months;
            return (
              <button
                key={months}
                type="button"
                onClick={() => props.setDelayMonths(months)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: active ? C.ink : C.cream,
                  border: `1px solid ${active ? C.ink : C.border}`,
                  color: active ? C.cream : C.slate,
                  cursor: 'pointer',
                  ...F.ui,
                  fontSize: '13px',
                }}
              >
                {months} mo
              </button>
            );
          })}
        </div>
      </FieldLabel>
    </div>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'block', marginBottom: '20px' }}>
      <span
        style={{
          display: 'block',
          ...F.label,
          fontSize: '10px',
          color: C.slateMute,
          marginBottom: '10px',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step,
  min,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step: number;
  min: number;
}) {
  return (
    <FieldLabel label={label}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            position: 'absolute',
            left: '14px',
            ...F.ui,
            fontSize: '14px',
            color: C.slateMute,
            pointerEvents: 'none',
          }}
        >
          A$
        </span>
        <input
          className="oc-num"
          type="number"
          inputMode="numeric"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: '100%',
            padding: '12px 14px 12px 38px',
            background: C.cream,
            border: `1px solid ${C.border}`,
            color: C.slate,
            ...F.ui,
            fontSize: '14px',
          }}
        />
      </div>
    </FieldLabel>
  );
}

// ── Results ──────────────────────────────────────────────────────────────────

function ResultsPanel({
  result,
  delayMonths,
}: {
  result: CalculatorResult;
  delayMonths: number;
}) {
  return (
    <div>
      {/* Headline */}
      <div
        style={{
          background: C.ink,
          color: C.cream,
          padding: '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-40%',
            right: '-10%',
            width: 360,
            height: 360,
            background:
              'radial-gradient(circle, rgba(201,168,76,0.16) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative' }}>
          <Label>-- Cost of delaying {delayMonths} months</Label>
          <div
            style={{
              ...F.display,
              fontSize: 'clamp(48px, 8vw, 84px)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: C.gold,
              margin: '16px 0 12px',
            }}
          >
            {formatCurrency(result.costOfDelay)}
          </div>
          <p
            style={{
              ...F.ui,
              fontSize: '15px',
              lineHeight: 1.6,
              color: 'rgba(245,240,232,0.75)',
              margin: 0,
            }}
          >
            That&rsquo;s roughly{' '}
            <strong style={{ color: C.cream }}>
              {formatCurrency(result.costPerWorkingDay)}
            </strong>{' '}
            of value forgone every working day you wait.
          </p>
        </div>
      </div>

      {/* Supporting stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderLeft: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <Stat
          value={formatNumber(result.hoursReclaimedPerYear)}
          label="Hours reclaimed / year"
        />
        <Stat
          value={formatCompact(result.netAnnualValue)}
          label="Net value / year"
        />
        <Stat
          value={formatCompact(result.fiveYearGap)}
          label="5-year gap vs acting now"
        />
      </div>

      {/* Lever breakdown */}
      <div
        style={{
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderTop: 'none',
          padding: '32px',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <Label color={C.slateMute}>-- Where the value comes from (per year)</Label>
        </div>
        <LeverBar
          label="Productivity reclaimed"
          value={result.productivityValue}
          max={result.grossAnnualValue}
        />
        <LeverBar
          label="Revenue uplift"
          value={result.revenueValue}
          max={result.grossAnnualValue}
        />
        <LeverBar
          label="Errors & rework avoided"
          value={result.reworkValue}
          max={result.grossAnnualValue}
        />
        <p
          style={{
            ...F.ui,
            fontSize: '12px',
            lineHeight: 1.6,
            color: C.slateMute,
            margin: '20px 0 0',
            paddingTop: '16px',
            borderTop: `1px solid ${C.border}`,
          }}
        >
          Gross annual opportunity of{' '}
          <strong style={{ color: C.slate }}>
            {formatCurrency(result.grossAnnualValue)}
          </strong>
          , before a conservative realisation discount and net implementation
          cost are applied.
        </p>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRight: `1px solid ${C.border}`,
        borderTop: `1px solid ${C.border}`,
        padding: '24px 20px',
      }}
    >
      <div
        style={{
          ...F.display,
          fontSize: '32px',
          lineHeight: 1,
          color: C.ink,
          marginBottom: '8px',
        }}
      >
        {value}
      </div>
      <div style={{ ...F.label, fontSize: '9px', color: C.slateMute, lineHeight: 1.4 }}>
        {label}
      </div>
    </div>
  );
}

function LeverBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '8px',
        }}
      >
        <span style={{ ...F.ui, fontSize: '13px', color: C.slate }}>{label}</span>
        <span style={{ ...F.ui, fontSize: '13px', color: C.ink, fontWeight: 600 }}>
          {formatCurrency(value)}
        </span>
      </div>
      <div style={{ height: '4px', background: C.cream, width: '100%' }}>
        <div
          style={{
            height: '4px',
            width: `${pct}%`,
            background: C.gold,
            transition: 'width 0.4s ease-out',
          }}
        />
      </div>
    </div>
  );
}

// ── Projection chart ─────────────────────────────────────────────────────────

function ProjectionSection({
  result,
  delayMonths,
}: {
  result: CalculatorResult;
  delayMonths: number;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        padding: 'clamp(24px, 4vw, 40px)',
        marginTop: '32px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '28px',
        }}
      >
        <div>
          <Label color={C.slateMute}>-- Five-year cumulative value</Label>
          <h2
            style={{
              ...F.section,
              fontSize: 'clamp(26px, 4vw, 36px)',
              lineHeight: 1.1,
              color: C.ink,
              margin: '12px 0 0',
            }}
          >
            Acting now vs waiting {delayMonths} months
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Legend color={C.gold} label="Act now" />
          <Legend color={C.slateMute} label={`Delay ${delayMonths} mo`} dashed />
        </div>
      </div>

      <ProjectionChart result={result} />

      <p
        style={{
          ...F.ui,
          fontSize: '14px',
          lineHeight: 1.7,
          color: C.slateMute,
          margin: '24px 0 0',
          maxWidth: '70ch',
        }}
      >
        Delaying doesn&rsquo;t just push the start date back — it leaves you
        permanently behind. Over five years, waiting {delayMonths} months opens a{' '}
        <strong style={{ color: C.slate }}>
          {formatCurrency(result.fiveYearGap)}
        </strong>{' '}
        gap versus moving now.
      </p>
    </div>
  );
}

function Legend({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          display: 'inline-block',
          width: '18px',
          height: 0,
          borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
        }}
      />
      <span style={{ ...F.label, fontSize: '9px', color: C.slateMute }}>{label}</span>
    </div>
  );
}

function ProjectionChart({ result }: { result: CalculatorResult }) {
  const W = 1000;
  const H = 320;
  const padL = 8;
  const padR = 8;
  const padB = 28;
  const padT = 8;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const points = result.projection;
  const max = Math.max(1, result.fiveYearActNow);
  const lastMonth = points.length;

  const x = (month: number) => padL + ((month - 1) / (lastMonth - 1)) * innerW;
  const y = (value: number) => padT + innerH - (value / max) * innerH;

  const line = (key: 'actNow' | 'delayed') =>
    points.map((p) => `${x(p.month).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');

  // Filled "gap" band between the two curves.
  const areaTop = points.map((p) => `${x(p.month).toFixed(1)},${y(p.actNow).toFixed(1)}`);
  const areaBottom = [...points]
    .reverse()
    .map((p) => `${x(p.month).toFixed(1)},${y(p.delayed).toFixed(1)}`);
  const areaPath = `M ${areaTop.join(' L ')} L ${areaBottom.join(' L ')} Z`;

  const yearTicks = [12, 24, 36, 48, 60];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Cumulative value over five years: acting now versus delaying"
      style={{ display: 'block' }}
    >
      {/* gridlines */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={padL}
          x2={W - padR}
          y1={padT + innerH - f * innerH}
          y2={padT + innerH - f * innerH}
          stroke={C.border}
          strokeWidth={1}
          strokeDasharray="2 4"
        />
      ))}
      {/* gap band */}
      <path d={areaPath} fill="rgba(201,168,76,0.12)" stroke="none" />
      {/* delayed curve */}
      <polyline
        points={line('delayed')}
        fill="none"
        stroke={C.slateMute}
        strokeWidth={2}
        strokeDasharray="5 5"
      />
      {/* act-now curve */}
      <polyline points={line('actNow')} fill="none" stroke={C.gold} strokeWidth={2.5} />
      {/* x-axis year labels */}
      {yearTicks.map((m) => (
        <text
          key={m}
          x={x(m)}
          y={H - 8}
          textAnchor="middle"
          fontFamily='"DM Mono", monospace'
          fontSize={11}
          fill={C.slateMute}
        >
          Yr {m / 12}
        </text>
      ))}
    </svg>
  );
}

// ── Methodology disclosure ───────────────────────────────────────────────────

function MethodologyNote() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: '32px', border: `1px solid ${C.border}`, background: C.cream }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={open}
      >
        <span style={{ ...F.label, fontSize: '10px', color: C.slate }}>
          -- How this is calculated
        </span>
        <span style={{ color: C.slateMute, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
          <Icons.ChevronRight size={16} />
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: '0 24px 24px',
            ...F.ui,
            fontSize: '14px',
            lineHeight: 1.75,
            color: C.slateMute,
          }}
        >
          <p style={{ margin: '0 0 14px' }}>
            This is a directional estimate built from three value levers, using
            conservative industry-average benchmarks — not a quote.
          </p>
          <ul style={{ margin: '0 0 14px', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong style={{ color: C.slate }}>Productivity reclaimed</strong> —
              your team&rsquo;s labour cost × the share of work that&rsquo;s
              automatable × the efficiency AI realistically delivers on it.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong style={{ color: C.slate }}>Revenue uplift</strong> — a
              conservative percentage of revenue from freed capacity, faster
              response and better conversion.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong style={{ color: C.slate }}>Errors &amp; rework avoided</strong>{' '}
              — the cost of work that no longer has to be redone.
            </li>
          </ul>
          <p style={{ margin: '0 0 14px' }}>
            We then apply a <strong style={{ color: C.slate }}>
              {Math.round(REALISATION_FACTOR * 100)}% realisation factor
            </strong>{' '}
            (not every gain lands) and net out{' '}
            <strong style={{ color: C.slate }}>
              {Math.round(IMPLEMENTATION_COST_FRACTION * 100)}%
            </strong>{' '}
            for tooling, delivery and internal change effort. The cost of delay is
            the net value forgone across your chosen waiting period, nudged up
            slightly each month as competitors adopt. Hours are based on{' '}
            {formatNumber(PRODUCTIVE_HOURS_PER_YEAR)} productive hours per person
            per year.
          </p>
          <p style={{ margin: 0, fontSize: '13px' }}>
            Figures are illustrative and for guidance only. Your real numbers
            depend on where you start — which is exactly the conversation
            we&rsquo;d have next.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Framing content ──────────────────────────────────────────────────────────

/** Full-bleed content band with an inner 1180px container. */
function Band({
  bg,
  color,
  children,
}: {
  bg: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ background: bg, color }}>
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          padding: 'clamp(56px, 8vw, 96px) 24px',
        }}
      >
        {children}
      </div>
    </section>
  );
}

function BandHeading({
  eyebrow,
  children,
  color,
  eyebrowColor,
}: {
  eyebrow: string;
  children: React.ReactNode;
  color: string;
  eyebrowColor?: string;
}) {
  return (
    <>
      <Label color={eyebrowColor ?? C.slateMute}>{eyebrow}</Label>
      <h2
        style={{
          ...F.section,
          fontSize: 'clamp(30px, 5vw, 52px)',
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          color,
          margin: '18px 0 0',
          maxWidth: '20ch',
        }}
      >
        {children}
      </h2>
    </>
  );
}

/** "Three places inaction shows up" — explains the levers in plain English. */
function LeversSection() {
  const cards = [
    {
      n: '01',
      title: 'Productivity you’re renting out',
      body: 'Your team is capable of high-value work. Every hour spent on tasks software could handle is an hour you’re paying senior rates for junior output. The calculator prices that gap at your real salary load — not a theoretical hourly rate.',
    },
    {
      n: '02',
      title: 'Revenue that never shows up',
      body: 'The enquiry you answered a day too late. The customer who didn’t get a same-day response. The capacity you couldn’t free to chase growth. It rarely appears as a loss because no invoice ever lands — which is exactly what makes it so easy to ignore.',
    },
    {
      n: '03',
      title: 'Rework you’ve normalised',
      body: 'Errors, re-keying, hunting for the right version of a document. Most businesses have quietly filed this under “the cost of doing business.” It isn’t. It’s the cost of doing business manually — and it’s optional.',
    },
  ];
  return (
    <Band bg={C.cream} color={C.slate}>
      <div style={{ maxWidth: '760px', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
        <BandHeading eyebrow="-- Reading the result" color={C.ink}>
          Three places inaction quietly shows up on your P&amp;L
        </BandHeading>
        <p
          style={{
            ...F.ui,
            fontSize: '16px',
            lineHeight: 1.7,
            color: C.slateMute,
            margin: '20px 0 0',
          }}
        >
          The cost of waiting isn’t abstract. It lands in three concrete places
          every quarter you don’t move. Each lever in the calculator is measuring
          one of them.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          borderTop: `1px solid ${C.border}`,
          borderLeft: `1px solid ${C.border}`,
        }}
      >
        {cards.map((c) => (
          <article
            key={c.n}
            style={{
              padding: 'clamp(28px, 3vw, 40px)',
              borderRight: `1px solid ${C.border}`,
              borderBottom: `1px solid ${C.border}`,
              background: '#FFFFFF',
            }}
          >
            <div style={{ ...F.label, fontSize: '10px', color: C.gold, marginBottom: '20px' }}>
              {c.n}
            </div>
            <h3
              style={{
                ...F.section,
                fontSize: '23px',
                lineHeight: 1.2,
                color: C.ink,
                margin: '0 0 14px',
              }}
            >
              {c.title}
            </h3>
            <p style={{ ...F.ui, fontSize: '14px', lineHeight: 1.75, color: C.slateMute, margin: 0 }}>
              {c.body}
            </p>
          </article>
        ))}
      </div>
    </Band>
  );
}

/** "Why waiting gets more expensive" — the compounding narrative. */
function CompoundingSection() {
  const points = [
    {
      title: 'The value is non-recoverable',
      body: 'A month of reclaimed hours you didn’t reclaim is simply gone. There’s no catch-up sprint that gives you back the quarter you spent deciding.',
    },
    {
      title: 'The benchmark keeps moving',
      body: 'As AI becomes standard in your sector, what was an edge becomes the price of entry. Wait long enough and you’re paying to catch up rather than to lead.',
    },
  ];
  return (
    <Band bg={C.ink} color={C.cream}>
      <div style={{ maxWidth: '720px' }}>
        <BandHeading eyebrow="-- The compounding problem" color={C.cream} eyebrowColor={C.gold}>
          Delay isn’t a pause. It’s a position you fall behind from.
        </BandHeading>
        <p
          style={{
            ...F.ui,
            fontSize: '16px',
            lineHeight: 1.75,
            color: 'rgba(245,240,232,0.72)',
            margin: '22px 0 0',
          }}
        >
          The instinct is to treat “not yet” as a free option — next quarter, next
          budget cycle, when things calm down. But opportunity cost compounds. Every
          month, two things happen at once: the value you would have captured is gone
          for good, and the businesses that did move pull a little further ahead. The
          chart above models exactly this — the gap between acting now and waiting
          never closes, because you can’t reclaim the months you sat still.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(24px, 4vw, 48px)',
          marginTop: 'clamp(36px, 5vw, 56px)',
        }}
      >
        {points.map((p) => (
          <div
            key={p.title}
            style={{ paddingTop: '24px', borderTop: `1px solid ${C.gold}` }}
          >
            <h3
              style={{
                ...F.ui,
                fontSize: '16px',
                fontWeight: 600,
                color: C.cream,
                margin: '0 0 10px',
              }}
            >
              {p.title}
            </h3>
            <p
              style={{
                ...F.ui,
                fontSize: '14px',
                lineHeight: 1.75,
                color: 'rgba(245,240,232,0.6)',
                margin: 0,
              }}
            >
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </Band>
  );
}

/** "From a number to a plan" — bridges the tool to the conversation. */
function PlanSection() {
  return (
    <Band bg={C.cream} color={C.slate}>
      <div style={{ maxWidth: '760px' }}>
        <BandHeading eyebrow="-- What to do with this" color={C.ink}>
          A number on its own changes nothing. The plan behind it does.
        </BandHeading>
        <p
          style={{
            ...F.ui,
            fontSize: '16px',
            lineHeight: 1.75,
            color: C.slateMute,
            margin: '22px 0 18px',
          }}
        >
          This calculator is deliberately conservative and deliberately general —
          it’s a directional signal, not a quote. Your real figure depends on where
          you start: which tasks are genuinely automatable, what your data looks
          like, and where the fastest, lowest-risk wins actually sit.
        </p>
        <p
          style={{
            ...F.ui,
            fontSize: '16px',
            lineHeight: 1.75,
            color: C.slateMute,
            margin: '0 0 28px',
          }}
        >
          That’s the conversation we have in a Discovery Sprint. We pressure-test
          these numbers against your real operations and come back with an honest,
          sequenced plan. Sometimes it’s smaller than the calculator suggests.
          Sometimes it’s a great deal bigger. Either way, you’ll know — send us your
          scenario below and we’ll take it from there.
        </p>
        <a href="/process" style={{ ...F.label, fontSize: '10px', color: C.ink, textDecoration: 'none', borderBottom: `1px solid ${C.gold}`, paddingBottom: '4px' }}>
          See how our process works →
        </a>
      </div>
    </Band>
  );
}

// ── Lead capture ─────────────────────────────────────────────────────────────

type LeadStatus =
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'success' }
  | { type: 'error'; message: string };

function LeadCapture({
  inputs,
  result,
}: {
  inputs: CalculatorInputs;
  result: CalculatorResult;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<LeadStatus>({ type: 'idle' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !EMAIL_RE.test(email)) {
      setStatus({
        type: 'error',
        message: 'Please add your name and a valid email.',
      });
      return;
    }
    setStatus({ type: 'submitting' });
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: getBenchmark(inputs.industry).label,
          message: buildLeadMessage(inputs, result),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Something went wrong.');
      }
      pushEvent('opportunity_cost_lead', {
        industry: inputs.industry,
        delay_months: inputs.delayMonths,
      });
      setStatus({ type: 'success' });
      setName('');
      setEmail('');
    } catch (err) {
      setStatus({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Couldn’t send. Email us at contact@creative-milk.com.au.',
      });
    }
  };

  return (
    <section style={{ background: C.inkDeep, color: C.cream, borderTop: `1px solid ${C.gold}` }}>
      <div
        className="oc-cta"
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          padding: 'clamp(56px, 8vw, 96px) 24px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 'clamp(24px, 5vw, 56px)',
          alignItems: 'center',
        }}
      >
      <div>
        <Label>-- Make it real</Label>
        <h2
          style={{
            ...F.section,
            fontSize: 'clamp(28px, 4.5vw, 44px)',
            lineHeight: 1.05,
            color: C.cream,
            margin: '16px 0 16px',
          }}
        >
          Want these numbers{' '}
          <em style={{ color: C.gold, fontStyle: 'italic', fontWeight: 300 }}>
            pressure-tested
          </em>{' '}
          on your business?
        </h2>
        <p
          style={{
            ...F.ui,
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'rgba(245,240,232,0.7)',
            margin: '0 0 12px',
          }}
        >
          Send us your scenario and we&rsquo;ll come back with a grounded view of
          where the biggest, fastest wins are — no obligation, no jargon.
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            ...F.label,
            fontSize: '10px',
            color: 'rgba(245,240,232,0.55)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <li>→ Your inputs come with the message</li>
          <li>→ A reply within one business day</li>
        </ul>
      </div>

      {status.type === 'success' ? (
        <div
          role="status"
          style={{
            border: `1px solid rgba(91,175,137,0.45)`,
            background: 'rgba(61,122,95,0.18)',
            padding: '28px',
            ...F.ui,
            fontSize: '15px',
            lineHeight: 1.6,
            color: C.cream,
          }}
        >
          <div style={{ marginBottom: '8px', color: C.forest }}>
            <Icons.Check size={20} color={C.forest} />
          </div>
          Got it — your scenario is on its way to us. We&rsquo;ll be in touch
          within one business day.
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            className="oc-num"
            type="text"
            placeholder="Your name"
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            style={leadInputStyle}
          />
          <input
            className="oc-num"
            type="email"
            placeholder="Work email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            style={leadInputStyle}
          />
          {status.type === 'error' && (
            <span style={{ ...F.ui, fontSize: '13px', color: '#E89090' }}>
              {status.message}
            </span>
          )}
          <button
            type="submit"
            disabled={status.type === 'submitting'}
            style={{
              ...goldButtonStyle,
              marginTop: '4px',
              opacity: status.type === 'submitting' ? 0.6 : 1,
              cursor: status.type === 'submitting' ? 'not-allowed' : 'pointer',
            }}
          >
            {status.type === 'submitting' ? 'Sending…' : 'Send me a grounded view'}
            {status.type !== 'submitting' && <Icons.ArrowRight size={14} />}
          </button>
          <a
            href="/contact"
            style={{
              ...F.label,
              fontSize: '10px',
              color: 'rgba(245,240,232,0.55)',
              textAlign: 'center',
              marginTop: '4px',
              textDecoration: 'none',
            }}
          >
            or book a call →
          </a>
        </form>
      )}

      <style>{`
        @media (max-width: 880px) {
          .oc-cta { grid-template-columns: 1fr !important; }
        }
      `}</style>
      </div>
    </section>
  );
}

const leadInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(245,240,232,0.06)',
  border: '1px solid rgba(245,240,232,0.18)',
  color: C.cream,
  ...F.ui,
  fontSize: '14px',
};

function buildLeadMessage(inputs: CalculatorInputs, result: CalculatorResult): string {
  const b = getBenchmark(inputs.industry);
  return [
    'Opportunity Cost Calculator submission',
    '',
    `Industry: ${b.label}`,
    `Annual revenue: ${formatCurrency(inputs.annualRevenue)}`,
    `Team size: ${formatNumber(inputs.employees)} FTE`,
    `Avg loaded salary: ${formatCurrency(inputs.avgSalary)}`,
    `Automatable work: ${Math.round(inputs.automatablePct * 100)}%`,
    `Delay horizon: ${inputs.delayMonths} months`,
    '',
    `Estimated cost of delay: ${formatCurrency(result.costOfDelay)}`,
    `Net value / year: ${formatCurrency(result.netAnnualValue)}`,
    `Hours reclaimed / year: ${formatNumber(result.hoursReclaimedPerYear)}`,
    `5-year gap vs acting now: ${formatCurrency(result.fiveYearGap)}`,
  ].join('\n');
}
