namespace Ambar.Api.Models
{
    public class ActividadComplementaria
    {
        public int ID_Actividad_Complementaria { get; set; }
        public int ID_Tipo_Credito { get; set; }
        public string Nombre_Actividad { get; set; } = string.Empty;
        public int ID_Periodo { get; set; }
        public int ID_Profesor { get; set; }
        public int ID_Departamento { get; set; }
        public string? PDF_Formato_Credito { get; set; }
    }
}