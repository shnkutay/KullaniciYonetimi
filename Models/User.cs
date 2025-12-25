using System.ComponentModel.DataAnnotations;

namespace KullaniciYonetimi.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string KullaniciAdi { get; set; } = string.Empty;
        public string Sifre { get; set; } = string.Empty;
        public string? AdSoyad { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;
        public string? Birim { get; set; } = string.Empty;
        public string? Rol { get; set; } = "Standart";
    }
}