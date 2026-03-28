import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../validators/auth.validator.js';
import { 
  createDeviceSchema, 
  updateDeviceSchema, 
  toggleDeviceSchema, 
  intensitySchema 
} from '../validators/device.validator.js';
import {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  toggleDevice,
  setIntensity,
  getRooms,
  getDeviceStats
} from '../controllers/device.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDevices);
router.get('/rooms', getRooms);
router.post('/', validate(createDeviceSchema), createDevice);
router.get('/:id', getDevice);
router.put('/:id', validate(updateDeviceSchema), updateDevice);
router.delete('/:id', deleteDevice);
router.post('/:id/toggle', validate(toggleDeviceSchema), toggleDevice);
router.post('/:id/intensity', validate(intensitySchema), setIntensity);
router.get('/:id/stats', getDeviceStats);

export default router;
