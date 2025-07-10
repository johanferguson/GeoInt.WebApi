using GeoInt.Core;
using GeoInt.Core.Interfaces.Persistance;

using MongoDB.Driver;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Persistance.MongoDb.Repository
{
    public class Repository<TEntity> : IRepository<TEntity>
        where TEntity : class, IEntity<Guid>
    {
        private readonly IMongoCollection<TEntity> _collection;

        public Repository(IMongoDatabase database, string? collectionName = null)
        {
            // Use entity name by default
            _collection = database.GetCollection<TEntity>(collectionName ?? typeof(TEntity).Name.ToLowerInvariant());
        }

        public async Task<TEntity?> GetByIdAsync(Guid id)
        {
            var filter = Builders<TEntity>.Filter.Eq(e => e.Id, id);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            return await _collection.Find(_ => true).ToListAsync();
        }

        public async Task AddAsync(TEntity entity)
        {
            await _collection.InsertOneAsync(entity);
        }

        public async Task UpdateAsync(TEntity entity)
        {
            var filter = Builders<TEntity>.Filter.Eq(e => e.Id, entity.Id);
            await _collection.ReplaceOneAsync(filter, entity);
        }

        public async Task BulkAddAsync(IEnumerable<TEntity> entities)
        {
            await _collection.InsertManyAsync(entities);
        }

        public async Task DeleteAsync(TEntity entity)
        {
            var filter = Builders<TEntity>.Filter.Eq(e => e.Id, entity.Id);
            await _collection.DeleteOneAsync(filter);
        }
    }
}
