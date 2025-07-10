using GeoInt.Application.Features.Base.Commands.BulkCreateCommand;
using System;
using GeoInt.Domain.Todo.Entities;
using MediatR;

namespace GeoInt.Application.Todo.Features.Commands
{
    public class BulkCreateTodoCommand : IBulkCreateCommand<TodoEntity, IEnumerable<Guid>>
    {
        public IEnumerable<string> Titles { get; set; }

        // This method is required by the interface. It maps the command to the domain entities.
        public IEnumerable<TodoEntity> ToEntities()
        {
            return Titles.Select(title => new TodoEntity
            {
                Id = Guid.NewGuid(),
                title = title,
                is_complete = false, // default for new items
                created_at = DateTime.UtcNow
            });
        }
    }
} 