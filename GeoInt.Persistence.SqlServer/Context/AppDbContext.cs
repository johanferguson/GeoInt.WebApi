using GeoInt.Domain;
using GeoInt.Domain.POI.Entities;

using Microsoft.EntityFrameworkCore;

using System.Reflection;


namespace GeoInt.Persistance.SqlServer.Context
{
    public class AppDbContext : DbContext
    {        
        public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
        {
        }

        public DbSet<POIEntity> POIs { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}