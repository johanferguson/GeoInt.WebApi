using GeoInt.Application.Features.Base.Query.GetAll;
using GeoInt.Domain.POI.Entities;
using MediatR;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.POI.Features.Queries
{
    public class GetAllPOIsQuery : IGetAllQuery<POIEntity, POIEntity>
    {
        // Optional filters/paging later
    }
} 