#!/bin/bash

# Build script for KeepWise Chrome Extension

set -e  # Exit on any error

echo "🚀 Building KeepWise Extension..."

# Clean previous build
rm -rf extension-pack
rm -f keepwise-extension.zip

# Create extension pack directory
mkdir -p extension-pack

# Copy required extension files
echo "📦 Copying extension files..."
cp manifest.json popup.html popup.js popup.css panel.html panel.js contentScript.js devtools.html devtools.js logo.png extension-pack/

# Copy README if it exists, otherwise create one
if [ -f extension-pack/README.md ]; then
    echo "📄 README already exists"
else
    cat > extension-pack/README.md << 'EOF'
# KeepWise Chrome Extension

Intelligent text summarization using Chrome's built-in Summarizer API (Gemini Nano).

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select this folder
5. The extension icon should appear in your toolbar!

## Usage

1. **Summarize Text**: Highlight any text on any web page, click KeepWise icon, click "✨ Summarize"
2. **Save Notes**: After summarizing, click "💾 Save Note" and sign in
3. **View Notes**: Visit https://keep-wise.onrender.com

See main project README for full documentation.

## Requirements

- Chrome/Edge 127+ with Summarizer API support
- Internet connection for syncing

## Version

Current version: 1.0.0

EOF
fi

# Create ZIP file
echo "📦 Creating ZIP archive..."
cd extension-pack
zip -r ../keepwise-extension.zip . -x "*.DS_Store" "*.git*" > /dev/null 2>&1
cd ..

# Get file size
SIZE=$(ls -lh keepwise-extension.zip | awk '{print $5}')

echo "✅ Build complete!"
echo "📦 Extension packed: keepwise-extension.zip ($SIZE)"
echo ""
echo "🎯 Next steps:"
echo "  1. Test: Load extension-pack/ in Chrome as 'Load unpacked'"
echo "  2. Distribute: Share keepwise-extension.zip with users"
echo "  3. Or publish: Upload to Chrome Web Store"
echo ""
echo "📖 See BUILD_EXTENSION.md for more distribution options"

