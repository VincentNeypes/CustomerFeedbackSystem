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

        [HttpPost]
        public async Task<ActionResult<SurveyResponse>> PostResponse(SurveyResponse response)
        {
            response.SubmittedAt = DateTime.UtcNow;
            _context.SurveyResponses.Add(response);
            await _context.SaveChangesAsync();
            return Ok(response);
        }
    }
}