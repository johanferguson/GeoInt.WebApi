using GeoInt.Core;
using GeoInt.Core.Interfaces.Persistance;
using GeoInt.Domain.POI.Entities;

using MongoDB.Driver;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Persistance.MongoDb.Repository
{
    public class POIRepository : IRepository<POIEntity>
    {
        private readonly IMongoCollection<POIEntity> _collection;

        public POIRepository(IMongoDatabase database)
        {
            _collection = database.GetCollection<POIEntity>("poientity");
        }

        public async Task<POIEntity?> GetByIdAsync(Guid id)
        {
            var filter = Builders<POIEntity>.Filter.Eq(e => e.Id, id);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<POIEntity>> GetAllAsync()
        {
            return await _collection.Find(_ => true).ToListAsync();
        }

        public async Task AddAsync(POIEntity entity)
        {
            await _collection.InsertOneAsync(entity);
        }

        public async Task BulkAddAsync(IEnumerable<POIEntity> entities)
        {
            await _collection.InsertManyAsync(entities);
        }

        public async Task UpdateAsync(POIEntity entity)
        {
            var filter = Builders<POIEntity>.Filter.Eq(e => e.Id, entity.Id);
            await _collection.ReplaceOneAsync(filter, entity);
        }

        public async Task DeleteAsync(POIEntity entity)
        {
            var filter = Builders<POIEntity>.Filter.Eq(e => e.Id, entity.Id);
            await _collection.DeleteOneAsync(filter);
        }
    }
} 