import { z } from 'zod';

export const createDeviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  room: z.string().min(1, 'Room is required'),
  type: z.enum(['AC', 'Light', 'Fan', 'Refrigerator', 'TV', 'Heater', 'WashingMachine', 'Router', 'Other']),
  powerRating: z.number().min(0, 'Power rating must be positive'),
  icon: z.string().optional(),
  isSmart: z.boolean().optional()
});

export const updateDeviceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  room: z.string().min(1).optional(),
  type: z.enum(['AC', 'Light', 'Fan', 'Refrigerator', 'TV', 'Heater', 'WashingMachine', 'Router', 'Other']).optional(),
  powerRating: z.number().min(0).optional(),
  icon: z.string().optional(),
  isSmart: z.boolean().optional()
});

export const toggleDeviceSchema = z.object({
  status: z.boolean()
});

export const intensitySchema = z.object({
  intensity: z.number().min(0).max(100)
});
