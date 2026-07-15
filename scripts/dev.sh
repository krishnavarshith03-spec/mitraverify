#!/bin/bash
cd "$(dirname "$0")/.."

trap 'echo -e "\nShutting down..."; lsof -ti:8000 | xargs kill -9 2>/dev/null || true; lsof -ti:3005 | xargs kill -9 2>/dev/null || true; pkill -9 cloudflared 2>/dev/null || true; exit 0' SIGINT SIGTERM EXIT

echo "========================================="
echo "MITRA VERIFY - Idempotent Local Deploy"
echo "========================================="

# 1. Start Backend & Wait for Health
./scripts/start_backend.sh
if [ $? -ne 0 ]; then
    echo "Backend failed to start. Exiting."
    exit 1
fi

# 2. Start Tunnel & Get URL
./scripts/start_tunnel.sh
if [ $? -ne 0 ]; then
    echo "Tunnel failed to start. Exiting."
    exit 1
fi

# 3. Start Frontend
echo "-> Starting Next.js Frontend..."
lsof -ti:3005 | xargs kill -9 2>/dev/null || true
cd mitra-verify
npm run dev &
cd ..

echo "========================================="
echo "Deployment Successful!"
echo "Frontend: http://localhost:3005"
echo "API URL:  $(grep NEXT_PUBLIC_API_URL mitra-verify/.env.local | cut -d '=' -f 2)"
echo "API Docs: $(grep NEXT_PUBLIC_API_URL mitra-verify/.env.local | cut -d '=' -f 2)/docs"
echo "========================================="

wait
