/**
 * BookCallModal — the Book a 30-min call qualifying form.
 *
 * Captures everything we need for the first conversation: name, email, phone,
 * company, suburb, company size, role, and the open problem-statement field.
 *
 * Submits to /api/readiness/book-call. On success, shows a confirmation and
 * leaves the modal open until the user closes it.
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  C,
  F,
  Icons,
  Label,
  goldButtonStyle,
} from '../../_components/ui';

const COMPANY_SIZES = [
  { value: '1-10',    label: '1–10' },
  { value: '11-50',   label: '11–50' },
  { value: '51-200',  label: '51–200' },
  { value: '200+',    label: '200+' },
];

const ROLES = [
  { value: 'founder',   label: 'Founder / Owner' },
  { value: 'exec',      label: 'Executive / Leadership' },
  { value: 'ops',       label: 'Operations' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other',     label: 'Other' },
];

export function BookCallModal({
  resultId,
  initialEmail,
  initialFirstName,
  onClose,
}: {
  resultId: string;
  initialEmail?: string;
  initialFirstName?: string;
  onClose: () => void;
}) {
  const [firstName, setFirstName] = useState(initialFirstName ?? '');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [role, setRole] = useState('');
  const [suburb, setSuburb] = useState('');
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Lock background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/readiness/book-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim(),
          companySize,
          role,
          suburb: suburb.trim(),
          problem: problem.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Submission failed');
      setDone(true);
    } catch (err) {
      console.error('[book-call] submit failed:', err);
      setError(
        err instanceof Error ? err.message : 'Could not send. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Book a 30-minute call"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15,21,38,0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: C.cream,
          color: C.slate,
          padding: '40px',
          position: 'relative',
        }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: C.slate,
            ...F.label,
            fontSize: '10px',
            padding: '8px',
          }}
        >
          CLOSE ×
        </button>

        {done ? (
          <SuccessState onClose={onClose} firstName={firstName} />
        ) : (
          <>
            <div style={{ marginBottom: '32px' }}>
              <Label color={C.gold}>— Book a 30-minute call</Label>
              <h2
                style={{
                  ...F.section,
                  fontSize: '32px',
                  lineHeight: 1.15,
                  color: C.ink,
                  margin: '12px 0 12px',
                }}
              >
                Tell us a bit about your business.
              </h2>
              <p
                style={{
                  ...F.ui,
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: C.slateMute,
                  margin: 0,
                }}
              >
                We&rsquo;ll review your assessment before the call so the conversation gets straight to the point. We&rsquo;ll be in touch within one business day to schedule.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <Row>
                <Field label="First name" required>
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={inputStyle}
                    maxLength={80}
                  />
                </Field>
                <Field label="Last name" required>
                  <input
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={inputStyle}
                    maxLength={80}
                  />
                </Field>
              </Row>
              <Row>
                <Field label="Email" required>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    maxLength={254}
                  />
                </Field>
                <Field label="Phone" required>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                    placeholder="+61 400 000 000"
                    maxLength={40}
                  />
                </Field>
              </Row>
              <Field label="Company" required>
                <input
                  required
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={inputStyle}
                  maxLength={120}
                />
              </Field>
              <Field label="Suburb / location" required>
                <input
                  required
                  type="text"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. Brunswick VIC"
                  maxLength={120}
                />
              </Field>
              <Row>
                <Field label="Company size" required>
                  <select
                    required
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select…</option>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Your role" required>
                  <select
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select…</option>
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </Row>
              <Field
                label="What's the AI problem you're trying to solve?"
                required
              >
                <textarea
                  required
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Be specific — a real problem we could actually help with."
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </Field>

              {error && (
                <p
                  style={{
                    ...F.ui,
                    fontSize: '13px',
                    color: '#9F4A1F',
                    margin: '4px 0 0',
                  }}
                >
                  {error}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '8px',
                }}
              >
                <button type="submit" disabled={busy} style={goldButtonStyle}>
                  {busy ? 'Sending…' : 'Submit'} <Icons.ArrowRight size={14} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  ...F.ui,
  fontSize: '14px',
  background: '#FFFFFF',
  border: `1px solid ${C.border}`,
  color: C.slate,
  outline: 'none',
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
      <span style={{ ...F.label, fontSize: '10px', color: C.slateMute }}>
        {label}
        {required && ' *'}
      </span>
      {children}
    </label>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      {children}
    </div>
  );
}

function SuccessState({
  onClose,
  firstName,
}: {
  onClose: () => void;
  firstName: string;
}) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 24px',
          background: C.gold,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icons.Check size={28} color={C.ink} />
      </div>
      <h2
        style={{
          ...F.section,
          fontSize: '32px',
          lineHeight: 1.15,
          color: C.ink,
          margin: '0 0 16px',
        }}
      >
        Thanks{firstName ? `, ${firstName}` : ''}.
      </h2>
      <p
        style={{
          ...F.ui,
          fontSize: '15px',
          lineHeight: 1.7,
          color: C.slateMute,
          margin: '0 auto 32px',
          maxWidth: '440px',
        }}
      >
        We&rsquo;ll be in touch within one business day to schedule a time. In the meantime, your playbook will land in your inbox shortly if you requested it.
      </p>
      <button onClick={onClose} style={goldButtonStyle}>
        Done
      </button>
    </div>
  );
}
