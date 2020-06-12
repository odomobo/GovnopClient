using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace GovopBackend.DTOs
{
    public enum Vote
    {
        Abstain = 0,
        Yes = 1,
        No = 2,
    }

    public class UserManager
    {
        public static readonly Lazy<UserManager> Instance = new Lazy<UserManager>();

        private class UserInfo
        {
            public string Nickname;
            public DateTime LastSeen;
            public Vote? Vote;
        }

        private enum VotingState
        {
            Open,
            Closed,
        }

        

        private readonly Dictionary<Guid, UserInfo> _users = new Dictionary<Guid, UserInfo>();
        private VotingState _votingState = VotingState.Closed;


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
                Thread.Sleep(TimeSpan.FromSeconds(5));
                List<Guid> guidsToRemove = new List<Guid>();
                lock (_users)
                {
                    foreach (var kvp in _users)
                    {
                        if (DateTime.Now - kvp.Value.LastSeen > TimeSpan.FromSeconds(10))
                        {
                            ActionEventQueue.Instance.Value.Add(
                                new ResponseDTO
                                    {UserGuid = kvp.Key, Nickname = kvp.Value.Nickname, Type = Types.RemoveName});
                            guidsToRemove.Add(kvp.Key);
                        }
                    }

                    foreach (var guid in guidsToRemove)
                    {
                        _users.Remove(guid);
                    }

                    if (guidsToRemove.Any() && _votingState == VotingState.Open && _users.Values.All(u => u.Vote != null))
                    {
                        CloseVoting(Guid.Empty, string.Empty);
                    }
                }
            }
        }

        public void CastVote(Guid userGuid, string nickname, int voteId)
        {
            lock (_users)
            {
                if (_votingState != VotingState.Open)
                    return;

                Vote vote = (Vote) voteId;
                if (!_users.ContainsKey(userGuid))
                {
                    // after the ping, then it will contain the user guaranteed
                    Ping(userGuid, nickname);
                }

                _users[userGuid].Vote = vote;

                ActionEventQueue.Instance.Value.Add(new ResponseDTO {UserGuid = userGuid, Nickname = nickname, Type = Types.Vote, VoteType = voteId});

                if (_users.Values.All(u => u.Vote != null))
                {
                    CloseVoting(Guid.Empty, string.Empty);
                }
            }
        }

        public void CloseVoting(Guid userGuid, string nickname)
        {
            lock (_users)
            {
                // can't close voting if it's not open
                if (_votingState != VotingState.Open)
                    return;

                int yesCount = _users.Values.Count(u => u.Vote == Vote.Yes);
                int noCount = _users.Values.Count(u => u.Vote == Vote.No);
                int abstainCount = _users.Values.Count(u => u.Vote == Vote.Abstain || u.Vote == null);

                // TODO: include all results in message?
                string message;
                if (abstainCount > 0)
                {
                    message = $"vote results: {yesCount}/{noCount} (Abstain: {abstainCount})";
                }
                else
                {
                    message = $"vote results: {yesCount}/{noCount}";
                }

                _votingState = VotingState.Closed;
                ActionEventQueue.Instance.Value.Add(
                    new ResponseDTO
                        {UserGuid = userGuid, Nickname = nickname, Type = Types.VotingClosed, Message = message});

                foreach (var user in _users.Values)
                    user.Vote = null;
            }
        }

        public void OpenVoting(Guid userGuid, string nickname)
        {
            lock (_users)
            {
                // can't open voting if it's not closed
                if (_votingState != VotingState.Closed)
                    return;

                _votingState = VotingState.Open;
                ActionEventQueue.Instance.Value.Add(new ResponseDTO {UserGuid = userGuid, Nickname = nickname, Type=Types.VotingOpened});
            }
        }

    }
}
