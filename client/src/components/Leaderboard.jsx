import React, { useState, useEffect, useRef } from 'react';
import bgImg from '../assets/lotr-background.jpg';
import imagekitLogo from '../assets/ice-logo.png';

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
  overlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' },
  inner: {
    position: 'relative',
    zIndex: 1,
    width: '90%',
    maxWidth: 860,
    padding: '40px 0',
  },
  title: {
    fontFamily: "'MedievalSharp', 'Cinzel', serif",
    fontSize: 'clamp(32px, 5vw, 56px)',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 32,
    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: "'DM Mono', monospace",
    fontSize: 18,
    color: '#C8B89A',
    marginBottom: 32,
  },
  th: {
    borderBottom: '1px solid rgba(212,175,55,0.4)',
    padding: '10px 16px',
    textAlign: 'left',
    color: '#D4AF37',
    fontWeight: 500,
    fontSize: 13,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    verticalAlign: 'middle',
  },
  prizesRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 32,
  },
  prizeCard: {
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(212,175,55,0.4)',
    borderRadius: 3,
    padding: '20px 24px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 16,
    color: '#C8B89A',
  },
  prizeTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: 700,
    marginBottom: 8,
  },
  btnsRow: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
  btn: {
    padding: '15px 36px',
    background: '#D4AF37',
    color: '#1A0A00',
    border: '2px solid #8B6914',
    borderRadius: 3,
    fontFamily: "'Cinzel', serif",
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },
};

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Leaderboard({ onPlayAgain }) {
  const [scores, setScores] = useState([]);
  const [topScore, setTopScore] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = () => {
    fetch('/api/scores/leaderboard')
      .then((r) => r.json())
      .then(setScores)
      .catch(() => {});
    fetch('/api/scores/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.topScore && d.topScore.score > 0) setTopScore(d.topScore);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handlePlayAgain = onPlayAgain || (() => { window.location.href = '/'; });

  return (
    <div style={S.root}>
      <div style={S.overlay} />
      <div style={S.inner}>
        <h2 style={S.title}>The Fellowship of Scores</h2>

        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>#</th>
              <th style={S.th}>Name</th>
              <th style={S.th}>Score</th>
              <th style={S.th}>Dodged</th>
              <th style={S.th}>Time</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr
                key={s._id || i}
                style={{
                  background: i === 0 ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: i === 0 ? '#D4AF37' : '#C8B89A',
                  fontSize: i === 0 ? 20 : 18,
                }}
              >
                <td style={S.td}>{i === 0 ? '🏆' : i + 1}</td>
                <td style={S.td}>
                  {s.name}
                  {s.imagekitCollected > 0 && (
                    <img
                      src={imagekitLogo}
                      alt="ik"
                      style={{ width: 16, height: 16, marginLeft: 8, verticalAlign: 'middle', opacity: 0.8 }}
                    />
                  )}
                </td>
                <td style={{ ...S.td, fontWeight: i === 0 ? 700 : 400 }}>{s.score}</td>
                <td style={S.td}>{s.fireballsDodged || 0}</td>
                <td style={S.td}>{fmtTime(s.timestamp)}</td>
              </tr>
            ))}
            {scores.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#7A6040', padding: 32, fontSize: 18 }}>
                  No scores yet. Be the first!
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={S.prizesRow}>
          <div style={S.prizeCard}>
            <div style={S.prizeTitle}>🏆 Top Score Prize</div>
            <div>Claude Max × 5 — 3 months</div>
            {topScore && (
              <div style={{ marginTop: 10, color: '#D4AF37', fontSize: 15 }}>
                Current leader: {topScore.score} — {topScore.name}
              </div>
            )}
          </div>
          <div style={S.prizeCard}>
            <div style={S.prizeTitle}>🎟 Lucky Draw Prize</div>
            <div>LOTR Lego Set</div>
            <div style={{ marginTop: 6, color: '#A09070', fontSize: 14 }}>Draw at end of day</div>
          </div>
        </div>

        <div style={S.btnsRow}>
          <button style={S.btn} onClick={handlePlayAgain}>
            Play Again →
          </button>
        </div>
      </div>
    </div>
  );
}
