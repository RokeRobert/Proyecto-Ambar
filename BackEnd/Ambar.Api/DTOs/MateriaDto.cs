namespace Ambar.Api.DTOs
{
    public class MateriaDto
    {
        public int IdMateria { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int Creditos { get; set; }
        public int Semestre { get; set; }
        public int? IdCarrera { get; set; }
        public string Carrera { get; set; } = string.Empty;
        public int? IdEspecialidad { get; set; }
        public string NombreEspecialidad { get; set; } = string.Empty;
        public int? IdMateriaRequisito { get; set; }
        public string NombreMateriaRequisito { get; set; } = string.Empty;
    }
}