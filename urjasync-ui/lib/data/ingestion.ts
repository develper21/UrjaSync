import { getMQTTClient, EnergyData, DeviceStatus } from '../iot/mqtt-client';
import { getDataValidator, ValidationResult } from './validation';
import { getWebSocketServer } from '../realtime/websocket-server';

export interface IngestionConfig {
  batchSize: number;
  batchTimeout: number; // ms
  retryAttempts: number;
  retryDelay: number; // ms
  enablePersistence: boolean;
}

export interface IngestionStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  errorRate: number;
  averageLatency: number;
  lastProcessed: Date;
}

export class DataIngestionService {
  private config: IngestionConfig;
  private validator = getDataValidator();
  private mqttClient = getMQTTClient();
  private wsServer = getWebSocketServer();
  
  private energyBuffer: EnergyData[] = [];
  private statusBuffer: DeviceStatus[] = [];
  private processing = false;
  
  private stats: IngestionStats = {
    totalProcessed: 0,
    successful: 0,
    failed: 0,
    errorRate: 0,
    averageLatency: 0,
    lastProcessed: new Date()
  };

  private batchTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<IngestionConfig> = {}) {
    this.config = {
      batchSize: 100,
      batchTimeout: 5000, // 5 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      enablePersistence: true,
      ...config
    };

    this.setupEventListeners();
    this.startBatchProcessor();
  }

  private setupEventListeners(): void {
    this.mqttClient.on('energy_data', (data: EnergyData) => {
      this.processEnergyData(data);
    });

    this.mqttClient.on('device_status', (status: DeviceStatus) => {
      this.processDeviceStatus(status);
    });
  }

  private processEnergyData(data: EnergyData): void {
    try {
      const validation = this.validator.validateEnergyData(data);
      
      if (!validation.isValid) {
        console.error('Energy data validation failed:', validation.errors);
        this.stats.failed++;
        this.updateStats();
        
        // Emit validation error
        this.wsServer.broadcastEvent({
          type: 'alert',
          timestamp: Date.now(),
          data: {
            id: `validation_error_${Date.now()}`,
            type: 'data_validation',
            severity: 'medium',
            message: `Energy data validation failed: ${validation.errors.join(', ')}`,
            deviceId: data.deviceId,
            timestamp: Date.now(),
            acknowledged: false
          }
        });
        return;
      }

      if (validation.warnings.length > 0) {
        console.warn('Energy data validation warnings:', validation.warnings);
      }

      // Add to buffer for batch processing
      if (validation.sanitizedData) {
        this.energyBuffer.push(validation.sanitizedData);
        
        // Check if buffer should be processed immediately
        if (this.energyBuffer.length >= this.config.batchSize) {
          this.processBatch();
        }
      }

      this.stats.successful++;
      this.updateStats();
      
      // Broadcast real-time update
      this.wsServer.broadcastEvent({
        type: 'energy_update',
        timestamp: Date.now(),
        data: validation.sanitizedData
      });

    } catch (error) {
      console.error('Error processing energy data:', error);
      this.stats.failed++;
      this.updateStats();
    }
  }

  private processDeviceStatus(status: DeviceStatus): void {
    try {
      const validation = this.validator.validateDeviceStatus(status);
      
      if (!validation.isValid) {
        console.error('Device status validation failed:', validation.errors);
        this.stats.failed++;
        this.updateStats();
        return;
      }

      if (validation.warnings.length > 0) {
        console.warn('Device status validation warnings:', validation.warnings);
      }

      // Add to buffer for batch processing
      if (validation.sanitizedData) {
        this.statusBuffer.push(validation.sanitizedData);
        
        if (this.statusBuffer.length >= this.config.batchSize) {
          this.processBatch();
        }
      }

      this.stats.successful++;
      this.updateStats();
      
      // Broadcast real-time update
      this.wsServer.broadcastEvent({
        type: 'device_status',
        timestamp: Date.now(),
        data: validation.sanitizedData
      });

    } catch (error) {
      console.error('Error processing device status:', error);
      this.stats.failed++;
      this.updateStats();
    }
  }

  private startBatchProcessor(): void {
    this.batchTimer = setInterval(() => {
      if (this.energyBuffer.length > 0 || this.statusBuffer.length > 0) {
        this.processBatch();
      }
    }, this.config.batchTimeout);
  }

  private async processBatch(): Promise<void> {
    if (this.processing) {
      return; // Skip if already processing
    }

    this.processing = true;

    try {
      // Process energy data batch
      if (this.energyBuffer.length > 0) {
        const energyBatch = [...this.energyBuffer];
        this.energyBuffer = [];
        
        await this.persistEnergyData(energyBatch);
      }

      // Process device status batch
      if (this.statusBuffer.length > 0) {
        const statusBatch = [...this.statusBuffer];
        this.statusBuffer = [];
        
        await this.persistDeviceStatus(statusBatch);
      }

    } catch (error) {
      console.error('Error processing batch:', error);
    } finally {
      this.processing = false;
    }
  }

  private async persistEnergyData(data: EnergyData[]): Promise<void> {
    if (!this.config.enablePersistence) {
      return;
    }

    try {
      // TODO: Implement database persistence
      // For now, just log the data
      console.log(`Persisting ${data.length} energy data records`);
      
      // Simulate database operation
      await new Promise(resolve => setTimeout(resolve, 10));
      
    } catch (error) {
      console.error('Failed to persist energy data:', error);
      throw error;
    }
  }

  private async persistDeviceStatus(data: DeviceStatus[]): Promise<void> {
    if (!this.config.enablePersistence) {
      return;
    }

    try {
      // TODO: Implement database persistence
      console.log(`Persisting ${data.length} device status records`);
      
      // Simulate database operation
      await new Promise(resolve => setTimeout(resolve, 10));
      
    } catch (error) {
      console.error('Failed to persist device status:', error);
      throw error;
    }
  }

  private updateStats(): void {
    this.stats.totalProcessed = this.stats.successful + this.stats.failed;
    this.stats.errorRate = this.stats.totalProcessed > 0 
      ? this.stats.failed / this.stats.totalProcessed 
      : 0;
    this.stats.lastProcessed = new Date();
  }

  // Public API methods
  getStats(): IngestionStats {
    return { ...this.stats };
  }

  getBufferStatus(): {
    energyBuffer: number;
    statusBuffer: number;
    processing: boolean;
  } {
    return {
      energyBuffer: this.energyBuffer.length,
      statusBuffer: this.statusBuffer.length,
      processing: this.processing
    };
  }

  async flushBuffers(): Promise<void> {
    await this.processBatch();
  }

  updateConfig(newConfig: Partial<IngestionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Manual data ingestion for testing
  async ingestEnergyData(data: any): Promise<ValidationResult> {
    const validation = this.validator.validateEnergyData(data);
    
    if (validation.isValid && validation.sanitizedData) {
      this.processEnergyData(validation.sanitizedData);
    }
    
    return validation;
  }

  async ingestDeviceStatus(data: any): Promise<ValidationResult> {
    const validation = this.validator.validateDeviceStatus(data);
    
    if (validation.isValid && validation.sanitizedData) {
      this.processDeviceStatus(validation.sanitizedData);
    }
    
    return validation;
  }

  // Cleanup
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Flush remaining data
    this.flushBuffers().catch(console.error);
  }
}

// Singleton instance
let ingestionService: DataIngestionService | null = null;

export function getDataIngestionService(): DataIngestionService {
  if (!ingestionService) {
    ingestionService = new DataIngestionService();
  }
  return ingestionService;
}
