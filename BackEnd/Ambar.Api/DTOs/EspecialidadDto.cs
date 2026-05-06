namespace Ambar.Api.DTOs
{
    public class EspecialidadDto
    {
        public int IdEspecialidad { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int IdCarrera { get; set; }
        public string NombreCarrera { get; set; } = string.Empty;
    }
}