using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GovopBackend.DTOs
{
    public static class Types
    {
        public const int Message = 0;
        public const int AddUpdateName = 1;
        public const int RemoveName = 2;
        public const int Roll = 3;
        public const int Vote = 4;
        public const int VotingOpened = 5;
        public const int VotingClosed = 6;
    }
    public class ResponseDTO
    {
        public int Id { get; set; }
        public int Type { get; set; }
        public Guid UserGuid { get; set; }
        public string Nickname { get; set; }
        public string Message { get; set; }
        public string VoteType { get; set; }
    }
}
