namespace Ambar.Api.DTOs
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public object? Usuario { get; set; }
    }
}