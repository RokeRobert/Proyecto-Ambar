namespace Ambar.Api.Models
{
    public class PlaneacionDetalle
    {
        public int ID_Planeacion { get; set; }
        public int ID_Grupo { get; set; }
        public string Planeacion { get; set; } = string.Empty;
    }
}