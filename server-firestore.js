const express = require('express');
const cors = require('cors');
const path = require('path');

let admin;
let db; // Firestore database
try {
  admin = require('./firebase-admin-init');
  db = admin.firestore();
  console.log('✅ Firebase Admin and Firestore initialized successfully');
} catch (error) {
  console.warn('⚠️  Firebase Admin not configured. Authentication will be disabled.');
  console.warn('To enable auth: Copy firebase-admin-init.example.js to firebase-admin-init.js and configure.');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

// POST /api/notes - Create a new note
app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { url, highlighted_text, summary } = req.body;
    const userId = req.user.uid;

    if (!url || !highlighted_text || !summary) {
      return res.status(400).json({ error: 'Missing required fields: url, highlighted_text, summary' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const noteData = {
      user_id: userId,
      url: url,
      highlighted_text: highlighted_text,
      summary: summary,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('notes').add(noteData);

    res.json({
      success: true,
      id: docRef.id,
      message: 'Note saved successfully'
    });
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// GET /api/notes - Get all notes for the user
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const snapshot = await db.collection('notes')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .get();

    const notes = [];
    snapshot.forEach(doc => {
      notes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({ success: true, notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET /api/notes/:id - Get a specific note
app.get('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const noteId = req.params.id;

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const doc = await db.collection('notes').doc(noteId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = doc.data();
    
    // Verify the note belongs to the user
    if (noteData.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ 
      success: true, 
      note: {
        id: doc.id,
        ...noteData
      }
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// DELETE /api/notes/:id - Delete a note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const noteId = req.params.id;

    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const doc = await db.collection('notes').doc(noteId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = doc.data();

    // Verify the note belongs to the user
    if (noteData.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.collection('notes').doc(noteId).delete();

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Serve the notes viewer page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KeepWise server running on port ${PORT}`);
  console.log(`📝 Notes viewer available at http://localhost:${PORT}`);
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.FLY) {
    console.log(`🌍 Production environment detected`);
  }
  if (db) {
    console.log(`✅ Using Firestore as database`);
  } else {
    console.log(`⚠️  Database not configured - using anonymous mode`);
  }
});

