using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface IReciboRepository
    {
        Task<IEnumerable<ReciboDto>> GetRecibosByAlumnoAsync(int idAlumno);
        Task<IEnumerable<ReciboAdminDto>> GetRecibosAdminAsync();
        Task<bool> MarcarPagadoAsync(int idRecibo);
        Task<bool> GenerarReciboPruebaAsync(int idAlumno);
    }

    public class ReciboRepository : IReciboRepository
    {
        private readonly IDbConnection _connection;
        public ReciboRepository(IDbConnection connection) => _connection = connection;

        public async Task<IEnumerable<ReciboDto>> GetRecibosByAlumnoAsync(int idAlumno)
        {
            string query = @"
                SELECT 
                    r.ID_Recibo AS IdRecibo,
                    CAST(r.Referencia_Bancaria AS VARCHAR) AS ReferenciaBancaria,
                    c.Nombre_Concepto AS Concepto,
                    CASE 
                        WHEN MONTH(r.Fecha_Emicion) <= 6 THEN 'ENE-JUN ' + CAST(YEAR(r.Fecha_Emicion) AS VARCHAR) 
                        ELSE 'AGO-DIC ' + CAST(YEAR(r.Fecha_Emicion) AS VARCHAR) 
                    END AS Periodo,
                    c.Importe AS Monto,
                    r.Fecha_Emicion AS FechaEmision,
                    r.Fecha_Vigencia AS FechaVencimiento,
                    er.Nombre_Estatus AS Estado
                FROM recibos r
                INNER JOIN conceptos_pago c ON r.ID_Concepto = c.ID_Concepto
                INNER JOIN estatus_recibos er ON r.ID_Estatus = er.ID_Estatus
                WHERE r.ID_Alumno = @IdAlumno
                ORDER BY r.Fecha_Emicion DESC";
            return await _connection.QueryAsync<ReciboDto>(query, new { IdAlumno = idAlumno });
        }

        public async Task<IEnumerable<ReciboAdminDto>> GetRecibosAdminAsync()
        {
            string query = @"
                SELECT 
                    r.ID_Recibo AS IdRecibo,
                    CAST(a.ID_Alumno AS VARCHAR(20)) AS Control,
                    'REF-' + CAST(r.Referencia_Bancaria AS VARCHAR(20)) AS Referencia,
                    CASE WHEN r.ID_Estatus = 2 THEN 'pagado' ELSE 'pendiente' END AS Estado,
                    ISNULL(c.Nombre_Carrera, 'Tronco Común') AS Carrera,
                    CAST((ISNULL((SELECT MAX(ID_Periodo) FROM periodos), 1) - ISNULL(a.ID_Periodo_Ingreso, 1) + 1) AS VARCHAR) AS Semestre
                FROM recibos r
                INNER JOIN alumnos a ON r.ID_Alumno = a.ID_Alumno
                LEFT JOIN carreras c ON a.ID_Carrera = c.ID_Carrera";
            return await _connection.QueryAsync<ReciboAdminDto>(query);
        }

        public async Task<bool> MarcarPagadoAsync(int idRecibo)
        {
            string query = "UPDATE recibos SET ID_Estatus = 2 WHERE ID_Recibo = @IdRecibo";
            return await _connection.ExecuteAsync(query, new { IdRecibo = idRecibo }) > 0;
        }

        public async Task<bool> GenerarReciboPruebaAsync(int idAlumno)
        {
            string query = @"
                INSERT INTO recibos (ID_Alumno, ID_Estatus, Referencia_Bancaria, ID_Concepto, ID_Banco, Convenio, Fecha_Emicion, Fecha_Vigencia)
                VALUES (@IdAlumno, 1, ABS(CHECKSUM(NEWID())) % 1000000, 1, 1, 12345, GETDATE(), DATEADD(day, 15, GETDATE()))";
            return await _connection.ExecuteAsync(query, new { IdAlumno = idAlumno }) > 0;
        }
    }
}