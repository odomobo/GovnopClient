import ViewModel from './ViewModel.js';
import URL from './URL.js';
import * as Messages from './Messages.js';
import * as Voting from './Voting.js';
import * as Players from './Players.js';

// TODO: maybe allow for reset on server reset??
var LatestId = 0;

export function start()
{
  LatestId = 0;
  setTimeout(poll, 0);
}

function rollReceived(guid, nickname, message)
{
  Messages.display(null, nickname + " rolled " + message);
}

const TYPE_MESSAGE=0;
const TYPE_ADD_UPDATE_USER=1;
const TYPE_REMOVE_USER=2;
const TYPE_ROLL=3;
const TYPE_VOTE=4;
const TYPE_VOTING_OPENED=5;
const TYPE_VOTING_CLOSED=6;

// TODO: refactor this to be less nasty?
function processResponse(response)
{
  if (response.type == TYPE_MESSAGE)
  {
    Messages.display(response.nickname, response.message);
  }
  else if (response.type == TYPE_ADD_UPDATE_USER)
  {
    Players.addUpdate(response.userGuid, response.nickname);
  }
  else if (response.type == TYPE_REMOVE_USER)
  {
    Players.remove(response.userGuid, response.nickname);
  }
  else if (response.type == TYPE_ROLL)
  {
    rollReceived(response.userGuid, response.nickname, response.message);
  }
  else if (response.type == TYPE_VOTE)
  {
    Voting.displayVoteReceived(response.userGuid, response.nickname, response.voteType)
  }
  else if (response.type == TYPE_VOTING_OPENED)
  {
    Voting.displayOpenVoting(response.userGuid, response.nickname);
  }
  else if (response.type == TYPE_VOTING_CLOSED)
  {
    Voting.displayCloseVoting(response.userGuid, response.nickname, response.message);
  }
  else
  {
    console.log("Invalid response object:");
    console.log(response);
  }
}

function poll()
{
  console.log("Waiting for " + LatestId);
  $.ajax(URL + "/actions/" + LatestId,
    {
      async: true,
      timeout: 60000
    }
  ).done(function( data ) {
    console.log( data );
    
    for (var i = 0; i < data.length; i++)
    {
      processResponse(data[i]);
    }
    
    if (data.length > 0)
    {
      LatestId = data[data.length-1].id + 1;
    }
    setTimeout(poll, 1);
  }).fail(function(){
    setTimeout(poll, 1000);
  });
}
