using MediatR;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.Features.Base.Commands.DeleteCommand
{
    public interface IDeleteCommand<TEntity, TResponse> : IRequest<TResponse>
    {
        Guid Id { get; }
    }
}
