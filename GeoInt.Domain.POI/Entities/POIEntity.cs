using GeoInt.Core;


namespace GeoInt.Domain.POI.Entities
{
    public class POIEntity : IEntity<Guid>
    {
        public Guid Id { get; set; }

        public string Name { get; set; }
        public string Category { get; set; }

        public double Lat { get; set; }
        public double Long { get; set; }

        public DateTime created_at { get; set; }
        public DateTime? modified_at { get; set; }
        public DateTime? deleted_at { get; set; }
    }
}