using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GovopBackend
{
    public static class Types
    {
        public const int Message = 0;
        public const int AddUpdateName = 1;
        public const int RemoveName = 2;
        public const int Roll = 3;
    }
    public class ResponseDTO
    {
        public int Id { get; set; }
        public int Type { get; set; }
        public Guid UserGuid { get; set; }
        public string Nickname { get; set; }
        public string Message { get; set; }
    }
}
