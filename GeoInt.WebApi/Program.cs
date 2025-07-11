using GeoInt.Persistance.MongoDb;
using GeoInt.Persistance.SqlServer;
using GeoInt.WebApi.Configuration;
using GeoInt.WebApi.Routes.v1.Todos;
using GeoInt.Application.Todo;
using GeoInt.Application;
using GeoInt.WebApi.Routes.v1.POIs;
using GeoInt.Application.POI;
using GeoInt.Persistance.PostGis;


namespace GeoInt.WebApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);


            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddApplicationLayer();
            builder.Services.AddTodoApplicationLayer();
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

            app.UseRouting();

            // Add Antiforgery support
            app.UseAntiforgery();

            app.MapToDoEnpoints();
            app.MapPOIEnpoints();

            app.UseSwagger();
            app.UseSwaggerUI();

            app.Run();
        }
    }
}