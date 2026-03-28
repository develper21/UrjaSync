import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getCurrentBill,
  getBillHistory,
  getBudgetStatus,
  getSavings,
  generateBill
} from '../controllers/billing.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/current', getCurrentBill);
router.get('/history', getBillHistory);
router.get('/budget-status', getBudgetStatus);
router.get('/savings', getSavings);
router.post('/generate', generateBill);

export default router;
