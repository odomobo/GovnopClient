import ViewModel from './ViewModel.js';
import URL from './URL.js';
import * as Messages from './Messages.js';



var VotingButtonComponent = {
  template: `
    <button 
      :id="'vote-' + voteBtn.voteId + '-btn'" 
      :class="{ 'vote-selected': voteBtn.voteId == selectedVote }"
      v-on:click="selectVote(voteBtn.voteId)"
    >{{ voteBtn.text }}</button>
  `,
  props: {
    voteBtn: Object,
    selectedVote: String
  },
  methods: {
    selectVote: function(voteId) {
      sendVote(voteId);
      ViewModel.voting.selected = voteId;
    }
  }
};

export var VotingComponent = {
  template: `
    <div id="voting-pane">
      <div id="start-vote-pane">
        <button id="start-vote-btn" v-bind:class="{ disabled: votingOpen }">Start Vote</button>
        <button id="close-vote-btn" v-bind:class="{ disabled: !votingOpen }">Close Vote</button>
      </div>
      <div id="vote-pane" v-bind:class="{ disabled: !votingOpen }">
        <voting-button 
          v-for="button in votingButtons" 
          :vote-btn="button"
          v-bind:selected-vote="selectedVote"
        ></voting-button>
      </div>
    </div>
  `,
  props: {
    votingButtons: Array,
    votingOpen: Boolean,
    selectedVote: String
  },
  components: {
    "votingButton": VotingButtonComponent
  }
}

function sendVote(voteId)
{
  console.log("Sending voting button click for: " + voteId);
  $.ajax(URL + "/vote",
    {
      method: "POST",
      async: true,
      timeout: 10000,
      data: JSON.stringify({userGuid: ViewModel.userGuid, nickname: ViewModel.nickname, voteId: voteId}),
      contentType: "application/json"
    }
  );
}

const SYSTEM_GUID = "00000000-0000-0000-0000-000000000000";

// TODO: remove these when no longer needed
const VOTE_ABSTAIN='a';
const VOTE_YES='y';
const VOTE_NO='n';

export function displayVoteReceived(userGuid, nickname, vote)
{
  console.log("Vote received: " + vote);
  
  // TODO: won't need this in the future
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
  
  ViewModel.players[userGuid].voteText = text;
  ViewModel.players[userGuid].vote = vote;
  ViewModel.players[userGuid].voted = true;
}

const TEXT_ABSTAIN = "- Abstain";
const TEXT_YES = "- Yes";
const TEXT_NO = "- No";

export function displayOpenVoting(userGuid, nickname)
{
  ViewModel.voting.selected = "";
  ViewModel.voting.isOpen = true;
  
  Messages.display(null, nickname + " initiated a vote");
  
  for (var prop in ViewModel.players)
  {
    ViewModel.players[prop].voteText = "";
    ViewModel.players[prop].vote = "";
    ViewModel.players[prop].voted = false;
  }
}

export function displayCloseVoting(userGuid, nickname, message)
{
  ViewModel.voting.selected = "";
  ViewModel.voting.isOpen = false;
  
  if (userGuid == SYSTEM_GUID)
  {
    Messages.display(null, "voting closed automatically; " + message);
  }
  else
  {
    Messages.display(null, nickname + " closed voting; " + message);
  }
  
  for (var prop in ViewModel.players)
  {
    ViewModel.players[prop].voted = false;
  }
}
