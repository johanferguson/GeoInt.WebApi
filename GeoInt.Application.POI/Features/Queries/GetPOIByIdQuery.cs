using GeoInt.Application.Features.Base.Query.GetById;
using GeoInt.Domain.POI.Entities;


namespace GeoInt.Application.POI.Features.Queries
{
    public class GetPOIByIdQuery : IGetByIdQuery<POIEntity, POIEntity>
    {
        public Guid Id { get; set; }

        public GetPOIByIdQuery(Guid id)
        {
            Id = id;
        }
    }
} 