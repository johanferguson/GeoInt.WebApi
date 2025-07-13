 

## Requirements
- PostGIS container running (from Step 1)
- Database migrated (from Step 2)
- Docker and Docker Compose installed

## Installation Steps

### 1. Assess Current Setup
```bash
# Check available services
docker-compose config --services

# Check existing images
docker images | findstr geoint

# Verify PostGIS container is running
docker-compose ps
```

### 2. Build WebAPI Container
```bash
# Build and start WebAPI (will build image first)
docker-compose up webapi -d
```

**Expected Output:**
- Dockerfile builds multi-stage container
- ASP.NET Core 8.0 runtime image
- Build time: ~38 seconds
- Image: `geointwebapi-webapi`

### 3. Start WebAPI Container (if needed)
```bash
# If container exists but stopped
docker start geoint-webapi

# Check container status
docker ps
```

### 4. Verify WebAPI Started
```bash
# Check container logs
docker logs geoint-webapi --tail 10

# Expected log output:
# Now listening on: http://[::]:8080
# Application started. Press Ctrl+C to shut down.
# Hosting environment: Production
```

## Test WebAPI Container

### Test POI Endpoints
```powershell
# GET all POIs
Invoke-RestMethod -Uri "http://localhost:5000/api/pois" -Method GET

# Create test POI
$testPOI = @{ 
    name = "Docker Test POI"
    category = "Tech" 
    lat = 37.7749
    long = -122.4194 
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/pois" -Method POST -Body $testPOI -ContentType "application/json"
```

## Configuration Details

### Container Network
- **Network**: `geointwebapi_geoint-network`
- **PostGIS Connection**: `Host=postgis;Database=POI;Username=postgres;Password=r00t01`
- **Port Mapping**: `5000` (host) → `8080` (container)

### Environment Variables
```yaml
ASPNETCORE_ENVIRONMENT: Production
ASPNETCORE_URLS: http://+:8080
ConnectionStrings__PostGisConnection: Host=postgis;Database=POI;Username=postgres;Password=r00t01
FeatureToggles__UsePostGis: true
```

### Container Dependencies
```yaml
depends_on:
  postgis:
    condition: service_healthy
  db-migration:
    condition: service_completed_successfully
```

## Success Criteria
- ✅ Container status: `Up (health: starting)`
- ✅ API accessible on `http://localhost:5000`
- ✅ POI endpoints respond with HTTP 200
- ✅ Spatial data operations working
- ✅ Database connectivity through Docker network

## Troubleshooting

### Migration Dependency Issue
If migration fails, start WebAPI directly:
```bash
docker start geoint-webapi
```

### Container Port Conflicts
Change host port if 5000 is in use:
```yaml
ports:
  - "5001:8080"  # Use port 5001 instead
```

### Health Check
Container includes health check on `/api/todos` endpoint every 30 seconds.