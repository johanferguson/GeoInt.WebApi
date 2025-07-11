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

                try
                {
                    var entities = await ParseCsvToPOIEntities(file);
                    var command = new TCommand();
                    
                    // Set the entities on the command (assuming TCommand has Entities property)
                    if (command is BulkCreatePOICommand poiCommand)
                    {
                        poiCommand.Entities = entities;
                    }
                    
                    await mediator.Send(command);
                    return Results.Ok(new { success = true, count = entities.Count() });
                }
                catch (Exception ex)
                {
                    return Results.BadRequest($"CSV processing error: {ex.Message}");
                }
            }).DisableAntiforgery();
        }

        private static async Task<IEnumerable<POIEntity>> ParseCsvToPOIEntities(IFormFile file)
        {
            var entities = new List<POIEntity>();
            var lineNumber = 0;

            using var reader = new StreamReader(file.OpenReadStream());
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            // Read header
            csv.Read();
            csv.ReadHeader();
            lineNumber++;

            // Validate required headers exist
            var headers = csv.HeaderRecord;
            if (headers == null || !headers.Contains("Name") || !headers.Contains("Category") || 
                !headers.Contains("Latitude") || !headers.Contains("Longitude"))
            {
                throw new InvalidOperationException("CSV must contain headers: Name, Category, Latitude, Longitude");
            }

            while (csv.Read())
            {
                lineNumber++;
                
                try
                {
                    if (csv.ColumnCount == 4)
                    {
                        // Validate and parse fields with proper error handling
                        var name = csv.GetField<string>("Name")?.Trim();
                        var category = csv.GetField<string>("Category")?.Trim();

                        if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(category))
                        {
                            throw new InvalidOperationException($"Line {lineNumber}: Name and Category are required");
                        }

                        // Parse coordinates with validation
                        if (!csv.TryGetField<double>("Latitude", out var latitude) ||
                            !csv.TryGetField<double>("Longitude", out var longitude))
                        {
                            throw new InvalidOperationException($"Line {lineNumber}: Invalid latitude or longitude values");
                        }

                        var entity = new POIEntity
                        {
                            Id = Guid.NewGuid(),
                            Name = name,
                            Category = category,
                            created_at = DateTime.UtcNow
                        };

                        // Set location with spatial sync
                        entity.SetLocation(latitude, longitude);
                        entities.Add(entity);
                    }
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException($"Line {lineNumber}: {ex.Message}", ex);
                }
            }

            if (entities.Count == 0)
            {
                throw new InvalidOperationException("No valid POI records found in CSV");
            }

            return entities;
        }
    }
}