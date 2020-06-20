import ViewModel from './ViewModel.js';
import * as Ping from './Ping.js';
import * as Polling from './Polling.js';
import * as Messages from './Messages.js';
import URL from './URL.js';

$(document).ready(function(){

  setInitialNickname();
  setInitialUserId();
  $("#nickname").change(nicknameChanged);
  $("#roll-btn").click(rollClicked);
  $("#message").on('keypress',function(e) {
    if(e.which == 13) {
      messageEntered();
    }
  });
  Ping.start();
  Polling.start();
});

function setInitialUserId()
{
  ViewModel.userGuid = sessionStorage.getItem("USER_GUID");
  
  if (!ViewModel.userGuid)
  {
    ViewModel.userGuid = uuidv4();
    sessionStorage.setItem("USER_GUID", ViewModel.userGuid);
  }
}

function setInitialNickname()
{
  ViewModel.nickname = localStorage.getItem("Nickname");
  if (!ViewModel.nickname)
  {
    ViewModel.nickname = "unnamed_user";
    localStorage.setItem("Nickname", ViewModel.nickname);
  }
  $("#nickname").val(ViewModel.nickname);
}

function nicknameChanged()
{
  var nickname = $("#nickname").val();
  ViewModel.nickname = nickname;
  localStorage.setItem("Nickname", ViewModel.nickname);
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function rollClicked()
{
  console.log("Roll clicked");
  $.ajax(URL + "/roll",
    {
      method: "POST",
      async: true,
      timeout: 10000,
      data: JSON.stringify({userGuid: ViewModel.userGuid, nickname: ViewModel.nickname}),
      contentType: "application/json"
    }
  );
}

function messageEntered()
{
  var message = $("#message").val();
  $("#message").val("");
  Messages.send(message);
}
