using GeoInt.Application.Features.Base.Commands.BulkCreateCommand;
using GeoInt.Core;
using GeoInt.Core.Interfaces.Persistance;
using MediatR;


public class BulkCreateCommandHandler<TCommand, TEntity, TResponse> : IRequestHandler<TCommand, TResponse>
        where TCommand : IBulkCreateCommand<TEntity, TResponse>
        where TEntity : class, IEntity<Guid>
{
    private readonly IRepository<TEntity> _repo;

    public BulkCreateCommandHandler(IRepository<TEntity> repository)
    {
        _repo = repository;
    }


    public async Task<TResponse> Handle(TCommand request, CancellationToken cancellationToken)
    {
        var entities = request.ToEntities().ToList();

        foreach (var entity in entities)
        {
            entity.created_at = DateTime.UtcNow; // Auditing
        }

        await _repo.BulkAddAsync(entities);

        return (TResponse)(object)entities.Select(e => e.Id).ToList();
    }
} 