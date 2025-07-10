using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GeoInt.Application.Features.Base.Commands.DeleteCommand;
using GeoInt.Domain.POI.Entities;


namespace GeoInt.Application.POI.Features.Commands
{
    public class DeletePOICommand : IDeleteCommand<POIEntity, Guid>
    {
        public Guid Id { get; set; }
    }
}
