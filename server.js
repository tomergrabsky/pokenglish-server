const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const STATE_FILE = path.join(__dirname, 'state.json');

const DEFAULT_STATE = {
  xp: 0,
  learnedLetters: [],
  learnedWords: [],
  quizStreak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  selectedPokemon: 1
};

app.use(cors());
app.use(express.json());

// GET /state - קבל את ה-state
app.get('/state', (req, res) => {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json(DEFAULT_STATE);
    }
  } catch (e) {
    res.json(DEFAULT_STATE);
  }
});

// POST /state - שמור state
app.post('/state', (req, res) => {
  try {
    const state = { ...DEFAULT_STATE, ...req.body };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`PokeEnglish state server running on port ${PORT}`);
});
