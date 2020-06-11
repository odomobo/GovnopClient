
var URL="";
var USER_GUID="";
var Nickname = "";

$(document).ready(function(){
  setURL();
  USER_GUID = uuidv4(); // TODO: use session storage
  startPolling();
});

function setURL()
{
  var urlVars = getUrlVars();
  // TODO: give error message on bad URL?
  console.log(urlVars);
  URL = urlVars["url"];
  setInitialNickname()
  $("#nickname").change(nicknameChanged);
}

function setInitialNickname()
{
  var initialNickname = "unnamed user";
  $("#nickname").val(initialNickname);
  Nickname = initialNickname;
}

function createMessage(type, message)
{
  return {userGuid: USER_GUID, nickname: Nickname, message: message};
}

function nicknameChanged()
{
  var nickname = $("#nickname").val();
  Nickname = nickname;
  ping();
  //sendMessage(createMessage(0, "Nickname changed from xxx to " + nickname));
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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

var LatestId;
function startPolling()
{
  LatestId = 0;
  setTimeout(poll, 0);
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
  appendSystemMessage("Nickname added or updated to " + nickname);
}

function removeUser(guid, nickname)
{
  appendSystemMessage(nickname + " logged off");
}

var TYPE_MESSAGE=0;
var TYPE_ADD_UPDATE_USER=1;
var TYPE_REMOVE_USER=2;

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
  else
  {
    console.log("Invalid response object:");
    console.log(response);
  }
}

function ping()
{
  $.ajax(URL + "/ping",
    {
      method: "POST",
      async: true,
      timeout: 1000,
      data: JSON.stringify({userGuid: USER_GUID, nickname: Nickname}),
      contentType: "application/json"
    }
  );
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