using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface IReciboRepository
    {
        Task<IEnumerable<ReciboDto>> GetRecibosByAlumnoAsync(int idAlumno);
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
    }
}