import axios from 'axios';

interface TournamentResponse {
  id: string;
  name: string;
  date: string;
  location: string;
  buyIn: number;
  startingChips: number;
  maxPlayers: number;
  blindStructure: Array<{
    level: number;
    smallBlind: number;
    bigBlind: number;
    ante: number;
    duration: number;
  }>;
  breaks: Array<{
    name: string;
    duration: number;
    afterLevel: number;
  }>;
  status: string;
  players: any[];
  currentLevel: number;
  createdAt: string;
  updatedAt: string;
}

interface TournamentState {
  currentLevel: number;
  timeRemaining: number;
  isBreak: boolean;
  breakTimeRemaining: number;
  activePlayers: number;
  totalPlayers: number;
  averageStack: number;
  isPaused: boolean;
  nextBreak?: {
    name: string;
    afterLevel: number;
  };
}

const API_BASE_URL = 'http://localhost:3000/api/tournaments';

const getTournamentState = async (tournamentId: string): Promise<TournamentState> => {
  const response = await axios.get<TournamentState>(`${API_BASE_URL}/${tournamentId}/state`);
  return response.data;
};

const createAndStartTournament = async () => {
  try {
    // Create tournament data
    const tournamentData = {
      name: "Test Tournament",
      date: new Date(),
      location: "Test Location",
      buyIn: 100,
      startingChips: 10000,
      maxPlayers: 9,
      blindStructure: [
        {
          level: 1,
          smallBlind: 25,
          bigBlind: 50,
          ante: 0,
          duration: 20 // 20 minutes
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
          duration: 10, // 10 minutes
          afterLevel: 1
        }
      ]
    };

    // Create tournament
    console.log('Creating tournament...');
    const createResponse = await axios.post<TournamentResponse>(API_BASE_URL, tournamentData);
    const tournamentId = createResponse.data.id;
    console.log('Tournament created with ID:', tournamentId);

    // Start tournament
    console.log('Starting tournament...');
    await axios.post(`${API_BASE_URL}/${tournamentId}/start`);
    console.log('Tournament started successfully');

    // Get initial tournament state
    console.log('\nInitial Tournament State:');
    let state = await getTournamentState(tournamentId);
    console.log(state);

    // Advance level
    console.log('\nAdvancing level...');
    await axios.post(`${API_BASE_URL}/${tournamentId}/timer/level/advance`);
    state = await getTournamentState(tournamentId);
    console.log('Tournament State after advancing level:', state);

    // Pause timer
    console.log('\nPausing timer...');
    await axios.post(`${API_BASE_URL}/${tournamentId}/timer/pause`);
    state = await getTournamentState(tournamentId);
    console.log('Tournament State after pausing:', state);

    // Resume timer
    console.log('\nResuming timer...');
    await axios.post(`${API_BASE_URL}/${tournamentId}/timer/resume`);
    state = await getTournamentState(tournamentId);
    console.log('Tournament State after resuming:', state);

  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the test
createAndStartTournament(); 