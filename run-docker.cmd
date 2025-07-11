@echo off
REM GeoInt Docker Runner Script for Windows
REM Usage: run-docker.cmd [production|development|down|logs]

if "%1"=="production" goto production
if "%1"=="prod" goto production
if "%1"=="development" goto development
if "%1"=="dev" goto development
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="migration-logs" goto migration-logs
if "%1"=="clean" goto clean
if "%1"=="rebuild" goto rebuild
goto help

:production
echo 🚀 Starting GeoInt in Production mode...
docker-compose up --build
goto end

:development
echo 🛠️ Starting GeoInt in Development mode...
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
goto end

:down
echo 🛑 Stopping all GeoInt containers...
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
goto end

:logs
echo 📋 Showing logs for all containers...
docker-compose logs -f
goto end

:migration-logs
echo 📋 Showing migration container logs...
docker-compose logs geoint-migration
goto end

:clean
echo 🧹 Cleaning up containers and volumes...
docker-compose down -v --remove-orphans
docker system prune -f
goto end

:rebuild
echo 🔄 Rebuilding containers...
docker-compose down
docker-compose build --no-cache
docker-compose up
goto end

:help
echo GeoInt Docker Management Script
echo.
echo Usage: %0 [command]
echo.
echo Commands:
echo   production   - Start in production mode
echo   development  - Start in development mode
echo   down         - Stop all containers
echo   logs         - Show all container logs
echo   migration-logs - Show migration container logs
echo   clean        - Remove containers and volumes
echo   rebuild      - Rebuild and restart containers
echo.
echo Examples:
echo   %0 development
echo   %0 logs
echo   %0 down

:end 