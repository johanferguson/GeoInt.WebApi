using GeoInt.Application.Todo.Features.Commands;
using GeoInt.Application.Todo.Features.Queries;
using GeoInt.Domain.Todo.Entities;
using GeoInt.WebApi.Routes.Mapping;

using System.Runtime.CompilerServices;

namespace GeoInt.WebApi.Routes.v1.Todos
{

    public static class Todo
    {
        public static void MapEnpoints(this WebApplication app)
        {
            app.MapGenericGetById<GetTodoByIdQuery, TodoEntity, TodoEntity>("/api/todos/{id}");
            app.MapGenericGetAll<GetAllTodosQuery, TodoEntity, TodoEntity>("/api/todos");

            app.MapGenericCreate<CreateTodoCommand, TodoEntity, Guid>("/api/todos");
            app.MapGenericUpdate<UpdateTodoCommand, TodoEntity>("/api/todos");
            app.MapGenericDelete<DeleteTodoCommand, TodoEntity>("/api/todos");
        }
    }
}
