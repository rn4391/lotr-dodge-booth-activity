import React, { useState, useEffect } from 'react';
import bgImg from '../assets/background.jpg';

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
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
  },
  layout: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1200,
    padding: '0 48px',
    gap: 32,
  },
  // Left 60%
  left: {
    flex: '0 0 52%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(16px, 2vw, 24px)',
    color: '#22D3EE',
    lineHeight: 1.1,
    textShadow: '0 2px 20px rgba(0,0,0,0.8)',
    margin: 0,
  },
  subtitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(28px, 4vw, 52px)',
    color: '#E2E8F0',
    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
    margin: '4px 0 0 0',
    lineHeight: 1.1,
  },
  highScore: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 8,
    opacity: 0.85,
  },
  btn: {
    marginTop: 24,
    padding: '16px 40px',
    background: '#22D3EE',
    color: '#06121A',
    border: '2px solid #0E7490',
    borderRadius: 3,
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.06em',
    transition: 'transform 0.15s ease, background 0.15s ease',
  },
  // Right 40%
  right: {
    flex: '0 0 48%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  rewardHeader: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 42,
    fontWeight: 700,
    color: '#22D3EE',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 8,
    opacity: 0.9,
  },
  rewardCard: {
    background: 'rgba(8, 14, 26, 0.78)',
    border: '1px solid rgba(34, 211, 238, 0.35)',
    borderRadius: 8,
    padding: '32px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  rewardBadge: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '5px 14px',
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  rewardTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(34px, 4.5vw, 52px)',
    color: '#E2E8F0',
    margin: 0,
    lineHeight: 1.15,
  },
  rewardDesc: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 24,
    color: '#94A3B8',
    margin: 0,
    lineHeight: 1.6,
  },
};

export default function HomeScreen({ onStart }) {
  const [topScore, setTopScore] = useState(null);
  const [btnHover, setBtnHover] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    fetch('/api/scores/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.topScore && d.topScore.score > 0) setTopScore(d.topScore);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        ...S.root,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      <div style={S.overlay} />

      <div style={S.layout}>
        {/* Left: heading + CTA */}
        <div style={S.left}>
          <h1 style={S.title}>It Works On My Machine...</h1>
          <h2 style={S.subtitle}>Dev vs QA</h2>

          {topScore && (
            <p style={S.highScore}>
              Today's best: {topScore.score} pts — {topScore.name}
            </p>
          )}

          <button
            style={{
              ...S.btn,
              ...(btnHover
                ? { background: '#67E8F9', transform: 'scale(1.02)' }
                : {}),
            }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            onClick={onStart}
          >
            PLAY NOW →
          </button>
        </div>

        {/* Right: reward */}
        <div style={S.right}>
          <p style={S.rewardHeader}>Reward</p>

          {/* Top Score — Mac Mini M4 */}
          <div
            style={{
              ...S.rewardCard,
              border: '1px solid rgba(34,211,238,0.65)',
              background: 'rgba(10,18,32,0.82)',
            }}
          >
            <span
              style={{
                ...S.rewardBadge,
                background: 'rgba(34,211,238,0.15)',
                color: '#22D3EE',
                border: '1px solid rgba(34,211,238,0.4)',
              }}
            >
              Highest Score
            </span>
            <h3 style={S.rewardTitle}>Mac Mini M4</h3>
            <p style={S.rewardDesc}>
              The <strong style={{ color: '#E2E8F0' }}>Mac Mini M4</strong> goes to the
              player with the highest score of the day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
