/**
 * AssessmentClient — the interactive AI Readiness flow.
 *
 * States:
 *   intro       → hero + brief + Start button
 *   quiz        → 15 questions with progress, prev/next
 *   submitting  → brief loading state while POSTing to /api/readiness/submit
 *   error       → retry option if submission fails
 *
 * On successful submit, redirects to /ai-readiness/result/[id]. The result
 * page is the single source of truth for what to render — the client never
 * shows the score locally.
 *
 * Refactored from CreativeMilkReadiness_v5.jsx. Visual identity preserved
 * verbatim. Differences:
 *   - All scoring + result rendering now lives at the result page
 *   - Submission is a real POST, not an in-memory state transition
 *   - WebGL hero is the production component (with SVG fallback)
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '@/lib/readiness/questions';
import { PILLARS } from '@/lib/readiness/pillars';
import { PILLAR_KEYS } from '@/lib/readiness/types';
import type { Answers } from '@/lib/readiness/types';
import {
  C,
  F,
  Icons,
  Label,
  GhostButton,
  SiteNav,
  PILLAR_ICONS,
  goldButtonStyle,
  inkButtonStyle,
  AiReadinessFontLink,
} from './_components/ui';
import { HeroBackground } from './_components/HeroBackground';

type Stage = 'intro' | 'quiz' | 'submitting' | 'error';

export default function AssessmentClient() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('intro');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalQuestions = QUESTIONS.length;

  const handleAnswer = (questionId: string, value: number) =>
    setAnswers((a) => ({ ...a, [questionId]: value }));

  const handleNext = async () => {
    if (questionIdx < totalQuestions - 1) {
      setQuestionIdx((i) => i + 1);
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
    } else {
      // Last question — submit
      await submitAssessment();
    }
  };

  const handlePrevious = () => {
    if (questionIdx > 0) {
      setQuestionIdx((i) => i - 1);
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
    }
  };

  const submitAssessment = async () => {
    setStage('submitting');
    setSubmitError(null);
    try {
      const res = await fetch('/api/readiness/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const { id } = (await res.json()) as { id: string };
      router.push(`/ai-readiness/result/${id}`);
    } catch (err) {
      console.error('[ai-readiness] submit failed:', err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
      setStage('error');
    }
  };

  return (
    <div style={{ background: C.cream, color: C.slate, minHeight: '100vh' }}>
      <AiReadinessFontLink />
      <style>{`
        body { margin: 0; font-family: Syne, sans-serif; }
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        input { font-family: inherit; }
      `}</style>

      {stage === 'intro' && <IntroScreen onStart={() => setStage('quiz')} />}

      {stage === 'quiz' && (
        <QuestionScreen
          question={QUESTIONS[questionIdx]}
          questionIdx={questionIdx}
          totalQuestions={totalQuestions}
          answers={answers}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}

      {stage === 'submitting' && <SubmittingScreen />}

      {stage === 'error' && (
        <ErrorScreen
          message={submitError ?? 'Submission failed.'}
          onRetry={submitAssessment}
        />
      )}
    </div>
  );
}

// ── Intro ───────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: C.ink, color: C.cream }}>
      <HeroBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <SiteNav />
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ marginBottom: '32px' }}>
            <Label>— AI Readiness Assessment</Label>
          </div>
          <h1
            style={{
              ...F.display,
              fontSize: 'clamp(56px, 9vw, 110px)',
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              color: C.cream,
              margin: '0 0 32px',
            }}
          >
            Find out how AI-ready your business{' '}
            <em style={{ color: C.gold, fontStyle: 'italic', fontWeight: 300 }}>really</em>{' '}
            is.
          </h1>
          <p
            style={{
              ...F.ui,
              fontSize: '17px',
              lineHeight: 1.7,
              color: 'rgba(245,240,232,0.75)',
              maxWidth: '640px',
              margin: '0 0 48px',
            }}
          >
            A five-minute assessment across the five pillars of AI readiness — strategy, data, culture, technology, governance. You&rsquo;ll get a personalised score, a breakdown of where you&rsquo;re strongest and weakest, and a focused 90-day playbook for what to do next.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginBottom: '48px' }}>
            {['Free assessment', 'No credit card', '5 minutes'].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(245,240,232,0.6)',
                }}
              >
                <Icons.Check size={14} color={C.gold} />
                <span style={{ ...F.ui, fontSize: '13px' }}>{item}</span>
              </div>
            ))}
          </div>
          <button onClick={onStart} style={goldButtonStyle}>
            Start the assessment <Icons.ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quiz ────────────────────────────────────────────────────────────────────

function TopProgress({
  progress,
  currentStep,
  totalSteps,
}: {
  progress: number;
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div style={{ background: C.cream, borderBottom: `1px solid ${C.creamDeeper}` }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '16px 24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            ...F.label,
            fontSize: '10px',
            color: C.slateMute,
          }}
        >
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{progress}% complete</span>
        </div>
        <div style={{ height: '1px', width: '100%', background: C.border }}>
          <div
            style={{
              height: '1px',
              width: `${progress}%`,
              background: C.gold,
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function PillarBar({ activePillarIdx }: { activePillarIdx: number }) {
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
      {PILLAR_KEYS.map((p, idx) => (
        <div
          key={p}
          style={{
            flex: 1,
            height: '1px',
            background: idx <= activePillarIdx ? C.gold : C.border,
            transition: 'background 0.5s',
          }}
        />
      ))}
    </div>
  );
}

function PillarPills({ activePillar }: { activePillar: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
      {PILLAR_KEYS.map((p) => {
        const pillar = PILLARS[p];
        const isActive = p === activePillar;
        return (
          <span
            key={p}
            style={{
              padding: '6px 12px',
              ...F.label,
              fontSize: '9px',
              background: isActive ? C.ink : 'transparent',
              border: `1px solid ${isActive ? C.ink : C.border}`,
              color: isActive ? C.cream : C.slateMute,
            }}
          >
            {pillar.label}
          </span>
        );
      })}
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '20px 24px',
        background: selected ? C.cream : '#FFFFFF',
        border: `1px solid ${selected ? C.ink : C.border}`,
        color: C.slate,
        cursor: 'pointer',
        display: 'block',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: `1px solid ${selected ? C.ink : '#A8A8B0'}`,
            background: selected ? C.ink : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {selected && (
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: C.gold,
              }}
            />
          )}
        </div>
        <span style={{ ...F.ui, fontSize: '14px' }}>{label}</span>
      </div>
    </button>
  );
}

function QuestionScreen({
  question,
  questionIdx,
  totalQuestions,
  answers,
  onAnswer,
  onNext,
  onPrevious,
}: {
  question: (typeof QUESTIONS)[number];
  questionIdx: number;
  totalQuestions: number;
  answers: Answers;
  onAnswer: (id: string, val: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const pillar = PILLARS[question.pillar];
  const PillarIcon = PILLAR_ICONS[question.pillar];
  const pillarIdx = PILLAR_KEYS.indexOf(question.pillar);
  const selectedValue = answers[question.id];
  const isAnswered = typeof selectedValue === 'number';
  const isLast = questionIdx === totalQuestions - 1;

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <div style={{ background: C.ink }}>
        <SiteNav />
      </div>
      <TopProgress
        progress={Math.round(((questionIdx + 1) / totalQuestions) * 100)}
        currentStep={questionIdx + 1}
        totalSteps={totalQuestions}
      />
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ marginBottom: '12px' }}>
            <Label color={C.slateMute}>— Section 2 of 3</Label>
          </div>
          <h2 style={{ ...F.section, fontSize: '40px', lineHeight: 1.1, color: C.ink, margin: 0 }}>
            Your AI Readiness Baseline
          </h2>
          <p style={{ ...F.ui, fontSize: '14px', color: C.slateMute, marginTop: '12px' }}>
            Fifteen questions across five pillars. ~5 minutes.
          </p>
        </div>
        <div style={{ padding: '40px', background: '#FFFFFF', border: `1px solid ${C.border}` }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: C.ink }}>
              <PillarIcon size={16} color={C.gold} />
              <span style={{ ...F.label, fontSize: '10px' }}>{pillar.label}</span>
            </div>
            <span style={{ ...F.label, fontSize: '10px', color: C.slateMute }}>
              {questionIdx + 1} / {totalQuestions}
            </span>
          </div>
          <PillarBar activePillarIdx={pillarIdx} />
          <PillarPills activePillar={question.pillar} />
          <h3
            style={{
              ...F.section,
              fontSize: '28px',
              lineHeight: 1.2,
              color: C.ink,
              margin: '0 0 32px',
            }}
          >
            {question.text}
          </h3>
          <div style={{ marginBottom: '40px' }}>
            {question.options.map((opt, idx) => (
              <OptionButton
                key={idx}
                label={opt}
                selected={selectedValue === idx}
                onClick={() => onAnswer(question.id, idx)}
              />
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <GhostButton onClick={onPrevious} disabled={questionIdx === 0}>
              <Icons.ChevronLeft size={14} /> Previous
            </GhostButton>
            <button
              type="button"
              onClick={onNext}
              disabled={!isAnswered}
              style={{
                ...inkButtonStyle,
                opacity: !isAnswered ? 0.3 : 1,
                cursor: !isAnswered ? 'not-allowed' : 'pointer',
              }}
            >
              {isLast ? 'See my score' : 'Next'} <Icons.ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Submitting ──────────────────────────────────────────────────────────────

function SubmittingScreen() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: C.ink,
        color: C.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <HeroBackground />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Label>— Scoring your assessment</Label>
        </div>
        <h2
          style={{
            ...F.section,
            fontSize: '40px',
            lineHeight: 1.1,
            color: C.cream,
            margin: '0 0 16px',
          }}
        >
          One moment.
        </h2>
        <p
          style={{
            ...F.ui,
            fontSize: '15px',
            color: 'rgba(245,240,232,0.65)',
            maxWidth: '420px',
            margin: '0 auto',
          }}
        >
          Calculating your pillar scores and personalising your focus areas.
        </p>
      </div>
    </div>
  );
}

// ── Error ───────────────────────────────────────────────────────────────────

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: C.ink,
        color: C.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <HeroBackground />
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '480px',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Label color={C.gold}>— Something went wrong</Label>
        </div>
        <h2
          style={{
            ...F.section,
            fontSize: '40px',
            lineHeight: 1.1,
            color: C.cream,
            margin: '0 0 16px',
          }}
        >
          We couldn&rsquo;t save your assessment.
        </h2>
        <p
          style={{
            ...F.ui,
            fontSize: '15px',
            color: 'rgba(245,240,232,0.65)',
            margin: '0 0 32px',
          }}
        >
          {message}
        </p>
        <button onClick={onRetry} style={goldButtonStyle}>
          Try again <Icons.ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
