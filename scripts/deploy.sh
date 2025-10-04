#!/bin/bash

# Deployment script for Vercel
echo "🚀 Starting deployment preparation..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🎉 Ready for deployment!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Connect your GitHub repo to Vercel"
    echo "3. Add Vercel KV database to your project"
    echo "4. Configure environment variables in Vercel dashboard"
    echo "5. Deploy!"
    echo ""
    echo "🔗 Useful links:"
    echo "- Vercel Dashboard: https://vercel.com/dashboard"
    echo "- Vercel KV Setup: https://vercel.com/docs/storage/vercel-kv"
else
    echo "❌ Build failed!"
    echo "Please fix the errors above before deploying."
    exit 1
fi