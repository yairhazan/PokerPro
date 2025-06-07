import request from 'supertest';
import express from 'express';
import cors from 'cors';
import tournamentRoutes from '../routes/tournamentRoutes';
import { mockTournamentData, mockPlayerData } from './helpers/testData';
import { timerService } from '../services/timerService';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/tournaments', tournamentRoutes);

describe('Tournament API', () => {
  let tournamentId: string;

  beforeEach(() => {
    // Clear all timers before each test
    timerService.stopTimer(tournamentId);
  });

  afterEach(() => {
    // Clean up timers after each test
    timerService.stopTimer(tournamentId);
  });

  describe('POST /api/tournaments', () => {
    it('should create a new tournament', async () => {
      const response = await request(app)
        .post('/api/tournaments')
        .send(mockTournamentData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockTournamentData.name);
      expect(response.body.status).toBe('scheduled');
      
      tournamentId = response.body.id;
    });

    it('should return 400 for invalid tournament data', async () => {
      const response = await request(app)
        .post('/api/tournaments')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tournaments', () => {
    it('should return all tournaments', async () => {
      const response = await request(app)
        .get('/api/tournaments');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tournaments/:id', () => {
    it('should return tournament by id', async () => {
      const response = await request(app)
        .get(`/api/tournaments/${tournamentId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(tournamentId);
    });

    it('should return 404 for non-existent tournament', async () => {
      const response = await request(app)
        .get('/api/tournaments/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/tournaments/:id/players', () => {
    it('should register a player', async () => {
      const response = await request(app)
        .post(`/api/tournaments/${tournamentId}/players`)
        .send(mockPlayerData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockPlayerData.name);
      expect(response.body.status).toBe('registered');
    });

    it('should return 404 for non-existent tournament', async () => {
      const response = await request(app)
        .post('/api/tournaments/non-existent-id/players')
        .send(mockPlayerData);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/tournaments/:id/start', () => {
    it('should start the tournament', async () => {
      const response = await request(app)
        .post(`/api/tournaments/${tournamentId}/start`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('in_progress');
    });

    it('should return 400 when trying to start already started tournament', async () => {
      const response = await request(app)
        .post(`/api/tournaments/${tournamentId}/start`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/tournaments/:id/state', () => {
    it('should return tournament state', async () => {
      const response = await request(app)
        .get(`/api/tournaments/${tournamentId}/state`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('currentLevel');
      expect(response.body).toHaveProperty('timeRemaining');
      expect(response.body).toHaveProperty('activePlayers');
      expect(response.body).toHaveProperty('totalPlayers');
    });
  });

  describe('POST /api/tournaments/:id/level/advance', () => {
    it('should advance to next level', async () => {
      const response = await request(app)
        .post(`/api/tournaments/${tournamentId}/level/advance`);

      expect(response.status).toBe(200);
      expect(response.body.currentLevel).toBe(2);
    });
  });

  describe('PATCH /api/tournaments/:id/players/:playerId', () => {
    it('should update player status', async () => {
      // First get the player ID from the tournament
      const tournamentResponse = await request(app)
        .get(`/api/tournaments/${tournamentId}`);
      
      const playerId = tournamentResponse.body.players[0].id;

      const response = await request(app)
        .patch(`/api/tournaments/${tournamentId}/players/${playerId}`)
        .send({ status: 'eliminated' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('eliminated');
    });
  });

  describe('Tournament Timer', () => {
    it('should start timer when tournament starts', async () => {
      // Create tournament
      const createResponse = await request(app)
        .post('/api/tournaments')
        .send(mockTournamentData);
      
      tournamentId = createResponse.body.id;

      // Start tournament
      await request(app)
        .post(`/api/tournaments/${tournamentId}/start`);

      // Get tournament state
      const stateResponse = await request(app)
        .get(`/api/tournaments/${tournamentId}/state`);

      expect(stateResponse.status).toBe(200);
      expect(stateResponse.body.timeRemaining).toBeLessThanOrEqual(mockTournamentData.blindStructure[0].duration * 60);
      expect(stateResponse.body.isBreak).toBe(false);
    });

    it('should handle breaks correctly', async () => {
      // Create tournament with break after first level
      const tournamentWithBreak = {
        ...mockTournamentData,
        blindStructure: [
          {
            level: 1,
            smallBlind: 25,
            bigBlind: 50,
            ante: 0,
            duration: 1 // 1 minute for testing
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
            duration: 1, // 1 minute for testing
            afterLevel: 1
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/tournaments')
        .send(tournamentWithBreak);
      
      tournamentId = createResponse.body.id;

      // Start tournament
      await request(app)
        .post(`/api/tournaments/${tournamentId}/start`);

      // Wait for level to end and break to start
      await new Promise(resolve => setTimeout(resolve, 61000)); // Wait for level + break

      // Get tournament state
      const stateResponse = await request(app)
        .get(`/api/tournaments/${tournamentId}/state`);

      expect(stateResponse.status).toBe(200);
      expect(stateResponse.body.currentLevel).toBe(2); // Should be on second level
    });

    it('should stop timer when tournament ends', async () => {
      // Create tournament
      const createResponse = await request(app)
        .post('/api/tournaments')
        .send(mockTournamentData);
      
      tournamentId = createResponse.body.id;

      // Start tournament
      await request(app)
        .post(`/api/tournaments/${tournamentId}/start`);

      // Stop timer
      timerService.stopTimer(tournamentId);

      // Get tournament state
      const stateResponse = await request(app)
        .get(`/api/tournaments/${tournamentId}/state`);

      expect(stateResponse.status).toBe(400); // Should return error as timer is not active
    });
  });
}); 