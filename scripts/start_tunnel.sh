#!/bin/bash

echo "-> Cleaning up old cloudflared processes..."
pkill -9 cloudflared 2>/dev/null || true

echo "-> Starting Cloudflare Tunnel..."
rm -f tunnel.log

cloudflared tunnel --url http://localhost:8000 > tunnel.log 2>&1 &
TUNNEL_PID=$!

echo "-> Waiting for Cloudflare Tunnel URL..."
URL=""
RETRY_COUNT=0
MAX_RETRIES=3

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    for i in {1..30}; do
        # Regex to extract trycloudflare URL
        URL=$(grep -oE "https://[a-zA-Z0-9-]+\.trycloudflare\.com" tunnel.log | head -n 1)
        if [ -n "$URL" ]; then
            break 2
        fi
        sleep 1
    done

    echo "-> ERROR: Failed to get Cloudflare URL within 30s. Retrying... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
    pkill -9 cloudflared 2>/dev/null || true
    rm -f tunnel.log
    cloudflared tunnel --url http://localhost:8000 > tunnel.log 2>&1 &
    TUNNEL_PID=$!
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ -z "$URL" ]; then
    echo "-> FATAL: Could not get Cloudflare URL after 3 retries. Logs:"
    cat tunnel.log
    exit 1
fi

echo "========================================="
echo "Tunnel is active!"
echo "Public URL: $URL"
echo "========================================="

if [ -f "mitra-verify/.env.local" ]; then
    echo "-> Updating frontend config..."
    if grep -q "^NEXT_PUBLIC_API_URL=" mitra-verify/.env.local; then
        sed -i '' "s|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$URL|g" mitra-verify/.env.local
    else
        echo -e "\nNEXT_PUBLIC_API_URL=$URL" >> mitra-verify/.env.local
    fi
else
    echo "-> Error: mitra-verify/.env.local not found!"
fi
