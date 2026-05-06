using Ambar.Api.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ambar.Api.Repositories
{
    public interface ICoordinadorRepository
    {
        Task<IEnumerable<GrupoAsignacionDto>> GetGruposConProfesorAsync();
        Task<IEnumerable<DocenteSimpleDto>> GetDocentesAsync();
        Task<bool> AsignarProfesorAsync(int idGrupo, int? idProfesor);
        Task<IEnumerable<AlumnoBusquedaDto>> BuscarAlumnosAsync(string termino);
        Task<AlumnoDetalleDto> GetAlumnoDetallesAsync(string idAlumno);
        Task<IEnumerable<OfertaAcademicaDto>> GetOfertaAcademicaAsync();
        Task<bool> InscribirAlumnoAsync(string idAlumno, int idGrupo);
        Task<bool> DarBajaAlumnoAsync(string idAlumno, int idGrupo);
    }
}