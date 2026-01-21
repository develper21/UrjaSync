import { db, testConnection } from './index';

// Initialize database connection
export async function initializeDatabase() {
  console.log('🔧 Initializing database connection...');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    throw new Error('Failed to connect to database');
  }
  
  console.log('✅ Database initialized successfully');
  return db;
}

// Database health check
export async function databaseHealthCheck() {
  try {
    const { pool } = await import('./index');
    const client = await pool.connect();
    await client.query('SELECT 1 as health_check');
    client.release();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'postgresql',
      version: '16.0'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Graceful shutdown
export async function shutdownDatabase() {
  try {
    const { pool } = await import('./index');
    await pool.end();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}
