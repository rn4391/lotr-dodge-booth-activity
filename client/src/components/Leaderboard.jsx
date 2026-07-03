import React, { useState, useEffect, useRef } from 'react';
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
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(32px, 5vw, 56px)',
    color: '#22D3EE',
    textAlign: 'center',
    marginBottom: 32,
    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: "'DM Mono', monospace",
    fontSize: 18,
    color: '#CBD5E1',
    marginBottom: 32,
  },
  th: {
    borderBottom: '1px solid rgba(34,211,238,0.4)',
    padding: '10px 16px',
    textAlign: 'left',
    color: '#22D3EE',
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
    gridTemplateColumns: '1fr',
    gap: 16,
    marginBottom: 32,
  },
  prizeCard: {
    background: 'rgba(8,14,26,0.78)',
    border: '1px solid rgba(34,211,238,0.4)',
    borderRadius: 3,
    padding: '20px 24px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 16,
    color: '#CBD5E1',
  },
  prizeTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 18,
    color: '#22D3EE',
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
    background: '#22D3EE',
    color: '#06121A',
    border: '2px solid #0E7490',
    borderRadius: 3,
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },
};

function fmtTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time}`;
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
        <h2 style={S.title}>Top Developers</h2>

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
                  background: i === 0 ? 'rgba(34,211,238,0.15)' : 'transparent',
                  color: i === 0 ? '#22D3EE' : '#CBD5E1',
                  fontSize: i === 0 ? 20 : 18,
                }}
              >
                <td style={S.td}>{i === 0 ? '🏆' : i + 1}</td>
                <td style={S.td}>
                  {s.name}
                </td>
                <td style={{ ...S.td, fontWeight: i === 0 ? 700 : 400 }}>{s.score}</td>
                <td style={S.td}>{s.fireballsDodged || 0}</td>
                <td style={S.td}>{fmtTime(s.timestamp)}</td>
              </tr>
            ))}
            {scores.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#64748B', padding: 32, fontSize: 18 }}>
                  No scores yet. Be the first!
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={S.prizesRow}>
          <div style={S.prizeCard}>
            <div style={S.prizeTitle}>🏆 Top Score Prize</div>
            <div>Win exciting rewards — to the top two players of the event</div>
            {topScore && (
              <div style={{ marginTop: 10, color: '#22D3EE', fontSize: 15 }}>
                Current leader: {topScore.score} — {topScore.name}
              </div>
            )}
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
