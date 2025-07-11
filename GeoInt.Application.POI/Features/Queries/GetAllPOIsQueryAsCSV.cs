using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GeoInt.Application.Features.Base.Query.GetAll;
using GeoInt.Domain.POI.Entities;

namespace GeoInt.Application.POI.Features.Queries
{
    public class GetAllPOIsQueryAsCSV : IGetAllQuery<POIEntity, POIEntity>
    {
        // Optional filters/paging later - same as GetAllPOIsQuery

        /// <summary>
        /// Converts POI entities to CSV format
        /// </summary>
        /// <param name="entities">Collection of POI entities</param>
        /// <returns>CSV formatted string</returns>
        public string ConvertToCSV(IEnumerable<POIEntity> entities)
        {
            var csv = new StringBuilder();
            
            // Add CSV header
            csv.AppendLine("Id,Name,Category,Latitude,Longitude,Created,Modified");
            
            // Add data rows
            foreach (var entity in entities)
            {
                csv.AppendLine($"{entity.Id}," +
                              $"\"{entity.Name?.Replace("\"", "\"\"")}\"," +        // Escape quotes in names
                              $"\"{entity.Category?.Replace("\"", "\"\"")}\"," +    // Escape quotes in categories  
                              $"{entity.Lat}," +
                              $"{entity.Long}," +
                              $"{entity.created_at:yyyy-MM-dd HH:mm:ss}," +
                              $"{entity.modified_at?.ToString("yyyy-MM-dd HH:mm:ss") ?? ""}");
            }
            
            return csv.ToString();
        }
    }
}
