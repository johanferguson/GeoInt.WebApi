using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;


namespace GeoInt.Application
{
    public static class Register
    {

        public static void AddApplicationLayer(this IServiceCollection services)
        {
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            });

            
        }
    }
}