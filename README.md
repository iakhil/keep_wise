# KeepWise - Intelligent Text Summarization

A Chrome extension that uses Chrome's built-in Summarizer API (Gemini Nano) to summarize highlighted text and save it as searchable notes with Firebase authentication.

![KeepWise Logo](logo.png)

## Features

- 🧠 **AI-Powered Summarization**: Uses Chrome's built-in Gemini Nano model
- 💾 **Save & Organize**: Store highlighted text, URLs, and summaries
- 🔐 **Secure**: Firebase Authentication with Email/Password and Google Sign-In
- 🌐 **Web Viewer**: Access your notes from any device via web interface
- 🎨 **Modern UI**: Elegant dark theme interface
- ⚡ **DevTools Panel**: Professional developer tools integration

## Quick Start

### Installation

1. Clone this repository:
```bash
git clone https://github.com/YOUR_USERNAME/keepwise.git
cd keepwise
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Copy `public/firebase-init.js.example` to `public/firebase-init.js`
   - Add your Firebase web configuration (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md))
   - For backend auth, copy `firebase-admin-init.example.js` to `firebase-admin-init.js`
   - Add your Firebase service account credentials

4. Start the server:
```bash
npm start
```

5. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `keepwise` directory

### Usage

1. **Summarize Text**: 
   - Highlight any text on a web page
   - Click the KeepWise extension icon
   - Click "✨ Summarize" to generate a summary

2. **Save Notes**: 
   - After summarizing, click "💾 Save Note"
   - Sign in if prompted (first time only)
   - Your note will be saved with the URL and timestamp

3. **View Notes**:
   - Visit `http://localhost:3000` in your browser
   - Sign in with your Firebase account
   - Browse, search, and delete your saved notes

### DevTools Panel

For power users, open Chrome DevTools → "KeepWise" tab to access additional features.

## Architecture

```
KeepWise/
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
├── popup.css           # Popup styles
├── contentScript.js    # Injected into web pages
├── panel.html          # DevTools panel UI
├── panel.js            # DevTools panel logic
├── manifest.json       # Extension manifest
├── server.js           # Express.js backend
├── package.json        # Dependencies
├── public/             # Web interface
│   ├── index.html      # Main notes viewer
│   ├── app.js          # Frontend logic
│   ├── styles.css      # Website styles
│   ├── firebase-init.js # Firebase config
│   └── auth-helper.js  # Auth token sync
└── logo.png            # KeepWise logo
```

## API Endpoints

All endpoints require Firebase authentication (unless running without Firebase):

- `POST /api/notes` - Save a new note
- `GET /api/notes` - Get all user's notes
- `GET /api/notes/:id` - Get a specific note
- `DELETE /api/notes/:id` - Delete a note

## Deployment

Quick deploy to Render:

```bash
# Push to GitHub
git push origin main

# Follow deployment instructions
# See DEPLOYMENT.md for detailed guide
```

Or see [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions for Render, Railway, Fly.io, or VPS.

## Technologies Used

- **Chrome Extension API**: Manifest V3, Summarizer API
- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Authentication**: Firebase Auth (Email/Password, Google)
- **Frontend**: Vanilla JavaScript, HTML, CSS

## Requirements

- Node.js 16+ 
- Chrome/Edge browser with Summarizer API support
- Firebase account (for authentication)
- Git (for deployment)

## Browser Support

Currently supports:
- ✅ Chrome 127+ (with Summarizer API)
- ✅ Edge 127+ (with Summarizer API)
- 🚧 Firefox (coming soon)
- 🚧 Safari (coming soon)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation in `/docs`

## Acknowledgments

- Built using Chrome's [Summarizer API](https://developer.chrome.com/docs/ai/summarizer-api)
- Powered by Google's Gemini Nano model
- Authentication by Firebase

---

Made with ❤️ for intelligent note-taking

