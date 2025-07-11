# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files for better layer caching
COPY *.sln .
COPY GeoInt.WebApi/GeoInt.WebApi.csproj GeoInt.WebApi/
COPY GeoInt.Core/GeoInt.Core.csproj GeoInt.Core/
COPY GeoInt.Application/GeoInt.Application.csproj GeoInt.Application/
COPY GeoInt.Application.POI/GeoInt.Application.POI.csproj GeoInt.Application.POI/
COPY GeoInt.Application.Todo/GeoInt.Application.Todo.csproj GeoInt.Application.Todo/
COPY GeoInt.Domain.POI/GeoInt.Domain.POI.csproj GeoInt.Domain.POI/
COPY GeoInt.Domain.Todo/GeoInt.Domain.Todo.csproj GeoInt.Domain.Todo/
COPY GeoInt.Persistance.PostGis/GeoInt.Persistance.PostGis.csproj GeoInt.Persistance.PostGis/
COPY GeoInt.Persistence.MongoDb/GeoInt.Persistance.MongoDb.csproj GeoInt.Persistence.MongoDb/
COPY GeoInt.Persistence.SqlServer/GeoInt.Persistance.SqlServer.csproj GeoInt.Persistence.SqlServer/

# Restore packages
RUN dotnet restore

# Copy source code
COPY . .

# Build application
WORKDIR /src/GeoInt.WebApi
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=publish /app/publish .

# Create non-root user for security
RUN useradd -m -s /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/todos || exit 1

# Set entry point
ENTRYPOINT ["dotnet", "GeoInt.WebApi.dll"] 