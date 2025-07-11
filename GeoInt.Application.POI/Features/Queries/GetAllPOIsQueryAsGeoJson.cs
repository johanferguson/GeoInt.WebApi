using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GeoInt.Application.Features.Base.Query.GetAll;
using GeoInt.Domain.POI.Entities;
using System.Text.Json;

namespace GeoInt.Application.POI.Features.Queries
{
    public class GetAllPOIsQueryAsGeoJson : IGetAllQuery<POIEntity, POIEntity>
    {
        // Optional filters/paging later - same as GetAllPOIsQuery

        /// <summary>
        /// Converts POI entities to GeoJSON FeatureCollection format
        /// </summary>
        /// <param name="entities">Collection of POI entities</param>
        /// <returns>GeoJSON formatted string</returns>
        public string ConvertToGeoJson(IEnumerable<POIEntity> entities)
        {
            var features = entities.Select(entity => new
            {
                type = "Feature",
                geometry = new
                {
                    type = "Point",
                    coordinates = new[] { entity.Long, entity.Lat } // [longitude, latitude] per GeoJSON spec
                },
                properties = new
                {
                    id = entity.Id.ToString(),
                    name = entity.Name,
                    category = entity.Category,
                    created_at = entity.created_at.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    modified_at = entity.modified_at?.ToString("yyyy-MM-ddTHH:mm:ssZ")
                }
            });

            var geoJson = new
            {
                type = "FeatureCollection",
                features = features
            };

            return JsonSerializer.Serialize(geoJson, new JsonSerializerOptions 
            { 
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
        }
    }
}
