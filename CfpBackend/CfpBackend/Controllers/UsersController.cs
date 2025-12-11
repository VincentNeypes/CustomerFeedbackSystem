using CfpBackend.Data;
using CfpBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
namespace CfpBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UsersController(AppDbContext context) { _context = context; }
        [HttpGet] public async Task<ActionResult<IEnumerable<User>>> GetUsers() => await _context.Users.ToListAsync();
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(CreateUserDto request)
        {
            using var hmac = new HMACSHA512();
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Role = request.Role,
                Status = "Active",
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password)),
                PasswordSalt = hmac.Key
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }
    }
}