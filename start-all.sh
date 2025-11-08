#!/bin/bash

# Redis Monitor - Start All Services
# This script starts Redis, Backend, and Frontend in the correct order

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Redis Monitor - Starting All Services${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Step 1: Start Redis
echo -e "${YELLOW}[1/3] Starting Redis...${NC}"
cd "$PROJECT_ROOT"

if ! docker ps | grep -q redis-monitor; then
    docker-compose up -d
    echo -e "${GREEN}✓ Redis started${NC}"
    
    # Wait for Redis to be ready
    echo -n "Waiting for Redis to be ready..."
    for i in {1..30}; do
        if docker exec redis-monitor redis-cli ping &> /dev/null; then
            echo -e " ${GREEN}Ready!${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
else
    echo -e "${GREEN}✓ Redis already running${NC}"
fi
echo ""

# Step 2: Start Backend
echo -e "${YELLOW}[2/3] Starting Backend (Spring Boot)...${NC}"
cd "$PROJECT_ROOT/backend"

# Check if backend is already running
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}⚠ Port 8080 is already in use${NC}"
    echo "If the backend is already running, skip this step."
    echo "Otherwise, kill the process using: kill \$(lsof -t -i:8080)"
else
    echo "Starting backend in background..."
    nohup mvn spring-boot:run > "$PROJECT_ROOT/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo "$BACKEND_PID" > "$PROJECT_ROOT/.backend.pid"
    
    # Wait for backend to be ready
    echo -n "Waiting for backend to start..."
    for i in {1..60}; do
        if curl -s http://localhost:8080/api/metrics/current/cpu_usage &> /dev/null; then
            echo -e " ${GREEN}Ready!${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
    
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    echo "  View logs: tail -f $PROJECT_ROOT/backend.log"
fi
echo ""

# Step 3: Start Frontend
echo -e "${YELLOW}[3/3] Starting Frontend (Vite)...${NC}"
cd "$PROJECT_ROOT/frontend"

# Check if frontend is already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}⚠ Port 5173 is already in use${NC}"
    echo "If the frontend is already running, skip this step."
else
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi
    
    echo "Starting frontend in background..."
    nohup npm run dev > "$PROJECT_ROOT/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo "$FRONTEND_PID" > "$PROJECT_ROOT/.frontend.pid"
    
    # Wait for frontend to be ready
    echo -n "Waiting for frontend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:5173 &> /dev/null; then
            echo -e " ${GREEN}Ready!${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
    
    echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
    echo "  View logs: tail -f $PROJECT_ROOT/frontend.log"
fi
echo ""

# Summary
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}All Services Started Successfully!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Service Status:"
echo "  • Redis:    http://localhost:6380"
echo "  • Backend:  http://localhost:8080"
echo "  • Frontend: http://localhost:5173"
echo ""
echo "Access the dashboard:"
echo -e "  ${GREEN}http://localhost:5173${NC}"
echo ""
echo "Available dashboards:"
echo "  • http://localhost:5173?dashboard=system-metrics (default)"
echo "  • http://localhost:5173?dashboard=minimal"
echo "  • http://localhost:5173?dashboard=network"
echo ""
echo "To stop all services, run:"
echo "  ./stop-all.sh"
echo ""

# Open browser (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Opening browser..."
    sleep 2
    open http://localhost:5173
fi
