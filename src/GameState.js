export const GameState = {
  currentLevel: 1,
  currentRound: 1,
  maxRounds: 2,
  tournamentPlayers: [], 
  eliminatedBots: [],
  gems: 2000,

  resetTournament() {
    this.currentRound = 1;
    this.eliminatedBots = [];
    this.tournamentPlayers = [];
  },

  nextRound() {
    this.currentRound++;
  }
};
