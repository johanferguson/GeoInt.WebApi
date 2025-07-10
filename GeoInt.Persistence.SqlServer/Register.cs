using GeoInt.Core.Interfaces.Persistance;
using GeoInt.Domain.Todo.Entities;
using GeoInt.Domain.POI.Entities;
using GeoInt.Persistance.SqlServer.Context;
using GeoInt.Persistance.SqlServer.Repository;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;


namespace GeoInt.Persistance.SqlServer
{
    public static class Register
    {
        public static IServiceCollection AddSqlServerPersistance(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options => options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            //services.AddScoped(typeof(IRepository<>), typeof(Repository.Repository<>));
            services.AddScoped<IRepository<TodoEntity>, TodoRepository>();
            services.AddScoped<IRepository<POIEntity>, POIRepository>();

            return services;
        }
    }
}