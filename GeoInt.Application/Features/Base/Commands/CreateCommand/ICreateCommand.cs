using MediatR;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.Features.Base.Commands.CreateCommand
{
    public interface ICreateCommand<TEntity, TResponse> : IRequest<TResponse>
    {
        TEntity ToEntity();
    }
}
