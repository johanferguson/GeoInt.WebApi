using GeoInt.Application.Features.Base.Commands.UpdateCommand;
using GeoInt.Domain.POI.Entities;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.POI.Features.Commands
{
    public class UpdatePOICommand : IUpdateCommand<POIEntity, Guid>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public double Lat { get; set; }
        public double Long { get; set; }

        // This method applies the changes to an existing entity
        public void UpdateEntity(POIEntity entity)
        {
            entity.Name = this.Name;
            entity.Category = this.Category;
            entity.Lat = this.Lat;
            entity.Long = this.Long;
            entity.modified_at = DateTime.UtcNow;
        }
    }
}
