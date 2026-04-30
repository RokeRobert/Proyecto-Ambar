namespace Ambar.Api.Models
{
    public class ConceptoPago
    {
        public int ID_Concepto { get; set; }
        public string Nombre_Concepto { get; set; } = string.Empty;
        public decimal? Importe { get; set; }
    }
}