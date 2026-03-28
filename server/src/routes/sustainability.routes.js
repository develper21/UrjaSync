import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getSustainabilityStats,
  getGoals,
  updateGoal,
  getEmissions,
  initSustainability
} from '../controllers/sustainability.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats', getSustainabilityStats);
router.get('/goals', getGoals);
router.put('/goals/:goalId', updateGoal);
router.get('/emissions', getEmissions);
router.post('/init', initSustainability);

export default router;
