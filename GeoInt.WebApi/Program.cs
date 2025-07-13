using GeoInt.Persistance.MongoDb;
using GeoInt.Persistance.SqlServer;
using GeoInt.WebApi.Configuration;
using GeoInt.Application;
using GeoInt.WebApi.Routes.v1.POIs;
using GeoInt.Application.POI;
using GeoInt.Persistance.PostGis;
using Microsoft.EntityFrameworkCore;


namespace GeoInt.WebApi
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);


            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddApplicationLayer();
            builder.Services.AddPOIApplicationLayer();

            builder.Services.AddAntiforgery(options => options.SuppressXFrameOptionsHeader = true);

            // Register feature toggles as options (optional, only if you need to inject FeatureToggles elsewhere)
            builder.Services.Configure<FeatureToggles>(builder.Configuration.GetSection("FeatureToggles"));

            // Get feature toggles directly for registration decisions (this does NOT resolve from DI)
            var featureToggles = builder.Configuration.GetSection("FeatureToggles").Get<FeatureToggles>();

            if (featureToggles.UseSqlServer)
                builder.Services.AddSqlServerPersistance(builder.Configuration);

            if (featureToggles.UseMongoDb)
                builder.Services.AddMongoDbPersistance(builder.Configuration);
                        
            if(featureToggles.UsePostGis)
                builder.Services.AddPostGisPersistance(builder.Configuration);

            var app = builder.Build();

            // For local development - apply migrations on startup
            if (app.Environment.IsDevelopment() && featureToggles?.UsePostGis == true)
            {
                await EnsureDatabaseAsync(app.Services);
            }

            app.UseRouting();

            // Add Antiforgery support
            app.UseAntiforgery();

            app.MapPOIEnpoints();

            app.UseSwagger();
            app.UseSwaggerUI();

            app.Run();
        }

        static async Task EnsureDatabaseAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            
            try
            {
                var context = scope.ServiceProvider.GetRequiredService<GeoInt.Persistance.PostGis.Context.AppDbContext>();
                
                logger.LogInformation("Applying database migrations for local development...");
                await context.Database.MigrateAsync();
                logger.LogInformation("Database migration completed successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Database migration failed during local development startup.");
                throw;
            }
        }
    }
}