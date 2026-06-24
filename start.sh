#!/bin/bash

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/Backend"
FRONTEND="$ROOT/Frontend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[start]${NC} $1"; }
warn() { echo -e "${YELLOW}[start]${NC} $1"; }

# Install deps
log "Installing backend dependencies..."
cd "$BACKEND" && npm install

log "Installing frontend dependencies..."
cd "$FRONTEND" && npm install

# Start backend
log "Starting backend..."
cd "$BACKEND" && npm run dev &
BACKEND_PID=$!

# Start frontend
log "Starting frontend..."
cd "$FRONTEND" && npm run dev &
FRONTEND_PID=$!

warn "Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
warn "Press Ctrl+C to stop both servers."

# Kill both on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
