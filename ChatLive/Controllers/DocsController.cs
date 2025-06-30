using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ChatLive.Controllers
{
    [Route("/[controller]")]
    [ApiController]
    public class DocsController : ControllerBase
    {
        [HttpGet("hub")]
        public IActionResult Hub()
        {
            return Ok(new
            {
                url = "/hub",
                description = "Use this endpoint with SignalR client to establish real-time connection."
            });
        }
    }
}
