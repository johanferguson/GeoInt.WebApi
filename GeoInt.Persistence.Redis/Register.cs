using MediateR.Core.Interfaces.Persistance;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace MediateR.Persistence.Redis
{
    public static class Register
    {
        public static IServiceCollection AddRedisPersistence(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IConnectionMultiplexer>(
                ConnectionMultiplexer.Connect(configuration.GetConnectionString("Redis")));

            services.AddScoped(typeof(IRepository<>), typeof(Repository.Repository<>));
            return services;
        }
    }
}
