using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface ICreditoRepository
    {
        Task<IEnumerable<CreditoDto>> GetByAlumnoAsync(int idAlumno);
        Task<IEnumerable<ActividadDisponibleDto>> GetActividadesDisponiblesAsync(int idAlumno);
        Task<bool> SubirCreditoAsync(int idAlumno, int idActividad, string rutaArchivo);
        Task<IEnumerable<CreditoAdminDto>> GetCreditosAdminAsync();
        Task<bool> ActualizarEstatusCreditoAsync(ActualizarEstatusCreditoDto dto);
    }

    public class CreditoRepository : ICreditoRepository
    {
        private readonly IDbConnection _connection;
        public CreditoRepository(IDbConnection connection) => _connection = connection;

        public async Task<IEnumerable<CreditoDto>> GetByAlumnoAsync(int idAlumno)
        {
            string query = @"
                SELECT 
                    ca.ID_Actividad_Complementaria AS IdActividad,
                    ac.Nombre_Actividad AS Actividad,
                    tc.Nombre_Tipo_Credito AS Tipo,
                    ee.Nombre_Estatus AS Estado,
                    ca.PDF_CreditoComplementario AS RutaArchivo
                FROM creditos_alumnos ca
                INNER JOIN actividades_complementarias ac ON ca.ID_Actividad_Complementaria = ac.ID_Actividad_Complementaria
                INNER JOIN tipo_credito tc ON ac.ID_Tipo_Credito = tc.ID_Tipo_Credito
                INNER JOIN estatus_eventos ee ON ca.ID_Estatus = ee.ID_Estatus
                WHERE ca.ID_Alumno = @IdAlumno";
            return await _connection.QueryAsync<CreditoDto>(query, new { IdAlumno = idAlumno });
        }

        public async Task<IEnumerable<ActividadDisponibleDto>> GetActividadesDisponiblesAsync(int idAlumno)
        {
            string query = @"
                SELECT 
                    ac.ID_Actividad_Complementaria AS IdActividad,
                    ac.Nombre_Actividad AS Nombre,
                    tc.Nombre_Tipo_Credito AS Tipo
                FROM actividades_complementarias ac
                INNER JOIN tipo_credito tc ON ac.ID_Tipo_Credito = tc.ID_Tipo_Credito
                WHERE ac.ID_Actividad_Complementaria NOT IN (
                    -- Ocultamos las actividades que el alumno ya completó o que están en revisión
                    SELECT ID_Actividad_Complementaria 
                    FROM creditos_alumnos 
                    WHERE ID_Alumno = @IdAlumno AND ID_Estatus IN (1, 2) 
                )";
            return await _connection.QueryAsync<ActividadDisponibleDto>(query, new { IdAlumno = idAlumno });
        }

        public async Task<bool> SubirCreditoAsync(int idAlumno, int idActividad, string rutaArchivo)
        {
            string query = @"
                IF EXISTS (SELECT 1 FROM creditos_alumnos WHERE ID_Alumno = @IdAlumno AND ID_Actividad_Complementaria = @IdActividad)
                BEGIN
                    UPDATE creditos_alumnos 
                    SET PDF_CreditoComplementario = @RutaArchivo, ID_Estatus = 2 
                    WHERE ID_Alumno = @IdAlumno AND ID_Actividad_Complementaria = @IdActividad
                END
                ELSE
                BEGIN
                    INSERT INTO creditos_alumnos (ID_Alumno, ID_Actividad_Complementaria, ID_Estatus, PDF_CreditoComplementario)
                    VALUES (@IdAlumno, @IdActividad, 2, @RutaArchivo)
                END";
            return await _connection.ExecuteAsync(query, new { IdAlumno = idAlumno, IdActividad = idActividad, RutaArchivo = rutaArchivo }) > 0;
        }

        public async Task<IEnumerable<CreditoAdminDto>> GetCreditosAdminAsync()
        {
            string query = @"
                SELECT 
                    ca.ID_Alumno AS IdAlumno,
                    CAST(ca.ID_Alumno AS VARCHAR(20)) AS Control,
                    ISNULL(a.Nombre, '') + ' ' + ISNULL(a.Primer_Apellido, '') AS NombreAlumno,
                    ISNULL(c.Nombre_Carrera, 'Sin Carrera') AS Carrera,
                    ca.ID_Actividad_Complementaria AS IdActividad,
                    ISNULL(ac.Nombre_Actividad, 'Actividad Desconocida') AS Actividad,
                    ISNULL(ca.PDF_CreditoComplementario, '') AS RutaPdf,
                    ca.ID_Estatus AS IdEstatus
                FROM creditos_alumnos ca
                INNER JOIN alumnos a ON ca.ID_Alumno = a.ID_Alumno
                LEFT JOIN carreras c ON a.ID_Carrera = c.ID_Carrera
                LEFT JOIN actividades_complementarias ac ON ca.ID_Actividad_Complementaria = ac.ID_Actividad_Complementaria";
            return await _connection.QueryAsync<CreditoAdminDto>(query);
        }

        public async Task<bool> ActualizarEstatusCreditoAsync(ActualizarEstatusCreditoDto dto)
        {
            string query = @"
                UPDATE creditos_alumnos 
                SET ID_Estatus = @Estatus 
                WHERE ID_Alumno = @IdAlumno AND ID_Actividad_Complementaria = @IdActividad";
            return await _connection.ExecuteAsync(query, dto) > 0;
        }
    }
}