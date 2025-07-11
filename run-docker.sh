#!/bin/bash

# GeoInt Docker Runner Script
# Usage: ./run-docker.sh [production|development|down|logs]

case "$1" in
    "production" | "prod")
        echo "🚀 Starting GeoInt in Production mode..."
        docker-compose up --build
        ;;
    "development" | "dev")
        echo "🛠️ Starting GeoInt in Development mode..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
        ;;
    "down")
        echo "🛑 Stopping all GeoInt containers..."
        docker-compose down
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
        ;;
    "logs")
        echo "📋 Showing logs for all containers..."
        docker-compose logs -f
        ;;
    "migration-logs")
        echo "📋 Showing migration container logs..."
        docker-compose logs geoint-migration
        ;;
    "clean")
        echo "🧹 Cleaning up containers and volumes..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        ;;
    "rebuild")
        echo "🔄 Rebuilding containers..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up
        ;;
    *)
        echo "GeoInt Docker Management Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  production   - Start in production mode"
        echo "  development  - Start in development mode"
        echo "  down         - Stop all containers"
        echo "  logs         - Show all container logs"
        echo "  migration-logs - Show migration container logs"
        echo "  clean        - Remove containers and volumes"
        echo "  rebuild      - Rebuild and restart containers"
        echo ""
        echo "Examples:"
        echo "  $0 development"
        echo "  $0 logs"
        echo "  $0 down"
        ;;
esac 