const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

let admin;
try {
  admin = require('./firebase-admin-init');
} catch (error) {
  console.warn('Firebase Admin not configured. Authentication will be disabled.');
  console.warn('To enable auth: Copy firebase-admin-init.example.js to firebase-admin-init.js and configure.');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new Database('notes.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    url TEXT NOT NULL,
    highlighted_text TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: Check if user_id column exists and add it if needed
try {
  const tableInfo = db.prepare(`PRAGMA table_info(notes)`).all();
  const hasUserIdColumn = tableInfo.some(col => col.name === 'user_id');

  if (!hasUserIdColumn) {
    console.log('Migrating database: Adding user_id column...');
    db.exec(`ALTER TABLE notes ADD COLUMN user_id TEXT DEFAULT 'anonymous'`);
    db.exec(`UPDATE notes SET user_id = 'anonymous' WHERE user_id IS NULL OR user_id = ''`);
    console.log('Database migration completed successfully');
  }
} catch (error) {
  console.error('Database migration error:', error);
}

async function authenticateToken(req, res, next) {
  if (!admin) {
    req.user = { uid: 'anonymous', email: 'anonymous@local.dev' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

app.post('/api/notes', authenticateToken, (req, res) => {
  try {
    const { url, highlighted_text, summary } = req.body;
    const userId = req.user.uid;

    if (!url || !highlighted_text || !summary) {
      return res.status(400).json({ error: 'Missing required fields: url, highlighted_text, summary' });
    }

    const stmt = db.prepare('INSERT INTO notes (user_id, url, highlighted_text, summary) VALUES (?, ?, ?, ?)');
    const result = stmt.run(userId, url, highlighted_text, summary);

    res.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Note saved successfully'
    });
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

app.get('/api/notes', authenticateToken, (req, res) => {
  try {
    const userId = req.user.uid;
    const notes = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    res.json({ success: true, notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.get('/api/notes/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.uid;
    const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(req.params.id, userId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ success: true, note });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

app.delete('/api/notes/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.uid;
    const stmt = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?');
    const result = stmt.run(req.params.id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KeepWise server running on port ${PORT}`);
  console.log(`Notes viewer available at http://localhost:${PORT}`);
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.FLY) {
    console.log(`Production environment detected`);
  }
});
