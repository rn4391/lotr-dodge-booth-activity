import React, { useState, useEffect } from 'react';
import bgImg from '../assets/background.jpg';
import imagekitLogo from '../assets/ice-logo.png';
import bugImg from '../assets/bug.png';

const THRESHOLD = 5;

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
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(10, 16, 28, 0.92)',
    border: '2px solid #0E7490',
    borderRadius: 4,
    padding: '40px 48px',
    maxWidth: 560,
    width: '90%',
    color: '#E2E8F0',
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 34,
    color: '#22D3EE',
    marginBottom: 28,
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: "'DM Mono', monospace",
    fontSize: 17,
    lineHeight: 1.7,
  },
  rowTop: {
    verticalAlign: 'top',
    paddingBottom: 14,
  },
  key: {
    fontWeight: 600,
    paddingRight: 16,
    whiteSpace: 'nowrap',
    color: '#E2E8F0',
    paddingTop: 2,
  },
  desc: {
    color: '#94A3B8',
  },
  note: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 16,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
    borderTop: '1px solid rgba(34,211,238,0.25)',
    paddingTop: 14,
  },
  btn: {
    display: 'block',
    width: '100%',
    marginTop: 20,
    padding: '14px',
    background: '#22D3EE',
    color: '#06121A',
    border: '2px solid #0E7490',
    borderRadius: 3,
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 20,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'background 0.15s ease',
  },
};

export default function InstructionScreen({ onStart }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        ...S.root,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div style={S.overlay} />
      <div style={S.card}>
        <h2 style={S.title}>The Rules of Engagement</h2>

        <table style={S.table}>
          <tbody>
            <tr style={S.rowTop}>
              <td style={{ ...S.key, paddingTop: 4 }}>
                <img
                  src={bugImg}
                  alt="Bug"
                  style={{ width: 28, height: 28, verticalAlign: 'middle' }}
                />
                &nbsp;BUG
              </td>
              <td style={S.desc}>Dodge to increase score</td>
            </tr>
            <tr style={S.rowTop}>
              <td style={{ ...S.key, paddingTop: 4 }}>
                <img
                  src={imagekitLogo}
                  alt="ImageKit"
                  style={{ width: 28, height: 28, verticalAlign: 'middle' }}
                />
                &nbsp;POWER UPS
              </td>
              <td style={S.desc}>Collect for bonus points</td>
            </tr>
            <tr style={S.rowTop}>
              <td style={S.key}>💀 GET HIT</td>
              <td style={S.desc}>Build fails — game over</td>
            </tr>
            <tr style={S.rowTop}>
              <td style={S.key}>⌨️ SPACE</td>
              <td style={S.desc}>Jump — hold longer to jump higher</td>
            </tr>
          </tbody>
        </table>

        <p style={S.note}>
          Score above {THRESHOLD} points to enter the lucky draw.
        </p>

        <button
          style={S.btn}
          onMouseEnter={(e) => (e.target.style.background = '#67E8F9')}
          onMouseLeave={(e) => (e.target.style.background = '#22D3EE')}
          onClick={onStart}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
