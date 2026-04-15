import React, { useState, useEffect, useRef } from 'react';
import bgImg from '../assets/lotr-background.jpg';
import gandalfImg from '../assets/gandalf.png';
import happyGandalfImg from '../assets/happy-gandalf.png';

const THINKING_LINES = [
  "A wizard considers all fates carefully...",
  "Even the smallest person can change the course of the future.",
  "Many that live deserve draw. Many that win deserve luck.",
  "I have no memory of who wins... let the names decide.",
  "It is not despair, for despair is only for those who see the end beyond all doubt.",
  "All we have to decide is whose name comes up.",
  "The quest stands upon the edge of a knife...",
  "Fate is with those who are bold and faithful.",
  "I am looking for someone to share in a prize.",
  "The threads of fate are being woven... even now.",
];

const WIN_MESSAGES = [
  "You shall not pass... without your prize!",
  "Even the smallest hobbit can win the greatest prize.",
  "A wizard chose exactly who they meant to.",
  "The Fellowship rejoices! Step forward, worthy winner.",
  "From the shire to the prize desk — your quest is complete!",
];

const S = {
  root: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundImage: `url(${bgImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.60)',
  },
  left: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 48px 60px 64px',
  },
  right: {
    position: 'relative',
    zIndex: 1,
    width: '38%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  gandalfImg: {
    height: '88vh',
    objectFit: 'contain',
    objectPosition: 'bottom',
    display: 'block',
    filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.8))',
    transition: 'opacity 0.6s ease',
  },
  thoughtBox: {
    background: 'rgba(20,12,0,0.82)',
    border: '2px solid #8B6914',
    borderRadius: 6,
    padding: '28px 32px',
    marginBottom: 36,
    maxWidth: 540,
  },
  thoughtLine: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(16px, 2vw, 22px)',
    color: '#D4AF37',
    fontStyle: 'italic',
    lineHeight: 1.5,
    minHeight: 66,
    transition: 'opacity 0.4s ease',
  },
  rollingLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: 'rgba(200,184,154,0.5)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  rollingName: {
    fontFamily: "'MedievalSharp', 'Cinzel', serif",
    fontSize: 'clamp(28px, 4vw, 48px)',
    color: '#fff',
    letterSpacing: '0.04em',
    lineHeight: 1.2,
    minHeight: 60,
    transition: 'filter 0.2s ease',
  },
  winnerSection: {
    marginTop: 16,
  },
  winnerLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 14,
    color: '#D4AF37',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  winnerName: {
    fontFamily: "'MedievalSharp', 'Cinzel', serif",
    fontSize: 'clamp(42px, 6vw, 80px)',
    color: '#D4AF37',
    textShadow: '0 0 40px rgba(212,175,55,0.5)',
    lineHeight: 1.1,
    marginBottom: 20,
  },
  winMsg: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(16px, 2vw, 22px)',
    color: '#C8B89A',
    fontStyle: 'italic',
    lineHeight: 1.5,
    marginBottom: 28,
  },
  btn: {
    padding: '13px 32px',
    background: '#D4AF37',
    color: '#1A0A00',
    border: '2px solid #8B6914',
    borderRadius: 3,
    fontFamily: "'Cinzel', serif",
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },
};

export default function LuckyDrawPage() {
  const [names, setNames] = useState([]);
  const [winner, setWinner] = useState(null);
  const [displayName, setDisplayName] = useState('...');
  const [phase, setPhase] = useState('rolling'); // 'rolling' | 'slowing' | 'winner'
  const [thoughtIdx, setThoughtIdx] = useState(0);
  const [thoughtVisible, setThoughtVisible] = useState(true);
  const [gandalfHappy, setGandalfHappy] = useState(false);
  const [gandalfOpacity, setGandalfOpacity] = useState(1);
  const [winMsg] = useState(() => WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]);

  const rollIntervalRef = useRef(null);
  const thoughtIntervalRef = useRef(null);

  // Fetch names + winner on mount
  useEffect(() => {
    fetch('/api/scores/leaderboard')
      .then(r => r.json())
      .then(data => setNames(data.map(s => s.name)))
      .catch(() => setNames(['Frodo', 'Gandalf', 'Aragorn', 'Legolas', 'Gimli']));

    fetch('/api/scores/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'cityjs2025' }),
    })
      .then(r => r.json())
      .then(d => { if (d.winner) setWinner(d.winner); })
      .catch(() => {});
  }, []);

  // Rotate thought lines
  useEffect(() => {
    thoughtIntervalRef.current = setInterval(() => {
      setThoughtVisible(false);
      setTimeout(() => {
        setThoughtIdx(i => (i + 1) % THINKING_LINES.length);
        setThoughtVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(thoughtIntervalRef.current);
  }, []);

  // Rolling name animation
  useEffect(() => {
    if (names.length === 0) return;

    let speed = 60;       // ms between name changes (fast)
    let elapsed = 0;      // total ms since start
    const ROLL_DURATION = 7000;   // 7s fast rolling
    const SLOW_DURATION = 6000;   // 6s slowing down

    function pickName() {
      return names[Math.floor(Math.random() * names.length)];
    }

    function tick() {
      elapsed += speed;

      if (elapsed < ROLL_DURATION) {
        // Fast rolling phase
        setDisplayName(pickName());
        setPhase('rolling');
        schedule(speed);
      } else if (elapsed < ROLL_DURATION + SLOW_DURATION) {
        // Slowing down phase
        setPhase('slowing');
        const progress = (elapsed - ROLL_DURATION) / SLOW_DURATION; // 0→1
        speed = 60 + progress * progress * 1200; // eased: 60ms → ~1260ms
        setDisplayName(pickName());
        schedule(speed);
      } else {
        // Done — land on winner
        setDisplayName(winner ? winner.name : (names[0] || ''));
        clearInterval(thoughtIntervalRef.current);

        // Swap Gandalf image
        setTimeout(() => {
          setGandalfOpacity(0);
          setTimeout(() => {
            setGandalfHappy(true);
            setGandalfOpacity(1);
          }, 600);
        }, 300);

        setTimeout(() => setPhase('winner'), 800);
      }
    }

    function schedule(delay) {
      rollIntervalRef.current = setTimeout(tick, delay);
    }

    schedule(speed);
    return () => clearTimeout(rollIntervalRef.current);
  }, [names, winner]);

  const blurAmount = phase === 'rolling' ? 2 : phase === 'slowing' ? 1 : 0;

  return (
    <div style={S.root}>
      <div style={S.overlay} />

      {/* Left panel */}
      <div style={S.left}>
        {/* Thought bubble */}
        <div style={S.thoughtBox}>
          <div style={{ ...S.thoughtLine, opacity: thoughtVisible ? 1 : 0 }}>
            "{THINKING_LINES[thoughtIdx]}"
          </div>
        </div>

        {phase !== 'winner' ? (
          <>
            <div style={S.rollingLabel}>The fates are deciding...</div>
            <div style={{
              ...S.rollingName,
              filter: `blur(${blurAmount}px)`,
              opacity: phase === 'rolling' ? 0.85 : 1,
            }}>
              {displayName}
            </div>
          </>
        ) : (
          <div style={S.winnerSection}>
            <div style={S.winnerLabel}>⭐ The winner is</div>
            <div style={S.winnerName}>{displayName}</div>
            {winner && winner.email && (
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 18,
                color: 'rgba(200,184,154,0.7)',
                marginTop: -12,
                marginBottom: 20,
                letterSpacing: '0.04em',
              }}>
                {winner.email}
              </div>
            )}
            <div style={S.winMsg}>"{winMsg}"</div>
          </div>
        )}
      </div>

      {/* Right panel — Gandalf */}
      <div style={S.right}>
        <img
          src={gandalfHappy ? happyGandalfImg : gandalfImg}
          alt="Gandalf"
          style={{ ...S.gandalfImg, opacity: gandalfOpacity }}
        />
      </div>
    </div>
  );
}
