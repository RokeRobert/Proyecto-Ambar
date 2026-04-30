using System.Diagnostics.Contracts;

namespace Ambar.Api.Models
{
    public class Alumno
    {   
        public int ID_Alumno { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Primer_Apellido { get; set; } = string.Empty;
        public string? Segundo_Apellido { get; set; }
        public int ID_Carrera { get; set; }
        public int? ID_Especialidad { get; set; }
        public int? ID_Estatus { get; set; }
        public int ID_Periodo_Ingreso { get; set; }
        public string CURP { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Correo_Personal { get; set; } = string.Empty;
        public string? Correo_Institucional { get; set; }
        public DateTime Fecha_Nacimiento { get; set; }
        public string? Ciudad { get; set; }
        public string? Colonia { get; set; }
        public string? Calle { get; set; }
        public string? Codigo_Postal { get; set; }
        public string Contrasena { get; set; } = string.Empty;
        public string Direccion_Foto { get; set; } = string.Empty;
    }
}