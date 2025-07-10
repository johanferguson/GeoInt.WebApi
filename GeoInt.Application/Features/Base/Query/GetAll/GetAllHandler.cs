using GeoInt.Core;
using GeoInt.Core.Interfaces.Persistance;
using MediatR;

namespace GeoInt.Application.Features.Base.Query.GetAll
{
    public class GetAllHandler<TQuery, TEntity, TResponse> : IRequestHandler<TQuery, IEnumerable<TResponse>>
        where TQuery : IGetAllQuery<TEntity, TResponse>
        where TEntity : class, IEntity<Guid>
    {
        private readonly IRepository<TEntity> _repository;

        public GetAllHandler(IRepository<TEntity> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<TResponse>> Handle(TQuery request, CancellationToken cancellationToken)
        {
            var entities = await _repository.GetAllAsync();
            return entities.Cast<TResponse>();
        }
    }
}