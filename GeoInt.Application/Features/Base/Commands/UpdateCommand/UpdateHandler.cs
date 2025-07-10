using GeoInt.Core;
using GeoInt.Core.Interfaces.Persistance;
using MediatR;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.Features.Base.Commands.UpdateCommand
{
    /// <summary>
    /// Generic update handler for any entity.
    /// </summary>
    public class UpdateHandler<TCommand, TEntity, TResponse> : IRequestHandler<TCommand, TResponse>
        where TCommand : IUpdateCommand<TEntity, TResponse>
        where TEntity : class, IEntity<Guid>
    {
        private readonly IRepository<TEntity> _repository;

        public UpdateHandler(IRepository<TEntity> repository)
        {
            _repository = repository;
        }

        public async Task<TResponse> Handle(TCommand request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                throw new KeyNotFoundException($"{typeof(TEntity).Name} with ID {request.Id} not found.");
            }

            request.UpdateEntity(entity); // Perform the update logic
            entity.modified_at = DateTime.UtcNow; // Audit

            await _repository.UpdateAsync(entity);

            return (TResponse)(object)entity.Id!;
        }
    }
}
