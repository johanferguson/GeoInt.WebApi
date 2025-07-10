using GeoInt.Core;
using GeoInt.Core.Interfaces.Persistance;
using MediatR;

namespace GeoInt.Application.Features.Base.Commands.DeleteCommand
{
    /// <summary>
    /// Generic delete handler for any entity.
    /// </summary>
    public class DeleteHandler<TCommand, TEntity, TResponse> : IRequestHandler<TCommand, TResponse>
        where TCommand : IDeleteCommand<TEntity, TResponse>
        where TEntity : class, IEntity<Guid>
    {
        private readonly IRepository<TEntity> _repository;

        public DeleteHandler(IRepository<TEntity> repository)
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

            entity.deleted_at = DateTime.UtcNow; // Audit (if you soft-delete)
            await _repository.DeleteAsync(entity);

            return (TResponse)(object)entity.Id!;
        }
    }
}
