import React, { useState, useEffect } from 'react';
import bgImg from '../assets/background.jpg';

const THRESHOLD = 5;

const DEATH_MESSAGES = [
  'And so it ends. The QA lead sees all.',
  'Even the smallest bug can change the course of a release.',
  'One does not simply dodge every bug report.',
  'Production is down. The build is broken.',
  'You pushed on a Friday. Unfortunately, that did not help.',
  'Not all those who deploy are safe.',
  'I would have merged it for you. My reviewer. My lead.',
  'A senior dev is never on time. They ship precisely when they mean to.',
  "They're shipping the hotfix to prod... and you couldn't stop it.",
  'console.log could not save you now.',
];

const FAIL_MESSAGES = [
  'Even a junior dev would have scored higher.',
  `The threshold is ${THRESHOLD}. The QA lead is disappointed.`,
  'QA sends its regards.',
  'Your PR shall not pass... code review.',
  'Perhaps the dev life was not for you either.',
];

const AWARENESS_OPTIONS = [
  'Yes, have used it',
  'Only heard about it, never used it',
  'Did not know about it',
];

const S = {
  root: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundImage: `url(${bgImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
  },
  overlay: { position: 'absolute', inset: 0, background: 'rgba(3,7,18,0.65)' },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(10,16,28,0.92)',
    border: '2px solid #0E7490',
    borderRadius: 4,
    padding: '36px 44px',
    maxWidth: 520,
    width: '90%',
    color: '#E2E8F0',
    my: 40,
  },
  deathMsg: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 18,
    fontStyle: 'italic',
    color: '#67E8F9',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 1.5,
  },
  scoreBlock: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    lineHeight: 2,
  },
  bigScore: {
    fontSize: 36,
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 700,
    color: '#22D3EE',
  },
  subCard: {
    background: 'rgba(15,23,42,0.7)',
    border: '1px solid rgba(34,211,238,0.3)',
    borderRadius: 3,
    padding: '20px 24px',
    marginBottom: 16,
  },
  subCardTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 15,
    color: '#E2E8F0',
    marginBottom: 12,
    fontWeight: 600,
  },
  label: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: '#94A3B8',
    display: 'block',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid #334155',
    borderRadius: 2,
    padding: '10px 12px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 12,
    outline: 'none',
    boxSizing: 'border-box',
  },
  awareOption: (selected) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '10px 14px',
    marginBottom: 6,
    background: selected ? 'rgba(34,211,238,0.18)' : 'rgba(15,23,42,0.6)',
    border: selected ? '1px solid #22D3EE' : '1px solid #334155',
    borderLeft: selected ? '3px solid #22D3EE' : '3px solid transparent',
    borderRadius: 2,
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: '#E2E8F0',
    cursor: 'pointer',
  }),
  btn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    background: '#22D3EE',
    color: '#06121A',
    border: '2px solid #0E7490',
    borderRadius: 3,
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.05em',
    marginTop: 4,
  },
  failMsg: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 16,
    fontStyle: 'italic',
    color: '#67E8F9',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 1.5,
  },
  smallNote: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
  },
};

export default function EndScreen({ result, onRetry, onLeaderboard }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [awareness, setAwareness] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deathMsg] = useState(
    () => DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)]
  );
  const [failMsg] = useState(
    () => FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)]
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const qualified = result && result.score >= THRESHOLD;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !awareness) return;
    setSubmitting(true);
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          score: result.score,
          multiplierReached: 1,
          fireballsDodged: result.fireballsDodged,
          imagekitCollected: result.imagekitCollected,
          imagekitAwareness: awareness,
          qualifiedForDraw: true,
        }),
      });
      onLeaderboard();
    } catch {
      setSubmitting(false);
    }
  }

  if (!result) return null;

  return (
    <div
      style={{
        ...S.root,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      <div style={S.overlay} />
      <div style={{ ...S.card, position: 'relative', zIndex: 1 }}>
        <p style={S.deathMsg}>"{deathMsg}"</p>

        <div style={S.scoreBlock}>
          <div>
            Final Score: <span style={S.bigScore}>{result.score}</span>
          </div>
          <div>Bugs dodged: {result.fireballsDodged}</div>
        </div>

        {qualified ? (
          <form onSubmit={handleSubmit}>
            <div style={S.subCard}>
              <p style={S.subCardTitle}>
                Your code passed QA. You're in the draw.
              </p>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: '#CBD5E1',
                  marginBottom: 14,
                }}
              >
                Enter your details to claim your ticket.
              </p>

              <label style={S.label}>Name</label>
              <input
                style={S.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                required
              />

              <label style={S.label}>Email</label>
              <input
                style={S.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada@dev.io"
                required
              />

              <label style={{ ...S.label, marginBottom: 8 }}>
                Did you know about ImageKit before this event?
              </label>
              {AWARENESS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  style={S.awareOption(awareness === opt)}
                  onClick={() => setAwareness(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              type="submit"
              style={{
                ...S.btn,
                opacity: submitting || !awareness ? 0.6 : 1,
                cursor: submitting || !awareness ? 'not-allowed' : 'pointer',
              }}
              disabled={submitting || !awareness}
            >
              {submitting ? 'Submitting...' : 'Claim My Draw Ticket →'}
            </button>
          </form>
        ) : (
          <>
            <p style={S.failMsg}>
              {failMsg
                .replace('{THRESHOLD}', THRESHOLD)
                .replace('{score}', result.score)}
            </p>
            <button style={S.btn} onClick={onRetry}>
              Try Again →
            </button>
            <p style={S.smallNote}>
              Score above {THRESHOLD} to enter the lucky draw
            </p>
          </>
        )}
      </div>
    </div>
  );
}
