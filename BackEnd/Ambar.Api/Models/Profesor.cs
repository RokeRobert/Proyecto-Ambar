namespace Ambar.Api.Models
{
    public class Profesor
    {
        public int ID_Profesor { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Primer_Apellido { get; set; } = string.Empty;
        public string Segundo_Apellido { get; set; } = string.Empty;
        public int ID_Estatus { get; set; }
        public DateTime Fecha_Ingreso { get; set; }
        public int ID_Departamento { get; set; }
        public string Contrasena { get; set; } = string.Empty;
        public int ID_Rol { get; set; }
        public string Direccion_Foto { get; set; } = string.Empty;

    
        public string Correo_Institucional { get; set; } = string.Empty;
        
    }
}