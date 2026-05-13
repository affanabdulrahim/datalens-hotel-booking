#!/usr/bin/env bash
# DataLens — single-command startup for macOS/Linux
set -e

echo "Starting DataLens — Hotel Booking Dashboard..."

# Start backend in background
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID) → http://localhost:8000/docs"

# Install frontend deps if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    (cd frontend && npm install)
fi

# Start frontend in background
(cd frontend && npm run dev) &
FRONTEND_PID=$!
echo "Frontend started (PID $FRONTEND_PID) → http://localhost:5173"

echo ""
echo "=============================================="
echo " DataLens is running!"
echo " Frontend: http://localhost:5173"
echo " Backend:  http://localhost:8000/docs"
echo " Press Ctrl+C to stop both servers."
echo "=============================================="

# Wait and clean up on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
