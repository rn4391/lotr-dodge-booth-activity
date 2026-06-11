import React, { useState, useCallback } from 'react';
import HomeScreen from './components/HomeScreen.jsx';
import InstructionScreen from './components/InstructionScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import EndScreen from './components/EndScreen.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import OperatorPanel from './components/OperatorPanel.jsx';
import LuckyDrawPage from './components/LuckyDrawPage.jsx';

const headerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 24px',
  pointerEvents: 'none',
};

const operatorLinkStyle = {
  position: 'fixed',
  bottom: 14,
  right: 18,
  zIndex: 50,
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  color: 'rgba(148,163,184,0.5)',
  cursor: 'pointer',
  letterSpacing: '0.05em',
  background: 'none',
  border: 'none',
  pointerEvents: 'all',
  textDecoration: 'none',
};

// Standalone leaderboard view (no game wrapper)
function StandaloneLeaderboard() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Leaderboard />
    </div>
  );
}

function Game() {
  const [gameState, setGameState] = useState('home');
  const [gameResult, setGameResult] = useState(null);
  const [operatorOpen, setOperatorOpen] = useState(false);

  const goTo = useCallback((state) => setGameState(state), []);

  const handleGameEnd = useCallback((result) => {
    setGameResult(result);
    setGameState('end');
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Persistent Header */}
      <header style={headerStyle}>
        <span
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 13,
            color: 'rgba(148,163,184,0.6)',
            letterSpacing: '0.06em',
          }}
        >
          Dev vs QA
        </span>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: 'rgba(148,163,184,0.5)',
            letterSpacing: '0.05em',
          }}
        >
          Powered by ImageKit.io
        </span>
      </header>

      {gameState === 'home' && <HomeScreen onStart={() => goTo('instructions')} />}
      {gameState === 'instructions' && (
        <InstructionScreen onStart={() => goTo('playing')} />
      )}
      {gameState === 'playing' && <GameScreen onGameEnd={handleGameEnd} />}
      {gameState === 'end' && (
        <EndScreen
          result={gameResult}
          onRetry={() => goTo('home')}
          onLeaderboard={() => goTo('leaderboard')}
        />
      )}
      {gameState === 'leaderboard' && (
        <Leaderboard onPlayAgain={() => goTo('home')} />
      )}

      <button style={operatorLinkStyle} onClick={() => setOperatorOpen(true)}>
        Operator
      </button>

      {operatorOpen && <OperatorPanel onClose={() => setOperatorOpen(false)} />}
    </div>
  );
}

export default function App() {
  if (window.location.pathname === '/leaderboard') {
    return <StandaloneLeaderboard />;
  }
  if (window.location.pathname === '/lucky-draw') {
    // Lucky draw is temporarily suspended — redirect to the leaderboard for now.
    // Keep <LuckyDrawPage /> intact for when the draw is re-enabled:
    //   return <LuckyDrawPage />;
    window.location.replace('/leaderboard');
    return <StandaloneLeaderboard />;
  }
  return <Game />;
}
