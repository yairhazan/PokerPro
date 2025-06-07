import { Router } from 'express';
import { blindStructureController } from '../controllers/blindStructureController';

const router = Router();

// Generate custom blind structure
router.post('/generate', blindStructureController.generateBlindStructure);




export default router; 