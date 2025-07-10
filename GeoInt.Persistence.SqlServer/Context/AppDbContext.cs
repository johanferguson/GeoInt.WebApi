using GeoInt.Domain;
using GeoInt.Domain.Todo.Entities;

using Microsoft.EntityFrameworkCore;

using System.Reflection;


namespace GeoInt.Persistence.SqlServer.Context
{
    public class AppDbContext : DbContext
    {        
        public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
        {
        }

        public DbSet<TodoEntity> Todos { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}