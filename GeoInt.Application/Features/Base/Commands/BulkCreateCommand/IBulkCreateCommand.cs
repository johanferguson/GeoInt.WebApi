using MediatR;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.Features.Base.Commands.BulkCreateCommand
{
    public interface IBulkCreateCommand<TEntity, TResponse> : IRequest<TResponse>
    {
        IEnumerable<TEntity> ToEntities();
    }
} 