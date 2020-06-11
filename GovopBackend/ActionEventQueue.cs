using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace GovopBackend
{
    public class ActionEventQueue
    {
        public static readonly Lazy<ActionEventQueue> Instance = new Lazy<ActionEventQueue>();

        private ResponseDTO[] _actionList = new ResponseDTO[0];
        private readonly object _actionLock = new object();

        public void Add(ResponseDTO response)
        {
            lock (_actionLock)
            {
                response.Id = _actionList.Length;
                _actionList = _actionList.Append(response).ToArray();
                Monitor.PulseAll(_actionLock);
            }
        }

        public IEnumerable<ResponseDTO> GetAfter(int id, TimeSpan totalWaitTime)
        {
            var end = DateTime.Now.Add(totalWaitTime);
            bool finished = false;
            lock (_actionLock)
            {
                while (true)
                {
                    if (finished || _actionList.Length > id)
                        return _actionList.Skip(id);

                    var partialWaitTime = end - DateTime.Now;
                    partialWaitTime = partialWaitTime.Add(new TimeSpan(0, 0, 1));
                    finished = !Monitor.Wait(_actionLock, partialWaitTime);
                }
            }
        }
    }
}
