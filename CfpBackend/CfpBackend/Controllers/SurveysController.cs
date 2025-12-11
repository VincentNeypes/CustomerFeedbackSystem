using CfpBackend.Data;
using CfpBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Added for ToListAsync

namespace CfpBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Default: Require Login
    public class SurveysController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SurveysController(AppDbContext context) { _context = context; }

        // POST: api/surveys (Secured: Only Admins can publish)
        [HttpPost]
        public async Task<ActionResult<Survey>> PostSurvey(Survey survey)
        {
            _context.Surveys.Add(survey);
            await _context.SaveChangesAsync();
            return Ok(survey);
        }

        // GET: api/surveys (Public: Customers need to see this!)
        [HttpGet]
        [AllowAnonymous] 
        public async Task<ActionResult<IEnumerable<Survey>>> GetSurveys()
        {
            return await _context.Surveys.ToListAsync();
        }
    }
}