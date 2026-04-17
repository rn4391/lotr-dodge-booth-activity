const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// POST /api/scores — save a new score
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      score,
      multiplierReached,
      fireballsDodged,
      imagekitCollected,
      imagekitAwareness,
      qualifiedForDraw,
    } = req.body;

    const doc = new Score({
      name,
      email,
      score,
      multiplierReached,
      fireballsDodged,
      imagekitCollected,
      imagekitAwareness,
      qualifiedForDraw,
    });

    const saved = await doc.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scores/leaderboard — top 10 by score desc, timestamp asc
router.get('/leaderboard', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const scores = await Score.find({ timestamp: { $gte: todayStart } })
      .sort({ score: -1, timestamp: 1 })
      .limit(10)
      .select('name score multiplierReached fireballsDodged imagekitCollected timestamp');

    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scores/stats
router.get('/stats', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const scores = await Score.find({ timestamp: { $gte: todayStart } });
    const totalPlayers = scores.length;
    const averageScore =
      totalPlayers > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalPlayers)
        : 0;
    const totalImagekitCollected = scores.reduce(
      (sum, s) => sum + (s.imagekitCollected || 0),
      0
    );

    const awarenessBreakdown = { usedIt: 0, heardOfIt: 0, didNotKnow: 0 };
    scores.forEach((s) => {
      if (s.imagekitAwareness === 'Yes, have used it') awarenessBreakdown.usedIt++;
      else if (s.imagekitAwareness === 'Only heard about it, never used it')
        awarenessBreakdown.heardOfIt++;
      else if (s.imagekitAwareness === 'Did not know about it')
        awarenessBreakdown.didNotKnow++;
    });

    const topScoreDoc = await Score.findOne({ timestamp: { $gte: todayStart } })
      .sort({ score: -1 })
      .select('name score');

    res.json({
      totalPlayers,
      averageScore,
      totalImagekitCollected,
      awarenessBreakdown,
      topScore: topScoreDoc
        ? { name: topScoreDoc.name, score: topScoreDoc.score }
        : { name: '', score: 0 },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scores/draw — pick random qualifying winner
router.post('/draw', async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== 'cityjs2025') {
      return res.status(403).json({ error: 'Invalid password' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const qualified = await Score.find({
      qualifiedForDraw: true,
      timestamp: { $gte: todayStart },
    }).select('name email score');

    if (qualified.length === 0) {
      return res.status(404).json({ error: 'No qualifying entries found' });
    }

    // Deduplicate by email — each person gets one ticket
    const seen = new Set();
    const unique = qualified.filter(e => {
      if (seen.has(e.email)) return false;
      seen.add(e.email);
      return true;
    });

    const winner = unique[Math.floor(Math.random() * unique.length)];
    res.json({ winner: { name: winner.name, email: winner.email, score: winner.score } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scores/export — CSV download
router.get('/export', async (req, res) => {
  try {
    const scores = await Score.find().sort({ timestamp: -1 });
    const header =
      'Name,Email,Score,MultiplierReached,FireballsDodged,ImageKitCollected,Awareness,Timestamp\n';
    const rows = scores
      .map(
        (s) =>
          `"${s.name}","${s.email}",${s.score},${s.multiplierReached},${s.fireballsDodged},${s.imagekitCollected},"${s.imagekitAwareness}","${s.timestamp.toISOString()}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cityjs-scores.csv"');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/scores/reset — clear today's scores
router.delete('/reset', async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== 'cityjs2025') {
      return res.status(403).json({ error: 'Invalid password' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const result = await Score.deleteMany({ timestamp: { $gte: todayStart } });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
