namespace Ambar.Api.Models
{
    public class Horario
    {
        public int ID_Grupo { get; set; }
        public int ID_Salon { get; set; }
        public short Dia_Semana { get; set; }
        public int ID_Bloque_Tiempo { get; set; }
        public int ID_Periodo { get; set; }
    }
}