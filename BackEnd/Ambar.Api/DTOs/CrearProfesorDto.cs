namespace Ambar.Api.DTOs
{
    public class CrearProfesorDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string PrimerApellido { get; set; } = string.Empty;
        public string SegundoApellido { get; set; } = string.Empty;
        public string CorreoInstitucional { get; set; } = string.Empty;
        public DateTime FechaIngreso { get; set; }
        public int IdDepartamento { get; set; }
        public int IdRol { get; set; }
        public string Contrasena { get; set; } = string.Empty;
        public int? IdCarreraCoordinada { get; set; }
    }
}