using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GovopBackend.DTOs
{
    public class VoteDTO
    {
        public Guid UserGuid { get; set; }
        public string Nickname { get; set; }
        public string VoteId { get; set; }
    }
}
