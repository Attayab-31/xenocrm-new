# Vercel deployment script
$ErrorActionPreference = "Stop"

try {
    Write-Host "🚀 Starting Vercel deployment process..."

    # Check if Node.js is installed
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        throw "Node.js is not installed. Please install Node.js first."
    }

    # Install Vercel CLI if not already installed
    if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing Vercel CLI..."
        npm install -g vercel
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install Vercel CLI"
        }
    }

    # Install dependencies
    Write-Host "📦 Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }

    # Build the project
    Write-Host "🛠️ Building project..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }

    # Verify environment variables
    Write-Host "🔍 Verifying environment variables..."
    $requiredEnvVars = @(
        "MONGODB_URI",
        "NEXTAUTH_URL",
        "NEXTAUTH_SECRET",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "API_KEY",
        "REDIS_URL"
    )

    foreach ($var in $requiredEnvVars) {
        if ([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($var))) {
            throw "Missing required environment variable: $var"
        }
    }

    # Deploy to Vercel
    Write-Host "🚀 Deploying to Vercel..."
    vercel --prod
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment failed"
    }

    Write-Host "✅ Deployment process completed successfully!"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
