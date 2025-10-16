# Warehouse Management System Production Deployment Script for Windows
# Make sure Docker Desktop is installed and running

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Warehouse Management System Deployment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please create it and configure your settings." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Pre-deployment checks..." -ForegroundColor Yellow

# Load environment variables (simple approach for PowerShell)
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

# Validate required environment variables
$requiredVars = @("DB_PASSWORD", "JWT_SECRET", "FRONTEND_URL")
foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "❌ Required environment variable $var is not set" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Environment variables validated" -ForegroundColor Green

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow

# Wait for database to be ready
Write-Host "📊 Waiting for database..." -ForegroundColor Blue
$maxAttempts = 30
$attempt = 1

while ($attempt -le $maxAttempts) {
    try {
        $result = docker-compose -f docker-compose.prod.yml exec -T database pg_isready -U warehouse_user -d warehouse_production 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database is ready" -ForegroundColor Green
            break
        }
    } catch {
        # Continue trying
    }
    
    if ($attempt -eq $maxAttempts) {
        Write-Host "❌ Database failed to start after $maxAttempts attempts" -ForegroundColor Red
        docker-compose -f docker-compose.prod.yml logs database
        exit 1
    }
    
    Write-Host "⏳ Database attempt $attempt/$maxAttempts..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    $attempt++
}

# Wait for backend to be ready
Write-Host "🔧 Waiting for backend API..." -ForegroundColor Blue
$maxAttempts = 20
$attempt = 1

while ($attempt -le $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/health" -Method Get -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend API is ready" -ForegroundColor Green
            break
        }
    } catch {
        # Continue trying
    }
    
    if ($attempt -eq $maxAttempts) {
        Write-Host "❌ Backend API failed to start after $maxAttempts attempts" -ForegroundColor Red
        docker-compose -f docker-compose.prod.yml logs backend
        exit 1
    }
    
    Write-Host "⏳ Backend attempt $attempt/$maxAttempts..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    $attempt++
}

# Wait for frontend to be ready
Write-Host "🎨 Waiting for frontend..." -ForegroundColor Blue
$maxAttempts = 10
$attempt = 1

while ($attempt -le $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/health" -Method Get -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend is ready" -ForegroundColor Green
            break
        }
    } catch {
        # Continue trying
    }
    
    if ($attempt -eq $maxAttempts) {
        Write-Host "❌ Frontend failed to start after $maxAttempts attempts" -ForegroundColor Red
        docker-compose -f docker-compose.prod.yml logs frontend
        exit 1
    }
    
    Write-Host "⏳ Frontend attempt $attempt/$maxAttempts..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    $attempt++
}

# Run database setup
Write-Host "📊 Running database setup..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml exec -T backend npm run setup

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Service Status:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "🔗 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "   Health Check: http://localhost/health" -ForegroundColor White
Write-Host ""

Write-Host "👤 Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host "   ⚠️  Please change the admin password immediately!" -ForegroundColor Red
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Change default admin password" -ForegroundColor White
Write-Host "   2. Update .env file with your domain and secure passwords" -ForegroundColor White
Write-Host "   3. Set up SSL certificates if deploying to production" -ForegroundColor White
Write-Host "   4. Configure backup strategy" -ForegroundColor White
Write-Host "   5. Set up monitoring and logging" -ForegroundColor White
Write-Host ""

Write-Host "✅ Warehouse Management System is now running!" -ForegroundColor Green