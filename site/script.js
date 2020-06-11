
var URL="";
var USER_GUID="";
var Nickname = "";

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
  startPolling();
});

function setURL()
{
  var urlVars = getUrlVars();
  // TODO: give error message on bad URL?
  console.log(urlVars);
  URL = urlVars["url"];
}

function setInitialUserId()
{
  USER_GUID = localStorage.getItem("USER_GUID");
  
  if (!USER_GUID)
  {
    USER_GUID = uuidv4(); // TODO: use session storage
    localStorage.setItem("USER_GUID", USER_GUID);
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
    $("#players").append("<li data-guid='" + guid + "'>" + nickname + "</li>");
  }
  else
  {
    var oldNickname = $user.text();
    appendSystemMessage(oldNickname + " updated their nickname to " + nickname);
    $user.text(nickname);
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

var TYPE_MESSAGE=0;
var TYPE_ADD_UPDATE_USER=1;
var TYPE_REMOVE_USER=2;
var TYPE_ROLL=3;

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