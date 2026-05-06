namespace Ambar.Api.DTOs
{
    public class CrearMateriaDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int Creditos { get; set; }
        public int Semestre { get; set; }
        public int? IdCarrera { get; set; }
        public int? IdEspecialidad { get; set; }
        public int? IdMateriaRequisito { get; set; }
    }
}