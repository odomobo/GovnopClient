using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace GovopBackend
{
    public class UserManager
    {
        public static readonly Lazy<UserManager> Instance = new Lazy<UserManager>();

        private class UserInfo
        {
            public string Nickname;
            public DateTime LastSeen;
        }

        private readonly Dictionary<Guid, UserInfo> _users = new Dictionary<Guid, UserInfo>();


        public UserManager()
        {
            new Thread(Run).Start();
        }

        public void Ping(Guid guid, string nickname)
        {
            lock (_users)
            {
                UserInfo userInfo;
                if (_users.TryGetValue(guid, out userInfo))
                {
                    userInfo.LastSeen = DateTime.Now;
                    if (userInfo.Nickname == nickname)
                    {
                        // don't send an add/update message
                        return;
                    }

                    userInfo.Nickname = nickname;
                }
                else
                {
                    userInfo = new UserInfo {LastSeen = DateTime.Now, Nickname = nickname};
                    _users[guid] = userInfo;
                }

                ActionEventQueue.Instance.Value.Add(new ResponseDTO {UserGuid = guid, Nickname = nickname, Type = Types.AddUpdateName});
            }
        }

        private void Run()
        {
            while (true)
            {
                Thread.Sleep(TimeSpan.FromSeconds(30));
                lock (_users)
                {
                    foreach (var kvp in _users)
                    {
                        if (DateTime.Now - kvp.Value.LastSeen > TimeSpan.FromSeconds(60))
                        {
                            ActionEventQueue.Instance.Value.Add(new ResponseDTO {UserGuid = kvp.Key, Nickname = kvp.Value.Nickname, Type = Types.RemoveName});
                        }
                    }
                }
            }
        }

    }
}
