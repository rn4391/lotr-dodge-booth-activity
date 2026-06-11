import React, { useState, useEffect, useRef } from 'react';
import bgImg from '../assets/background.jpg';
import leadImg from '../assets/lead.png';
import happyLeadImg from '../assets/happy-lead.png';

const THINKING_LINES = [
  "The tech lead reviews every commit carefully...",
  "Even the smallest commit can change the course of a release.",
  "Many that ship deserve luck. Many that fail deserve a retry.",
  "I have no memory of who wins... let the build decide.",
  "It's not a bug, it's an undocumented feature.",
  "All we have to decide is whose name the RNG returns.",
  "The sprint stands upon the edge of a deadline...",
  "Fortune favors the dev who writes tests.",
  "I am looking for someone to share in a prize.",
  "The threads of fate are compiling... even now.",
];

const WIN_MESSAGES = [
  "Your PR shall pass... straight to the prize desk!",
  "Even the smallest intern can win the greatest prize.",
  "The RNG chose exactly who it meant to.",
  "The team rejoices! Step forward, worthy winner.",
  "From localhost to the prize desk — your deploy is complete!",
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
  leadSprite: {
    height: '88vh',
    objectFit: 'contain',
    objectPosition: 'bottom',
    display: 'block',
    filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.8))',
    transition: 'opacity 0.6s ease',
  },
  thoughtBox: {
    background: 'rgba(10,16,28,0.85)',
    border: '2px solid #0E7490',
    borderRadius: 6,
    padding: '28px 32px',
    marginBottom: 36,
    maxWidth: 540,
  },
  thoughtLine: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 'clamp(16px, 2vw, 22px)',
    color: '#67E8F9',
    fontStyle: 'italic',
    lineHeight: 1.5,
    minHeight: 66,
    transition: 'opacity 0.4s ease',
  },
  rollingLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: 'rgba(148,163,184,0.6)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  rollingName: {
    fontFamily: "'Orbitron', sans-serif",
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
    color: '#22D3EE',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  winnerName: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(42px, 6vw, 80px)',
    color: '#22D3EE',
    textShadow: '0 0 40px rgba(34,211,238,0.5)',
    lineHeight: 1.1,
    marginBottom: 20,
  },
  winMsg: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 'clamp(16px, 2vw, 22px)',
    color: '#CBD5E1',
    fontStyle: 'italic',
    lineHeight: 1.5,
    marginBottom: 28,
  },
  btn: {
    padding: '13px 32px',
    background: '#22D3EE',
    color: '#06121A',
    border: '2px solid #0E7490',
    borderRadius: 3,
    fontFamily: "'Orbitron', sans-serif",
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
  const [leadHappy, setLeadHappy] = useState(false);
  const [leadOpacity, setLeadOpacity] = useState(1);
  const [winMsg] = useState(() => WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]);

  const rollIntervalRef = useRef(null);
  const thoughtIntervalRef = useRef(null);

  // Fetch names + winner on mount
  useEffect(() => {
    fetch('/api/scores/leaderboard')
      .then(r => r.json())
      .then(data => setNames(data.map(s => s.name)))
      .catch(() => setNames(['Ada', 'Linus', 'Grace', 'Alan', 'Margaret']));

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

        // Swap lead image
        setTimeout(() => {
          setLeadOpacity(0);
          setTimeout(() => {
            setLeadHappy(true);
            setLeadOpacity(1);
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
            <div style={S.rollingLabel}>CI is deciding...</div>
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
                color: 'rgba(203,213,225,0.7)',
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

      {/* Right panel — Tech Lead */}
      <div style={S.right}>
        <img
          src={leadHappy ? happyLeadImg : leadImg}
          alt="Tech Lead"
          style={{ ...S.leadSprite, opacity: leadOpacity }}
        />
      </div>
    </div>
  );
}
