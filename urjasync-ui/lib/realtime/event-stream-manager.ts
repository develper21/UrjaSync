export interface Event {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata: EventMetadata;
  priority: 'low' | 'normal' | 'high' | 'critical';
  tags: string[];
  correlationId?: string;
  causationId?: string;
  version: number;
  schema?: string;
  ttl?: number; // time to live in seconds
}

export interface EventMetadata {
  userId?: string;
  sessionId?: string;
  deviceId?: string;
  location?: string;
  ip?: string;
  userAgent?: string;
  environment: 'development' | 'staging' | 'production';
  region?: string;
  traceId?: string;
  spanId?: string;
  additionalData?: Record<string, any>;
}

export interface EventStream {
  id: string;
  name: string;
  description: string;
  type: StreamType;
  config: StreamConfig;
  status: StreamStatus;
  retention: RetentionPolicy;
  schema?: EventSchema;
  createdAt: Date;
  updatedAt: Date;
  stats: StreamStats;
}

export type StreamType = 
  | 'event' 
  | 'command' 
  | 'query' 
  | 'snapshot' 
  | 'notification' 
  | 'metric' 
  | 'log' 
  | 'trace';

export interface StreamConfig {
  partitioning?: PartitioningConfig;
  serialization: SerializationConfig;
  compression: CompressionConfig;
  encryption?: EncryptionConfig;
  indexing: IndexingConfig;
  replication: ReplicationConfig;
}

export interface PartitioningConfig {
  strategy: 'none' | 'key' | 'hash' | 'range' | 'time';
  field?: string;
  partitions?: number;
  ttl?: number;
}

export interface SerializationConfig {
  format: 'json' | 'avro' | 'protobuf' | 'msgpack' | 'csv';
  schemaRegistry?: string;
  version?: string;
}

export interface CompressionConfig {
  algorithm: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd';
  level?: number;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyId?: string;
  fields?: string[]; // fields to encrypt
}

export interface IndexingConfig {
  enabled: boolean;
  fields: string[];
  type: 'hash' | 'btree' | 'fulltext';
}

export interface ReplicationConfig {
  factor: number;
  strategy: 'sync' | 'async';
  consistency: 'eventual' | 'strong';
}

export type StreamStatus = 'active' | 'inactive' | 'paused' | 'archived' | 'error';

export interface RetentionPolicy {
  type: 'time' | 'size' | 'count' | 'unlimited';
  value: number;
  unit?: 'seconds' | 'minutes' | 'hours' | 'days' | 'bytes' | 'mb' | 'gb' | 'records';
  archive?: boolean;
  coldStorage?: boolean;
}

export interface EventSchema {
  id: string;
  name: string;
  version: string;
  fields: SchemaField[];
  required: string[];
  indexes?: SchemaIndex[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'null';
  required?: boolean;
  nullable?: boolean;
  format?: string;
  enum?: string[];
  validation?: ValidationRule[];
  default?: any;
  description?: string;
}

export interface SchemaIndex {
  name: string;
  fields: string[];
  type: 'unique' | 'composite' | 'fulltext';
  options?: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'length' | 'enum' | 'custom';
  value?: any;
  message?: string;
}

export interface StreamStats {
  totalEvents: number;
  eventsPerSecond: number;
  averageEventSize: number; // bytes
  storageUsed: number; // bytes
  lastEventAt?: Date;
  errorRate: number; // percentage
  consumerCount: number;
  partitionStats?: PartitionStats[];
}

export interface PartitionStats {
  partitionId: number;
  events: number;
  size: number;
  lag: number; // messages
  oldestEvent?: Date;
  newestEvent?: Date;
}

export interface EventConsumer {
  id: string;
  name: string;
  streamId: string;
  groupId?: string;
  config: ConsumerConfig;
  position: ConsumerPosition;
  status: ConsumerStatus;
  stats: ConsumerStats;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
}

export interface ConsumerConfig {
  autoCommit: boolean;
  commitInterval: number; // milliseconds
  batchSize: number;
  maxPollRecords: number;
  pollTimeout: number; // milliseconds
  retryPolicy: RetryPolicy;
  processingTimeout: number; // milliseconds
  deadLetterQueue?: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds;
  multiplier?: number;
}

export interface ConsumerPosition {
  offset?: number;
  timestamp?: Date;
  partition?: number;
  committed: boolean;
}

export type ConsumerStatus = 'active' | 'paused' | 'error' | 'stopped' | 'rebalancing';

export interface ConsumerStats {
  totalProcessed: number;
  successfulProcessed: number;
  failedProcessed: number;
  averageProcessingTime: number; // milliseconds
  currentLag: number;
  throughput: number; // events per second
  errorRate: number; // percentage
  lastError?: string;
}

export interface EventProjection {
  id: string;
  name: string;
  description: string;
  sourceStreams: string[];
  handler: string; // function name or reference
  state: ProjectionState;
  config: ProjectionConfig;
  createdAt: Date;
  updatedAt: Date;
  lastProcessed?: Date;
  stats: ProjectionStats;
}

export interface ProjectionState {
  position: Record<string, number>; // stream -> position
  version: number;
  checksum?: string;
  lastUpdated: Date;
}

export interface ProjectionConfig {
  batchSize: number;
  checkpointInterval: number; // events
  parallelProcessing: boolean;
  retryPolicy: RetryPolicy;
  storage: StorageConfig;
}

export interface StorageConfig {
  type: 'memory' | 'redis' | 'database' | 'file';
  connection: Record<string, any>;
  ttl?: number; // seconds
  compression?: boolean;
}

export interface ProjectionStats {
  totalEventsProcessed: number;
  processingRate: number; // events per second
  averageProcessingTime: number; // milliseconds
  errorRate: number; // percentage
  storageSize: number; // bytes
  lastCheckpoint?: Date;
}

export interface EventSubscription {
  id: string;
  name: string;
  streamId: string;
  filter?: EventFilter;
  handler: string;
  config: SubscriptionConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats: SubscriptionStats;
}

export interface EventFilter {
  type: 'event_type' | 'data_field' | 'metadata' | 'time_range' | 'custom';
  field?: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
  caseSensitive?: boolean;
}

export interface SubscriptionConfig {
  startPosition: 'earliest' | 'latest' | 'timestamp' | 'offset';
  startValue?: any;
  batchSize: number;
  timeout: number; // milliseconds
  autoCommit: boolean;
}

export interface SubscriptionStats {
  totalReceived: number;
  totalProcessed: number;
  failedProcessed: number;
  averageLatency: number; // milliseconds
  throughput: number; // events per second
  lastReceived?: Date;
  lastProcessed?: Date;
}

export class EventStreamManager {
  private streams: Map<string, EventStream> = new Map();
  private consumers: Map<string, EventConsumer> = new Map();
  private projections: Map<string, EventProjection> = new Map();
  private subscriptions: Map<string, EventSubscription> = new Map();
  private schemas: Map<string, EventSchema> = new Map();
  private eventBuffer: Map<string, Event[]> = new Map();
  private processingQueue: Event[] = [];
  private isProcessing = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeDefaultStreams();
    this.initializeSchemas();
    this.startProcessing();
  }

  private initializeDefaultStreams() {
    const streams: EventStream[] = [
      {
        id: 'DEVICE_EVENTS',
        name: 'Device Events',
        description: 'Device lifecycle and status events',
        type: 'event',
        config: {
          partitioning: {
            strategy: 'key',
            field: 'deviceId',
            partitions: 10
          },
          serialization: {
            format: 'json',
            version: '1.0'
          },
          compression: {
            algorithm: 'gzip',
            level: 6
          },
          indexing: {
            enabled: true,
            fields: ['deviceId', 'type', 'timestamp'],
            type: 'btree'
          },
          replication: {
            factor: 3,
            strategy: 'async',
            consistency: 'eventual'
          }
        },
        status: 'active',
        retention: {
          type: 'time',
          value: 30,
          unit: 'days',
          archive: true,
          coldStorage: true
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalEvents: 0,
          eventsPerSecond: 0,
          averageEventSize: 1024,
          storageUsed: 0,
          errorRate: 0,
          consumerCount: 0
        }
      },
      {
        id: 'ENERGY_EVENTS',
        name: 'Energy Events',
        description: 'Energy consumption and production events',
        type: 'metric',
        config: {
          partitioning: {
            strategy: 'time',
            partitions: 24
          },
          serialization: {
            format: 'json',
            version: '1.0'
          },
          compression: {
            algorithm: 'snappy'
          },
          indexing: {
            enabled: true,
            fields: ['deviceId', 'timestamp', 'type'],
            type: 'btree'
          },
          replication: {
            factor: 2,
            strategy: 'async',
            consistency: 'eventual'
          }
        },
        status: 'active',
        retention: {
          type: 'time',
          value: 90,
          unit: 'days',
          archive: true
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalEvents: 0,
          eventsPerSecond: 0,
          averageEventSize: 512,
          storageUsed: 0,
          errorRate: 0,
          consumerCount: 0
        }
      },
      {
        id: 'ALERT_EVENTS',
        name: 'Alert Events',
        description: 'System and device alert events',
        type: 'notification',
        config: {
          partitioning: {
            strategy: 'hash',
            field: 'alertId',
            partitions: 5
          },
          serialization: {
            format: 'json',
            version: '1.0'
          },
          compression: {
            algorithm: 'gzip'
          },
          indexing: {
            enabled: true,
            fields: ['severity', 'type', 'deviceId', 'timestamp'],
            type: 'btree'
          },
          replication: {
            factor: 3,
            strategy: 'sync',
            consistency: 'strong'
          }
        },
        status: 'active',
        retention: {
          type: 'time',
          value: 365,
          unit: 'days',
          archive: true
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalEvents: 0,
          eventsPerSecond: 0,
          averageEventSize: 2048,
          storageUsed: 0,
          errorRate: 0,
          consumerCount: 0
        }
      }
    ];

    streams.forEach(stream => {
      this.streams.set(stream.id, stream);
      this.eventBuffer.set(stream.id, []);
    });
  }

  private initializeSchemas() {
    const schemas: EventSchema[] = [
      {
        id: 'DEVICE_EVENT_SCHEMA',
        name: 'Device Event Schema',
        version: '1.0',
        fields: [
          { name: 'deviceId', type: 'string', required: true, description: 'Unique device identifier' },
          { name: 'type', type: 'string', required: true, enum: ['online', 'offline', 'error', 'maintenance'] },
          { name: 'status', type: 'object', required: false },
          { name: 'location', type: 'string', required: false },
          { name: 'timestamp', type: 'date', required: true }
        ],
        required: ['deviceId', 'type', 'timestamp'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ENERGY_EVENT_SCHEMA',
        name: 'Energy Event Schema',
        version: '1.0',
        fields: [
          { name: 'deviceId', type: 'string', required: true },
          { name: 'type', type: 'string', required: true, enum: ['consumption', 'production', 'storage'] },
          { name: 'value', type: 'number', required: true, validation: [{ type: 'min', value: 0 }] },
          { name: 'unit', type: 'string', required: true, enum: ['kWh', 'W', 'V', 'A'] },
          { name: 'timestamp', type: 'date', required: true },
          { name: 'metadata', type: 'object', required: false }
        ],
        required: ['deviceId', 'type', 'value', 'unit', 'timestamp'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    schemas.forEach(schema => {
      this.schemas.set(schema.id, schema);
    });
  }

  private startProcessing(): void {
    setInterval(() => {
      this.processQueue();
      this.updateStats();
      this.cleanupExpiredEvents();
    }, 1000); // Process every second
  }

  async publishEvent(streamId: string, eventData: Omit<Event, 'id' | 'timestamp' | 'version'>): Promise<Event> {
    const stream = this.streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream ${streamId} not found`);
    }

    if (stream.status !== 'active') {
      throw new Error(`Stream ${streamId} is not active`);
    }

    const event: Event = {
      ...eventData,
      id: `EVENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      version: 1
    };

    // Validate against schema if exists
    if (stream.schema) {
      this.validateEvent(event, stream.schema);
    }

    // Add to buffer
    const buffer = this.eventBuffer.get(streamId);
    if (buffer) {
      buffer.push(event);
    }

    // Add to processing queue
    this.processingQueue.push(event);

    // Update stream stats
    stream.stats.totalEvents++;
    stream.stats.lastEventAt = event.timestamp;
    stream.stats.storageUsed += JSON.stringify(event).length;

    this.emit('event_published', { streamId, event });
    return event;
  }

  private validateEvent(event: Event, schema: EventSchema): void {
    for (const field of schema.fields) {
      const value = event.data[field.name];
      
      if (field.required && (value === undefined || value === null)) {
        throw new Error(`Required field ${field.name} is missing`);
      }

      if (field.validation) {
        for (const rule of field.validation) {
          if (!this.validateField(value, rule)) {
            throw new Error(`Validation failed for field ${field.name}: ${rule.message}`);
          }
        }
      }
    }
  }

  private validateField(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
      case 'min':
        return Number(value) >= Number(rule.value);
      case 'max':
        return Number(value) <= Number(rule.value);
      case 'pattern':
        return new RegExp(rule.value).test(String(value));
      case 'length':
        return String(value).length >= Number(rule.value);
      case 'enum':
        return Array.isArray(rule.value) && rule.value.includes(value);
      default:
        return true;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.processingQueue.splice(0, 100); // Process in batches

    for (const event of batch) {
      try {
        await this.processEvent(event);
      } catch (error) {
        console.error('Error processing event:', error);
      }
    }

    this.isProcessing = false;
  }

  private async processEvent(event: Event): Promise<void> {
    // Find applicable subscriptions
    const applicableSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => 
        sub.isActive && 
        this.matchesSubscription(event, sub)
      );

    // Process subscriptions
    for (const subscription of applicableSubscriptions) {
      await this.processSubscription(event, subscription);
    }

    // Update projections
    const applicableProjections = Array.from(this.projections.values())
      .filter(proj => 
        proj.sourceStreams.includes(event.source) ||
        proj.sourceStreams.includes('*')
      );

    for (const projection of applicableProjections) {
      await this.updateProjection(event, projection);
    }

    this.emit('event_processed', { event, subscriptions: applicableSubscriptions.length });
  }

  private matchesSubscription(event: Event, subscription: EventSubscription): boolean {
    if (!subscription.filter) return true;

    switch (subscription.filter.type) {
      case 'event_type':
        return this.evaluateFilter(event.type, subscription.filter);
      case 'data_field':
        if (!subscription.filter.field) return false;
        const fieldValue = event.data[subscription.filter.field];
        return this.evaluateFilter(fieldValue, subscription.filter);
      case 'metadata':
        if (!subscription.filter.field) return false;
        const metaValue = event.metadata[subscription.filter.field as keyof EventMetadata];
        return this.evaluateFilter(metaValue, subscription.filter);
      case 'time_range':
        return this.evaluateTimeRange(event.timestamp, subscription.filter);
      default:
        return true;
    }
  }

  private evaluateFilter(value: any, filter: EventFilter): boolean {
    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      case 'not_equals':
        return value !== filter.value;
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(value);
      case 'not_in':
        return Array.isArray(filter.value) && !filter.value.includes(value);
      case 'greater_than':
        return Number(value) > Number(filter.value);
      case 'less_than':
        return Number(value) < Number(filter.value);
      case 'contains':
        return String(value).includes(String(filter.value));
      case 'regex':
        return new RegExp(filter.value).test(String(value));
      default:
        return true;
    }
  }

  private evaluateTimeRange(timestamp: Date, filter: EventFilter): boolean {
    if (!filter.value || !Array.isArray(filter.value) || filter.value.length !== 2) {
      return false;
    }

    const [start, end] = filter.value;
    const eventTime = timestamp.getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    return eventTime >= startTime && eventTime <= endTime;
  }

  private async processSubscription(event: Event, subscription: EventSubscription): Promise<void> {
    try {
      // Simulate processing
      console.log(`Processing event ${event.id} for subscription ${subscription.id}`);
      
      subscription.stats.totalReceived++;
      subscription.stats.lastReceived = event.timestamp;
      
      // In a real implementation, this would call the handler function
      this.emit('subscription_processed', { subscriptionId: subscription.id, event });
    } catch (error) {
      subscription.stats.failedProcessed++;
      console.error(`Error processing subscription ${subscription.id}:`, error);
    }
  }

  private async updateProjection(event: Event, projection: EventProjection): Promise<void> {
    try {
      // Simulate projection update
      console.log(`Updating projection ${projection.id} with event ${event.id}`);
      
      projection.stats.totalEventsProcessed++;
      projection.lastProcessed = event.timestamp;
      
      // Update position
      if (!projection.state.position[event.source]) {
        projection.state.position[event.source] = 0;
      }
      projection.state.position[event.source]++;
      projection.state.lastUpdated = new Date();
      
      this.emit('projection_updated', { projectionId: projection.id, event });
    } catch (error) {
      console.error(`Error updating projection ${projection.id}:`, error);
    }
  }

  async createStream(streamData: Omit<EventStream, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<EventStream> {
    const stream: EventStream = {
      ...streamData,
      id: `STREAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalEvents: 0,
        eventsPerSecond: 0,
        averageEventSize: 1024,
        storageUsed: 0,
        errorRate: 0,
        consumerCount: 0
      }
    };

    this.streams.set(stream.id, stream);
    this.eventBuffer.set(stream.id, []);
    return stream;
  }

  async createConsumer(consumerData: Omit<EventConsumer, 'id' | 'createdAt' | 'updatedAt' | 'stats' | 'position'>): Promise<EventConsumer> {
    const consumer: EventConsumer = {
      ...consumerData,
      id: `CONSUMER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: {
        committed: false
      },
      stats: {
        totalProcessed: 0,
        successfulProcessed: 0,
        failedProcessed: 0,
        averageProcessingTime: 0,
        currentLag: 0,
        throughput: 0,
        errorRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.consumers.set(consumer.id, consumer);
    return consumer;
  }

  async createSubscription(subscriptionData: Omit<EventSubscription, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<EventSubscription> {
    const subscription: EventSubscription = {
      ...subscriptionData,
      id: `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalReceived: 0,
        totalProcessed: 0,
        failedProcessed: 0,
        averageLatency: 0,
        throughput: 0
      }
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  async createProjection(projectionData: Omit<EventProjection, 'id' | 'createdAt' | 'updatedAt' | 'stats' | 'state'>): Promise<EventProjection> {
    const projection: EventProjection = {
      ...projectionData,
      id: `PROJ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      state: {
        position: {},
        version: 1,
        lastUpdated: new Date()
      },
      stats: {
        totalEventsProcessed: 0,
        processingRate: 0,
        averageProcessingTime: 0,
        errorRate: 0,
        storageSize: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projections.set(projection.id, projection);
    return projection;
  }

  async getStream(streamId: string): Promise<EventStream | null> {
    return this.streams.get(streamId) || null;
  }

  async getStreams(): Promise<EventStream[]> {
    return Array.from(this.streams.values());
  }

  async getEvents(streamId: string, filters?: {
    limit?: number;
    offset?: number;
    startTime?: Date;
    endTime?: Date;
    eventType?: string;
  }): Promise<Event[]> {
    const buffer = this.eventBuffer.get(streamId) || [];
    let events = [...buffer];

    if (filters) {
      if (filters.startTime) {
        events = events.filter(e => e.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        events = events.filter(e => e.timestamp <= filters.endTime!);
      }
      if (filters.eventType) {
        events = events.filter(e => e.type === filters.eventType);
      }
    }

    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.offset) {
      events.splice(0, filters.offset);
    }

    if (filters?.limit) {
      return events.slice(0, filters.limit);
    }

    return events;
  }

  async getStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [streamId, stream] of this.streams.entries()) {
      stats[streamId] = {
        ...stream.stats,
        eventsPerSecond: this.calculateEventsPerSecond(streamId)
      };
    }

    return stats;
  }

  private calculateEventsPerSecond(streamId: string): number {
    const buffer = this.eventBuffer.get(streamId) || [];
    if (buffer.length === 0) return 0;

    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    const recentEvents = buffer.filter(event => 
      event.timestamp.getTime() > oneSecondAgo
    );

    return recentEvents.length;
  }

  private updateStats(): void {
    for (const stream of this.streams.values()) {
      stream.stats.eventsPerSecond = this.calculateEventsPerSecond(stream.id);
      stream.stats.consumerCount = Array.from(this.consumers.values())
        .filter(consumer => consumer.streamId === stream.id).length;
    }
  }

  private cleanupExpiredEvents(): void {
    const now = Date.now();

    for (const [streamId, stream] of this.streams.entries()) {
      if (stream.retention.type === 'time') {
        const retentionMs = this.getRetentionMs(stream.retention);
        const buffer = this.eventBuffer.get(streamId) || [];
        
        const validEvents = buffer.filter(event => 
          now - event.timestamp.getTime() <= retentionMs
        );

        this.eventBuffer.set(streamId, validEvents);
      }
    }
  }

  private getRetentionMs(retention: RetentionPolicy): number {
    switch (retention.unit) {
      case 'seconds':
        return retention.value * 1000;
      case 'minutes':
        return retention.value * 60 * 1000;
      case 'hours':
        return retention.value * 60 * 60 * 1000;
      case 'days':
        return retention.value * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000; // Default to 1 day
    }
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

let eventStreamManagerInstance: EventStreamManager | null = null;

export function getEventStreamManager(): EventStreamManager {
  if (!eventStreamManagerInstance) {
    eventStreamManagerInstance = new EventStreamManager();
  }
  return eventStreamManagerInstance;
}
