using GeoInt.Application.Features.Base.Commands.DeleteCommand;
using GeoInt.Domain.Todo.Entities;


namespace GeoInt.Application.Todo.Features.Commands
{
    public class DeleteTodoCommand : IDeleteCommand<TodoEntity, Guid>
    {
        public Guid Id { get; set; }
    }
}
