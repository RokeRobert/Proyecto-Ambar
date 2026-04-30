namespace Ambar.Api.DTOs
{
    public class AlumnoPerfilDto
    {
        public int ID_Alumno { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Primer_Apellido { get; set; } = string.Empty;
        public string? Segundo_Apellido { get; set; }
        public int ID_Carrera { get; set; }
        public int ID_Periodo_Ingreso { get; set; }
        public int Periodo_Actual { get; set; }
        public string CURP { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Correo_Personal { get; set; } = string.Empty;
        public string? Correo_Institucional { get; set; }
        public DateTime Fecha_Nacimiento { get; set; }
        public string? Ciudad { get; set; }
        public string? Colonia { get; set; }
        public string? Calle { get; set; }
        public string? Codigo_Postal { get; set; }
        public string Direccion_Foto { get; set; } = string.Empty;
        public string? Nombre_Carrera { get; set; }
        public string? Nombre_Especialidad { get; set; }
        public string? Nombre_Estatus { get; set; }
    }
}