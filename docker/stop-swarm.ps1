# ==========================================================
# Finix Bank - Stop Stack / Compose Script (PowerShell / WSL)
# ==========================================================
param(
    [string]$StackName = "finix"
)

Write-Host "🛑 Stopping Finix Bank services..." -ForegroundColor Yellow

# 1. Check if stack exists and remove it
$swarmState = wsl docker info --format "{{.Swarm.LocalNodeState}}"
if ($swarmState.Trim() -eq "active") {
    Write-Host "Removing Swarm stack '$StackName'..." -ForegroundColor Yellow
    wsl docker stack rm $StackName
}

# 2. Also bring down any standard docker compose containers
Write-Host "Bringing down standard Docker compose containers if any..." -ForegroundColor Yellow
wsl docker compose down --remove-orphans

Write-Host "✅ All Finix Bank services stopped successfully." -ForegroundColor Green
