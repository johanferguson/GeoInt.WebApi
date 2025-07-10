using GeoInt.Application.Features.Base.Commands.UpdateCommand;
using GeoInt.Domain.Todo.Entities;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.Todo.Features.Commands
{
    public class UpdateTodoCommand : IUpdateCommand<TodoEntity, Guid>
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public bool IsComplete { get; set; }

        // This method applies the changes to an existing entity
        public void UpdateEntity(TodoEntity entity)
        {
            entity.title = this.Title;
            entity.is_complete = this.IsComplete;
            entity.modified_at = DateTime.UtcNow;
        }
    }
}