using GeoInt.Application.Features.Base.Commands.CreateCommand;
using GeoInt.Core;
using GeoInt.Domain;

using MediatR;

using Microsoft.AspNetCore.Mvc;

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
    }
}