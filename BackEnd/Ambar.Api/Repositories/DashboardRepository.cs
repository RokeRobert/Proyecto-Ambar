using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface IDashboardRepository
    {
        Task<DashboardDto> GetResumenAsync(string carrera);
    }

    public class DashboardRepository : IDashboardRepository
    {
        private readonly IDbConnection _connection;
        public DashboardRepository(IDbConnection connection) => _connection = connection;

        public async Task<DashboardDto> GetResumenAsync(string carrera)
        {
            // Preparamos el filtro por carrera (Si es 'todas', no filtra)
            // Nota: Si en tu BD la columna se llama ID_Carrera, puedes cambiar "Carrera" por "ID_Carrera".
            string filtroCarrera = carrera == "todas" ? "" : "AND a.ID_Carrera = @Carrera";
            string filtroAlumnos = carrera == "todas" ? "" : "WHERE a.ID_Carrera = @Carrera";

            string query = $@"
                SELECT 
                    (SELECT COUNT(*) FROM alumnos a {filtroAlumnos}) AS TotalAlumnos,
                    
                    (SELECT COUNT(*) FROM recibos r 
                     INNER JOIN alumnos a ON r.ID_Alumno = a.ID_Alumno 
                     WHERE (r.ID_Estatus <> 2 OR r.ID_Estatus IS NULL) {filtroCarrera}) AS PagosPendientes,
                     
                    (SELECT COUNT(*) FROM recibos r 
                     INNER JOIN alumnos a ON r.ID_Alumno = a.ID_Alumno 
                     WHERE r.ID_Estatus = 2 {filtroCarrera}) AS PagosCompletados,
                     
                    (SELECT COUNT(*) FROM creditos_alumnos c
                     INNER JOIN alumnos a ON c.ID_Alumno = a.ID_Alumno 
                     WHERE c.ID_Estatus = 1 {filtroCarrera}) AS CreditosPendientes,

                    (SELECT COUNT(*) FROM creditos_alumnos c
                     INNER JOIN alumnos a ON c.ID_Alumno = a.ID_Alumno 
                     WHERE c.ID_Estatus = 2 {filtroCarrera}) AS CreditosAprobados,

                     (SELECT COUNT(*) FROM creditos_alumnos c
                     INNER JOIN alumnos a ON c.ID_Alumno = a.ID_Alumno 
                     WHERE c.ID_Estatus = 3 {filtroCarrera}) AS CreditosRechazados,

                    (
                        (SELECT COUNT(*) FROM tickets t
                         INNER JOIN alumnos a ON t.ID_Alumno = a.ID_Alumno 
                         WHERE t.ID_Estatus = 1 {filtroCarrera})
                        +
                        (SELECT COUNT(*) FROM tickets_profesores tp 
                         WHERE tp.ID_Estatus = 1)
                    ) AS TicketsAbiertos
            ";

            // Ejecutamos las subconsultas en un solo viaje a la base de datos
            var resultado = await _connection.QueryFirstOrDefaultAsync<DashboardDto>(query, new { Carrera = carrera });
            return resultado ?? new DashboardDto();
        }
    }
}