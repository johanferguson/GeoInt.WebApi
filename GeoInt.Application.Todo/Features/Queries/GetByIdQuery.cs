using GeoInt.Application.Features.Base.Query.GetById;
using GeoInt.Domain.Todo.Entities;


namespace GeoInt.Application.Todo.Features.Queries
{
    public class GetTodoByIdQuery : IGetByIdQuery<TodoEntity, TodoEntity>
    {
        public Guid Id { get; set; }

        public GetTodoByIdQuery(Guid id)
        {
            Id = id;
        }
    }
}
