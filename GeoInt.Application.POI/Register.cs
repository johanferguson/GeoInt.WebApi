using GeoInt.Application.Features.Base.Commands.DeleteCommand;
using GeoInt.Application.Features.Base.Commands.UpdateCommand;
using GeoInt.Application.Features.Base.Commands.BulkCreateCommand;
using GeoInt.Application.Features.Base.Query.GetAll;
using GeoInt.Application.Features.Base.Query.GetById;
using GeoInt.Application.POI.Features.Commands;
using GeoInt.Application.POI.Features.Queries;
using GeoInt.Domain.POI.Entities;
using MediatR;

using Microsoft.Extensions.DependencyInjection;



namespace GeoInt.Application.POI
{
    public static class Register
    {
        public static void AddPOIApplicationLayer(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetPOIByIdQuery, POIEntity>, GetByIdHandler<GetPOIByIdQuery, POIEntity, POIEntity>>();
            services.AddScoped<IRequestHandler<GetAllPOIsQuery, IEnumerable<POIEntity>>, GetAllHandler<GetAllPOIsQuery, POIEntity, POIEntity>>();

            services.AddScoped<IRequestHandler<CreatePOICommand, Guid>, AddCommandHandler<CreatePOICommand, POIEntity, Guid>>();
            services.AddScoped<IRequestHandler<UpdatePOICommand, Guid>, UpdateHandler<UpdatePOICommand, POIEntity, Guid>>();
            services.AddScoped<IRequestHandler<DeletePOICommand, Guid>, DeleteHandler<DeletePOICommand, POIEntity, Guid>>();
            services.AddScoped<IRequestHandler<BulkCreatePOICommand, IEnumerable<Guid>>, BulkCreateCommandHandler<BulkCreatePOICommand, POIEntity, IEnumerable<Guid>>>();
        }
    }
} 