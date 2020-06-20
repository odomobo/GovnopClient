import ViewModel from './ViewModel.js';
import URL from './URL.js';

// TODO: build this in player module, register locally here
export const MessageComponent = {
  template: `
    <li :class="{ player: nickname != null, system: nickname == null }">
      <span v-if="nickname != null" class="username">{{ nickname }}:</span>
      <span class="message">{{ text }}</span>
    </li>
  `,
  props: {
    nickname: String,
    text: String
  },
};

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

function displayMessage(nickname, message)
{
  ViewModel.messages.push({nickname: nickname, text: message});
}

function displaySystemMessage(message)
{
  ViewModel.messages.push({nickname: null, text: "* " + message});
}

export function display(nickname, message)
{
  if (nickname == null)
    displaySystemMessage(message);
  else
    displayMessage(nickname, message);
}