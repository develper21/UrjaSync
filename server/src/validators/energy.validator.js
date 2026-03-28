import { z } from 'zod';

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  deviceId: z.string().optional()
});

export const addReadingSchema = z.object({
  deviceId: z.string().optional(),
  usage: z.number().min(0, 'Usage must be positive'),
  cost: z.number().min(0, 'Cost must be positive'),
  rate: z.number().min(0, 'Rate must be positive'),
  solarGeneration: z.number().min(0).optional()
});
