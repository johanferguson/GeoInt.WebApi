using GeoInt.Core.Interfaces.Persistance;
using GeoInt.Domain.Todo.Entities;
using GeoInt.Persistance.PostGis.Context;

using Microsoft.EntityFrameworkCore;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Persistance.PostGis.Repository
{
    public class TodoRepository : IRepository<TodoEntity>
    {
        private readonly AppDbContext _context;

        public TodoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TodoEntity?> GetByIdAsync(Guid id)
        {
            return await _context.Todos.FindAsync(id);
        }

        public async Task<IEnumerable<TodoEntity>> GetAllAsync()
        {
            return await _context.Todos.ToListAsync();
        }

        public async Task AddAsync(TodoEntity entity)
        {
            await _context.Todos.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(TodoEntity entity)
        {
            _context.Todos.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task BulkAddAsync(IEnumerable<TodoEntity> entities)
        {
            await _context.Todos.AddRangeAsync(entities);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(TodoEntity entity)
        {
            _context.Todos.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
} 