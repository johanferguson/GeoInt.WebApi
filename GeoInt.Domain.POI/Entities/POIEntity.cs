using GeoInt.Core;
using NetTopologySuite.Geometries;


namespace GeoInt.Domain.POI.Entities
{
    public class POIEntity : IEntity<Guid>
    {
        public Guid Id { get; set; }

        public string Name { get; set; }
        public string Category { get; set; }

        public double Lat { get; set; }
        public double Long { get; set; }

        // Spatial property for PostGIS
        public Point? Location { get; set; }

        public DateTime created_at { get; set; }
        public DateTime? modified_at { get; set; }
        public DateTime? deleted_at { get; set; }

        // Method to sync Location with Lat/Long
        public void SetLocation(double lat, double lng)
        {
            Lat = lat;
            Long = lng;
            Location = new Point(lng, lat) { SRID = 4326 };
        }

        // Method to sync Lat/Long from Location
        public void SyncFromLocation()
        {
            if (Location != null)
            {
                Lat = Location.Y;
                Long = Location.X;
            }
        }

        // Method to populate Location from existing Lat/Long
        public void PopulateLocationFromCoordinates()
        {
            if (Location == null && Lat != 0 && Long != 0)
            {
                Location = new Point(Long, Lat) { SRID = 4326 };
            }
        }
    }
}