using CfpBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CfpBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetStats([FromQuery] string? location = null)
        {
            var query = _context.SurveyResponses.AsQueryable();

            if (!string.IsNullOrEmpty(location) && location != "All Locations")
            {
                query = query.Where(r => r.Location == location);
            }

            var responses = await query.ToListAsync();
            var totalResponses = responses.Count;

            double totalCsat = 0;
            int csatCount = 0;
            int promoters = 0;
            int detractors = 0;
            int npsCount = 0;

            foreach (var r in responses)
            {

                try
                {
                    var answers = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(r.ResponsesJson);
                    if (answers == null) continue;

                    foreach (var kvp in answers)
                    {
                        if (int.TryParse(kvp.Value, out int score))
                        {
                            // CSAT (1-5 scale)
                            if (score >= 1 && score <= 5)
                            {
                                totalCsat += score;
                                csatCount++;
                            }
                            // NPS (0-10 scale)
                            if (score >= 0 && score <= 10)
                            {
                                if (score >= 9) promoters++;
                                else if (score <= 6) detractors++;
                                npsCount++;
                            }
                        }
                    }
                }
                catch {  }
            }

            double avgSatisfaction = csatCount > 0 ? Math.Round(totalCsat / csatCount, 1) : 0;
            double npsScore = npsCount > 0 ? ((double)(promoters - detractors) / npsCount) * 100 : 0;

            return Ok(new
            {
                TotalResponses = totalResponses,
                AvgSatisfaction = avgSatisfaction,
                NpsScore = Math.Round(npsScore, 0),
                CompletionRate = 100
            });
        }

        // GET: api/analytics/trends
        [HttpGet("trends")]
        public async Task<IActionResult> GetTrends()
        {
            var data = await _context.SurveyResponses
                .GroupBy(r => r.SubmittedAt.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .OrderBy(x => x.Date)
                .Take(30)
                .ToListAsync();

            var labels = data.Select(x => x.Date.ToString("MM/dd")).ToArray();
            var values = data.Select(x => x.Count).ToArray();

            return Ok(new { labels, data = values });
        }
    }
}