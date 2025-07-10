using MediateR.Core.Interfaces.Persistance;
using MediateR.Domain;
using StackExchange.Redis;
using System.Text.Json;


namespace MediateR.Persistence.Redis.Repository
{
    public class Repository<TEntity> : IRepository<TEntity>
        where TEntity : class, IEntity<Guid>
    {
        private readonly IDatabase _redis;
        private readonly string _prefix;

        public Repository(IConnectionMultiplexer redis, string? prefix = null)
        {
            _redis = redis.GetDatabase();
            _prefix = prefix ?? typeof(TEntity).Name.ToLowerInvariant();
        }

        private string GetKey(Guid id) => $"{_prefix}:{id}";

        public async Task<TEntity?> GetByIdAsync(Guid id)
        {
            var value = await _redis.StringGetAsync(GetKey(id));
            return value.HasValue ? JsonSerializer.Deserialize<TEntity>(value!) : null;
        }

        public async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            // Redis has no native "get all", unless you scan keys (expensive for prod!).
            var endpoints = _redis.Multiplexer.GetEndPoints();
            var server = _redis.Multiplexer.GetServer(endpoints[0]);
            var keys = server.Keys(pattern: $"{_prefix}:*");

            var entities = new List<TEntity>();
            foreach (var key in keys)
            {
                var value = await _redis.StringGetAsync(key);
                if (value.HasValue)
                {
                    var entity = JsonSerializer.Deserialize<TEntity>(value!);
                    if (entity != null) entities.Add(entity);
                }
            }
            return entities;
        }

        public async Task AddAsync(TEntity entity)
        {
            await _redis.StringSetAsync(GetKey(entity.Id), JsonSerializer.Serialize(entity));
        }

        public async Task UpdateAsync(TEntity entity)
        {
            // In Redis, add and update are equivalent
            await AddAsync(entity);
        }

        public async Task DeleteAsync(TEntity entity)
        {
            await _redis.KeyDeleteAsync(GetKey(entity.Id));
        }
    }
}
