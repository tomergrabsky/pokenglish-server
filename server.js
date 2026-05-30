const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const STATE_FILE = path.join(__dirname, 'state.json');
const FILES_DIR = path.join(__dirname, 'collected_files');

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
app.use(express.json({ limit: '10mb' }));

// GET /state
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

// POST /state
app.post('/state', (req, res) => {
  try {
    const state = { ...DEFAULT_STATE, ...req.body };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /files - שמור קובץ קוד (לאיסוף הקבצים מbase44)
app.post('/files', (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath || !content) return res.status(400).json({ ok: false });
    const fullPath = path.join(FILES_DIR, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    res.json({ ok: true, path: filePath, size: content.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /files - רשימת קבצים שנאספו
app.get('/files', (req, res) => {
  try {
    const listFiles = (dir, base = '') => {
      const result = [];
      if (!fs.existsSync(dir)) return result;
      for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f);
        const rel = base ? base + '/' + f : f;
        if (fs.statSync(full).isDirectory()) result.push(...listFiles(full, rel));
        else result.push(rel);
      }
      return result;
    };
    res.json({ files: listFiles(FILES_DIR) });
  } catch (e) {
    res.json({ files: [] });
  }
});

app.listen(PORT, () => {
  console.log(`PokeEnglish state server running on port ${PORT}`);
});
