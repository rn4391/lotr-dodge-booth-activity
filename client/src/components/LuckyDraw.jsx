import React, { useState, useEffect, useRef } from 'react';
import bgImg from '../assets/background.jpg';
import imagekitLogo from '../assets/ice-logo.png';

const S = {
  root: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `url(${bgImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: { position: 'absolute', inset: 0, background: 'rgba(3,7,18,0.72)' },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    width: '90%',
    maxWidth: 700,
  },
  preTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(18px, 2.5vw, 28px)',
    color: '#22D3EE',
    marginBottom: 24,
    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
  },
  reel: {
    height: 100,
    overflow: 'hidden',
    marginBottom: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelText: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(32px, 5vw, 58px)',
    color: '#fff',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textShadow: '0 2px 20px rgba(34,211,238,0.6)',
  },
  winnerName: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(42px, 7vw, 80px)',
    color: '#22D3EE',
    fontWeight: 700,
    marginBottom: 16,
    textShadow: '0 0 40px rgba(34,211,238,0.5)',
    animation: 'fadeInScale 0.6s ease',
  },
  sub: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 16,
    color: '#CBD5E1',
    marginBottom: 24,
  },
  stats: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 32,
  },
  logos: {
    display: 'flex',
    gap: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  closeBtn: {
    padding: '12px 28px',
    background: 'transparent',
    color: '#CBD5E1',
    border: '1px solid rgba(34,211,238,0.4)',
    borderRadius: 3,
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    cursor: 'pointer',
  },
};

// Inject keyframe animation
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.8); }
    to   { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(styleTag);

export default function LuckyDraw({ onClose, stats }) {
  const [phase, setPhase] = useState('rolling'); // 'rolling' | 'reveal'
  const [displayName, setDisplayName] = useState('Loading...');
  const [winner, setWinner] = useState(null);
  const intervalRef = useRef(null);
  const namesRef = useRef([]);

  useEffect(() => {
    // Get qualifying names for the reel
    fetch('/api/scores/leaderboard')
      .then((r) => r.json())
      .then((scores) => {
        namesRef.current = scores.map((s) => s.name);
        if (namesRef.current.length === 0) namesRef.current = ['No entries yet'];
      })
      .catch(() => {
        namesRef.current = ['Ada', 'Linus', 'Grace', 'Alan'];
      });

    // Roll names fast
    let speed = 60;
    let elapsed = 0;

    function roll() {
      const names = namesRef.current;
      if (names.length > 0) {
        setDisplayName(names[Math.floor(Math.random() * names.length)]);
      }
    }

    function tick() {
      roll();
      elapsed += speed;
      // Slow down after 3s
      if (elapsed > 3000) speed = Math.min(speed * 1.08, 500);
      if (elapsed > 6000) {
        // Done rolling — fetch winner
        clearInterval(intervalRef.current);
        fetch('/api/scores/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'cityjs2025' }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.winner) {
              setDisplayName(d.winner.name);
              setWinner(d.winner);
              setTimeout(() => setPhase('reveal'), 400);
            } else {
              setDisplayName('No winner found');
              setPhase('reveal');
            }
          })
          .catch(() => {
            setDisplayName('Error — check console');
            setPhase('reveal');
          });
        return;
      }
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, speed);
    }

    intervalRef.current = setInterval(tick, speed);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div style={S.root}>
      <div style={S.overlay} />
      <div style={S.content}>
        {phase === 'rolling' && (
          <>
            <p style={S.preTitle}>The lucky committer is...</p>
            <div style={S.reel}>
              <span style={{ ...S.reelText, filter: 'blur(1px)' }}>
                {displayName}
              </span>
            </div>
          </>
        )}

        {phase === 'reveal' && (
          <>
            <p style={S.preTitle}>The lucky committer is...</p>
            <div style={S.winnerName}>{winner ? winner.name : displayName}</div>
            <p style={S.sub}>Claim your Lego Set at the booth desk</p>
            {stats && (
              <p style={S.stats}>
                {stats.totalPlayers} players · {stats.totalImagekitCollected} ImageKit logos
                collected today
              </p>
            )}
          </>
        )}

        <div style={S.logos}>
          <img src={imagekitLogo} alt="ImageKit" style={{ height: 24, opacity: 0.8 }} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: '#94A3B8',
            }}
          >
            ImageKit.io
          </span>
        </div>

        <button style={S.closeBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
