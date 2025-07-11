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
            app.MapGenericGetById<GetPOIByIdQuery, POIEntity, POIEntity>("/api/pois/{id}");
            app.MapGenericGetAll<GetAllPOIsQuery, POIEntity, POIEntity>("/api/pois");

            app.MapGenericCreate<CreatePOICommand, POIEntity, Guid>("/api/pois");
            app.MapGenericUpdate<UpdatePOICommand, POIEntity>("/api/pois");
            app.MapGenericDelete<DeletePOICommand, POIEntity>("/api/pois/{id}");
            app.MapGenericCreateBulk<BulkCreatePOICommand, POIEntity>("/api/pois/bulk-csv");
        }
    }
}