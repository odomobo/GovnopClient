import ViewModel from './ViewModel.js';
import URL from './URL.js';

// TODO: refactor this to have its own endpoint, instead of being silly... I think?
const TYPE_MESSAGE=0;
export function send(message)
{
  var action = {userGuid: ViewModel.userGuid, nickname: ViewModel.nickname, type: TYPE_MESSAGE, message: message};
  console.log(JSON.stringify(action));
  $.ajax(URL + "/actions",
    {
      method: "POST",
      async: true,
      timeout: 10000,
      data: JSON.stringify(action),
      contentType: "application/json"
    }
  );
}

function appendRawMessage(html)
{
  var $messageList = $("#messages");
  //$newMessage = $("<li class='"+cls+"'>"+html+"</li>");
  $messageList.append(html);
}

function displayMessage(nickname, message)
{
  // TODO: don't preserve nickname, but do preserve message
  var $html = $("<li class='player'><span class='username'></span> <span class='message'></span></li>");
  $html.find(".username").text(nickname+":");
  $html.find(".message").text(message);
  appendRawMessage($html[0].outerHTML);
}

function displaySystemMessage(message)
{
  var $html = $("<li class='system'></li>");
  $html.text("* " + message);
  appendRawMessage($html[0].outerHTML);
}

export function display(nickname, message)
{
  if (nickname == null)
    displaySystemMessage(message);
  else
    displayMessage(nickname, message);
}