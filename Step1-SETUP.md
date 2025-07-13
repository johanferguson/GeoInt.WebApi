 

## Requirements
- Docker Desktop running
- PowerShell/Terminal access
- Project cloned to local machine

## Configuration Issues Found & Fixed
- Database name mismatch: `poi` → `POI` (match appsettings.json)
- Missing `init-scripts/` directory referenced in docker-compose.yml

## Installation Steps

### 1. Create Missing Directory
```bash
mkdir init-scripts
```
**Why**: Docker-compose.yml references this directory for database initialization scripts

### 2. Fix Database Name Configuration
Updated `docker-compose.yml` and `docker-compose.dev.yml`:
- `POSTGRES_DB: poi` → `POSTGRES_DB: POI`
- Health check: `pg_isready -U postgres -d poi` → `pg_isready -U postgres -d POI`
- Connection strings: `Database=poi` → `Database=POI`

**Why**: Match database name in appsettings.json to prevent connection issues

### 3. Start PostGIS Container
```bash
docker-compose up postgis -d
```
**Why**: Start only PostGIS service in detached mode for isolated testing

### 4. Verify Container Status
```bash
docker-compose ps
```
**Why**: Confirm container is running and healthy

### 5. Test Database Connectivity
```bash
docker exec geoint-postgis pg_isready -U postgres -d POI
```
**Why**: Verify PostgreSQL accepts connections on correct database

## Result
- **Container**: `geoint-postgis` running healthy
- **Image**: `postgis/postgis:15-3.3` (PostgreSQL 15.4 + PostGIS 3.3)
- **Database**: `POI` 
- **Port**: `localhost:5432`
- **Credentials**: `postgres/r00t01`
- **Status**: Ready for migrations

## Next Step
Step 2: Migrate to PostGIS Container from local PC