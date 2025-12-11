using CfpBackend.Data;
using CfpBackend.Models;
using Microsoft.AspNetCore.Mvc;

namespace CfpBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SurveyResponsesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SurveyResponsesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/SurveyResponses
        [HttpPost]
        public async Task<ActionResult<SurveyResponse>> PostResponse(SurveyResponse response)
        {
            response.SubmittedAt = DateTime.UtcNow; // Set timestamp
            _context.SurveyResponses.Add(response);
            await _context.SaveChangesAsync();
            return Ok(response);
        }
    }
}