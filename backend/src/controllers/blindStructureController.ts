import { Request, Response } from 'express';
import { BlindStructureService, BlindStructureConfig } from '../services/blindStructureService';

export const blindStructureController = {
  generateBlindStructure: (req: Request, res: Response) => {
    try {
      const config: BlindStructureConfig = {
        levelTime: Number(req.body.levelTime),
        startingBB: Number(req.body.startingBB),
        Ante: Boolean(req.body.Ante)
      };

      // Validate input
      if (!config.levelTime || !config.startingBB) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (config.levelTime < 1 || config.startingBB < 1) {
        return res.status(400).json({ error: 'Invalid values for levelTime or startingBB' });
      }

      const result = BlindStructureService.generateBlindStructure(config);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate blind structure' });
    }
  }
}; 