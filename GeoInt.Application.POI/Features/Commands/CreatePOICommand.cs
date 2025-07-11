using GeoInt.Application.Features.Base.Commands.CreateCommand;
using System;
using GeoInt.Domain.POI.Entities;
using MediatR;

namespace GeoInt.Application.POI.Features.Commands
{
    public class CreatePOICommand : ICreateCommand<POIEntity, Guid>
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public double Lat { get; set; }
        public double Long { get; set; }

        // This method is required by the interface. It maps the command to the domain entity.
        public POIEntity ToEntity()
        {
            var entity = new POIEntity
            {
                Id = Guid.NewGuid(),
                Name = this.Name,
                Category = this.Category,
                created_at = DateTime.UtcNow
            };
            
            // Set location with spatial sync
            entity.SetLocation(this.Lat, this.Long);
            
            return entity;
        }
    }
}
