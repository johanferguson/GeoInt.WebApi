using GeoInt.Application.Features.Base.Commands.BulkCreateCommand;
using System;
using GeoInt.Domain.POI.Entities;
using MediatR;

namespace GeoInt.Application.POI.Features.Commands
{
    public class BulkCreatePOICommand : IBulkCreateCommand<POIEntity, IEnumerable<Guid>>
    {
        public IEnumerable<POIData> POIs { get; set; }
        public IEnumerable<POIEntity> Entities { get; set; }

        // This method is required by the interface. It maps the command to the domain entities.
        public IEnumerable<POIEntity> ToEntities()
        {
            if (Entities != null)
                return Entities;
                
            return POIs.Select(poi => 
            {
                var entity = new POIEntity
                {
                    Id = Guid.NewGuid(),
                    Name = poi.Name,
                    Category = poi.Category,
                    created_at = DateTime.UtcNow
                };
                
                // Set location with spatial sync
                entity.SetLocation(poi.Lat, poi.Long);
                
                return entity;
            });
        }
    }

    public class POIData
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public double Lat { get; set; }
        public double Long { get; set; }
    }
} 