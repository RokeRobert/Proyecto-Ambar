namespace Ambar.Api.DTOs
{
    public class ReciboAdminDto
    {
        public int IdRecibo { get; set; }
        public string Control { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string Carrera { get; set; } = string.Empty;
        public string Semestre { get; set; } = string.Empty;
    }
}