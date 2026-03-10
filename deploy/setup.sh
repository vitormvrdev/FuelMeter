#!/bin/bash
# FuelMeter deployment script for homelab
# Run this on the server: bash /opt/fuelmeter/deploy/setup.sh

set -e

echo "=== FuelMeter Deployment ==="

# 1. Clone repo
echo "[1/5] Cloning repo..."
if [ -d /opt/fuelmeter/.git ]; then
    cd /opt/fuelmeter && git pull
else
    git clone https://github.com/vitormvrdev/FuelMeter.git /opt/fuelmeter
fi

# 2. Build and start container
echo "[2/5] Building Docker image..."
cd /opt/fuelmeter
docker compose -f deploy/docker-compose.yml build

echo "[3/5] Starting FuelMeter..."
docker compose -f deploy/docker-compose.yml up -d

# 3. Run database migration
echo "[4/5] Running database migration..."
sleep 3
docker exec fuelmeter sh -c "npx prisma migrate deploy" 2>/dev/null || echo "Migration will run on first start"

# 4. Update nginx config
echo "[5/5] Updating nginx..."
# Append FuelMeter config to nginx if not already present
if ! grep -q "fuelmeter" /opt/nginx/conf/default.conf 2>/dev/null; then
    cat /opt/fuelmeter/deploy/nginx-fuelmeter.conf >> /opt/nginx/conf/default.conf
    docker exec nginx nginx -s reload
    echo "nginx config updated and reloaded"
else
    echo "nginx config already contains fuelmeter block"
fi

echo ""
echo "=== Done! ==="
echo "Local:     https://192.168.1.100:3003"
echo "Tailscale: https://100.80.32.104:3003"
echo ""
echo "Add to your phone: open the URL in Safari/Chrome and 'Add to Home Screen'"
