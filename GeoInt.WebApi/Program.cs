using GeoInt.Persistance.MongoDb;
using GeoInt.Persistance.SqlServer;
using GeoInt.WebApi.Configuration;
using GeoInt.WebApi.Routes.v1.Todos;
using GeoInt.Application.Todo;
using GeoInt.Application;


namespace GeoInt.WebApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddAuthorization();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddApplicationLayer();
            builder.Services.AddTodoApplicationLayer();

            // Register feature toggles as options (optional, only if you need to inject FeatureToggles elsewhere)
            builder.Services.Configure<FeatureToggles>(builder.Configuration.GetSection("FeatureToggles"));

            // Get feature toggles directly for registration decisions (this does NOT resolve from DI)
            var featureToggles = builder.Configuration.GetSection("FeatureToggles").Get<FeatureToggles>();

            if (featureToggles.UseSqlServer)
                builder.Services.AddSqlServerPersistance(builder.Configuration);

            if (featureToggles.UseMongoDb)
                builder.Services.AddMongoDbPersistance(builder.Configuration);
                        
            var app = builder.Build();

            app.UseHttpsRedirection();
            app.UseAuthorization();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            else if (app.Environment.IsStaging())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
                    c.RoutePrefix = "swagger";
                });
            }

            app.MapEnpoints();
            app.Run();
        }
    }
}