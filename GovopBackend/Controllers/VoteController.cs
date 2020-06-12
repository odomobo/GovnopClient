using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace GovopBackend.DTOs.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class VoteController : ControllerBase
    {
        [HttpPost]
        public void Post(VoteDTO vote)
        {
            UserManager.Instance.Value.CastVote(vote.UserGuid, vote.Nickname, vote.VoteId);
        }

        [HttpPost("close")]
        public void Close(PingDTO info)
        {
            UserManager.Instance.Value.CloseVoting(info.UserGuid, info.Nickname);
        }

        [HttpPost("open")]
        public void Open(PingDTO info)
        {
            UserManager.Instance.Value.OpenVoting(info.UserGuid, info.Nickname);
        }
    }
}
