using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace GovopBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PingController : ControllerBase
    {
        private static Dictionary<Guid, string> Users = new Dictionary<Guid, string>();

        [HttpPost]
        public void Post(PingDto ping)
        {
            UserManager.Instance.Value.Ping(ping.UserGuid, ping.Nickname);
        }
    }
}
