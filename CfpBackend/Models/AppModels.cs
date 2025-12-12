namespace CfpBackend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public byte[] PasswordHash { get; set; } = Array.Empty<byte>();
        public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();
        public string Role { get; set; } = "Analyst";
        public string Status { get; set; } = "Active";
    }

    public class Survey
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsPublished { get; set; }
        public string QuestionsJson { get; set; } = "[]";
    }

    public class SurveyResponse
    {
        public int Id { get; set; }
        public int SurveyId { get; set; }
        public string ResponsesJson { get; set; } = "{}";
        public string Location { get; set; } = "Unknown";
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }

    public class LoginDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class CreateUserDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }
    }
}