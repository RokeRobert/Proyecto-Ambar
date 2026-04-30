namespace Ambar.Api.DTOs
{
    public class CalificacionDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Clave { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public string Grupo { get; set; } = string.Empty;
        public int Creditos { get; set; }
        public int IdPeriodo { get; set; }
        public int? U1 { get; set; }
        public int? U2 { get; set; }
        public int? U3 { get; set; }
        public int? U4 { get; set; }
        public int? U5 { get; set; }
        public int? U6 { get; set; }
    }
}