
var URL="";
var USER_GUID="";
var Nickname = "";
const SYSTEM_GUID = "00000000-0000-0000-0000-000000000000";

$(document).ready(function(){
  setURL();
  setInitialNickname();
  setInitialUserId();
  $("#nickname").change(nicknameChanged);
  $("#roll-btn").click(rollClicked);
  $("#message").on('keypress',function(e) {
    if(e.which == 13) {
      messageEntered();
    }
  });
  initVoting();
  startPolling();
});

function setURL()
{
  var urlVars = getUrlVars();
  // TODO: give error message on bad URL?
  console.log(urlVars);
  URL = urlVars["server"];
}

function setInitialUserId()
{
  USER_GUID = sessionStorage.getItem("USER_GUID");
  
  if (!USER_GUID)
  {
    USER_GUID = uuidv4(); // TODO: use session storage
    sessionStorage.setItem("USER_GUID", USER_GUID);
  }
}

function setInitialNickname()
{
  Nickname = localStorage.getItem("Nickname");
  if (!Nickname)
  {
    Nickname = "unnamed_user";
    localStorage.setItem("Nickname", Nickname);
  }
  $("#nickname").val(Nickname);
}

function createMessage(type, message)
{
  return {userGuid: USER_GUID, nickname: Nickname, message: message};
}

function nicknameChanged()
{
  var nickname = $("#nickname").val();
  Nickname = nickname;
  localStorage.setItem("Nickname", Nickname);
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const VOTE_ABSTAIN=0;
const VOTE_YES=1;
const VOTE_NO=2;

function initVoting() {
  $("#start-vote-btn").click(sendStartVote);
  $("#clear-vote-btn").click(clearVote);
  $("#vote-yes-btn").click(function(){sendVote(VOTE_YES)});
  $("#vote-no-btn").click(function(){sendVote(VOTE_NO)});
  $("#vote-abstain-btn").click(function(){sendVote(VOTE_ABSTAIN)});
  $("#close-vote-btn").click(sendCloseVote);
}

function clearVote() {
  $("#players").removeClass("show-votes");
  // TODO
}

function sendVote(voteId)
{
  console.log("Sending voting button click for: " + voteId);
  $.ajax(URL + "/vote",
    {
      method: "POST",
      async: true,
      timeout: 10000,
      data: JSON.stringify({userGuid: USER_GUID, nickname: Nickname, voteId: voteId}),
      contentType: "application/json"
    }
  );
}

function sendStartVote()
{
  console.log("Sending open vote");
  $.ajax(URL + "/vote/open",
    {
      method: "POST",
      async: true,
      timeout: 10000,
      data: JSON.stringify({userGuid: USER_GUID, nickname: Nickname}),
      contentType: "application/json"
    }
  );
}

function sendCloseVote()
{
  console.log("Sending close vote");
  $.ajax(URL + "/vote/close",
    {
      method: "POST",
      async: true,
      timeout: 10000,
      data: JSON.stringify({userGuid: USER_GUID, nickname: Nickname}),
      contentType: "application/json"
    }
  );
}

function messageEntered()
{
  var message = $("#message").val();
  $("#message").val("");
  sendMessage({userGuid: USER_GUID, nickname: Nickname, type: TYPE_MESSAGE, message: message});
}

function sendMessage(message)
{
  console.log(JSON.stringify(message));
  $.ajax(URL + "/actions",
    {
      method: "POST",
      async: true,
      timeout: 10000,
      data: JSON.stringify(message),
      contentType: "application/json"
    }
  );
}

function rollClicked()
{
  console.log("Roll clicked");
  $.ajax(URL + "/roll",
    {
      method: "POST",
      async: true,
      timeout: 10000,
      data: JSON.stringify({userGuid: USER_GUID, nickname: Nickname}),
      contentType: "application/json"
    }
  );
}

// https://stackoverflow.com/a/4656873
// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function appendRawMessage(text)
{
  var messageBox = $("#messages");
  var prevMessage = messageBox.val();
  if (prevMessage.length == 0)
  {
    messageBox.val(text);
  }
  else
  {
    messageBox.val(prevMessage + "\n" + text);
  }
  
  messageBox.scrollTop(messageBox[0].scrollHeight);
}

function appendMessage(nickname, message)
{
  var text = nickname + ": " + message;
  appendRawMessage(text);
}

function appendSystemMessage(message)
{
  var text = "* " + message;
  appendRawMessage(text);
}

function addUpdateUser(guid, nickname)
{
  var $user = $("#players li[data-guid='" + guid + "']");
  if ($user.length == 0)
  {
    appendSystemMessage(nickname + " logged on");
    $user = $("<li data-guid='" + guid + "'><span class='nickname'></span> <span class='vote'></span></li>");
    $user.find(".nickname").text(nickname);
    $("#players").append($user);
  }
  else
  {
    var $userNickname = $user.find(".nickname");
    var oldNickname = $userNickname.text();
    appendSystemMessage(oldNickname + " updated their nickname to " + nickname);
    $userNickname.text(nickname);
  }
}

function removeUser(guid, nickname)
{
  var $user = $("#players li[data-guid='" + guid + "']");
  $user.remove();
  appendSystemMessage(nickname + " logged off");
}

function rollReceived(guid, nickname, message)
{
  appendSystemMessage(nickname + " rolled " + message);
}

function voteReceived(userGuid, nickname, vote)
{
  console.log("Vote received: " + vote);
  var $user = $("#players li[data-guid='" + userGuid + "']");
  $user.addClass("voted");
  
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
  
  $user.find(".vote").text(text);
}

const TEXT_ABSTAIN = "- Abstain";
const TEXT_YES = "- Yes";
const TEXT_NO = "- No";

function openVoting(userGuid, nickname)
{
  $("#start-vote-pane").addClass("disabled")
  $("#vote-pane").removeClass("disabled")
  
  appendSystemMessage(nickname + " initiated a vote");
  
  $("#players").removeClass("show-votes");
  $("#players .vote").text("");
  
  // TODO
}

function closeVoting(userGuid, nickname, message)
{
  $("#start-vote-pane").removeClass("disabled")
  $("#vote-pane").addClass("disabled")
  
  if (userGuid == SYSTEM_GUID)
  {
    appendSystemMessage("voting closed automatically; " + message);
  }
  else
  {
    appendSystemMessage(nickname + " closed voting; " + message);
  }
  
  $("#players").addClass("show-votes");
  $("#players li").removeClass("voted");
  
  // TODO
}

const TYPE_MESSAGE=0;
const TYPE_ADD_UPDATE_USER=1;
const TYPE_REMOVE_USER=2;
const TYPE_ROLL=3;
const TYPE_VOTE=4;
const TYPE_VOTING_OPENED=5;
const TYPE_VOTING_CLOSED=6;

function processResponse(response)
{
  if (response.type == TYPE_MESSAGE)
  {
    appendMessage(response.nickname, response.message);
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

function startPinging()
{
  setTimeout(ping, 0);
}

function ping()
{
  $.ajax(URL + "/ping",
    {
      method: "POST",
      async: true,
      timeout: 5000,
      data: JSON.stringify({userGuid: USER_GUID, nickname: Nickname}),
      contentType: "application/json"
    }
  ).done(function(){
    $("#connection-error").addClass("hidden");
  }).fail(function(){
    $("#connection-error").removeClass("hidden");
  }).always(function(){
    setTimeout(ping, 1000);
  });
}

var LatestId;
function startPolling()
{
  LatestId = 0;
  setTimeout(poll, 0);
}

function poll()
{
  ping();
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
      //var message = data[i];
      processResponse(data[i]);
      //$("#messages").append("<li>"+message.message+"</li>");
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