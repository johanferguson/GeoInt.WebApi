using GeoInt.Core.Interfaces.Persistance;
using GeoInt.Domain.POI.Entities;
using GeoInt.Persistance.PostGis.Context;

using Microsoft.EntityFrameworkCore;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Persistance.PostGis.Repository
{
    public class POIRepository : IRepository<POIEntity>
    {
        private readonly AppDbContext _context;

        public POIRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<POIEntity?> GetByIdAsync(Guid id)
        {
            var entity = await _context.POIs.FindAsync(id);
            
            // Populate Location for existing entity that doesn't have it
            if (entity?.Location == null)
            {
                entity?.PopulateLocationFromCoordinates();
            }
            
            return entity;
        }

        public async Task<IEnumerable<POIEntity>> GetAllAsync()
        {
            var entities = await _context.POIs.ToListAsync();
            
            // Populate Location for existing entities that don't have it
            foreach (var entity in entities.Where(e => e.Location == null))
            {
                entity.PopulateLocationFromCoordinates();
            }
            
            return entities;
        }

        public async Task AddAsync(POIEntity entity)
        {
            await _context.POIs.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task BulkAddAsync(IEnumerable<POIEntity> entities)
        {
            await _context.POIs.AddRangeAsync(entities);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(POIEntity entity)
        {
            _context.POIs.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(POIEntity entity)
        {
            _context.POIs.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
} 