#!/bin/bash
set -e

echo "-> Checking port 8000..."
# Kill any process on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo "-> Booting FastAPI Backend..."
cd mitra-verify-backend
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run in background
uvicorn app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid

echo "-> Waiting for backend to be healthy..."
for i in {1..30}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health || true)
    if [ "$STATUS" == "200" ]; then
        echo "-> Backend is healthy!"
        exit 0
    fi
    sleep 1
done

echo "-> Backend failed to become healthy within 30 seconds. Logs:"
cat backend.log
exit 1
