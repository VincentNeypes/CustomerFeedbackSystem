using CfpBackend.Data;
using CfpBackend.Models;
using Microsoft.AspNetCore.Authorization; // Add this
using Microsoft.AspNetCore.Mvc;

namespace CfpBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // <--- This locks the entire controller
    public class SurveysController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SurveysController(AppDbContext context) { _context = context; }

        [HttpPost]
        public async Task<ActionResult<Survey>> PostSurvey(Survey survey)
        {
            _context.Surveys.Add(survey);
            await _context.SaveChangesAsync();
            return Ok(survey);
        }

        // You likely need a GET method to list surveys for the dashboard too
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Survey>>> GetSurveys()
        {
            // Simple implementation to fetch all surveys
            return Ok(_context.Surveys);
        }
    }
}