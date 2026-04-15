const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  score: { type: Number, required: true },
  multiplierReached: { type: Number, default: 1 },
  fireballsDodged: { type: Number, default: 0 },
  imagekitCollected: { type: Number, default: 0 },
  imagekitAwareness: { type: String, default: '' },
  qualifiedForDraw: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Score', ScoreSchema);
