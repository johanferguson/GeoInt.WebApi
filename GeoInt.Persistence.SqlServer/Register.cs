using GeoInt.Core.Interfaces.Persistance;
using GeoInt.Domain.Todo.Entities;
using GeoInt.Persistence.SqlServer.Context;
using GeoInt.Persistence.SqlServer.Repository;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;


namespace GeoInt.Persistence.SqlServer
{
    public static class Register
    {
        public static IServiceCollection AddSqlServerPersistence(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options => options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            //services.AddScoped(typeof(IRepository<>), typeof(Repository.Repository<>));
            services.AddScoped<IRepository<TodoEntity>, TodoRepository>();

            return services;
        }
    }
}