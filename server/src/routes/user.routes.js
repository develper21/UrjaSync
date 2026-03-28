import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, updateProfileSchema, updateSettingsSchema } from '../validators/auth.validator.js';
import { getSettings, updateSettings, updateProfile, updateNotifications } from '../controllers/user.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/settings', getSettings);
router.put('/settings', validate(updateSettingsSchema), updateSettings);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/notifications', updateNotifications);

export default router;
