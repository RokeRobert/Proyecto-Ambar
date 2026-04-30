namespace Ambar.Api.Models
{
    public class Materia
    {
        public int ID_Materia { get; set; }
        public int? ID_Carrera { get; set; }
        public string? Nombre_Materia { get; set; }
        public int? Horas_Teoricas { get; set; }
        public int? Horas_Practicas { get; set; }
        public int? Total_Creditos { get; set; }
        public string? Temario { get; set; }
        public int? Semestre { get; set; }
        public int? ID_Especialidad { get; set; }
    }
}