using MediatR;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.Features.Base.Query.GetById
{
    public interface IGetByIdQuery<TEntity, TResponse> : IRequest<TResponse>
    {
        Guid Id { get; }
    }
}
