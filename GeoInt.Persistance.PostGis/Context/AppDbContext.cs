using GeoInt.Domain;
using GeoInt.Domain.POI.Entities;

using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

using System.Reflection;


namespace GeoInt.Persistance.PostGis.Context
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
            
            // Configure POI spatial properties
            modelBuilder.Entity<POIEntity>(entity =>
            {
                entity.Property(e => e.Location)
                      .HasColumnType("geometry(point,4326)"); // WGS84 coordinate system
                      
                // Create spatial index using PostgreSQL syntax
                entity.HasIndex(e => e.Location)
                      .HasMethod("gist");
            });
            
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
} 