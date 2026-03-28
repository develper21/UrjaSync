import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getUsageTrend,
  getCostAnalysis,
  getDeviceBreakdown,
  getCarbonTrend,
  getDashboardStats
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/usage-trend', getUsageTrend);
router.get('/cost-analysis', getCostAnalysis);
router.get('/device-breakdown', getDeviceBreakdown);
router.get('/carbon-trend', getCarbonTrend);
router.get('/dashboard-stats', getDashboardStats);

export default router;
