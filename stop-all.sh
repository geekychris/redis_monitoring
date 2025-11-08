#!/bin/bash

# Redis Monitor - Stop All Services
# This script stops Redis, Backend, and Frontend

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}Redis Monitor - Stopping All Services${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo ""

# Stop Frontend
echo -e "${YELLOW}[1/3] Stopping Frontend...${NC}"
if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_ROOT/.frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    else
        echo "Frontend process not found (PID: $FRONTEND_PID)"
    fi
    rm "$PROJECT_ROOT/.frontend.pid"
else
    # Try to find and kill any process on port 5173
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Killing process on port 5173..."
        kill $(lsof -t -i:5173) 2>/dev/null || true
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    else
        echo "Frontend not running"
    fi
fi
echo ""

# Stop Backend
echo -e "${YELLOW}[2/3] Stopping Backend...${NC}"
if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_ROOT/.backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped (PID: $BACKEND_PID)${NC}"
    else
        echo "Backend process not found (PID: $BACKEND_PID)"
    fi
    rm "$PROJECT_ROOT/.backend.pid"
else
    # Try to find and kill any process on port 8080
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Killing process on port 8080..."
        kill $(lsof -t -i:8080) 2>/dev/null || true
        echo -e "${GREEN}✓ Backend stopped${NC}"
    else
        echo "Backend not running"
    fi
fi
echo ""

# Stop Redis
echo -e "${YELLOW}[3/3] Stopping Redis...${NC}"
cd "$PROJECT_ROOT"
if docker ps | grep -q redis-monitor; then
    docker-compose down
    echo -e "${GREEN}✓ Redis stopped${NC}"
else
    echo "Redis not running"
fi
echo ""

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}All Services Stopped${NC}"
echo -e "${GREEN}=====================================${NC}"
