using GeoInt.Core.Interfaces.Persistance;
using GeoInt.Domain.POI.Entities;
using GeoInt.Persistance.PostGis.Context;
using GeoInt.Persistance.PostGis.Repository;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;


namespace GeoInt.Persistance.PostGis
{
    public static class Register
    {
        public static IServiceCollection AddPostGisPersistance(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options => 
                options.UseNpgsql(configuration.GetConnectionString("PostGisConnection"),
                    x => x.UseNetTopologySuite())); // Enable spatial support

            //services.AddScoped(typeof(IRepository<>), typeof(Repository.Repository<>));
            services.AddScoped<IRepository<POIEntity>, POIRepository>();

            return services;
        }
    }
} 