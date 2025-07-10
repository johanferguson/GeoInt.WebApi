using GeoInt.Core.Interfaces.Persistance;
using GeoInt.Domain.POI.Entities;
using GeoInt.Persistance.SqlServer.Context;

using Microsoft.EntityFrameworkCore;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Persistance.SqlServer.Repository
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
            return await _context.POIs.FindAsync(id);
        }

        public async Task<IEnumerable<POIEntity>> GetAllAsync()
        {
            return await _context.POIs.ToListAsync();
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