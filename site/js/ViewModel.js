import Vue from 'https://unpkg.com/vue@2.6.0/dist/vue.esm.browser.min.js';

// register player component
Vue.component('player', {
  template: "#player-template",
  props: {
    nickname: String,
    voteText: String,
    vote: Number,
    voted: Boolean
  },
});

var App = new Vue({
  el: '#app',
  data: {
    players: {},
    nickname: "",
    userGuid: ""
  }
});

export default App;