#!/bin/bash

# Start Backend (Spring Boot)

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT/backend"

# Check if port is already in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠ Error: Port 8080 is already in use"
    echo "Kill the process using: kill \$(lsof -t -i:8080)"
    exit 1
fi

echo "Starting Spring Boot backend..."
echo "This will run in the foreground. Press Ctrl+C to stop."
echo ""

mvn spring-boot:run
