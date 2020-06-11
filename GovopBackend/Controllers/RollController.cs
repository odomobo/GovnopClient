using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace GovopBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RollController : ControllerBase
    {
        private readonly Random _random = new Random();

        [HttpPost]
        public void Post(PingDto ping)
        {
            var roll = Roll(2, 6);
            var rollStr = string.Join(" ", roll);
            var message = $"{roll.Sum()} [ {rollStr} ]";
            ActionEventQueue.Instance.Value.Add(new ResponseDTO{Message = message, Nickname = ping.Nickname, UserGuid = ping.UserGuid, Type = Types.Roll});
        }

        private List<int> Roll(int count, int dNumber)
        {
            var ret = new List<int>();
            for (int i = 0; i < count; i++)
            {
                ret.Add(_random.Next(1, 7));
            }

            return ret;
        }
    }
}
