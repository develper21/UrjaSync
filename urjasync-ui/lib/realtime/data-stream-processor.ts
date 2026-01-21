export interface StreamData {
  id: string;
  source: string;
  deviceId: string;
  timestamp: Date;
  type: 'energy' | 'device' | 'sensor' | 'alert' | 'system';
  data: Record<string, any>;
  metadata?: StreamMetadata;
  processed: boolean;
  processedAt?: Date;
  error?: string;
}

export interface StreamMetadata {
  userId: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  quality: 'high' | 'medium' | 'low';
  reliability: number; // 0-1
  sourceVersion: string;
  compression?: string;
  encryption?: boolean;
}

export interface StreamProcessor {
  id: string;
  name: string;
  description: string;
  type: ProcessorType;
  config: ProcessorConfig;
  isActive: boolean;
  priority: number;
  filters: StreamFilter[];
  transformations: StreamTransformation[];
  outputs: StreamOutput[];
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  stats: ProcessorStats;
}

export type ProcessorType = 
  | 'filter' 
  | 'transform' 
  | 'aggregate' 
  | 'enrich' 
  | 'validate' 
  | 'normalize' 
  | 'route' 
  | 'alert';

export interface ProcessorConfig {
  batchSize?: number;
  batchTimeout?: number; // milliseconds
  retryAttempts?: number;
  retryDelay?: number;
  parallelProcessing?: boolean;
  memoryLimit?: number; // MB
  timeout?: number; // milliseconds
}

export interface StreamFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'regex';
  value: any;
  caseSensitive?: boolean;
}

export interface StreamTransformation {
  type: 'map' | 'reduce' | 'aggregate' | 'normalize' | 'enrich' | 'calculate' | 'format' | 'validate';
  field?: string;
  expression?: string;
  parameters?: Record<string, any>;
}

export interface StreamOutput {
  type: 'stream' | 'database' | 'cache' | 'webhook' | 'websocket' | 'alert';
  destination: string;
  config?: Record<string, any>;
}

export interface ProcessorStats {
  totalProcessed: number;
  successfulProcessed: number;
  failedProcessed: number;
  averageProcessingTime: number; // milliseconds
  lastError?: string;
  throughput: number; // records per second
  uptime: number; // percentage
  memoryUsage: number; // MB
}

export interface StreamPipeline {
  id: string;
  name: string;
  description: string;
  source: StreamSource;
  processors: string[]; // Processor IDs
  outputs: StreamOutput[];
  isActive: boolean;
  config: PipelineConfig;
  createdAt: Date;
  updatedAt: Date;
  stats: PipelineStats;
}

export interface StreamSource {
  type: 'mqtt' | 'websocket' | 'http' | 'kafka' | 'file' | 'database';
  connection: ConnectionConfig;
  topic?: string;
  format: 'json' | 'csv' | 'xml' | 'binary';
  schema?: DataSchema;
}

export interface ConnectionConfig {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  apiKey?: string;
  clientId?: string;
  certificate?: string;
  options?: Record<string, any>;
}

export interface DataSchema {
  fields: SchemaField[];
  version: string;
  required: string[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required?: boolean;
  format?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'length' | 'custom';
  value?: any;
  message?: string;
}

export interface PipelineConfig {
  batchSize?: number;
  batchTimeout?: number;
  errorHandling: 'stop' | 'continue' | 'retry';
  monitoring: boolean;
  alerting: boolean;
  logging: boolean;
  persistence: boolean;
}

export interface PipelineStats {
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  averageLatency: number; // milliseconds
  throughput: number; // records per second
  errorRate: number; // percentage
  lastProcessed?: Date;
  uptime: number; // percentage
}

export interface StreamBuffer {
  id: string;
  name: string;
  type: 'memory' | 'redis' | 'file' | 'database';
  size: number; // maximum number of records
  ttl: number; // time to live in seconds
  strategy: 'fifo' | 'lifo' | 'priority';
  isActive: boolean;
  stats: BufferStats;
}

export interface BufferStats {
  currentSize: number;
  maxSize: number;
  utilization: number; // percentage
  throughput: number; // records per second
  averageLatency: number; // milliseconds
}

export class DataStreamProcessor {
  private processors: Map<string, StreamProcessor> = new Map();
  private pipelines: Map<string, StreamPipeline> = new Map();
  private buffers: Map<string, StreamBuffer> = new Map();
  private processingQueue: StreamData[] = [];
  private isProcessing = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeDefaultProcessors();
    this.initializeBuffers();
    this.startProcessing();
  }

  private initializeDefaultProcessors() {
    const processors: StreamProcessor[] = [
      {
        id: 'ENERGY_VALIDATOR',
        name: 'Energy Data Validator',
        description: 'Validates energy consumption data',
        type: 'validate',
        config: {
          batchSize: 100,
          batchTimeout: 5000,
          retryAttempts: 3,
          timeout: 10000
        },
        isActive: true,
        priority: 1,
        filters: [
          { field: 'type', operator: 'equals', value: 'energy' }
        ],
        transformations: [
          { type: 'validate', field: 'consumption', expression: '>= 0' },
          { type: 'validate', field: 'voltage', expression: '>= 0' },
          { type: 'validate', field: 'current', expression: '>= 0' }
        ],
        outputs: [
          { type: 'stream', destination: 'validated_energy_stream' },
          { type: 'alert', destination: 'energy_alerts' }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalProcessed: 0,
          successfulProcessed: 0,
          failedProcessed: 0,
          averageProcessingTime: 0,
          throughput: 0,
          uptime: 100,
          memoryUsage: 0
        }
      },
      {
        id: 'DEVICE_NORMALIZER',
        name: 'Device Data Normalizer',
        description: 'Normalizes device data to standard format',
        type: 'normalize',
        config: {
          batchSize: 50,
          batchTimeout: 3000,
          parallelProcessing: true
        },
        isActive: true,
        priority: 2,
        filters: [
          { field: 'type', operator: 'equals', value: 'device' }
        ],
        transformations: [
          { type: 'normalize', field: 'timestamp', expression: 'new Date()' },
          { type: 'normalize', field: 'status', expression: 'normalizeStatus(value)' },
          { type: 'enrich', field: 'deviceInfo', parameters: { source: 'device_registry' } }
        ],
        outputs: [
          { type: 'stream', destination: 'normalized_device_stream' },
          { type: 'database', destination: 'device_data' }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalProcessed: 0,
          successfulProcessed: 0,
          failedProcessed: 0,
          averageProcessingTime: 0,
          throughput: 0,
          uptime: 100,
          memoryUsage: 0
        }
      },
      {
        id: 'ALERT_AGGREGATOR',
        name: 'Alert Aggregator',
        description: 'Aggregates and deduplicates alerts',
        type: 'aggregate',
        config: {
          batchSize: 200,
          batchTimeout: 10000,
          memoryLimit: 512
        },
        isActive: true,
        priority: 3,
        filters: [
          { field: 'type', operator: 'equals', value: 'alert' }
        ],
        transformations: [
          { type: 'aggregate', expression: 'groupBy(deviceId, alertType)' },
          { type: 'calculate', field: 'count', expression: 'count()' },
          { type: 'format', expression: 'alertSummary()' }
        ],
        outputs: [
          { type: 'stream', destination: 'aggregated_alerts' },
          { type: 'websocket', destination: 'alert_dashboard' }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalProcessed: 0,
          successfulProcessed: 0,
          failedProcessed: 0,
          averageProcessingTime: 0,
          throughput: 0,
          uptime: 100,
          memoryUsage: 0
        }
      }
    ];

    processors.forEach(processor => {
      this.processors.set(processor.id, processor);
    });
  }

  private initializeBuffers() {
    const buffers: StreamBuffer[] = [
      {
        id: 'INPUT_BUFFER',
        name: 'Input Stream Buffer',
        type: 'memory',
        size: 10000,
        ttl: 300, // 5 minutes
        strategy: 'fifo',
        isActive: true,
        stats: {
          currentSize: 0,
          maxSize: 10000,
          utilization: 0,
          throughput: 0,
          averageLatency: 0
        }
      },
      {
        id: 'OUTPUT_BUFFER',
        name: 'Output Stream Buffer',
        type: 'memory',
        size: 5000,
        ttl: 600, // 10 minutes
        strategy: 'fifo',
        isActive: true,
        stats: {
          currentSize: 0,
          maxSize: 5000,
          utilization: 0,
          throughput: 0,
          averageLatency: 0
        }
      }
    ];

    buffers.forEach(buffer => {
      this.buffers.set(buffer.id, buffer);
    });
  }

  private startProcessing(): void {
    setInterval(() => {
      this.processQueue();
      this.cleanupExpiredData();
      this.updateStats();
    }, 1000); // Process every second
  }

  async processStreamData(data: Omit<StreamData, 'id' | 'processed'>): Promise<StreamData> {
    const streamData: StreamData = {
      ...data,
      id: `STREAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processed: false
    };

    // Add to input buffer
    await this.addToBuffer('INPUT_BUFFER', streamData);
    
    // Add to processing queue
    this.processingQueue.push(streamData);
    
    this.emit('data_received', streamData);
    
    return streamData;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.processingQueue.splice(0, 100); // Process in batches of 100

    for (const data of batch) {
      try {
        await this.processDataItem(data);
      } catch (error) {
        data.error = error instanceof Error ? error.message : 'Unknown error';
        data.processed = true;
        data.processedAt = new Date();
      }
    }

    this.isProcessing = false;
  }

  private async processDataItem(data: StreamData): Promise<void> {
    const startTime = Date.now();

    // Find applicable processors
    const applicableProcessors = Array.from(this.processors.values())
      .filter(processor => 
        processor.isActive && 
        this.matchesFilters(data, processor.filters)
      )
      .sort((a, b) => a.priority - b.priority);

    // Apply processors in priority order
    let processedData = { ...data };
    for (const processor of applicableProcessors) {
      processedData = await this.applyProcessor(processedData, processor);
      this.updateProcessorStats(processor, true, Date.now() - startTime);
    }

    processedData.processed = true;
    processedData.processedAt = new Date();

    // Add to output buffer
    await this.addToBuffer('OUTPUT_BUFFER', processedData);

    this.emit('data_processed', processedData);
  }

  private matchesFilters(data: StreamData, filters: StreamFilter[]): boolean {
    return filters.every(filter => {
      const fieldValue = this.getFieldValue(data, filter.field);
      
      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'not_equals':
          return fieldValue !== filter.value;
        case 'greater_than':
          return Number(fieldValue) > Number(filter.value);
        case 'less_than':
          return Number(fieldValue) < Number(filter.value);
        case 'contains':
          return String(fieldValue).includes(String(filter.value));
        case 'not_contains':
          return !String(fieldValue).includes(String(filter.value));
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        case 'not_in':
          return Array.isArray(filter.value) && !filter.value.includes(fieldValue);
        case 'regex':
          return new RegExp(filter.value).test(String(fieldValue));
        default:
          return true;
      }
    });
  }

  private getFieldValue(data: StreamData, field: string): any {
    const parts = field.split('.');
    let value: any = data;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return null;
      }
    }
    
    return value;
  }

  private async applyProcessor(data: StreamData, processor: StreamProcessor): Promise<StreamData> {
    let processedData = { ...data };

    for (const transformation of processor.transformations) {
      processedData = await this.applyTransformation(processedData, transformation);
    }

    // Send to outputs
    for (const output of processor.outputs) {
      await this.sendToOutput(processedData, output);
    }

    return processedData;
  }

  private async applyTransformation(data: StreamData, transformation: StreamTransformation): Promise<StreamData> {
    switch (transformation.type) {
      case 'map':
        return this.mapTransformation(data, transformation);
      case 'normalize':
        return this.normalizeTransformation(data, transformation);
      case 'enrich':
        return this.enrichTransformation(data, transformation);
      case 'calculate':
        return this.calculateTransformation(data, transformation);
      case 'validate':
        return this.validateTransformation(data, transformation);
      case 'format':
        return this.formatTransformation(data, transformation);
      default:
        return data;
    }
  }

  private mapTransformation(data: StreamData, transformation: StreamTransformation): StreamData {
    // Simple mapping transformation
    if (transformation.field && transformation.expression) {
      const parts = transformation.field.split('.');
      let current: any = data;
      
      for (const part of parts.slice(0, -1)) {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
      
      current[parts[parts.length - 1]] = this.evaluateExpression(transformation.expression, data);
    }
    
    return data;
  }

  private normalizeTransformation(data: StreamData, transformation: StreamTransformation): StreamData {
    if (transformation.field === 'timestamp') {
      data.timestamp = new Date(data.timestamp);
    }
    
    if (transformation.field === 'status') {
      // Normalize status values
      const statusMap: Record<string, string> = {
        '1': 'online',
        '0': 'offline',
        'true': 'online',
        'false': 'offline'
      };
      
      if (data.data.status) {
        data.data.status = statusMap[String(data.data.status)] || data.data.status;
      }
    }
    
    return data;
  }

  private enrichTransformation(data: StreamData, transformation: StreamTransformation): StreamData {
    // Simulate data enrichment
    if (transformation.field === 'deviceInfo') {
      data.data.deviceInfo = {
        type: 'smart_meter',
        model: 'SM-2000',
        firmware: 'v2.1.0',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
    }
    
    return data;
  }

  private calculateTransformation(data: StreamData, transformation: StreamTransformation): StreamData {
    if (transformation.expression === 'count()') {
      data.data.count = (data.data.count || 0) + 1;
    }
    
    if (transformation.expression === 'power()') {
      const voltage = data.data.voltage || 0;
      const current = data.data.current || 0;
      data.data.power = voltage * current;
    }
    
    return data;
  }

  private formatTransformation(data: StreamData, transformation: StreamTransformation): StreamData {
    if (transformation.expression === 'alertSummary()') {
      data.data.summary = `Device ${data.deviceId}: ${data.data.count} alerts detected`;
    }
    
    return data;
  }

  private validateTransformation(data: StreamData, transformation: StreamTransformation): StreamData {
    if (transformation.field && transformation.expression) {
      const value = this.getFieldValue(data, transformation.field);
      const isValid = this.evaluateExpression(`${value} ${transformation.expression}`, data);
      
      if (!isValid) {
        data.error = `Validation failed for field ${transformation.field}`;
      }
    }
    
    return data;
  }

  private evaluateExpression(expression: string, _data: StreamData): any {
    // Simple expression evaluator - in production, use a proper expression parser
    try {
      if (expression.includes('normalizeStatus')) {
        return 'normalized';
      }
      
      if (expression.includes('new Date()')) {
        return new Date();
      }
      
      if (expression.includes('count()')) {
        return 1;
      }
      
      if (expression.includes('alertSummary()')) {
        return 'Alert summary generated';
      }
      
      return expression;
    } catch (error) {
      return null;
    }
  }

  private async sendToOutput(data: StreamData, output: StreamOutput): Promise<void> {
    switch (output.type) {
      case 'stream':
        await this.addToStream(output.destination, data);
        break;
      case 'database':
        await this.saveToDatabase(output.destination, data);
        break;
      case 'websocket':
        await this.sendToWebSocket(output.destination, data);
        break;
      case 'alert':
        await this.sendAlert(output.destination, data);
        break;
    }
  }

  private async addToStream(streamName: string, data: StreamData): Promise<void> {
    // Simulate adding to stream
    console.log(`Adding data to stream ${streamName}:`, data.id);
  }

  private async saveToDatabase(collection: string, data: StreamData): Promise<void> {
    // Simulate database save
    console.log(`Saving data to ${collection}:`, data.id);
  }

  private async sendToWebSocket(channel: string, data: StreamData): Promise<void> {
    // Simulate WebSocket send
    console.log(`Sending to WebSocket ${channel}:`, data.id);
  }

  private async sendAlert(channel: string, data: StreamData): Promise<void> {
    // Simulate alert sending
    console.log(`Sending alert to ${channel}:`, data.id);
  }

  private async addToBuffer(bufferId: string, _data: StreamData): Promise<void> {
    const buffer = this.buffers.get(bufferId);
    if (!buffer) return;

    buffer.stats.currentSize++;
    buffer.stats.utilization = (buffer.stats.currentSize / buffer.stats.maxSize) * 100;
    
    // In a real implementation, this would add to the actual buffer
    this.buffers.set(bufferId, buffer);
  }

  private cleanupExpiredData(): void {
    // Simulate cleanup of expired data
    
    for (const buffer of this.buffers.values()) {
      // Simulate cleanup of expired data
      if (buffer.stats.currentSize > 0) {
        const expiredCount = Math.floor(buffer.stats.currentSize * 0.1); // Remove 10% as expired
        buffer.stats.currentSize = Math.max(0, buffer.stats.currentSize - expiredCount);
        buffer.stats.utilization = (buffer.stats.currentSize / buffer.stats.maxSize) * 100;
      }
    }
  }

  private updateStats(): void {
    for (const processor of this.processors.values()) {
      // Update processor stats
      processor.stats.throughput = processor.stats.totalProcessed > 0 ? 
        processor.stats.successfulProcessed / (Date.now() - (processor.createdAt.getTime())) * 1000 : 0;
      
      processor.stats.memoryUsage = Math.random() * 100; // Simulate memory usage
    }
  }

  private updateProcessorStats(processor: StreamProcessor, success: boolean, processingTime: number): void {
    processor.stats.totalProcessed++;
    
    if (success) {
      processor.stats.successfulProcessed++;
    } else {
      processor.stats.failedProcessed++;
    }
    
    processor.stats.averageProcessingTime = 
      (processor.stats.averageProcessingTime + processingTime) / 2;
    
    processor.lastRun = new Date();
  }

  async createProcessor(processorData: Omit<StreamProcessor, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<StreamProcessor> {
    const processor: StreamProcessor = {
      ...processorData,
      id: `PROCESSOR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalProcessed: 0,
        successfulProcessed: 0,
        failedProcessed: 0,
        averageProcessingTime: 0,
        throughput: 0,
        uptime: 100,
        memoryUsage: 0
      }
    };

    this.processors.set(processor.id, processor);
    return processor;
  }

  async createPipeline(pipelineData: Omit<StreamPipeline, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<StreamPipeline> {
    const pipeline: StreamPipeline = {
      ...pipelineData,
      id: `PIPELINE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalRecords: 0,
        processedRecords: 0,
        failedRecords: 0,
        averageLatency: 0,
        throughput: 0,
        errorRate: 0,
        uptime: 100
      }
    };

    this.pipelines.set(pipeline.id, pipeline);
    return pipeline;
  }

  async getProcessor(processorId: string): Promise<StreamProcessor | null> {
    return this.processors.get(processorId) || null;
  }

  async getPipeline(pipelineId: string): Promise<StreamPipeline | null> {
    return this.pipelines.get(pipelineId) || null;
  }

  async getProcessors(): Promise<StreamProcessor[]> {
    return Array.from(this.processors.values());
  }

  async getPipelines(): Promise<StreamPipeline[]> {
    return Array.from(this.pipelines.values());
  }

  async getBuffer(bufferId: string): Promise<StreamBuffer | null> {
    return this.buffers.get(bufferId) || null;
  }

  async getBuffers(): Promise<StreamBuffer[]> {
    return Array.from(this.buffers.values());
  }

  // Event system
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
}

let dataStreamProcessorInstance: DataStreamProcessor | null = null;

export function getDataStreamProcessor(): DataStreamProcessor {
  if (!dataStreamProcessorInstance) {
    dataStreamProcessorInstance = new DataStreamProcessor();
  }
  return dataStreamProcessorInstance;
}
