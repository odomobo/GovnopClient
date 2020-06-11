using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace GovopBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ActionsController : ControllerBase
    {
        [HttpPost]
        public void Post(ResponseDTO response)
        {
            ActionEventQueue.Instance.Value.Add(response);
        }

        [HttpGet("{id}")]
        public IEnumerable<ResponseDTO> Get(int id)
        {
            return ActionEventQueue.Instance.Value.GetAfter(id, TimeSpan.FromSeconds(30));
        }
    }
}
