namespace Ambar.Api.DTOs
{
    public class GrupoDisponibleDto
    {
        public int IdGrupo { get; set; }
        public int IdMateria { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Clave { get; set; } = string.Empty;
        public string Docente { get; set; } = string.Empty;
        public int Creditos { get; set; }
        public string HorarioRaw { get; set; } = string.Empty;
    }
}