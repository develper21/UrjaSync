import express from 'express';
import { register, login, logout, getMe, refreshToken } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/refresh-token', refreshToken);

export default router;
