import { Router } from 'express';
import { chipsValueController } from '../controllers/chipsValueController';

const router = Router();

// Get chip values for a tournament
router.get('/:id', chipsValueController.getChipValues);

export default router; 