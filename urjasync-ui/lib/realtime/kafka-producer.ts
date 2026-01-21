import { Kafka, Producer, ProducerRecord } from 'kafkajs';

export interface KafkaMessage {
  topic: string;
  key?: string;
  value: any;
  headers?: Record<string, string>;
  timestamp?: number;
  partition?: number;
}

export interface ProducerConfig {
  clientId: string;
  brokers: string[];
  ssl?: boolean;
  sasl?: any; // Simplified type to avoid KafkaJS typing issues
  retry?: {
    initialRetryTime: number;
    retries: number;
  };
}

export class EventProducer {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;
  private messageQueue: KafkaMessage[] = [];
  private config: ProducerConfig;

  constructor(config: ProducerConfig) {
    this.config = config;
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      ssl: config.ssl,
      sasl: config.sasl,
      retry: config.retry || {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.producer.on('producer.connect', () => {
      console.log('📡 Kafka producer connected');
      this.isConnected = true;
      this.processMessageQueue();
    });

    this.producer.on('producer.disconnect', () => {
      console.log('📡 Kafka producer disconnected');
      this.isConnected = false;
    });

    this.producer.on('producer.network.request_timeout', (payload) => {
      console.error('Kafka producer request timeout:', payload);
    });

    this.producer.on('producer.network.request_queue_size', (payload: any) => {
      if (payload.brokerId && payload.queueSize > 100) {
        console.warn('Kafka producer queue size high:', payload.queueSize);
      }
    });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
    } catch (error) {
      console.error('Failed to connect Kafka producer:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
    } catch (error) {
      console.error('Failed to disconnect Kafka producer:', error);
      throw error;
    }
  }

  async sendMessage(message: KafkaMessage): Promise<void> {
    if (!this.isConnected) {
      console.log('Kafka producer not connected, queuing message');
      this.messageQueue.push(message);
      return;
    }

    try {
      const record: ProducerRecord = {
        topic: message.topic,
        messages: [{
          key: message.key,
          value: JSON.stringify(message.value),
          headers: message.headers ? 
            Object.entries(message.headers).reduce((acc, [k, v]) => {
              acc[k] = Buffer.from(v);
              return acc;
            }, {} as Record<string, Buffer>) : 
            undefined,
          timestamp: (message.timestamp || Date.now()).toString(),
          partition: message.partition
        }]
      };

      await this.producer.send(record);
      
      console.log(`📤 Message sent to topic ${message.topic}:`, message.key || 'no-key');
    } catch (error) {
      console.error('Failed to send Kafka message:', error);
      
      // Queue message for retry
      this.messageQueue.push(message);
      
      // If it's a connection error, try to reconnect
      if (!this.isConnected) {
        await this.connect();
      }
    }
  }

  async sendBatch(messages: KafkaMessage[]): Promise<void> {
    if (!this.isConnected) {
      console.log('Kafka producer not connected, queuing batch messages');
      this.messageQueue.push(...messages);
      return;
    }

    // Group messages by topic
    const messagesByTopic = messages.reduce((acc, message) => {
      if (!acc[message.topic]) {
        acc[message.topic] = [];
      }
      acc[message.topic].push(message);
      return acc;
    }, {} as Record<string, KafkaMessage[]>);

    try {
      for (const [topic, topicMessages] of Object.entries(messagesByTopic)) {
        const record: ProducerRecord = {
          topic,
          messages: topicMessages.map(msg => ({
            key: msg.key,
            value: JSON.stringify(msg.value),
            headers: msg.headers ? 
              Object.entries(msg.headers).reduce((acc, [k, v]) => {
                acc[k] = Buffer.from(v);
                return acc;
              }, {} as Record<string, Buffer>) : 
              undefined,
            timestamp: (msg.timestamp || Date.now()).toString(),
            partition: msg.partition
          }))
        };

        await this.producer.send(record);
      }
      
      console.log(`📤 Batch sent: ${messages.length} messages across ${Object.keys(messagesByTopic).length} topics`);
    } catch (error) {
      console.error('Failed to send Kafka batch:', error);
      
      // Queue messages for retry
      this.messageQueue.push(...messages);
      
      if (!this.isConnected) {
        await this.connect();
      }
    }
  }

  private async processMessageQueue(): Promise<void> {
    if (this.messageQueue.length === 0) return;

    console.log(`📤 Processing ${this.messageQueue.length} queued messages`);
    
    const messagesToProcess = [...this.messageQueue];
    this.messageQueue = [];

    try {
      await this.sendBatch(messagesToProcess);
    } catch (error) {
      console.error('Failed to process message queue:', error);
      // Put messages back in queue
      this.messageQueue.unshift(...messagesToProcess);
    }
  }

  // Energy data specific methods
  async publishEnergyData(deviceId: string, energyData: any): Promise<void> {
    await this.sendMessage({
      topic: 'energy-data',
      key: deviceId,
      value: {
        deviceId,
        timestamp: Date.now(),
        ...energyData
      },
      headers: {
        'message-type': 'energy-data',
        'device-id': deviceId
      }
    });
  }

  async publishDeviceStatus(deviceId: string, status: any): Promise<void> {
    await this.sendMessage({
      topic: 'device-status',
      key: deviceId,
      value: {
        deviceId,
        timestamp: Date.now(),
        ...status
      },
      headers: {
        'message-type': 'device-status',
        'device-id': deviceId
      }
    });
  }

  async publishAlert(alert: any): Promise<void> {
    await this.sendMessage({
      topic: 'alerts',
      key: alert.id,
      value: {
        ...alert,
        timestamp: Date.now()
      },
      headers: {
        'message-type': 'alert',
        'severity': alert.severity
      }
    });
  }

  async publishAnalyticsEvent(eventType: string, data: any): Promise<void> {
    await this.sendMessage({
      topic: 'analytics-events',
      key: `${eventType}_${data.deviceId || 'system'}`,
      value: {
        eventType,
        timestamp: Date.now(),
        ...data
      },
      headers: {
        'message-type': 'analytics',
        'event-type': eventType
      }
    });
  }

  async publishCostOptimization(data: any): Promise<void> {
    await this.sendMessage({
      topic: 'cost-optimization',
      key: data.ruleId || 'system',
      value: {
        ...data,
        timestamp: Date.now()
      },
      headers: {
        'message-type': 'cost-optimization',
        'action': data.action
      }
    });
  }

  // Health check
  async healthCheck(): Promise<{
    connected: boolean;
    queueSize: number;
    brokerStatus: string;
  }> {
    try {
      const brokerStatus = this.isConnected ? 'connected' : 'disconnected';
      
      // Try to get metadata to verify connection
      if (this.isConnected) {
        await this.kafka.admin().listTopics();
      }

      return {
        connected: this.isConnected,
        queueSize: this.messageQueue.length,
        brokerStatus
      };
    } catch (error) {
      return {
        connected: false,
        queueSize: this.messageQueue.length,
        brokerStatus: 'error'
      };
    }
  }

  // Get statistics
  getStats(): {
    connected: boolean;
    queueSize: number;
    config: ProducerConfig;
  } {
    return {
      connected: this.isConnected,
      queueSize: this.messageQueue.length,
      config: this.config
    };
  }
}

// Singleton instance for default producer
let defaultProducer: EventProducer | null = null;

export function getDefaultEventProducer(): EventProducer {
  if (!defaultProducer) {
    const config: ProducerConfig = {
      clientId: 'urjasync-producer',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      ssl: process.env.KAFKA_SSL === 'true',
      sasl: process.env.KAFKA_SASL_USERNAME ? 'plain' : undefined,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    };

    defaultProducer = new EventProducer(config);
  }
  return defaultProducer;
}
