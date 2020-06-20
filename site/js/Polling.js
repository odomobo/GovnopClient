import ViewModel from './ViewModel.js';
import URL from './URL.js';
import * as Messages from './Messages.js';

const SYSTEM_GUID = "00000000-0000-0000-0000-000000000000";

// TODO: maybe allow for reset on server reset??
var LatestId = 0;

export function start()
{
  LatestId = 0;
  setTimeout(poll, 0);
}

function addUpdateUser(guid, nickname)
{
  //var $user = $("#players li[data-guid='" + guid + "']");
  //if ($user.length == 0)
  //{
  //  
  //  $user = $("<li data-guid='" + guid + "'><span class='nickname'></span> <span class='vote'></span></li>");
  //  $user.find(".nickname").text(nickname);
  //  $("#players").append($user);
  //}
  //else
  //{
  //  var $userNickname = $user.find(".nickname");
  //  
  //  
  //  $userNickname.text(nickname);
  //}
  
  // vue
  if (guid in ViewModel.players)
  {
    var oldNickname = ViewModel.players[guid].nickname;
    ViewModel.players[guid].nickname = nickname;
    Messages.display(null, oldNickname + " updated their nickname to " + nickname);
  }
  else
  {
    // can't directly set property, because vue won't see it
    ViewModel.$set(ViewModel.players, guid, {nickname: nickname, voteText: "", vote: -1, voted: false});
    Messages.display(null, nickname + " connected");
  }
}

function removeUser(guid, nickname)
{
  //var $user = $("#players li[data-guid='" + guid + "']");
  //$user.remove();
  Messages.display(null, nickname + " disconnected");
  
  // vue
  // can't directly delete property, because vue won't see it
  ViewModel.$delete(ViewModel.players, guid);
}

function rollReceived(guid, nickname, message)
{
  Messages.display(null, nickname + " rolled " + message);
}

// TODO: remove these when no longer needed
const VOTE_ABSTAIN='a';
const VOTE_YES='y';
const VOTE_NO='n';

function voteReceived(userGuid, nickname, vote)
{
  console.log("Vote received: " + vote);
  //var $user = $("#players li[data-guid='" + userGuid + "']");
  //$user.addClass("voted");
  
  // TODO: won't need this in the future
  var text;
  if (vote == VOTE_ABSTAIN)
  {
    text = TEXT_ABSTAIN;
  } 
  else if (vote == VOTE_YES)
  {
    text = TEXT_YES;
  }
  else if (vote == VOTE_NO)
  {
    text = TEXT_NO;
  }
  else
  {
    console.log("Error: invalid vote: " + vote);
  }
  
  //$user.find(".vote").text(text);
  
  // vue
  ViewModel.players[userGuid].voteText = text;
  ViewModel.players[userGuid].voted = true;
}

const TEXT_ABSTAIN = "- Abstain";
const TEXT_YES = "- Yes";
const TEXT_NO = "- No";

function openVoting(userGuid, nickname)
{
  $("#start-vote-pane").addClass("disabled")
  $("#vote-pane").removeClass("disabled")
  $("#vote-pane button").removeClass("vote-selected");
  
  Messages.display(null, nickname + " initiated a vote");
  
  $("#players").removeClass("show-votes");
  //$("#players .vote").text("");
  
  // vue
  for (var prop in ViewModel.players)
  {
    ViewModel.players[prop].voteText = "";
    ViewModel.players[prop].voted = false;
  }
}

function closeVoting(userGuid, nickname, message)
{
  $("#start-vote-pane").removeClass("disabled")
  $("#vote-pane").addClass("disabled")
  $("#vote-pane button").removeClass("vote-selected");
  
  if (userGuid == SYSTEM_GUID)
  {
    Messages.display(null, "voting closed automatically; " + message);
  }
  else
  {
    Messages.display(null, nickname + " closed voting; " + message);
  }
  
  $("#players").addClass("show-votes");
  //$("#players li").removeClass("voted");
  
  // vue
  for (var prop in ViewModel.players)
  {
    ViewModel.players[prop].voted = false;
  }
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
    addUpdateUser(response.userGuid, response.nickname);
  }
  else if (response.type == TYPE_REMOVE_USER)
  {
    removeUser(response.userGuid, response.nickname);
  }
  else if (response.type == TYPE_ROLL)
  {
    rollReceived(response.userGuid, response.nickname, response.message);
  }
  else if (response.type == TYPE_VOTE)
  {
    voteReceived(response.userGuid, response.nickname, response.voteType)
  }
  else if (response.type == TYPE_VOTING_OPENED)
  {
    openVoting(response.userGuid, response.nickname);
  }
  else if (response.type == TYPE_VOTING_CLOSED)
  {
    closeVoting(response.userGuid, response.nickname, response.message);
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
    // TODO: real stuff here
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
