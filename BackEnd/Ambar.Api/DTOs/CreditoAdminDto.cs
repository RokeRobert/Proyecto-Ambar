namespace Ambar.Api.DTOs
{
    public class CreditoAdminDto
    {
        public int IdAlumno { get; set; }
        public string Control { get; set; } = string.Empty;
        public string NombreAlumno { get; set; } = string.Empty;
        public string Carrera { get; set; } = string.Empty;
        public int IdActividad { get; set; }
        public string Actividad { get; set; } = string.Empty;
        public string RutaPdf { get; set; } = string.Empty;
        public int IdEstatus { get; set; }
    }
}