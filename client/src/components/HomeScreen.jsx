import React, { useState, useEffect } from 'react';
import bgImg from '../assets/lotr-background.jpg';

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
    flex: '0 0 60%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(20px, 3vw, 36px)',
    color: '#D4AF37',
    lineHeight: 1.1,
    textShadow: '0 2px 20px rgba(0,0,0,0.8)',
    margin: 0,
  },
  subtitle: {
    fontFamily: "'MedievalSharp', 'Cinzel', serif",
    fontSize: 'clamp(36px, 6vw, 76px)',
    color: '#C8B89A',
    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
    margin: '4px 0 0 0',
    lineHeight: 1.1,
  },
  highScore: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 14,
    color: '#C8B89A',
    marginTop: 8,
    opacity: 0.85,
  },
  btn: {
    marginTop: 24,
    padding: '16px 40px',
    background: '#D4AF37',
    color: '#1A0A00',
    border: '2px solid #8B6914',
    borderRadius: 3,
    fontFamily: "'Cinzel', serif",
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.06em',
    transition: 'transform 0.15s ease, background 0.15s ease',
  },
  // Right 40%
  right: {
    flex: '0 0 40%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  rewardHeader: {
    fontFamily: "'Cinzel', serif",
    fontSize: 33,
    fontWeight: 700,
    color: '#D4AF37',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 4,
    opacity: 0.8,
  },
  rewardCard: {
    background: 'rgba(10, 6, 2, 0.72)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: 6,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  rewardBadge: {
    fontFamily: "'Cinzel', serif",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '3px 10px',
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  rewardTitle: {
    fontFamily: "'MedievalSharp', 'Cinzel', serif",
    fontSize: 'clamp(20px, 2.5vw, 28px)',
    color: '#C8B89A',
    margin: 0,
    lineHeight: 1.3,
  },
  rewardDesc: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 20,
    color: '#A09070',
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
          <h1 style={S.title}>One Does Not Simply...</h1>
          <h2 style={S.subtitle}>...Dodge Saruman's Fire</h2>

          {topScore && (
            <p style={S.highScore}>
              Today's best: {topScore.score} pts — {topScore.name}
            </p>
          )}

          <button
            style={{
              ...S.btn,
              ...(btnHover
                ? { background: '#E8C84A', transform: 'scale(1.02)' }
                : {}),
            }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            onClick={onStart}
          >
            BEGIN YOUR QUEST →
          </button>
        </div>

        {/* Right: rewards */}
        <div style={S.right}>
          <p style={S.rewardHeader}>Rewards</p>

          {/* Reward 1 — Lucky Draw */}
          <div style={S.rewardCard}>
            <span
              style={{
                ...S.rewardBadge,
                background: 'rgba(212,175,55,0.15)',
                color: '#D4AF37',
                border: '1px solid rgba(212,175,55,0.4)',
              }}
            >
              Score &gt; 5
            </span>
            <h3 style={S.rewardTitle}>Enter the Lucky Draw</h3>
            <p style={S.rewardDesc}>
              Win the <strong style={{ color: '#C8B89A' }}>Rivendell Lego Set</strong> — score
              more than 5 to get your name in the draw.
            </p>
          </div>

          {/* Reward 2 — Top Score */}
          <div
            style={{
              ...S.rewardCard,
              border: '1px solid rgba(212,175,55,0.65)',
              background: 'rgba(20,12,2,0.8)',
            }}
          >
            <span
              style={{
                ...S.rewardBadge,
                background: 'rgba(212,175,55,0.15)',
                color: '#D4AF37',
                border: '1px solid rgba(212,175,55,0.4)',
              }}
            >
              Highest Score
            </span>
            <h3 style={S.rewardTitle}>Claude Max 5×</h3>
            <p style={S.rewardDesc}>
              <strong style={{ color: '#C8B89A' }}>3-month Claude Max 5×</strong> subscription
              goes to the player with the highest score of the day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
