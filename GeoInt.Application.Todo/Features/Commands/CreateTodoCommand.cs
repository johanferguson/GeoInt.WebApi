using GeoInt.Application.Features.Base.Commands.CreateCommand;
using System;
using GeoInt.Domain.Todo.Entities;
using MediatR;

namespace GeoInt.Application.Todo.Features.Commands
{
    public class CreateTodoCommand : ICreateCommand<TodoEntity, Guid>
    {
        public string Title { get; set; }

        // This method is required by the interface. It maps the command to the domain entity.
        public TodoEntity ToEntity()
        {
            return new TodoEntity
            {
                Id = Guid.NewGuid(),
                title = this.Title,
                is_complete = false, // default for new items
                created_at = DateTime.UtcNow
            };
        }
    }
}

