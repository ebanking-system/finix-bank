# ==========================================================
# Finix Bank - Docker Swarm Deployment Script (PowerShell / WSL)
# ==========================================================
param(
    [string]$StackName = "finix"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🏦 Finix Bank - Docker Swarm Stack Deployment" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Initialize Docker Swarm if inactive
$swarmState = wsl docker info --format "{{.Swarm.LocalNodeState}}"
if ($swarmState.Trim() -ne "active") {
    Write-Host "⚙️ Initializing Docker Swarm in WSL..." -ForegroundColor Yellow
    wsl docker swarm init
} else {
    Write-Host "✅ Docker Swarm is already active." -ForegroundColor Green
}

# 2. Build images
Write-Host "🔨 Building Docker images..." -ForegroundColor Yellow
wsl docker compose build

# 3. Deploy Stack
Write-Host "🚀 Deploying stack '$StackName' to Docker Swarm..." -ForegroundColor Yellow
wsl docker stack deploy -c docker-compose.yml $StackName

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "✨ Stack deployed successfully!" -ForegroundColor Green
Write-Host "Inspect services:  wsl docker stack services $StackName"
Write-Host "Inspect tasks:     wsl docker stack ps $StackName"
Write-Host "Frontend App:      http://localhost:3000"
Write-Host "API Gateway:       http://localhost:9090"
Write-Host "Eureka Dashboard:  http://localhost:8761"
Write-Host "RabbitMQ Console:  http://localhost:15672 (guest/guest)"
Write-Host "Tear down stack:   wsl docker stack rm $StackName"
Write-Host "==========================================================" -ForegroundColor Green
