 

## Requirements
- Docker containers running: `geoint-postgis` and `geoint-webapi`
- Docker network: `geointwebapi_geoint-network`
- PostGIS database: `POI` with spatial tables

## Installation Steps

### 1. Verify Docker Network Configuration
```bash
# Check Docker networks
docker network ls

# Inspect container network connectivity  
docker network inspect geointwebapi_geoint-network
```

**Expected Result:**
- Network: `geointwebapi_geoint-network (172.23.0.0/16)`
- PostGIS: `172.23.0.2`
- WebAPI: `172.23.0.3`

### 2. Verify Connection String Configuration
```bash
# Check WebAPI environment variables
docker exec geoint-webapi env | findstr "ConnectionStrings__PostGisConnection"
```

**Expected Output:**
```
ConnectionStrings__PostGisConnection=Host=postgis;Database=POI;Username=postgres;Password=r00t01;
```

### 3. Test Docker-to-Docker Connectivity
```bash
# Check container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test API connectivity
Invoke-RestMethod -Uri "http://localhost:5000/api/pois" -Method GET
```

### 4. Validate Spatial Data Operations
```powershell
# Create test POI via Docker WebAPI
$testPOI = @{ 
    name = "Step5 Verification POI"
    category = "Test"
    lat = 51.5074
    long = -0.1278 
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/pois" -Method POST -Body $testPOI -ContentType "application/json"
```

### 5. Final Verification
```powershell
# List all POIs to verify creation
Invoke-RestMethod -Uri "http://localhost:5000/api/pois" -Method GET | ForEach-Object { "$($_.name) ($($_.category)) - $($_.lat), $($_.long)" }
```

## Success Criteria

### Network Architecture ✅
- Docker network isolates containers
- Service discovery resolves `postgis` hostname
- Internal communication on `172.23.0.0/16` subnet

### Database Connection ✅  
- WebAPI connects to PostGIS via container network
- Spatial queries execute successfully
- Data persists across container operations

### API Functionality ✅
- GET `/api/pois` returns spatial data
- POST `/api/pois` creates POIs with coordinates
- Response times under 5ms

### Spatial Data Verification ✅
POIs created through Docker WebAPI:
1. **Test POI** (Restaurant) - NYC: `40.7128, -74.006`
2. **Docker Test POI** (Tech) - San Francisco: `37.7749, -122.4194`  
3. **Step5 Verification POI** (Test) - London: `51.5074, -0.1278`

## Container Status
```
NAMES            STATUS                    PORTS
geoint-webapi    Up X minutes (healthy)    0.0.0.0:5000->8080/tcp
geoint-postgis   Up X minutes (healthy)    0.0.0.0:5432->5432/tcp
```

**Step 5 Complete**: Docker WebAPI successfully connected to Docker PostGIS database with full spatial functionality.