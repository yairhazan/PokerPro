import { Request, Response } from 'express';
import { Tournament, Player, TournamentState, BlindStructureConfig } from '../types/tournament';
import { timerService } from '../services/timerService';
import { BlindStructureService } from '../services/blindStructureService';

// In-memory storage (replace with database in production)
let tournaments: Tournament[] = [];

// Make tournaments accessible to timer service
(global as any).tournaments = tournaments;

// Initialize tournaments array if it doesn't exist
if (!(global as any).tournaments) {
  (global as any).tournaments = tournaments;
}

export const tournamentController = {
  // Create a new tournament
  createTournament: (req: Request, res: Response) => {
    try {
      console.log('Creating tournament...');
      const { name, date, location, buyIn, startingChips, maxPlayers, BlindStructureConfig } = req.body;
      console.log('req.body', req.body);
      // Validate required fields
      if (!name || !date || !location || !buyIn || !startingChips || !maxPlayers || !BlindStructureConfig) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate blind structure config
      if (!BlindStructureConfig.levelTime || !BlindStructureConfig.startingBB) {
        return res.status(400).json({ error: 'Invalid blind structure configuration' });
      }

      // Generate blind structure and breaks
      const { blindStructure, breaks } = BlindStructureService.generateBlindStructure(BlindStructureConfig);

      const tournament: Tournament = {
        id: Date.now().toString(),
        name,
        date: new Date(date),
        location,
        buyIn,
        startingChips,
        maxPlayers,
        BlindStructureConfig,
        blindStructure,
        breaks,
        currentLevel: 1,
        status: 'scheduled',
        players: [],
        prizePool: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      tournaments.push(tournament);
      res.status(201).json(tournament);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create tournament' });
    }
  },

  // Get all tournaments
  getTournaments: (req: Request, res: Response) => {
    res.json(tournaments);
  },

  // Get tournament by ID
  getTournament: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json(tournament);
  },

  // Get tournament blind structure
  getTournamentBlindStructure: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({
      config: tournament.BlindStructureConfig,
      blindStructure: tournament.blindStructure,
      breaks: tournament.breaks
    });
  },

  // Register player for tournament
  registerPlayer: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Check for duplicate player name in the tournament
    const playerName = req.body.name?.trim();
    if (!playerName) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const isDuplicateName = tournament.players.some(
      p => p.name.toLowerCase() === playerName.toLowerCase()
    );

    if (isDuplicateName) {
      return res.status(400).json({ 
        error: 'A player with this name already exists in the tournament',
        suggestion: `Try using "${playerName} (${tournament.players.length + 1})" or add a unique identifier`
      });
    }

    const player: Player = {
      id: Date.now().toString(),
      ...req.body,
      name: playerName, // Use trimmed name
      chips: tournament.startingChips,
      status: 'registered',
      registrationTime: new Date(),
      rebuys: 0,
      totalInvestment: tournament.buyIn
    };

    tournament.players.push(player);
    tournament.updatedAt = new Date();
    res.status(201).json(player);
  },

  // Add rebuy for a player
  addRebuy: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const player = tournament.players.find(p => p.id === req.params.playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (player.status === 'eliminated') {
      return res.status(400).json({ error: 'Cannot rebuy eliminated player' });
    }

    // Add rebuy
    player.rebuys++;
    player.lastRebuyTime = new Date();
    player.status = 'rebuied';
    player.chips = tournament.startingChips;
    player.totalInvestment += tournament.buyIn;

    // Update tournament prize pool
    tournament.prizePool += tournament.buyIn;
    tournament.updatedAt = new Date();

    res.json({
      message: 'Rebuy added successfully',
      player,
      newChipCount: player.chips,
      totalInvestment: player.totalInvestment
    });
  },

  // Eliminate a player
  eliminatePlayer: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const player = tournament.players.find(p => p.id === req.params.playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (player.status === 'eliminated') {
      return res.status(400).json({ error: 'Player is already eliminated' });
    }

    // Eliminate player
    player.status = 'eliminated';
    player.eliminationTime = new Date();
    player.chips = 0;

    tournament.updatedAt = new Date();

    res.json({
      message: 'Player eliminated successfully',
      player,
      eliminationTime: player.eliminationTime
    });
  },

  // Get player rebuy history
  getPlayerRebuyHistory: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const player = tournament.players.find(p => p.id === req.params.playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({
      playerId: player.id,
      playerName: player.name,
      rebuys: player.rebuys,
      lastRebuyTime: player.lastRebuyTime,
      totalInvestment: player.totalInvestment,
      status: player.status,
      currentChips: player.chips
    });
  },

  // Start tournament
  startTournament: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status !== 'scheduled') {
      return res.status(400).json({ error: 'Tournament cannot be started' });
    }

    tournament.status = 'in_progress';
    tournament.updatedAt = new Date();
    
    // Start the tournament timer
    timerService.startTimer(tournament);
    
    res.json(tournament);
  },

  // Get tournament state
  getTournamentState: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const timerState = timerService.getTimerState(tournament.id);
    if (!timerState) {
      return res.status(400).json({ error: 'Tournament timer not active' });
    }

    const currentLevel = tournament.blindStructure[tournament.currentLevel - 1];
    const nextBreak = tournament.breaks.find(b => b.afterLevel > tournament.currentLevel);
    
    const state: TournamentState = {
      currentLevel: timerState.currentLevel,
      timeRemaining: timerState.timeRemaining,
      isBreak: timerState.isBreak,
      breakTimeRemaining: timerState.breakTimeRemaining,
      activePlayers: tournament.players.filter(p => p.status === 'active').length,
      totalPlayers: tournament.players.length,
      averageStack: tournament.players.reduce((acc, p) => acc + p.chips, 0) / tournament.players.length,
      isPaused: timerState.isPaused,
      nextBreak: nextBreak ? {
        name: nextBreak.name,
        afterLevel: nextBreak.afterLevel
      } : undefined
    };

    res.json(state);
  },

  // Update player status (eliminate player)
  updatePlayerStatus: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const player = tournament.players.find(p => p.id === req.params.playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    player.status = req.body.status;
    tournament.updatedAt = new Date();
    res.json(player);
  },

  // Timer Control Methods
  pauseTimer: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const success = timerService.pauseTimer(tournament.id);
    if (!success) {
      return res.status(400).json({ error: 'Failed to pause timer' });
    }

    res.json({ message: 'Timer paused successfully' });
  },

  resumeTimer: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const success = timerService.resumeTimer(tournament.id);
    if (!success) {
      return res.status(400).json({ error: 'Failed to resume timer' });
    }

    res.json({ message: 'Timer resumed successfully' });
  },

  advanceLevel: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const success = timerService.advanceLevel(tournament.id);
    if (!success) {
      return res.status(400).json({ error: 'Failed to advance level' });
    }

    res.json({ message: 'Level advanced successfully' });
  },

  previousLevel: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const success = timerService.previousLevel(tournament.id);
    if (!success) {
      return res.status(400).json({ error: 'Failed to go to previous level' });
    }

    res.json({ message: 'Level changed successfully' });
  },

  addTime: (req: Request, res: Response) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const { seconds } = req.body;
    if (typeof seconds !== 'number') {
      return res.status(400).json({ error: 'Invalid time value' });
    }

    const success = timerService.addTime(tournament.id, seconds);
    if (!success) {
      return res.status(400).json({ error: 'Failed to add time' });
    }

    res.json({ message: 'Time added successfully' });
  }
}; 