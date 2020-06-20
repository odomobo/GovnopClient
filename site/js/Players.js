import Vue from 'https://unpkg.com/vue@2.6.0/dist/vue.esm.browser.min.js';
import ViewModel from './ViewModel.js';
import * as Messages from './Messages.js';


export const PlayerComponent = {
  template: `
    <li v-bind:class="{ voted: player.voted }">
      <span class='nickname'>{{player.nickname}}</span>
      <span class='vote'>{{player.voteText}}</span>
    </li>
  `,
  props: {
    player: Object
  },
};

export function addUpdate(guid, nickname)
{
  if (guid in ViewModel.players)
  {
    var oldNickname = ViewModel.players[guid].nickname;
    ViewModel.players[guid].nickname = nickname;
    Messages.display(null, oldNickname + " updated their nickname to " + nickname);
  }
  else
  {
    // can't directly set property, because vue won't see it
    ViewModel.$set(ViewModel.players, guid, {nickname: nickname, voteText: "", vote: "", voted: false});
    Messages.display(null, nickname + " connected");
  }
}

export function remove(guid, nickname)
{
  ViewModel.$delete(ViewModel.players, guid);
  Messages.display(null, nickname + " disconnected");
}

