using GeoInt.Application.Features.Base.Commands.CreateCommand;
using GeoInt.Core;
using GeoInt.Core.Interfaces.Persistance;
using MediatR;


public class AddCommandHandler<TCommand, TEntity, TResponse> : IRequestHandler<TCommand, TResponse>
        where TCommand : ICreateCommand<TEntity, TResponse>
        where TEntity : class, IEntity<Guid>
{
    private readonly IRepository<TEntity> _repo;

    public AddCommandHandler(IRepository<TEntity> repository)
    {
        _repo = repository;
    }


    public async Task<TResponse> Handle(TCommand request, CancellationToken cancellationToken)
    {
        TEntity? entity = null;

        entity = request.ToEntity();
        entity.created_at = DateTime.UtcNow; // Auditing

        await _repo.AddAsync(entity);

        return (TResponse)(object)entity.Id!;
    }
}
