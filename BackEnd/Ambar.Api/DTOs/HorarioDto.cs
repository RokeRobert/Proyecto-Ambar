namespace Ambar.Api.DTOs
{
    public class HorarioDto
    {
        public int Dia { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public string Materia { get; set; } = string.Empty;
        public string Aula { get; set; } = string.Empty;
    }
}