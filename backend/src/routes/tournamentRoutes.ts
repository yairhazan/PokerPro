import { Router } from 'express';
import { tournamentController } from '../controllers/tournamentController';

const router = Router();

// Tournament management
router.post('/', tournamentController.createTournament);
router.get('/', tournamentController.getTournaments);
router.get('/:id', tournamentController.getTournament);
router.get('/:id/blind-structure', tournamentController.getTournamentBlindStructure);
router.post('/:id/start', tournamentController.startTournament);
router.get('/:id/state', tournamentController.getTournamentState);

// Timer control
router.post('/:id/timer/pause', tournamentController.pauseTimer);
router.post('/:id/timer/resume', tournamentController.resumeTimer);
router.post('/:id/timer/level/advance', tournamentController.advanceLevel);
router.post('/:id/timer/level/previous', tournamentController.previousLevel);
router.post('/:id/timer/add-time', tournamentController.addTime);

// Player management
router.post('/:id/players', tournamentController.registerPlayer);
router.patch('/:id/players/:playerId', tournamentController.updatePlayerStatus);

export default router; 