# Building the KeepWise Extension for Distribution

Instructions for packaging the extension for distribution to users.

## Quick Build

Run this command in the project root:

```bash
./build-extension.sh
```

This will create a `keepwise-extension.zip` file ready for distribution.

## Manual Build

1. **Create extension pack directory:**
```bash
mkdir -p extension-pack
```

2. **Copy required files:**
```bash
cp manifest.json popup.html popup.js popup.css panel.html panel.js contentScript.js devtools.html devtools.js logo.png extension-pack/
```

3. **Copy README:**
```bash
cp extension-pack/README.md extension-pack/ 2>/dev/null || cat > extension-pack/README.md << 'EOF'
# KeepWise Chrome Extension
Intelligent text summarization using Chrome's built-in Summarizer API.
See main project README for details.
EOF
```

4. **Create ZIP:**
```bash
cd extension-pack
zip -r ../keepwise-extension.zip . -x "*.DS_Store"
cd ..
```

## Distribution Options

### Option 1: Direct Distribution

Distribute the `keepwise-extension.zip` file and instruct users to:

1. Extract the ZIP
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extracted folder

### Option 2: Chrome Web Store

To publish to Chrome Web Store:

1. Create a ZIP of the unpacked extension (not the folder itself)
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Create new item
4. Upload the ZIP
5. Fill out store listing details
6. Submit for review

**Requirements for Chrome Web Store:**
- Icons: 16x16, 32x32, 48x48, 128x128, 256x256
- Screenshots: 1 mandatory, up to 5 total
- Privacy policy (if collecting user data)
- Terms of service
- Promotional images

### Option 3: GitHub Releases

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Upload `keepwise-extension.zip` as an asset
4. Tag version (e.g., `v1.0.0`)
5. Add release notes

## File Checklist

Ensure these files are included in the extension pack:

- ✅ `manifest.json` - Extension configuration
- ✅ `popup.html` - Popup UI
- ✅ `popup.js` - Popup logic
- ✅ `popup.css` - Popup styles
- ✅ `panel.html` - DevTools panel UI
- ✅ `panel.js` - DevTools panel logic
- ✅ `contentScript.js` - Content script
- ✅ `devtools.html` - DevTools page
- ✅ `devtools.js` - DevTools registration
- ✅ `logo.png` - Extension icon
- ✅ `README.md` - User instructions

## Testing the Packaged Extension

Before distribution, test the ZIP:

1. Extract it to a temporary folder
2. Load it in Chrome using "Load unpacked"
3. Test all features:
   - Summarize text
   - Save notes
   - View DevTools panel
   - Sign in/out

## Version Updates

When updating the extension:

1. Update `manifest.json` version
2. Rebuild the extension pack
3. Create new release/distribution
4. Notify users of update

## Notes

- The extension pack should be small (< 2MB typically)
- Logo.png is the largest file (~1.4MB) - consider optimizing if needed
- Never include sensitive files like `.env` or `firebase-admin-init.js`
- Extension pack is in `.gitignore` - rebuild after changes

