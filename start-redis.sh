#!/bin/bash

# Start Redis via Docker Compose

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "Starting Redis..."
docker-compose up -d

echo "Waiting for Redis to be ready..."
for i in {1..30}; do
    if docker exec redis-monitor redis-cli ping &> /dev/null; then
        echo "✓ Redis is ready!"
        echo ""
        echo "Redis connection details:"
        echo "  Host: localhost"
        echo "  Port: 6380"
        echo "  Container: redis-monitor"
        echo ""
        echo "Test connection:"
        echo "  docker exec -it redis-monitor redis-cli ping"
        exit 0
    fi
    sleep 1
done

echo "⚠ Redis is taking longer than expected to start"
echo "Check logs: docker logs redis-monitor"
