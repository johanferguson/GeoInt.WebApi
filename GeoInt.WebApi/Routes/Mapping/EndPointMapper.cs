using GeoInt.Application.Features.Base.Commands.CreateCommand;
using GeoInt.Application.Features.Base.Commands.BulkCreateCommand;
using GeoInt.Application.POI.Features.Commands;
using GeoInt.Core;
using GeoInt.Domain;
using GeoInt.Domain.POI.Entities;

using MediatR;

using Microsoft.AspNetCore.Mvc;
using CsvHelper;
using System.Globalization;

namespace GeoInt.WebApi.Routes.Mapping
{
    public static class EndPointMapper
    {
        // Generic POST (Create)
        public static void MapGenericCreate<TCommand, TEntity, TResponse>(
        this WebApplication app, string route)
        where TCommand : ICreateCommand<TEntity, TResponse>
        where TEntity : class, Core.IEntity<Guid>
        {
            app.MapPost(route, async ([FromBody] TCommand command, [FromServices] IMediator mediator) =>
            {
                var result = await mediator.Send(command);
                return Results.Ok(result);
            });
        }


        // Generic UPDATE
        public static void MapGenericUpdate<TCommand, TEntity>(
        this IEndpointRouteBuilder app, string route)
        where TCommand : class, IRequest<Guid>
        where TEntity : class
        {
            app.MapPut(route, async ([FromBody] TCommand command, [FromServices] IMediator mediator) =>
            {
                await mediator.Send(command);
                return Results.NoContent();
            });
        }


        // Generic DELETE
        public static void MapGenericDelete<TCommand, TEntity>(
        this IEndpointRouteBuilder app, string route)
        where TCommand : class, IRequest<Guid>
        where TEntity : class
        {
            app.MapDelete(route, async ([FromBody] TCommand command, [FromServices] IMediator mediator) =>
            {
                await mediator.Send(command);
                return Results.NoContent();
            });
        }


        // Generic GET (ById)
        public static void MapGenericGetById<TQuery, TEntity, TResponse>(
        this IEndpointRouteBuilder app, string route)
        where TQuery : class, IRequest<TResponse>
        where TEntity : class
        {
            app.MapGet(route, async ([AsParameters] TQuery query, [FromServices] IMediator mediator) =>
            {
                var result = await mediator.Send(query);
                return result is not null ? Results.Ok(result) : Results.NotFound();
            });
        }


        // Generic GET (All)
        public static void MapGenericGetAll<TQuery, TEntity, TResponse>(
        this IEndpointRouteBuilder app, string route)
        where TQuery : class, IRequest<IEnumerable<TResponse>>, new()
        where TEntity : class
        {
            app.MapGet(route, async ([FromServices] IMediator mediator) =>
            {
                var result = await mediator.Send(new TQuery());
                return Results.Ok(result);
            });
        }

        // POI CSV Bulk Create
        public static void MapGenericCreateBulk<TCommand, TEntity>(
        this WebApplication app, string route)
        where TCommand : IBulkCreateCommand<TEntity, IEnumerable<Guid>>, new()
        where TEntity : class, Core.IEntity<Guid>
        {
            app.MapPost(route, async (IFormFile file, [FromServices] IMediator mediator) =>
            {
                if (file == null || file.Length == 0)
                    return Results.BadRequest("No file uploaded");

                if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                    return Results.BadRequest("Only CSV files are supported");

                if (file.Length > 5 * 1024 * 1024) // 5MB limit
                    return Results.BadRequest("File size exceeds 5MB limit");

                var entities = await ParseCsvToPOIEntities(file);
                var command = new TCommand();
                
                // Set the entities on the command (assuming TCommand has Entities property)
                if (command is BulkCreatePOICommand poiCommand)
                {
                    poiCommand.Entities = entities;
                }
                
                await mediator.Send(command);
                return Results.Ok(new { success = true, count = entities.Count() });
            });
        }

        private static async Task<IEnumerable<POIEntity>> ParseCsvToPOIEntities(IFormFile file)
        {
            using var reader = new StreamReader(file.OpenReadStream());
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
            
            var entities = new List<POIEntity>();
            
            csv.Read();
            csv.ReadHeader();
            
            while (csv.Read())
            {
                var entity = new POIEntity
                {
                    Id = Guid.NewGuid(),
                    Name = csv.GetField<string>("Name"),
                    Category = csv.GetField<string>("Category"),
                    Lat = csv.GetField<double>("Lat"),
                    Long = csv.GetField<double>("Long"),
                    created_at = DateTime.UtcNow
                };
                entities.Add(entity);
            }
            
            return entities;
        }
    }
}