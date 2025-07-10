using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Domain
{
    /// <summary>
    /// Base entity interface with audit fields for tracking creation, modification, and deletion.
    /// </summary>
    public interface IEntity<TId>
    {
        TId Id { get; set; }
        DateTime created_at { get; set; }
        DateTime? modified_at { get; set; }
        DateTime? deleted_at { get; set; }

        // Optional: If implementing DDD domain events
        // List<IDomainEvent> DomainEvents { get; }
    }
}
