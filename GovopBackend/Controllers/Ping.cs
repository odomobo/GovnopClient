using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace GovopBackend.DTOs.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PingController : ControllerBase
    {
        [HttpPost]
        public void Post(PingDTO ping)
        {
            UserManager.Instance.Value.Ping(ping.UserGuid, ping.Nickname);
        }
    }
}
