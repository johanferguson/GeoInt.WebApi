using GeoInt.Core.Interfaces.Persistance;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using MongoDB.Driver;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Persistance.MongoDb
{
    public static class Register
    {
        public static IServiceCollection AddMongoDbPersistance(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IMongoClient>(sp =>
                new MongoClient(configuration.GetConnectionString("MongoDb")));
            services.AddScoped<IMongoDatabase>(sp =>
                sp.GetRequiredService<IMongoClient>().GetDatabase(configuration["MongoDbDatabase"]));

            services.AddScoped(typeof(IRepository<>), typeof(Repository.Repository<>));
            return services;
        }
    }
}
