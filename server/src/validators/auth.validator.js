import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional()
});

export const updateSettingsSchema = z.object({
  monthlyBudget: z.number().min(0).optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
  notifications: z.object({
    energyAlerts: z.boolean().optional(),
    costWarnings: z.boolean().optional(),
    deviceOffline: z.boolean().optional(),
    weeklyReports: z.boolean().optional()
  }).optional()
});

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => err.message).join(', ');
        return res.status(400).json({
          success: false,
          message: messages
        });
      }
      next(error);
    }
  };
};
