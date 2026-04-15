import React, { useState, useEffect } from 'react';
import LuckyDraw from './LuckyDraw.jsx';

const S = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    background: '#1A1000',
    border: '1px solid #8B6914',
    borderRadius: 4,
    padding: '32px 36px',
    width: 420,
    maxWidth: '95vw',
    color: '#C8B89A',
    fontFamily: "'DM Mono', monospace",
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 20,
    color: '#D4AF37',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    background: '#0d0600',
    border: '1px solid #8B6914',
    borderRadius: 2,
    padding: '10px 12px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 14,
    color: '#C8B89A',
    marginBottom: 12,
    outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    display: 'block',
    width: '100%',
    padding: '11px',
    background: '#D4AF37',
    color: '#1A0A00',
    border: 'none',
    borderRadius: 3,
    fontFamily: "'Cinzel', serif",
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 10,
    letterSpacing: '0.04em',
  },
  btnDanger: {
    display: 'block',
    width: '100%',
    padding: '11px',
    background: 'transparent',
    color: '#CC4444',
    border: '1px solid #CC4444',
    borderRadius: 3,
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    cursor: 'pointer',
    marginBottom: 10,
  },
  btnGhost: {
    display: 'block',
    width: '100%',
    padding: '11px',
    background: 'transparent',
    color: '#C8B89A',
    border: '1px solid rgba(200,184,154,0.35)',
    borderRadius: 3,
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    cursor: 'pointer',
    marginBottom: 10,
  },
  statsBlock: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(139,105,20,0.3)',
    borderRadius: 3,
    padding: '14px 16px',
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 2,
  },
  error: { color: '#CC4444', fontSize: 12, marginBottom: 8 },
  success: { color: '#66BB6A', fontSize: 12, marginBottom: 8 },
};

export default function OperatorPanel({ onClose }) {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState('');
  const [showDraw, setShowDraw] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  function handleAuth(e) {
    e.preventDefault();
    if (password === 'cityjs2025') {
      setAuthed(true);
      setAuthErr('');
      fetchStats();
    } else {
      setAuthErr('Incorrect password.');
    }
  }

  function fetchStats() {
    fetch('/api/scores/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }

  function handleExport() {
    window.open('/api/scores/export', '_blank');
  }

  function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    fetch('/api/scores/reset', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'cityjs2025' }),
    })
      .then((r) => r.json())
      .then((d) => {
        setMsg(`Deleted ${d.deleted} scores.`);
        setResetConfirm(false);
        fetchStats();
      })
      .catch(() => setMsg('Reset failed.'));
  }

  return (
    <div style={S.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.panel}>
        <h3 style={S.title}>Operator Panel</h3>

        {!authed ? (
          <form onSubmit={handleAuth}>
            <input
              style={S.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {authErr && <p style={S.error}>{authErr}</p>}
            <button type="submit" style={S.btn}>
              Unlock →
            </button>
            <button type="button" style={S.btnGhost} onClick={onClose}>
              Cancel
            </button>
          </form>
        ) : (
          <>
            {stats && (
              <div style={S.statsBlock}>
                <div>Players today: <strong>{stats.totalPlayers}</strong></div>
                <div>Avg score: <strong>{stats.averageScore}</strong></div>
                <div>Top score: <strong>{stats.topScore?.score || 0}</strong> — {stats.topScore?.name || '—'}</div>
                <div>ImageKit logos: <strong>{stats.totalImagekitCollected}</strong></div>
                <div>
                  Awareness: {stats.awarenessBreakdown.usedIt} used / {stats.awarenessBreakdown.heardOfIt} heard / {stats.awarenessBreakdown.didNotKnow} new
                </div>
              </div>
            )}

            {msg && <p style={S.success}>{msg}</p>}

            <button style={S.btn} onClick={() => setShowDraw(true)}>
              🎟 Start Lucky Draw
            </button>

            <button style={S.btnGhost} onClick={handleExport}>
              Export CSV ↓
            </button>

            <button style={S.btnGhost} onClick={fetchStats}>
              Refresh Stats ↻
            </button>

            <button style={S.btnDanger} onClick={handleReset}>
              {resetConfirm ? '⚠ Confirm Reset? Click again' : 'Reset Today\'s Scores'}
            </button>

            <button style={S.btnGhost} onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>

      {showDraw && (
        <LuckyDraw stats={stats} onClose={() => setShowDraw(false)} />
      )}
    </div>
  );
}
