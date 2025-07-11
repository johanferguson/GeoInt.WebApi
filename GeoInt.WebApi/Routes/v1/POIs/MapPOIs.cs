using GeoInt.Application.POI.Features.Commands;
using GeoInt.Application.POI.Features.Queries;
using GeoInt.Domain.POI.Entities;
using GeoInt.WebApi.Routes.Mapping;

namespace GeoInt.WebApi.Routes.v1.POIs
{
    public static class POIs
    {
        public static void MapPOIEnpoints(this WebApplication app)
        {
            // Query endpoints
            app.MapGenericGetById<GetPOIByIdQuery, POIEntity, POIEntity>("/api/pois/{id}");
            app.MapGenericGetAll<GetAllPOIsQuery, POIEntity, POIEntity>("/api/pois");
            
            // Text response endpoints (API-style)
            app.MapPOIToCSV("/api/pois/tocsv", downloadAsFile: false);
            app.MapPOIToGeoJson("/api/pois/togeojson", downloadAsFile: false);
            
            // Download file endpoints
            app.MapPOIToCSV("/api/pois/export/csv", downloadAsFile: true);
            app.MapPOIToGeoJson("/api/pois/export/geojson", downloadAsFile: true);

            // Command endpoints
            app.MapGenericCreate<CreatePOICommand, POIEntity, Guid>("/api/pois");
            app.MapGenericUpdate<UpdatePOICommand, POIEntity>("/api/pois");
            app.MapGenericDelete<DeletePOICommand, POIEntity>("/api/pois/{id}");
            app.MapGenericCreateBulk<BulkCreatePOICommand, POIEntity>("/api/pois/bulk-csv");
        }
    }
}