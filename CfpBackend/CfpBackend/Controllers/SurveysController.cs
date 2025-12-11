using CfpBackend.Data;
using CfpBackend.Models;
using Microsoft.AspNetCore.Mvc;
namespace CfpBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SurveysController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SurveysController(AppDbContext context) { _context = context; }
        [HttpPost]
        public async Task<ActionResult<Survey>> PostSurvey(Survey survey)
        {
            _context.Surveys.Add(survey); await _context.SaveChangesAsync(); return Ok(survey);
        }
    }
}