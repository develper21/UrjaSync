import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { getMQTTClient } from './iot/mqtt-client';
import { getDeviceManager } from './iot/device-manager';
import { getWebSocketServer } from './realtime/websocket-server';
import { getDataIngestionService } from './data/ingestion';
import { getUsagePatternAnalyzer } from './analytics/pattern-analysis';
import { getPredictiveAnalytics } from './analytics/predictive-analytics';
import { getRecommendationEngine } from './analytics/recommendation-engine';
import { getMLIntegration } from './analytics/ml-integration';
import { getAnalyticsDataPipeline } from './analytics/data-pipeline';
import { getTariffIntelligence } from './cost-optimization/tariff-intelligence';
import { getAutomationEngine } from './cost-optimization/automation-engine';
import { getAuthService } from './security/auth';
import { getEncryptionService } from './security/encryption';
import { getSecurityMiddleware } from './security/middleware';
import { getDefaultEventProducer } from './realtime/kafka-producer';
import { getRedisCache } from './realtime/redis-cache';
import { getDeviceDiscovery } from './iot/device-discovery';
import { getModbusAdapter, getZigbeeAdapter, getWiFiAdapter } from './iot/protocol-adapters';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Initialize services
let httpServer: ReturnType<typeof createServer>;

async function initializeServices() {
  console.log('Initializing UrjaSync services...');
  
  // Initialize IoT infrastructure
  getMQTTClient();
  getDeviceManager();
  getDeviceDiscovery();
  getModbusAdapter();
  getZigbeeAdapter();
  getWiFiAdapter();
  console.log('✅ IoT infrastructure initialized');
  
  // Initialize data ingestion service
  getDataIngestionService();
  console.log('✅ Data ingestion service initialized');
  
  // Initialize analytics services
  getUsagePatternAnalyzer();
  getPredictiveAnalytics();
  getRecommendationEngine();
  getMLIntegration();
  getAnalyticsDataPipeline();
  console.log('✅ Enhanced analytics services initialized');
  
  // Initialize cost optimization services
  getTariffIntelligence();
  const automationEngine = getAutomationEngine();
  automationEngine.start();
  console.log('✅ Cost optimization services initialized');
  
  // Initialize security services
  getAuthService();
  getEncryptionService();
  getSecurityMiddleware();
  console.log('✅ Security services initialized');
  
  // Initialize real-time infrastructure
  getDefaultEventProducer();
  getRedisCache();
  console.log('✅ Real-time infrastructure initialized');
  
  // Register some mock devices for development
  if (dev) {
    await registerMockDevices(getDeviceManager());
  }
  
  console.log('🚀 UrjaSync services initialized successfully');
}

async function registerMockDevices(deviceManager: ReturnType<typeof getDeviceManager>) {
  try {
    // Register mock smart meter
    await deviceManager.registerDevice({
      name: 'Main Smart Meter',
      type: 'smart_meter',
      location: 'Main Panel',
      metadata: {
        model: 'SM-2000',
        firmware: '1.2.3'
      }
    });
    
    // Register mock smart plugs
    await deviceManager.registerDevice({
      name: 'Living Room AC',
      type: 'smart_plug',
      location: 'Living Room',
      metadata: {
        appliance: 'AC',
        capacity: 1.5
      }
    });
    
    await deviceManager.registerDevice({
      name: 'Washing Machine',
      type: 'smart_plug',
      location: 'Utility Room',
      metadata: {
        appliance: 'Washer',
        capacity: 0.5
      }
    });
    
    console.log('✅ Mock devices registered for development');
  } catch (error) {
    console.error('⚠️ Failed to register mock devices:', error);
  }
}

app.prepare().then(() => {
  httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket server
  getWebSocketServer(httpServer);
  console.log('✅ WebSocket server initialized');

  // Start the server
  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  // Initialize services after server starts
  initializeServices().catch(error => {
    console.error('Failed to initialize services:', error);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});

export { httpServer };
