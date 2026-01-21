export interface AggregationRule {
  id: string;
  name: string;
  description: string;
  source: string; // data source/stream
  type: AggregationType;
  window: TimeWindow;
  groupBy?: string[];
  filters?: AggregationFilter[];
  calculations: AggregationCalculation[];
  output: AggregationOutput;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  stats: AggregationStats;
}

export type AggregationType = 
  | 'sum' 
  | 'average' 
  | 'min' 
  | 'max' 
  | 'count' 
  | 'distinct_count' 
  | 'rate' 
  | 'percentile' 
  | 'moving_average' 
  | 'cumulative' 
  | 'custom';

export interface TimeWindow {
  type: 'fixed' | 'sliding' | 'tumbling' | 'session';
  duration: number; // in seconds
  size?: number; // for sliding windows
  step?: number; // for tumbling windows
  timezone?: string;
}

export interface AggregationFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'contains';
  value: any;
}

export interface AggregationCalculation {
  field: string;
  type: AggregationType;
  alias?: string;
  parameters?: Record<string, any>;
}

export interface AggregationOutput {
  type: 'stream' | 'cache' | 'database' | 'websocket' | 'alert';
  destination: string;
  format?: 'json' | 'csv' | 'parquet';
  config?: Record<string, any>;
}

export interface AggregationStats {
  totalProcessed: number;
  successfulAggregations: number;
  failedAggregations: number;
  averageProcessingTime: number; // milliseconds
  lastError?: string;
  throughput: number; // records per second
  memoryUsage: number; // MB
  uptime: number; // percentage
}

export interface AggregatedData {
  id: string;
  ruleId: string;
  windowStart: Date;
  windowEnd: Date;
  groupBy?: Record<string, any>;
  results: AggregationResult[];
  metadata: AggregationMetadata;
  createdAt: Date;
}

export interface AggregationResult {
  field: string;
  alias?: string;
  type: AggregationType;
  value: any;
  unit?: string;
  timestamp: Date;
}

export interface AggregationMetadata {
  source: string;
  recordCount: number;
  processingTime: number; // milliseconds
  windowType: string;
  filters: string[];
  quality: 'high' | 'medium' | 'low';
}

export interface DataWindow {
  id: string;
  type: TimeWindow['type'];
  startTime: Date;
  endTime: Date;
  data: any[];
  size: number;
  isFull: boolean;
  lastUpdated?: Date;
  metadata: WindowMetadata;
}

export interface WindowMetadata {
  source: string;
  lastUpdated: Date;
  compressionRatio?: number;
  checksum?: string;
  version: number;
}

export interface AggregationEngine {
  id: string;
  name: string;
  type: 'stream' | 'batch' | 'hybrid';
  config: EngineConfig;
  rules: Map<string, AggregationRule>;
  windows: Map<string, DataWindow>;
  buffers: Map<string, AggregationBuffer>;
  stats: EngineStats;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EngineConfig {
  maxConcurrentAggregations: number;
  memoryLimit: number; // MB
  processingInterval: number; // milliseconds
  checkpointInterval: number; // milliseconds
  errorHandling: 'stop' | 'continue' | 'retry';
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

export interface AggregationBuffer {
  id: string;
  name: string;
  type: 'memory' | 'redis' | 'file' | 'database';
  size: number;
  ttl: number; // seconds
  strategy: 'fifo' | 'lifo' | 'priority';
  compression: boolean;
  encryption: boolean;
  stats: BufferStats;
}

export interface BufferStats {
  currentSize: number;
  maxSize: number;
  utilization: number; // percentage
  throughput: number; // records per second
  averageLatency: number; // milliseconds
  hitRate: number; // percentage
}

export interface EngineStats {
  totalRules: number;
  activeRules: number;
  totalWindows: number;
  activeWindows: number;
  totalProcessed: number;
  processingRate: number; // records per second
  averageLatency: number; // milliseconds
  errorRate: number; // percentage
  memoryUsage: number; // MB
  uptime: number; // percentage
}

export class RealTimeAggregator {
  private engines: Map<string, AggregationEngine> = new Map();
  private rules: Map<string, AggregationRule> = new Map();
  private windows: Map<string, DataWindow> = new Map();
  private buffers: Map<string, AggregationBuffer> = new Map();
  private processingQueue: any[] = [];
  private isProcessing = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeBuffers();
    this.initializeEngines();
    this.startProcessing();
  }

  private initializeDefaultRules() {
    const rules: AggregationRule[] = [
      {
        id: 'ENERGY_CONSUMPTION_SUM',
        name: 'Energy Consumption Sum',
        description: 'Calculates total energy consumption per device over time windows',
        source: 'energy_data_stream',
        type: 'sum',
        window: {
          type: 'tumbling',
          duration: 300, // 5 minutes
          step: 300
        },
        groupBy: ['deviceId', 'location'],
        filters: [
          { field: 'type', operator: 'equals', value: 'consumption' }
        ],
        calculations: [
          { field: 'consumption', type: 'sum', alias: 'totalConsumption' },
          { field: 'consumption', type: 'average', alias: 'averageConsumption' },
          { field: 'consumption', type: 'max', alias: 'peakConsumption' }
        ],
        output: {
          type: 'stream',
          destination: 'energy_aggregates',
          format: 'json'
        },
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalProcessed: 0,
          successfulAggregations: 0,
          failedAggregations: 0,
          averageProcessingTime: 0,
          throughput: 0,
          memoryUsage: 0,
          uptime: 100
        }
      },
      {
        id: 'DEVICE_STATUS_RATE',
        name: 'Device Status Rate',
        description: 'Calculates device online/offline rates',
        source: 'device_status_stream',
        type: 'rate',
        window: {
          type: 'sliding',
          duration: 600, // 10 minutes
          size: 1000
        },
        groupBy: ['deviceId', 'status'],
        calculations: [
          { field: 'status', type: 'count', alias: 'statusCount' },
          { field: 'status', type: 'rate', alias: 'statusRate' }
        ],
        output: {
          type: 'websocket',
          destination: 'device_status_dashboard'
        },
        isActive: true,
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalProcessed: 0,
          successfulAggregations: 0,
          failedAggregations: 0,
          averageProcessingTime: 0,
          throughput: 0,
          memoryUsage: 0,
          uptime: 100
        }
      },
      {
        id: 'ALERT_FREQUENCY',
        name: 'Alert Frequency Analysis',
        description: 'Analyzes alert frequency by type and severity',
        source: 'alert_stream',
        type: 'count',
        window: {
          type: 'fixed',
          duration: 3600 // 1 hour
        },
        groupBy: ['alertType', 'severity', 'deviceId'],
        calculations: [
          { field: 'alertId', type: 'count', alias: 'alertCount' },
          { field: 'severity', type: 'distinct_count', alias: 'severityTypes' }
        ],
        output: {
          type: 'cache',
          destination: 'alert_frequency_cache'
        },
        isActive: true,
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalProcessed: 0,
          successfulAggregations: 0,
          failedAggregations: 0,
          averageProcessingTime: 0,
          throughput: 0,
          memoryUsage: 0,
          uptime: 100
        }
      }
    ];

    rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  private initializeBuffers() {
    const buffers: AggregationBuffer[] = [
      {
        id: 'AGGREGATION_INPUT_BUFFER',
        name: 'Aggregation Input Buffer',
        type: 'memory',
        size: 50000,
        ttl: 1800, // 30 minutes
        strategy: 'fifo',
        compression: true,
        encryption: false,
        stats: {
          currentSize: 0,
          maxSize: 50000,
          utilization: 0,
          throughput: 0,
          averageLatency: 0,
          hitRate: 95
        }
      },
      {
        id: 'AGGREGATION_OUTPUT_BUFFER',
        name: 'Aggregation Output Buffer',
        type: 'memory',
        size: 10000,
        ttl: 3600, // 1 hour
        strategy: 'fifo',
        compression: true,
        encryption: false,
        stats: {
          currentSize: 0,
          maxSize: 10000,
          utilization: 0,
          throughput: 0,
          averageLatency: 0,
          hitRate: 98
        }
      }
    ];

    buffers.forEach(buffer => {
      this.buffers.set(buffer.id, buffer);
    });
  }

  private initializeEngines() {
    const engine: AggregationEngine = {
      id: 'MAIN_AGGREGATION_ENGINE',
      name: 'Main Real-time Aggregation Engine',
      type: 'stream',
      config: {
        maxConcurrentAggregations: 10,
        memoryLimit: 2048, // 2GB
        processingInterval: 1000, // 1 second
        checkpointInterval: 60000, // 1 minute
        errorHandling: 'continue',
        retryAttempts: 3,
        retryDelay: 5000
      },
      rules: new Map(),
      windows: new Map(),
      buffers: new Map(),
      stats: {
        totalRules: 0,
        activeRules: 0,
        totalWindows: 0,
        activeWindows: 0,
        totalProcessed: 0,
        processingRate: 0,
        averageLatency: 0,
        errorRate: 0,
        memoryUsage: 0,
        uptime: 100
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.engines.set(engine.id, engine);
  }

  private startProcessing(): void {
    setInterval(() => {
      this.processQueue();
      this.updateWindows();
      this.cleanupExpiredData();
      this.updateStats();
    }, 1000); // Process every second
  }

  async processData(data: any, source: string): Promise<void> {
    // Add to input buffer
    await this.addToBuffer('AGGREGATION_INPUT_BUFFER', data);
    
    // Find applicable rules
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => 
        rule.isActive && 
        rule.source === source &&
        this.matchesFilters(data, rule.filters)
      )
      .sort((a, b) => a.priority - b.priority);

    // Add to processing queue
    for (const rule of applicableRules) {
      this.processingQueue.push({
        data,
        ruleId: rule.id,
        timestamp: new Date()
      });
    }

    this.emit('data_received', { data, source, applicableRules: applicableRules.length });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.processingQueue.splice(0, 100); // Process in batches

    for (const item of batch) {
      try {
        await this.processDataItem(item);
      } catch (error) {
        console.error('Error processing aggregation item:', error);
      }
    }

    this.isProcessing = false;
  }

  private async processDataItem(item: any): Promise<void> {
    const rule = this.rules.get(item.ruleId);
    if (!rule) return;

    const startTime = Date.now();

    // Get or create window
    const window = await this.getOrCreateWindow(rule, item.data);
    window.data.push(item.data);
    window.lastUpdated = new Date();

    // Check if window is ready for aggregation
    if (this.isWindowReady(window, rule)) {
      const aggregatedData = await this.performAggregation(window, rule);
      
      // Send to output
      await this.sendToOutput(aggregatedData, rule.output);
      
      // Update window
      this.updateWindow(window, rule);
      
      // Update stats
      this.updateRuleStats(rule, true, Date.now() - startTime);
      
      this.emit('aggregation_completed', { ruleId: rule.id, data: aggregatedData });
    }
  }

  private async getOrCreateWindow(rule: AggregationRule, data: any): Promise<DataWindow> {
    const windowId = this.generateWindowId(rule, data);
    let window = this.windows.get(windowId);

    if (!window) {
      const now = new Date();
      window = {
        id: windowId,
        type: rule.window.type,
        startTime: this.calculateWindowStart(now, rule.window),
        endTime: this.calculateWindowEnd(now, rule.window),
        data: [],
        size: 0,
        isFull: false,
        metadata: {
          source: rule.source,
          lastUpdated: now,
          version: 1
        }
      };
      this.windows.set(windowId, window);
    }

    return window;
  }

  private generateWindowId(rule: AggregationRule, data: any): string {
    const groupByValues = rule.groupBy ? 
      rule.groupBy.map(field => data[field] || 'unknown').join('_') : 
      'default';
    
    return `${rule.id}_${groupByValues}_${Math.floor(Date.now() / (rule.window.duration * 1000))}`;
  }

  private calculateWindowStart(now: Date, window: TimeWindow): Date {
    switch (window.type) {
      case 'tumbling':
        const windowSize = window.duration * 1000;
        const timestamp = now.getTime();
        return new Date(Math.floor(timestamp / windowSize) * windowSize);
      case 'sliding':
        return new Date(now.getTime() - window.duration * 1000);
      case 'fixed':
        return new Date(now.getTime() - window.duration * 1000);
      default:
        return new Date(now.getTime() - window.duration * 1000);
    }
  }

  private calculateWindowEnd(now: Date, window: TimeWindow): Date {
    switch (window.type) {
      case 'tumbling':
        const windowSize = window.duration * 1000;
        const timestamp = now.getTime();
        return new Date((Math.floor(timestamp / windowSize) + 1) * windowSize);
      case 'sliding':
      case 'fixed':
        return now;
      default:
        return now;
    }
  }

  private isWindowReady(window: DataWindow, rule: AggregationRule): boolean {
    const now = new Date();
    
    switch (rule.window.type) {
      case 'tumbling':
        return now >= window.endTime;
      case 'sliding':
        return window.data.length >= (rule.window.size || 100);
      case 'fixed':
        return now >= window.endTime;
      default:
        return window.data.length > 0;
    }
  }

  private async performAggregation(window: DataWindow, rule: AggregationRule): Promise<AggregatedData> {
    const results: AggregationResult[] = [];
    const groupBy = this.extractGroupByValues(window.data[0], rule.groupBy);

    for (const calculation of rule.calculations) {
      const result = await this.performCalculation(window.data, calculation);
      results.push(result);
    }

    const aggregatedData: AggregatedData = {
      id: `AGG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      windowStart: window.startTime,
      windowEnd: window.endTime,
      groupBy,
      results,
      metadata: {
        source: rule.source,
        recordCount: window.data.length,
        processingTime: Date.now() - window.startTime.getTime(),
        windowType: rule.window.type,
        filters: rule.filters?.map(f => `${f.field} ${f.operator} ${f.value}`) || [],
        quality: this.calculateDataQuality(window.data)
      },
      createdAt: new Date()
    };

    return aggregatedData;
  }

  private extractGroupByValues(data: any, groupBy?: string[]): Record<string, any> {
    if (!groupBy || groupBy.length === 0) return {};

    const values: Record<string, any> = {};
    for (const field of groupBy) {
      values[field] = data[field] || 'unknown';
    }
    return values;
  }

  private async performCalculation(data: any[], calculation: AggregationCalculation): Promise<AggregationResult> {
    const values = data.map(item => item[calculation.field]).filter(val => val != null);
    
    let result: any;
    switch (calculation.type) {
      case 'sum':
        result = values.reduce((sum, val) => sum + Number(val), 0);
        break;
      case 'average':
        result = values.length > 0 ? values.reduce((sum, val) => sum + Number(val), 0) / values.length : 0;
        break;
      case 'min':
        result = values.length > 0 ? Math.min(...values.map(Number)) : 0;
        break;
      case 'max':
        result = values.length > 0 ? Math.max(...values.map(Number)) : 0;
        break;
      case 'count':
        result = values.length;
        break;
      case 'distinct_count':
        result = new Set(values).size;
        break;
      case 'rate':
        const timeSpan = (data[data.length - 1]?.timestamp || new Date()).getTime() - (data[0]?.timestamp || new Date()).getTime();
        result = timeSpan > 0 ? (values.length / timeSpan) * 1000 : 0; // per second
        break;
      case 'percentile':
        const percentile = calculation.parameters?.percentile || 95;
        const sorted = values.map(Number).sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        result = sorted[Math.max(0, index)];
        break;
      case 'moving_average':
        const windowSize = calculation.parameters?.windowSize || 10;
        const recentValues = values.slice(-windowSize);
        result = recentValues.length > 0 ? recentValues.reduce((sum, val) => sum + Number(val), 0) / recentValues.length : 0;
        break;
      case 'cumulative':
        result = values.reduce((sum, val) => sum + Number(val), 0);
        break;
      default:
        result = null;
    }

    return {
      field: calculation.field,
      alias: calculation.alias || calculation.field,
      type: calculation.type,
      value: result,
      timestamp: new Date()
    };
  }

  private calculateDataQuality(data: any[]): 'high' | 'medium' | 'low' {
    if (data.length === 0) return 'low';
    
    // Simple quality calculation based on completeness and consistency
    let completeness = 0;
    let consistency = 0;
    
    if (data.length > 0) {
      const fields = Object.keys(data[0]);
      completeness = fields.filter(field => 
        data.every(item => item[field] != null && item[field] !== '')
      ).length / fields.length;
      
      // Check for consistent data types
      const firstTypes = fields.map(field => typeof data[0][field]);
      consistency = firstTypes.filter((type, index) => 
        data.every(item => typeof item[fields[index]] === type)
      ).length / fields.length;
    }
    
    const quality = (completeness + consistency) / 2;
    
    if (quality > 0.8) return 'high';
    if (quality > 0.5) return 'medium';
    return 'low';
  }

  private updateWindow(window: DataWindow, rule: AggregationRule): void {
    switch (rule.window.type) {
      case 'tumbling':
        // Reset window for next aggregation
        window.data = [];
        window.startTime = window.endTime;
        window.endTime = new Date(window.endTime.getTime() + rule.window.duration * 1000);
        window.metadata.version++;
        break;
      case 'sliding':
        // Remove oldest data if window is full
        const maxSize = rule.window.size || 100;
        if (window.data.length > maxSize) {
          window.data.shift();
        }
        window.startTime = new Date(Date.now() - rule.window.duration * 1000);
        window.endTime = new Date();
        break;
      case 'fixed':
        // Reset window completely
        window.data = [];
        window.isFull = true;
        break;
    }
    
    window.size = window.data.length;
    window.metadata.lastUpdated = new Date();
  }

  private async sendToOutput(data: AggregatedData, output: AggregationOutput): Promise<void> {
    switch (output.type) {
      case 'stream':
        await this.sendToStream(output.destination, data);
        break;
      case 'cache':
        await this.sendToCache(output.destination, data);
        break;
      case 'database':
        await this.sendToDatabase(output.destination, data);
        break;
      case 'websocket':
        await this.sendToWebSocket(output.destination, data);
        break;
      case 'alert':
        await this.sendAlert(output.destination, data);
        break;
    }
  }

  private async sendToStream(streamName: string, data: AggregatedData): Promise<void> {
    console.log(`Sending aggregated data to stream ${streamName}:`, data.id);
  }

  private async sendToCache(cacheKey: string, data: AggregatedData): Promise<void> {
    console.log(`Caching aggregated data with key ${cacheKey}:`, data.id);
  }

  private async sendToDatabase(collection: string, data: AggregatedData): Promise<void> {
    console.log(`Saving aggregated data to ${collection}:`, data.id);
  }

  private async sendToWebSocket(channel: string, data: AggregatedData): Promise<void> {
    console.log(`Sending aggregated data to WebSocket ${channel}:`, data.id);
  }

  private async sendAlert(alertChannel: string, data: AggregatedData): Promise<void> {
    console.log(`Sending aggregation alert to ${alertChannel}:`, data.id);
  }

  private matchesFilters(data: any, filters?: AggregationFilter[]): boolean {
    if (!filters || filters.length === 0) return true;

    return filters.every(filter => {
      const fieldValue = data[filter.field];
      
      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'not_equals':
          return fieldValue !== filter.value;
        case 'greater_than':
          return Number(fieldValue) > Number(filter.value);
        case 'less_than':
          return Number(fieldValue) < Number(filter.value);
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        case 'not_in':
          return Array.isArray(filter.value) && !filter.value.includes(fieldValue);
        case 'contains':
          return String(fieldValue).includes(String(filter.value));
        default:
          return true;
      }
    });
  }

  private async addToBuffer(bufferId: string, _data: any): Promise<void> {
    const buffer = this.buffers.get(bufferId);
    if (!buffer) return;

    buffer.stats.currentSize++;
    buffer.stats.utilization = (buffer.stats.currentSize / buffer.stats.maxSize) * 100;
  }

  private updateWindows(): void {
    const now = new Date();
    
    for (const window of this.windows.values()) {
      // Update window end time for sliding windows
      if (window.type === 'sliding') {
        window.endTime = now;
      }
    }
  }

  private cleanupExpiredData(): void {
    const now = Date.now();
    
    for (const [windowId, window] of this.windows.entries()) {
      // Remove windows that are too old
      const age = now - window.endTime.getTime();
      if (age > 3600000) { // 1 hour
        this.windows.delete(windowId);
      }
    }
  }

  private updateStats(): void {
    for (const rule of this.rules.values()) {
      rule.stats.throughput = rule.stats.totalProcessed > 0 ? 
        rule.stats.successfulAggregations / (Date.now() - rule.createdAt.getTime()) * 1000 : 0;
      
      rule.stats.memoryUsage = Math.random() * 200; // Simulate memory usage
    }
  }

  private updateRuleStats(rule: AggregationRule, success: boolean, processingTime: number): void {
    rule.stats.totalProcessed++;
    
    if (success) {
      rule.stats.successfulAggregations++;
    } else {
      rule.stats.failedAggregations++;
    }
    
    rule.stats.averageProcessingTime = 
      (rule.stats.averageProcessingTime + processingTime) / 2;
    
    rule.lastRun = new Date();
  }

  async createRule(ruleData: Omit<AggregationRule, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<AggregationRule> {
    const rule: AggregationRule = {
      ...ruleData,
      id: `RULE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalProcessed: 0,
        successfulAggregations: 0,
        failedAggregations: 0,
        averageProcessingTime: 0,
        throughput: 0,
        memoryUsage: 0,
        uptime: 100
      }
    };

    this.rules.set(rule.id, rule);
    return rule;
  }

  async getRule(ruleId: string): Promise<AggregationRule | null> {
    return this.rules.get(ruleId) || null;
  }

  async getRules(): Promise<AggregationRule[]> {
    return Array.from(this.rules.values());
  }

  async getAggregatedData(_ruleId?: string, _timeRange?: { start: Date; end: Date }): Promise<AggregatedData[]> {
    // This would typically query a database or cache
    // For now, return empty array
    return [];
  }

  async getStats(): Promise<EngineStats> {
    const engine = this.engines.get('MAIN_AGGREGATION_ENGINE');
    if (!engine) {
      throw new Error('Aggregation engine not found');
    }

    engine.stats.totalRules = this.rules.size;
    engine.stats.activeRules = Array.from(this.rules.values()).filter(r => r.isActive).length;
    engine.stats.totalWindows = this.windows.size;
    engine.stats.activeWindows = Array.from(this.windows.values()).filter(w => !w.isFull).length;

    return { ...engine.stats };
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

let realTimeAggregatorInstance: RealTimeAggregator | null = null;

export function getRealTimeAggregator(): RealTimeAggregator {
  if (!realTimeAggregatorInstance) {
    realTimeAggregatorInstance = new RealTimeAggregator();
  }
  return realTimeAggregatorInstance;
}
