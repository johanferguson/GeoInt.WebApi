namespace GeoInt.WebApi.Configuration
{
    public class FeatureToggles
    {
        public bool UseSqlServer { get; set; }
        public bool UseMongoDb { get; set; }
        public bool UseRedis { get; set; }
        public bool UseAuthentication { get; set; }
        public bool UseCache { get; set; }

        // Add other toggles as needed
    }
}
