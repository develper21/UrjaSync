import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../validators/auth.validator.js';
import { dateRangeSchema, addReadingSchema } from '../validators/energy.validator.js';
import {
  getRealtimeUsage,
  getTodayUsage,
  getWeeklyUsage,
  getMonthlyUsage,
  getRangeData,
  addReading
} from '../controllers/energy.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/realtime', getRealtimeUsage);
router.get('/today', getTodayUsage);
router.get('/weekly', getWeeklyUsage);
router.get('/monthly', getMonthlyUsage);
router.get('/range', validate(dateRangeSchema), getRangeData);
router.post('/reading', validate(addReadingSchema), addReading);

export default router;
