# GeoInt Docker Setup

This document explains how to run GeoInt using Docker with the Init Container Pattern for database migrations.

## Architecture

The Docker setup consists of 3 containers:

1. **PostGIS Database** - PostgreSQL with spatial extensions
2. **Migration Init Container** - Runs EF Core migrations once
3. **WebAPI Container** - Main application (starts after migration)

### Container Dependencies

```
PostGIS (starts first)
   ↓ (health check)
Migration Container (runs migrations, then exits)
   ↓ (completes successfully)
WebAPI Container (starts and serves requests)
```

## Quick Start

### Production Mode
```bash
# Windows
run-docker.cmd production

# Linux/Mac
./run-docker.sh production

# Manual
docker-compose up --build
```

### Development Mode
```bash
# Windows
run-docker.cmd development

# Linux/Mac
./run-docker.sh development

# Manual
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Container Details

### PostGIS Container
- **Image**: `postgis/postgis:15-3.3`
- **Database**: `poi`
- **User**: `postgres` / `r00t01`
- **Port**: `5432` (exposed in dev mode)
- **Health Check**: `pg_isready`

### Migration Container (Init)
- **Purpose**: Run EF Core database migrations
- **Lifecycle**: Starts → Runs migrations → Exits with code 0
- **Dependencies**: Waits for PostGIS to be healthy
- **Command**: `dotnet ef database update`

### WebAPI Container
- **Purpose**: Main application server
- **Port**: `5000:8080`
- **Dependencies**: Waits for migration to complete successfully
- **No Migration Code**: Starts instantly (no blocking)

## Startup Sequence

1. **PostGIS starts** and initializes database
2. **Health check passes** when PostGIS is ready
3. **Migration container starts** and applies schema changes
4. **Migration container exits** with success code
5. **WebAPI container starts** immediately (no delay)
6. **Application ready** for requests

## Management Commands

### Viewing Logs
```bash
# All containers
docker-compose logs -f

# Specific container
docker-compose logs geoint-migration
docker-compose logs geoint-webapi
docker-compose logs geoint-postgis
```

### Container Status
```bash
docker-compose ps
```

Expected output:
```
NAME                 STATUS
geoint-postgis       Up (healthy)
geoint-migration     Exited (0)           # Success!
geoint-webapi        Up                   # Running
```

### Stop Containers
```bash
# Windows
run-docker.cmd down

# Linux/Mac
./run-docker.sh down

# Manual
docker-compose down
```

### Clean Reset
```bash
# Remove containers and volumes
docker-compose down -v --remove-orphans
```

## Development vs Production

### Development (`docker-compose.dev.yml`)
- PostGIS port exposed (`5432`)
- Verbose migration logging
- Development environment variables
- Local data persistence

### Production (`docker-compose.yml`)
- No exposed database ports
- Production environment
- Named volumes for data persistence
- Health checks enabled

## Environment Variables

### PostGIS
- `POSTGRES_DB=poi`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=r00t01`

### WebAPI
- `ConnectionStrings__PostGisConnection=Host=postgis;Database=poi;Username=postgres;Password=r00t01;`
- `FeatureToggles__UsePostGis=true`
- `FeatureToggles__UseSqlServer=false`
- `FeatureToggles__UseMongoDb=false`

## Troubleshooting

### Migration Container Fails
```bash
# Check migration logs
docker-compose logs geoint-migration

# Common issues:
# - PostGIS not ready (wait longer)
# - Connection string incorrect
# - EF migrations syntax error
```

### WebAPI Won't Start
```bash
# Check if migration completed successfully
docker-compose ps

# Migration container should show: Exited (0)
# If Exited (1), check migration logs
```

### Database Connection Issues
```bash
# Test PostGIS directly
docker exec -it geoint-postgis psql -U postgres -d poi -c "SELECT version();"
```

### Reset Everything
```bash
# Windows
run-docker.cmd clean

# Linux/Mac
./run-docker.sh clean
```

## Performance Benefits

### Before (Blocking Migration)
```
App Start → Wait for DB → Run Migration (30s) → App Ready (32s)
```

### After (Init Container)
```
Migration Container → Run Migration (30s) → Exit
App Start → Instant Ready (2s)
```

### Result
- **WebAPI starts instantly** (no migration blocking)
- **Guaranteed migration order** (WebAPI only starts after success)
- **Failure isolation** (if migration fails, WebAPI never starts)
- **Scalable** (multiple WebAPI instances can start after single migration)

## API Endpoints

Once containers are running:

- **API Base URL**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/swagger`
- **Health Check**: `http://localhost:5000/health`

### Test Endpoints
```bash
# Get all TODOs
curl http://localhost:5000/api/todos

# Get all POIs
curl http://localhost:5000/api/pois

# Upload POI CSV
curl -X POST http://localhost:5000/api/pois/bulk-csv \
  -F "file=@pois.csv"
``` 