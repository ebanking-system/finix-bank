#!/usr/bin/env bash
# ==========================================================
# Finix Bank - Docker Swarm Deployment Script (WSL / Linux)
# ==========================================================
set -e

STACK_NAME="finix"

echo "=========================================================="
echo "🏦 Finix Bank - Docker Swarm Stack Deployment"
echo "=========================================================="

# 1. Initialize Docker Swarm if not active
SWARM_STATE=$(docker info --format '{{.Swarm.LocalNodeState}}')
if [ "$SWARM_STATE" != "active" ]; then
    echo "⚙️ Initializing Docker Swarm on local node..."
    docker swarm init
else
    echo "✅ Docker Swarm is already active."
fi

# 2. Build images locally
echo "🔨 Building service images with resource-efficient multi-stage builds..."
docker compose build

# 3. Deploy the stack to Docker Swarm
echo "🚀 Deploying stack '$STACK_NAME' to Swarm..."
docker stack deploy -c docker-compose.yml "$STACK_NAME"

echo "=========================================================="
echo "✨ Stack deployed successfully!"
echo "Inspect running services: docker stack services $STACK_NAME"
echo "Inspect tasks/containers:  docker stack ps $STACK_NAME"
echo "View application:         http://localhost:3000"
echo "API Gateway:              http://localhost:9090"
echo "Eureka Registry:          http://localhost:8761"
echo "RabbitMQ Console:         http://localhost:15672 (guest/guest)"
echo "To tear down:             docker stack rm $STACK_NAME"
echo "=========================================================="
