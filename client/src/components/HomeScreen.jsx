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
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: '0 24px',
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(20px, 3vw, 36px)',
    color: '#D4AF37',
    lineHeight: 1.1,
    textShadow: '0 2px 20px rgba(0,0,0,0.8)',
  },
  subtitle: {
    fontFamily: "'MedievalSharp', 'Cinzel', serif",
    fontSize: 'clamp(42px, 7vw, 84px)',
    color: '#C8B89A',
    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
    marginTop: 4,
  },
  body: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 20,
    color: '#A09070',
    lineHeight: 1.8,
    marginTop: 12,
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
      <div style={S.content}>
        <h1 style={S.title}>One Does Not Simply...</h1>
        <h2 style={S.subtitle}>...Dodge Saruman's Fire</h2>

        <p style={S.body}>
          Score more than 5 to enter the lucky draw.
          <br />
          Highest score gets Claude Max 5× (3 months).
        </p>

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
    </div>
  );
}
