using GeoInt.Core;
using GeoInt.Core.Interfaces.Persistance;
using MediatR;

namespace GeoInt.Application.Features.Base.Query.GetById
{
    public class GetByIdHandler<TQuery, TEntity, TResponse> : IRequestHandler<TQuery, TResponse>
        where TQuery : IGetByIdQuery<TEntity, TResponse>
        where TEntity : class, IEntity<Guid>
    {
        private readonly IRepository<TEntity> _repository;

        public GetByIdHandler(IRepository<TEntity> repository)
        {
            _repository = repository;
        }

        public async Task<TResponse> Handle(TQuery request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                throw new KeyNotFoundException($"{typeof(TEntity).Name} with ID {request.Id} not found.");
            }

            // In a real project, map to DTO here if TResponse != TEntity
            return (TResponse)(object)entity;
        }
    }
}
