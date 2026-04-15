# One Does Not Simply... Dodge
CityJS London 2025 — ImageKit Booth Game

## Setup
1. Drop assets into `client/src/assets/`:
   `frodo.png`, `saruman.png`, `fireball.png`, `ice-logo.png`, `lotr-background.jpg`
2. Ensure MongoDB is running locally
3. `npm install` in project root
4. `cd server && npm install` (express, mongoose, cors)
5. `cd client && npm install` (vite, react, react-dom)
6. Back in root: `npm run dev`
7. Open `localhost:5173` in Chrome, press F11 for fullscreen

## Tuning
- THRESHOLD (min score for draw entry): `EndScreen.jsx` top constant
- Projectile speed curve: `getProjectileSpeed()` in `GameScreen.jsx`
- Spawn frequency: `scheduleNextSpawn()` in `GameScreen.jsx`
- Jump feel: `JUMP_SHORT` / `JUMP_LONG` constants in `GameScreen.jsx`

## Operator Panel
Click "Operator" bottom-right. Password: `cityjs2025`
- View live stats
- Export CSV of all players
- Run lucky draw at end of day
- Reset scores for a new event day

## Prizes
- **Top Score**: Claude Max × 5 (3 months) — tracked automatically on leaderboard
- **Lucky Draw**: LOTR Lego Set — run from Operator Panel at end of day
  Draw is open only to players who scored above the THRESHOLD.

## Controls
- **Spacebar (tap)** → short hop (clears 1 projectile at foot level)
- **Spacebar (hold 200ms+)** → high leap (clears 2 close projectiles)
