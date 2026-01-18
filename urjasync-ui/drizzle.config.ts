import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'urjasync_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'urjasync_db',
  },
  verbose: true,
  strict: true,
});
