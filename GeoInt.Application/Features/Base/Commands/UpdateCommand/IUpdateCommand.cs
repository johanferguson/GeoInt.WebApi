using MediatR;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.Features.Base.Commands.UpdateCommand
{
    /// <summary>
    /// Generic update command interface for entities.
    /// </summary>
    public interface IUpdateCommand<TEntity, TResponse> : IRequest<TResponse>
    {
        Guid Id { get; }
        void UpdateEntity(TEntity entity);
    }
}
