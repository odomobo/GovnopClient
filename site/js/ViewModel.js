import Vue from 'https://unpkg.com/vue@2.6.0/dist/vue.esm.browser.min.js';
import * as Players from './Players.js';
import * as Messages from './Messages.js';
import * as Voting from './Voting.js';


var App = new Vue({
  el: '#app',
  // TODO: encapsulate all of the data possible
  data: {
    players: {},
    nickname: "",
    userGuid: "",
    messages: [],
    // TODO: encapsulate this inside of voting component
    voting: {      
      buttons: [
        {text: "Yes", voteId: 'y', selected: false},
        {text: "No", voteId: 'n', selected: false},
        {text: "Abstain", voteId: 'a', selected: false}
      ],
      selected: "",
      isOpen: false
    }
  },
  components: {
    "player": Players.PlayerComponent,
    "message": Messages.MessageComponent,
    "voting": Voting.VotingComponent
  }
});

export default App;