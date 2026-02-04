import { pgTable, uuid, varchar, text, timestamp, boolean, integer, numeric, pgEnum, jsonb } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const applianceStatusEnum = pgEnum('appliance_status', ['On', 'Off', 'Scheduled']);
export const applianceTypeEnum = pgEnum('appliance_type', ['AC', 'Washer', 'Light', 'Geyser', 'Refrigerator', 'TV', 'Fan', 'Other']);
export const billStatusEnum = pgEnum('bill_status', ['Paid', 'Pending', 'Overdue']);
export const tariffTypeEnum = pgEnum('tariff_type', ['Off-Peak', 'Standard', 'Peak']);
export const otpUsageEnum = pgEnum('otp_usage', ['registration', 'password_reset', 'email_verification']);
export const tradeStatusEnum = pgEnum('trade_status', ['pending', 'settled', 'rejected']);
export const tierEnum = pgEnum('tier', ['Bronze', 'Silver', 'Gold', 'Platinum']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  role: userRoleEnum('role').default('user').notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  avatar: text('avatar'),
  preferences: jsonb('preferences').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// OTP verification table
export const otpVerifications = pgTable('otp_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  otp: varchar('otp', { length: 6 }).notNull(),
  usage: otpUsageEnum('usage').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Appliances table
export const appliances = pgTable('appliances', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: applianceTypeEnum('type').notNull(),
  status: applianceStatusEnum('status').default('Off').notNull(),
  consumption: numeric('consumption', { precision: 10, scale: 2 }).default('0').notNull(),
  schedule: jsonb('schedule').default({}).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Energy usage records
export const energyUsage = pgTable('energy_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  applianceId: uuid('appliance_id').references(() => appliances.id, { onDelete: 'cascade' }),
  usage: numeric('usage', { precision: 10, scale: 3 }).notNull(),
  cost: numeric('cost', { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  tariffType: tariffTypeEnum('tariff_type').notNull(),
});

// Tariff periods
export const tariffPeriods = pgTable('tariff_periods', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: tariffTypeEnum('type').notNull(),
  rate: numeric('rate', { precision: 8, scale: 4 }).notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(), // HH:MM format
  endTime: varchar('end_time', { length: 5 }).notNull(), // HH:MM format
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bills table
export const bills = pgTable('bills', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  period: varchar('period', { length: 50 }).notNull(), // e.g., "January 2024"
  status: billStatusEnum('status').default('Pending').notNull(),
  dueDate: timestamp('due_date').notNull(),
  paidDate: timestamp('paid_date'),
  unitsConsumed: numeric('units_consumed', { precision: 10, scale: 2 }).notNull(),
  savings: numeric('savings', { precision: 10, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Routines table
export const routines = pgTable('routines', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  trigger: text('trigger').notNull(), // JSON string describing trigger conditions
  actions: jsonb('actions').notNull(), // Array of actions to perform
  isActive: boolean('is_active').default(true).notNull(),
  lastRun: timestamp('last_run'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Microgrids table
export const microgrids = pgTable('microgrids', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  households: integer('households').default(0).notNull(),
  totalGeneration: numeric('total_generation', { precision: 12, scale: 3 }).default('0').notNull(),
  totalConsumption: numeric('total_consumption', { precision: 12, scale: 3 }).default('0').notNull(),
  netFlow: numeric('net_flow', { precision: 12, scale: 3 }).default('0').notNull(),
  sharedCapacity: numeric('shared_capacity', { precision: 12, scale: 3 }).default('0').notNull(),
  invitesOpen: boolean('invites_open').default(true).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Microgrid members table
export const microgridMembers = pgTable('microgrid_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  microgridId: uuid('microgrid_id').references(() => microgrids.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  surplusKwh: numeric('surplus_kwh', { precision: 10, scale: 2 }).default('0').notNull(),
  peakCutPercent: numeric('peak_cut_percent', { precision: 5, scale: 2 }).default('0').notNull(),
  tier: tierEnum('tier').default('Bronze').notNull(),
  badges: jsonb('badges').default('[]').notNull(),
  credits: numeric('credits', { precision: 12, scale: 2 }).default('0').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Energy trades table
export const energyTrades = pgTable('energy_trades', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromMemberId: uuid('from_member_id').references(() => microgridMembers.id, { onDelete: 'cascade' }).notNull(),
  toMemberId: uuid('to_member_id').references(() => microgridMembers.id, { onDelete: 'cascade' }).notNull(),
  amountKwh: numeric('amount_kwh', { precision: 10, scale: 3 }).notNull(),
  creditValue: numeric('credit_value', { precision: 12, scale: 2 }).notNull(),
  pricePerKwh: numeric('price_per_kwh', { precision: 8, scale: 2 }).notNull(),
  status: tradeStatusEnum('status').default('pending').notNull(),
  settledAt: timestamp('settled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Refresh tokens table
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notification types enum
export const notificationTypeEnum = pgEnum('notification_type', ['info', 'success', 'warning', 'error']);
export const notificationSeverityEnum = pgEnum('notification_severity', ['info', 'low', 'medium', 'high', 'critical']);

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  severity: notificationSeverityEnum('severity').default('info').notNull(),
  category: varchar('category', { length: 50 }),
  isRead: boolean('is_read').default(false).notNull(),
  isSent: boolean('is_sent').default(false).notNull(),
  sentVia: jsonb('sent_via').default('[]').notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User sessions table
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  deviceInfo: jsonb('device_info').default({}).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true).notNull(),
  lastActivity: timestamp('last_activity').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
