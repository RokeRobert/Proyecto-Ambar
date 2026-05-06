namespace Ambar.Api.DTOs
{
    public class CrearAlumnoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string PrimerApellido { get; set; } = string.Empty;
        public string SegundoApellido { get; set; } = string.Empty;
        public string Curp { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string CorreoPersonal { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public int IdCarrera { get; set; }
        public int IdPeriodo { get; set; }
        public string Contrasena { get; set; } = string.Empty;
    }
}