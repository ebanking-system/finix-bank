#!/usr/bin/env bash
# ==========================================================
# Finix Bank - Stop Stack / Compose Script (WSL / Linux)
# ==========================================================
set -e

STACK_NAME="finix"

echo "🛑 Stopping Finix Bank services..."

# 1. Remove Swarm stack if Swarm is active
SWARM_STATE=$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null || echo "inactive")
if [ "$SWARM_STATE" = "active" ]; then
    echo "Removing Swarm stack '$STACK_NAME'..."
    docker stack rm "$STACK_NAME" 2>/dev/null || true
fi

# 2. Bring down any standard compose containers
echo "Bringing down Docker compose containers..."
docker compose down --remove-orphans 2>/dev/null || true

echo "✅ All Finix Bank services stopped successfully."
