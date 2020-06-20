import ViewModel from './ViewModel.js';
import URL from './URL.js';

export function start()
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
      data: JSON.stringify({userGuid: ViewModel.userGuid, nickname: ViewModel.nickname}),
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