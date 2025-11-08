#!/bin/bash

# Start Frontend (Vite)

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT/frontend"

# Check if port is already in use
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠ Error: Port 5173 is already in use"
    echo "Kill the process using: kill \$(lsof -t -i:5173)"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting Vite development server..."
echo "This will run in the foreground. Press Ctrl+C to stop."
echo ""

npm run dev
