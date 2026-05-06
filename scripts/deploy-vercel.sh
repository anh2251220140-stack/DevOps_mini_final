#!/bin/bash
# Quick deployment script for Vercel
# Usage: ./scripts/deploy-vercel.sh

set -e

echo "🚀 Preparing for Vercel Deployment..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit first."
    exit 1
fi

# Build frontend
echo "📦 Building Frontend..."
cd Frontend
npm install
npm run lint
npm run build
cd ..

# Validate backend
echo "✅ Validating Backend..."
cd Backend
npm install
node --check src/server.js
node --check api/index.js
cd ..

# Validate Vercel configuration
echo "🔍 Checking Vercel configuration..."
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found!"
    exit 1
fi

echo "✨ Ready for deployment!"
echo ""
echo "📝 Next steps:"
echo "1. Push to GitHub: git push"
echo "2. Go to https://vercel.com"
echo "3. Import project from GitHub"
echo "4. Add environment variables (see DEPLOYMENT_VI.md)"
echo "5. Deploy!"
echo ""
echo "Or run: vercel --prod"
