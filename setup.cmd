 @echo off
echo Pulling required base images...
docker pull nginx:alpine
docker pull node:18-alpine

echo Starting services with docker-compose...
docker-compose up -d --build

echo Done! Services should be running on:
echo - Frontend: http://localhost:5001
echo - API: http://localhost:5000
echo - Database: localhost:5432