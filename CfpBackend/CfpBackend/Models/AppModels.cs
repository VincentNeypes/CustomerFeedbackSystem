namespace CfpBackend.Models
{
    public class User { public int Id { get; set; } public string Name { get; set; } = ""; public string Email { get; set; } = ""; public string PasswordHash { get; set; } = ""; public string Role { get; set; } = "Analyst"; public string Status { get; set; } = "Active"; }
    public class Survey { public int Id { get; set; } public string Title { get; set; } = ""; public string? Description { get; set; } public bool IsPublished { get; set; } public string QuestionsJson { get; set; } = "[]"; }
    public class SurveyResponse { public int Id { get; set; } public int SurveyId { get; set; } public string ResponsesJson { get; set; } = "{}"; public DateTime SubmittedAt { get; set; } = DateTime.UtcNow; }
    public class LoginDto { public string Email { get; set; } public string Password { get; set; } }
}