import { Tournament } from '../../types/tournament';

export const mockTournamentData = {
  name: "Test Tournament",
  date: new Date().toISOString(),
  location: "Test Casino",
  buyIn: 1000,
  startingChips: 10000,
  maxPlayers: 100,
  blindStructure: [
    {
      level: 1,
      smallBlind: 25,
      bigBlind: 50,
      ante: 0,
      duration: 20
    },
    {
      level: 2,
      smallBlind: 50,
      bigBlind: 100,
      ante: 0,
      duration: 20
    }
  ],
  breaks: [
    {
      name: "First Break",
      duration: 15,
      afterLevel: 1
    }
  ]
};

export const mockPlayerData = {
  name: "Test Player"
}; 