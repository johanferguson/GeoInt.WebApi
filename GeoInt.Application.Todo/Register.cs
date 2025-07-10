using GeoInt.Application.Features.Base.Commands.DeleteCommand;
using GeoInt.Application.Features.Base.Commands.UpdateCommand;
using GeoInt.Application.Features.Base.Query.GetAll;
using GeoInt.Application.Features.Base.Query.GetById;
using GeoInt.Application.Todo.Features.Commands;
using GeoInt.Application.Todo.Features.Queries;
using GeoInt.Domain.Todo.Entities;
using MediatR;

using Microsoft.Extensions.DependencyInjection;



namespace GeoInt.Application.Todo
{
    public static class Register
    {
        public static void AddTodoApplicationLayer(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetTodoByIdQuery, TodoEntity>, GetByIdHandler<GetTodoByIdQuery, TodoEntity, TodoEntity>>();
            services.AddScoped<IRequestHandler<GetAllTodosQuery, IEnumerable<TodoEntity>>, GetAllHandler<GetAllTodosQuery, TodoEntity, TodoEntity>>();

            services.AddScoped<IRequestHandler<CreateTodoCommand, Guid>, AddCommandHandler<CreateTodoCommand, TodoEntity, Guid>>();
            services.AddScoped<IRequestHandler<UpdateTodoCommand, Guid>, UpdateHandler<UpdateTodoCommand, TodoEntity, Guid>>();
            services.AddScoped<IRequestHandler<DeleteTodoCommand, Guid>, DeleteHandler<DeleteTodoCommand, TodoEntity, Guid>>();
        }
    }
}