namespace Ambar.Api.Models
{
    public class CreditoAlumno
    {
        public int ID_Alumno { get; set; }
        public int ID_Actividad_Complementaria { get; set; }
        public string? PDF_CreditoComplementario { get; set; }
        public int ID_Estatus { get; set; }
    }
}