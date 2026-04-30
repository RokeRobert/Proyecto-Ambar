namespace Ambar.Api.DTOs
{
    public class CreditoDto
    {
        public int IdActividad { get; set; }
        public string Actividad { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string? RutaArchivo { get; set; }
    }
}