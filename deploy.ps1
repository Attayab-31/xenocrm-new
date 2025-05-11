# Vercel deployment script
Write-Host "🚀 Starting Vercel deployment process..."

# Install Vercel CLI if not already installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Vercel CLI..."
    npm install -g vercel
}

# Build the project
Write-Host "🛠️ Building project..."
npm run build

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..."
vercel --prod

Write-Host "✅ Deployment process completed!"
