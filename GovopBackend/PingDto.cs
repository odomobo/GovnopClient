using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GovopBackend
{
    public class PingDto
    {
        public Guid UserGuid { get; set; }
        public string Nickname { get; set; }
    }
}
