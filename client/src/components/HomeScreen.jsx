import React, { useState, useEffect } from 'react';
import bgImg from '../assets/background.jpg';

const CYAN = '#22D3EE';
const CYAN_LIGHT = '#67E8F9';

const KEYFRAMES = `
@keyframes fd-glow {
  0%, 100% { text-shadow: 0 0 18px rgba(34,211,238,0.55), 0 0 48px rgba(34,211,238,0.25); }
  50%      { text-shadow: 0 0 28px rgba(34,211,238,0.85), 0 0 80px rgba(34,211,238,0.45); }
}
@keyframes fd-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,211,238,0.55); }
  50%      { box-shadow: 0 0 0 14px rgba(34,211,238,0); }
}
`;

const S = {
  root: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundImage: `url(${bgImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    overflow: 'hidden',
  },
  // Darkens the scene behind the game title, fading toward the prize panel
  leftShade: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, rgba(4,8,16,0.82) 0%, rgba(4,8,16,0.6) 45%, rgba(4,8,16,0.35) 100%)',
  },

  // ── Left: game name + CTA
  left: {
    position: 'relative',
    zIndex: 1,
    flex: '1 1 55%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '0 4vw 0 6vw',
    gap: 'clamp(12px, 2vh, 24px)',
  },
  eyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 'clamp(13px, 1.1vw, 18px)',
    color: CYAN,
    letterSpacing: '0.35em',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  eyebrowRule: {
    width: 48,
    height: 2,
    background: CYAN,
    display: 'inline-block',
  },
  gameName: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    fontSize: 'clamp(44px, 5.4vw, 110px)',
    lineHeight: 0.92,
    letterSpacing: '0.02em',
    color: '#F1F5F9',
    textTransform: 'uppercase',
    textShadow: '0 4px 30px rgba(0,0,0,0.85)',
    margin: 0,
  },
  gameNameAccent: {
    display: 'block',
    color: CYAN,
  },
  highScore: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 'clamp(14px, 1.2vw, 20px)',
    color: '#CBD5E1',
    background: 'rgba(8,14,26,0.7)',
    border: '1px solid rgba(34,211,238,0.3)',
    borderRadius: 4,
    padding: '8px 14px',
  },
  btn: {
    marginTop: 'clamp(8px, 2vh, 24px)',
    padding: 'clamp(14px, 1.6vw, 22px) clamp(32px, 3.4vw, 60px)',
    background: CYAN,
    color: '#06121A',
    border: '2px solid #0E7490',
    borderRadius: 3,
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(18px, 1.6vw, 28px)',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.08em',
    transition: 'transform 0.15s ease, background 0.15s ease',
    animation: 'fd-pulse 2s ease-out infinite',
  },

  // ── Right: prize overlay panel
  right: {
    position: 'relative',
    zIndex: 1,
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 4vw',
    background: 'rgba(2,5,10,0.8)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    borderLeft: `3px solid ${CYAN}`,
    boxShadow: '-24px 0 60px rgba(0,0,0,0.5)',
  },
  playWin: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(30px, 4vw, 72px)',
    color: '#F1F5F9',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    lineHeight: 1,
    margin: 0,
  },
  prizeName: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    fontSize: 'clamp(44px, 5.4vw, 110px)',
    color: CYAN,
    textTransform: 'uppercase',
    lineHeight: 0.95,
    margin: 'clamp(10px, 1.6vh, 20px) 0 0 0',
    animation: 'fd-glow 2.4s ease-in-out infinite',
  },
  divider: {
    width: 96,
    height: 3,
    background: CYAN,
    margin: 'clamp(24px, 4vh, 44px) 0 clamp(14px, 2vh, 22px)',
  },
  prizeNote: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 'clamp(15px, 1.4vw, 24px)',
    color: '#94A3B8',
    lineHeight: 1.5,
    margin: 0,
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
      <style>{KEYFRAMES}</style>
      <div style={S.leftShade} />

      {/* Left: game name + CTA */}
      <div style={S.left}>
        <span style={S.eyebrow}>
          <span style={S.eyebrowRule} />
          Arcade Challenge
        </span>

        <h1 style={S.gameName}>
          Fire
          <span style={S.gameNameAccent}>Dodge</span>
        </h1>

        {topScore && (
          <p style={S.highScore}>
            Today's best: <strong style={{ color: CYAN }}>{topScore.score} pts</strong> —{' '}
            {topScore.name}
          </p>
        )}

        <button
          style={{
            ...S.btn,
            ...(btnHover ? { background: CYAN_LIGHT, transform: 'scale(1.03)' } : {}),
          }}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          onClick={onStart}
        >
          PLAY NOW →
        </button>
      </div>

      {/* Right: prize */}
      <div style={S.right}>
        <h2 style={S.playWin}>Play and Win</h2>
        <p style={S.prizeName}>
          Meta
          <br />
          <span style={{ whiteSpace: 'nowrap' }}>Quest 3S</span>
        </p>
        <div style={S.divider} />
        <p style={S.prizeNote}>
          Top the leaderboard and take it home.
        </p>
      </div>
    </div>
  );
}
