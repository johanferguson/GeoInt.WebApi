using GeoInt.Core;

namespace GeoInt.Domain.Todo.Entities
{
    public class TodoEntity : IEntity<Guid>
    {
        public Guid Id { get; set; }
        public string title { get; set; }
        public bool is_complete { get; set; }
        public DateTime created_at { get; set; }
        public DateTime? modified_at { get; set; }
        public DateTime? deleted_at { get; set; }
    }
}