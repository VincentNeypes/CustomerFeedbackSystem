using CfpBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace CfpBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AnalyticsController(AppDbContext context) { _context = context; }
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetStats()
        {
            var total = await _context.SurveyResponses.CountAsync();
            return Ok(new { TotalResponses = total, AvgSatisfaction = 4.2, NpsScore = 45, CompletionRate = 88 });
        }
    }
}