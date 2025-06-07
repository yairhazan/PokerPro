export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number; // in minutes
}

export interface Break {
  name: string;
  duration: number; // in minutes
  afterLevel: number;
}

export interface BlindStructureConfig {
  levelTime: number;
  startingBB: number;
  Ante: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  date: Date;
  location: string;
  buyIn: number;
  startingChips: number;
  maxPlayers: number;
  BlindStructureConfig: BlindStructureConfig;
  blindStructure: BlindLevel[];
  breaks: Break[];
  currentLevel: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  players: Player[];
  prizePool: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  seatNumber?: number;
  tableNumber?: number;
  status: 'registered' | 'active' | 'eliminated' | 'rebuied';
  registrationTime: Date;
  rebuys: number;
  lastRebuyTime?: Date;
  eliminationTime?: Date;
  totalInvestment: number; // buyIn + (rebuys * buyIn)
}

export interface TournamentState {
  currentLevel: number;
  timeRemaining: number; // in seconds
  isBreak: boolean;
  breakTimeRemaining: number; // in seconds
  activePlayers: number;
  totalPlayers: number;
  averageStack: number;
  isPaused: boolean;
  nextBreak?: {
    name: string;
    afterLevel: number;
  };
} 