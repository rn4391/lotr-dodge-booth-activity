import React, { useEffect, useRef, useCallback } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const GROUND_RATIO = 0.75;
const FRODO_HEIGHT = 110;
const SARUMAN_HEIGHT = 160;
const PROJECTILE_SIZE = 50;
const IMAGEKIT_SIZE = 44;
const JUMP_HEIGHT   = 220;   // max peak px above ground
const MIN_JUMP_UP   = 130;   // ms — min up-phase (tap)
const MAX_JUMP_UP   = 400;   // ms — up-phase when held to max
const JUMP_DOWN_DUR = 600;   // ms — fall duration
const IMAGEKIT_SPAWN_CHANCE = 0.36;
const BASE_SPEED      = 9;
const SPEED_INCREMENT = 2.5;  // added per tier
const MAX_SPEED       = 22;
const SPEED_TIER_SIZE = 5;    // balls per speed tier
const ICE_MIN_FIRE_GAP   = 5; // fireballs required between ice balls
const ICE_MIN_FIRE_START = 4; // fireballs before first ice allowed

// ── Easing ────────────────────────────────────────────────────────────────────
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInCubic(t) { return t * t * t; }

function getJumpOffset(elapsed, upDur, downDur) {
  if (elapsed <= upDur) {
    // Going up — ease relative to MAX so peak height scales with upDur
    return easeOutCubic(elapsed / MAX_JUMP_UP) * JUMP_HEIGHT;
  }
  const peakOffset = easeOutCubic(upDur / MAX_JUMP_UP) * JUMP_HEIGHT;
  const t = (elapsed - upDur) / downDur;
  return (1 - easeInCubic(Math.min(t, 1))) * peakOffset;
}

const BASE_SCREEN_WIDTH = 1440;

function getProjectileSpeed(totalSpawned, canvasWidth) {
  const tier = Math.floor(totalSpawned / SPEED_TIER_SIZE);
  const base = Math.min(BASE_SPEED + tier * SPEED_INCREMENT, MAX_SPEED);
  return base * (canvasWidth / BASE_SCREEN_WIDTH);
}

// ── Asset loader ──────────────────────────────────────────────────────────────
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GameScreen({ onGameEnd }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const stateRef = useRef(null); // mutable game state — avoids stale closures

  // Build initial state
  const initState = useCallback((canvas, imgs) => {
    const groundY = canvas.height * GROUND_RATIO;
    return {
      imgs,
      groundY,
      frodo: {
        x: canvas.width * 0.15,
        yOffset: 0,
        isJumping: false,
        jumpStart: 0,
        spaceHeld: false,
        upDuration: MAX_JUMP_UP,
        jumpBuffered: false,
        jumpBufferTime: 0,
      },
      saruman: {
        x: canvas.width * 0.72,
        y: groundY - SARUMAN_HEIGHT,
      },
      projectiles: [],
      score: 0,
      fireballsDodged: 0,
      imagekitCollected: 0,
      totalSpawned: 0,
      fireballsSpawned: 0,
      fireballsSinceLastIce: ICE_MIN_FIRE_GAP, // pre-fill so only ICE_MIN_FIRE_START gates first ice
      floatingTexts: [],
      gameStartTime: performance.now(),
      nextSpawnIn: 1200,
      lastSpawnTime: performance.now(),
      rafId: null,
      dead: false,
      topScore: null,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');

    // Size canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (stateRef.current) {
        stateRef.current.groundY = canvas.height * GROUND_RATIO;
        stateRef.current.frodo.x = canvas.width * 0.15;
        stateRef.current.saruman.x = canvas.width * 0.72;
        stateRef.current.saruman.y = stateRef.current.groundY - SARUMAN_HEIGHT;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Show loading
    ctx.fillStyle = '#0d0600';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#D4AF37';
    ctx.font = "20px 'DM Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);

    // Load assets
    const assetPaths = {
      bg: new URL('../assets/lotr-background.jpg', import.meta.url).href,
      frodo: new URL('../assets/frodo.png', import.meta.url).href,
      saruman: new URL('../assets/saruman.png', import.meta.url).href,
      fireball: new URL('../assets/fireball.png', import.meta.url).href,
      imagekit: new URL('../assets/ice-logo.png', import.meta.url).href,
    };

    Promise.all([
      loadImage(assetPaths.bg),
      loadImage(assetPaths.frodo),
      loadImage(assetPaths.saruman),
      loadImage(assetPaths.fireball),
      loadImage(assetPaths.imagekit),
    ])
      .then(([bg, frodo, saruman, fireball, imagekit]) => {
        const imgs = { bg, frodo, saruman, fireball, imagekit };
        stateRef.current = initState(canvas, imgs);

        // Fetch top score
        fetch('/api/scores/stats')
          .then((r) => r.json())
          .then((d) => {
            if (stateRef.current && d.topScore && d.topScore.score > 0) {
              stateRef.current.topScore = d.topScore;
            }
          })
          .catch(() => {});

        startGame();
      })
      .catch(() => {
        // Assets missing — run without images (stub)
        const imgs = { bg: null, frodo: null, saruman: null, fireball: null, imagekit: null };
        stateRef.current = initState(canvas, imgs);
        startGame();
      });

    // ── Input handling ────────────────────────────────────────────────────────
    const JUMP_BUFFER_MS = 150; // buffer window to catch pre-landing inputs

    function startJump(s) {
      s.frodo.isJumping = true;
      s.frodo.jumpStart = performance.now();
      s.frodo.spaceHeld = true;
      s.frodo.upDuration = MAX_JUMP_UP;
      s.frodo.jumpBuffered = false;
    }

    function onKeyDown(e) {
      if (e.code !== 'Space' || e.repeat) return;
      e.preventDefault();
      const s = stateRef.current;
      if (!s || s.dead) return;
      if (s.frodo.isJumping) {
        // Buffer the input — fire on landing if within window
        s.frodo.jumpBuffered = true;
        s.frodo.jumpBufferTime = performance.now();
      } else {
        startJump(s);
      }
    }

    function onKeyUp(e) {
      if (e.code !== 'Space') return;
      e.preventDefault();
      const s = stateRef.current;
      if (!s || !s.frodo.spaceHeld) return;
      const elapsed = performance.now() - s.frodo.jumpStart;
      s.frodo.upDuration = Math.min(Math.max(elapsed, MIN_JUMP_UP), MAX_JUMP_UP);
      s.frodo.spaceHeld = false;
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ── Spawn logic ───────────────────────────────────────────────────────────
    function scheduleNextSpawn(gameTime) {
      const baseInterval = Math.max(1800 - gameTime * 18, 600);
      const jitter = (Math.random() - 0.5) * 0.8 * baseInterval;
      stateRef.current.nextSpawnIn = baseInterval + jitter;
    }

    function spawnProjectile(gameTime) {
      const s = stateRef.current;
      if (!s) return;

      // Ice ball eligibility: need 5 fireballs total + 5 since last ice
      const iceEligible =
        s.fireballsSpawned >= ICE_MIN_FIRE_START &&
        s.fireballsSinceLastIce >= ICE_MIN_FIRE_GAP;
      const isImageKit = iceEligible && Math.random() < IMAGEKIT_SPAWN_CHANCE;
      const type = isImageKit ? 'imagekit' : 'fire';
      const size = type === 'imagekit' ? IMAGEKIT_SIZE : PROJECTILE_SIZE;
      // Spawn from Saruman's wand — right edge of his sprite, low (wand/hand height)
      const sarumanW = s.imgs.saruman
        ? Math.round(SARUMAN_HEIGHT * s.imgs.saruman.naturalWidth / s.imgs.saruman.naturalHeight)
        : 150;
      const spawnX = s.saruman.x;
      const spawnY = s.groundY - size / 2 - 20;
      s.projectiles.push({
        type,
        x: spawnX,
        y: spawnY,
        width: size,
        height: size,
        speed: getProjectileSpeed(s.totalSpawned, canvas.width),
      });
      s.totalSpawned++;
      if (type === 'fire') {
        s.fireballsSpawned++;
        s.fireballsSinceLastIce++;
      } else {
        s.fireballsSinceLastIce = 0;
      }
      s.lastSpawnTime = performance.now();
      scheduleNextSpawn(gameTime);

      // After tier 2: 20% chance of a second fireball 300–450ms later
      const tier = Math.floor(s.totalSpawned / SPEED_TIER_SIZE);
      if (tier >= 2 && type === 'fire' && Math.random() < 0.20) {
        setTimeout(() => {
          const s2 = stateRef.current;
          if (!s2 || s2.dead) return;
          const spawnX2 = s2.saruman.x;
          const spawnY2 = s2.groundY - PROJECTILE_SIZE / 2 - 20;
          s2.projectiles.push({
            type: 'fire',
            x: spawnX2,
            y: spawnY2,
            width: PROJECTILE_SIZE,
            height: PROJECTILE_SIZE,
            speed: getProjectileSpeed(s2.totalSpawned, canvas.width),
          });
          s2.totalSpawned++;
          s2.fireballsSpawned++;
          s2.fireballsSinceLastIce++;
        }, 300 + Math.random() * 150);
      }
    }

    // ── AABB collision ────────────────────────────────────────────────────────
    function overlaps(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    // ── Death sequence ────────────────────────────────────────────────────────
    function triggerDeath() {
      const s = stateRef.current;
      if (!s || s.dead) return;
      s.dead = true;
      cancelAnimationFrame(s.rafId);

      // Screen shake
      const shakeKeyframes = [
        { transform: 'translate(-8px, 4px)' },
        { transform: 'translate(8px, -4px)' },
        { transform: 'translate(-6px, -6px)' },
        { transform: 'translate(6px, 6px)' },
        { transform: 'translate(-4px, 2px)' },
        { transform: 'translate(0px, 0px)' },
      ];
      container.animate(shakeKeyframes, { duration: 400, easing: 'ease-out' });

      // Flash overlay
      const flash = document.createElement('div');
      flash.style.cssText = `
        position: fixed; inset: 0; z-index: 100; pointer-events: none;
        background: rgba(255,200,0,0);
        transition: background 0.15s ease;
      `;
      document.body.appendChild(flash);

      requestAnimationFrame(() => {
        flash.style.background = 'rgba(255,200,0,0.85)';
      });

      setTimeout(() => {
        flash.style.transition = 'background 0.45s ease';
        flash.style.background = 'rgba(255,255,255,1)';
      }, 150);

      setTimeout(() => {
        flash.style.transition = 'background 0.3s ease';
        flash.style.background = 'rgba(255,255,255,0)';
      }, 600);

      setTimeout(() => {
        document.body.removeChild(flash);
        onGameEnd({
          score: s.score,
          fireballsDodged: s.fireballsDodged,
          imagekitCollected: s.imagekitCollected,
        });
      }, 900);
    }

    // ── Draw HUD ──────────────────────────────────────────────────────────────
    function drawHUD(s) {
      // Score
      ctx.font = "bold 28px 'Cinzel', serif";
      ctx.fillStyle = '#D4AF37';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${s.score}`, 24, 52);

      // Multiplier indicator
      const tier = Math.floor(s.totalSpawned / SPEED_TIER_SIZE);
      const multiplier = tier + 1;
      if (multiplier > 1) {
        ctx.textAlign = 'center';
        ctx.font = "bold 22px 'Cinzel', serif";
        ctx.fillStyle = '#D4AF37';
        ctx.fillText(`×${multiplier}`, canvas.width / 2, 50);
      }

      // Top score
      if (s.topScore) {
        ctx.textAlign = 'right';
        ctx.font = "14px 'DM Mono', monospace";
        ctx.fillStyle = '#C8B89A';
        ctx.fillText(
          `Best: ${s.topScore.score} — ${s.topScore.name}`,
          canvas.width - 24,
          46
        );
      }

      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    }

    // ── Floating texts ────────────────────────────────────────────────────────
    function drawFloatingTexts(s, now) {
      s.floatingTexts = s.floatingTexts.filter((ft) => now - ft.born < ft.life);
      for (const ft of s.floatingTexts) {
        const age = now - ft.born;
        const progress = age / ft.life;
        const alpha = 1 - progress;
        const y = ft.y - progress * 60;
        ctx.globalAlpha = alpha;
        ctx.font = "bold 18px 'DM Mono', monospace";
        ctx.fillStyle = '#D4AF37';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, y);
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = 'left';
    }

    // ── Main loop ─────────────────────────────────────────────────────────────
    function loop(now) {
      const s = stateRef.current;
      if (!s || s.dead) return;

      const gameTime = (now - s.gameStartTime) / 1000;

      // Spawn check
      if (now - s.lastSpawnTime >= s.nextSpawnIn) {
        spawnProjectile(gameTime);
      }

      // ── Draw background
      if (s.imgs.bg) {
        ctx.drawImage(s.imgs.bg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#0d0600';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);



      // ── Saruman glow
      const sarumanDrawW = s.imgs.saruman
        ? Math.round(SARUMAN_HEIGHT * s.imgs.saruman.naturalWidth / s.imgs.saruman.naturalHeight)
        : 150;
      const glowCx = s.saruman.x + sarumanDrawW / 2;
      const glowCy = s.saruman.y + SARUMAN_HEIGHT / 2;
      const grd = ctx.createRadialGradient(glowCx, glowCy, 10, glowCx, glowCy, 160);
      const pulse = 0.15 + 0.08 * Math.sin(now / 400);
      grd.addColorStop(0, `rgba(255,50,0,${pulse})`);
      grd.addColorStop(1, 'rgba(255,50,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(s.saruman.x - 80, s.saruman.y - 20, sarumanDrawW + 160, SARUMAN_HEIGHT + 40);

      // ── Saruman
      if (s.imgs.saruman) {
        ctx.drawImage(s.imgs.saruman, s.saruman.x, s.saruman.y, sarumanDrawW, SARUMAN_HEIGHT);
      } else {
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(s.saruman.x, s.saruman.y, 150, SARUMAN_HEIGHT);
      }

      // ── Update Frodo jump
      if (s.frodo.isJumping) {
        const elapsed = now - s.frodo.jumpStart;

        // While held, keep extending upDuration up to max
        if (s.frodo.spaceHeld) {
          if (elapsed >= MAX_JUMP_UP) {
            s.frodo.upDuration = MAX_JUMP_UP;
            s.frodo.spaceHeld = false;
          } else {
            s.frodo.upDuration = elapsed; // still rising
          }
        }

        const upDur = s.frodo.upDuration;
        const totalDur = upDur + JUMP_DOWN_DUR;

        if (elapsed >= totalDur) {
          s.frodo.isJumping = false;
          s.frodo.yOffset = 0;
          // Fire buffered jump if input arrived just before landing
          if (s.frodo.jumpBuffered && (performance.now() - s.frodo.jumpBufferTime) < JUMP_BUFFER_MS) {
            startJump(s);
          }
        } else {
          s.frodo.yOffset = getJumpOffset(elapsed, upDur, JUMP_DOWN_DUR);
        }
      }

      const drawY = s.groundY - FRODO_HEIGHT - s.frodo.yOffset;
      const frodoDrawW = s.imgs.frodo
        ? Math.round(FRODO_HEIGHT * s.imgs.frodo.naturalWidth / s.imgs.frodo.naturalHeight)
        : 100;

      // ── Draw Frodo
      if (s.imgs.frodo) {
        ctx.drawImage(s.imgs.frodo, s.frodo.x, drawY, frodoDrawW, FRODO_HEIGHT);
      } else {
        ctx.fillStyle = '#4A7A30';
        ctx.fillRect(s.frodo.x, drawY, frodoDrawW, FRODO_HEIGHT);
      }

      // ── Frodo hitbox (tighter than sprite)
      const frodoHitbox = {
        x: s.frodo.x + Math.round(frodoDrawW * 0.20),
        y: drawY + Math.round(FRODO_HEIGHT * 0.08),
        width: Math.round(frodoDrawW * 0.50),
        height: Math.round(FRODO_HEIGHT * 0.75),
      };

      // ── Update & draw projectiles
      const toRemove = [];
      for (let i = 0; i < s.projectiles.length; i++) {
        const p = s.projectiles[i];
        p.x -= p.speed;

        const pHitbox = { x: p.x, y: p.y - p.height / 2, width: p.width, height: p.height };

        if (overlaps(frodoHitbox, pHitbox)) {
          if (p.type === 'fire') {
            triggerDeath();
            return;
          } else if (p.type === 'imagekit') {
            // Collected — bonus +5 × multiplier
            toRemove.push(i);
            const iceMultiplier = Math.floor(s.totalSpawned / SPEED_TIER_SIZE) + 1;
            const icePoints = 5 * iceMultiplier;
            s.score += icePoints;
            s.imagekitCollected++;
            s.floatingTexts.push({
              text: `+${icePoints}`,
              x: s.frodo.x + frodoDrawW / 2,
              y: drawY,
              born: now,
              life: 800,
            });
            // Flash
            ctx.fillStyle = 'rgba(212,175,55,0.35)';
            ctx.beginPath();
            ctx.arc(p.x + p.width / 2, p.y, 40, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (p.x + p.width < s.frodo.x) {
          // Passed Frodo
          if (p.type === 'fire') {
            const fireMultiplier = Math.floor(s.totalSpawned / SPEED_TIER_SIZE) + 1;
            s.score += 1 * fireMultiplier;
            s.fireballsDodged++;
          }
          toRemove.push(i);
        } else if (p.x + p.width < 0) {
          toRemove.push(i);
        }

        if (!toRemove.includes(i)) {
          // Draw projectile
          const img = p.type === 'fire' ? s.imgs.fireball : s.imgs.imagekit;
          if (img) {
            ctx.drawImage(img, p.x, p.y - p.height / 2, p.width, p.height);
          } else {
            ctx.fillStyle = p.type === 'fire' ? '#FF4400' : '#4488FF';
            ctx.fillRect(p.x, p.y - p.height / 2, p.width, p.height);
          }
        }
      }

      // Remove in reverse order
      for (let i = toRemove.length - 1; i >= 0; i--) {
        s.projectiles.splice(toRemove[i], 1);
      }

      // ── HUD
      drawHUD(s);
      drawFloatingTexts(s, now);

      s.rafId = requestAnimationFrame(loop);
    }

    function startGame() {
      if (!stateRef.current) return;
      stateRef.current.gameStartTime = performance.now();
      stateRef.current.lastSpawnTime = performance.now() + 800; // slight delay before first spawn
      scheduleNextSpawn(0);
      stateRef.current.rafId = requestAnimationFrame(loop);
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (stateRef.current) {
        cancelAnimationFrame(stateRef.current.rafId);
      }
    };
  }, [initState, onGameEnd]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
