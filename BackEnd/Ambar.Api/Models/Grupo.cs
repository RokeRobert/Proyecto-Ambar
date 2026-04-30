namespace Ambar.Api.Models
{
    public class Grupo
    {
        public int ID_Grupo { get; set; }
        public int ID_Carrera { get; set; }
        public int ID_Materia { get; set; }
        public int? ID_Profesor { get; set; }
        public int ID_Estatus { get; set; }
        public int ID_Periodo { get; set; }
    }
}