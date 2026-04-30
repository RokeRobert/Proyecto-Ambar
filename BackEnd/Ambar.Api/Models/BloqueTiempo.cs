namespace Ambar.Api.Models
{
    public class BloqueTiempo
    {
        public int ID_Bloque_Tiempo { get; set; }
        public TimeSpan Hora_Inicio { get; set; }
        public TimeSpan Hora_Final { get; set; }
    }
}