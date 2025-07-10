using MediatR;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.Features.Base.Query.GetAll
{
    /// <summary>
    /// Generic GetAll query interface for entities.
    /// </summary>
    /// <typeparam name="TEntity">Entity type.</typeparam>
    /// <typeparam name="TResponse">Response type (typically DTO or entity).</typeparam>
    public interface IGetAllQuery<TEntity, TResponse> : IRequest<IEnumerable<TResponse>>
    {
        // Optionally, add filtering, paging, sorting here in the future
    }
}
