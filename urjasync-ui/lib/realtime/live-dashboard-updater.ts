export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  config: WidgetConfig;
  dataSource: DataSource;
  refreshInterval: number; // seconds
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUpdate?: Date;
  stats: WidgetStats;
}

export type WidgetType = 
  | 'metric' 
  | 'chart' 
  | 'table' 
  | 'gauge' 
  | 'progress' 
  | 'status' 
  | 'map' 
  | 'heatmap' 
  | 'timeline' 
  | 'alert';

export interface WidgetConfig {
  layout: LayoutConfig;
  styling: StylingConfig;
  behavior: BehaviorConfig;
  data: DataConfig;
  interactions: InteractionConfig;
}

export interface LayoutConfig {
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex?: number;
  responsive: boolean;
  breakpoints?: Record<string, Partial<LayoutConfig>>;
}

export interface StylingConfig {
  theme: 'light' | 'dark' | 'auto';
  colors: string[];
  fonts: FontConfig;
  borders: BorderConfig;
  animations: AnimationConfig;
  customCSS?: string;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: 'normal' | 'bold' | 'light';
  color: string;
}

export interface BorderConfig {
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  radius: number;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number; // milliseconds
  easing: string;
  delay?: number; // milliseconds
}

export interface BehaviorConfig {
  autoRefresh: boolean;
  lazyLoading: boolean;
  caching: boolean;
  cacheTimeout: number; // seconds
  errorHandling: 'show' | 'hide' | 'retry';
  maxRetries: number;
}

export interface DataConfig {
  aggregation: AggregationConfig;
  filtering: FilterConfig;
  sorting: SortConfig;
  pagination: PaginationConfig;
  transformation: TransformationConfig;
}

export interface AggregationConfig {
  enabled: boolean;
  function: 'sum' | 'average' | 'min' | 'max' | 'count' | 'distinct';
  groupBy?: string[];
  timeWindow?: TimeWindowConfig;
}

export interface TimeWindowConfig {
  type: 'fixed' | 'sliding' | 'rolling';
  duration: number; // seconds
  step?: number; // seconds
}

export interface FilterConfig {
  enabled: boolean;
  rules: FilterRule[];
  logic: 'and' | 'or';
}

export interface FilterRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  caseSensitive?: boolean;
}

export interface SortConfig {
  enabled: boolean;
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  showControls: boolean;
  infiniteScroll: boolean;
}

export interface TransformationConfig {
  enabled: boolean;
  functions: TransformFunction[];
}

export interface TransformFunction {
  type: 'map' | 'filter' | 'reduce' | 'format' | 'calculate';
  expression: string;
  parameters?: Record<string, any>;
}

export interface InteractionConfig {
  clickable: boolean;
  hoverable: boolean;
  selectable: boolean;
  draggable: boolean;
  resizable: boolean;
  actions: WidgetAction[];
}

export interface WidgetAction {
  id: string;
  type: 'navigate' | 'modal' | 'api_call' | 'refresh' | 'export' | 'custom';
  label: string;
  icon?: string;
  config?: Record<string, any>;
}

export interface ConnectionConfig {
  host?: string;
  port?: number;
  url?: string;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  timeout?: number;
}

export interface DataSource {
  id: string;
  type: DataSourceType;
  connection: ConnectionConfig;
  query?: string;
  parameters?: Record<string, any>;
  refreshStrategy: RefreshStrategy;
  cache: CacheConfig;
}

export type DataSourceType = 
  | 'api' 
  | 'websocket' 
  | 'mqtt' 
  | 'database' 
  | 'stream' 
  | 'static' 
  | 'calculated';

export interface RefreshStrategy {
  type: 'interval' | 'event_driven' | 'manual' | 'hybrid';
  interval?: number; // seconds
  events?: string[];
  debounce?: number; // milliseconds
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // seconds
  maxSize: number; // MB
  strategy: 'lru' | 'fifo' | 'lfu';
}

export interface WidgetStats {
  totalUpdates: number;
  successfulUpdates: number;
  failedUpdates: number;
  averageUpdateTime: number; // milliseconds
  lastError?: string;
  dataPoints: number;
  renderTime: number; // milliseconds
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  permissions: Permission[];
  config: DashboardConfig;
  createdAt: Date;
  updatedAt: Date;
  stats: DashboardStats;
}

export interface DashboardLayout {
  type: 'grid' | 'flex' | 'absolute';
  columns: number;
  rowHeight: number;
  gap: number;
  responsive: boolean;
  breakpoints?: Record<string, { columns: number; rowHeight: number }>;
}

export interface Permission {
  type: 'view' | 'edit' | 'share' | 'admin';
  role?: string;
  user?: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'in' | 'not_in';
  value: any;
}

export interface DashboardConfig {
  theme: 'light' | 'dark' | 'auto';
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  notifications: NotificationConfig;
  export: ExportConfig;
  sharing: SharingConfig;
}

export interface NotificationConfig {
  enabled: boolean;
  channels: Array<'email' | 'push' | 'sms' | 'in_app'>;
  triggers: NotificationTrigger[];
}

export interface NotificationTrigger {
  event: string;
  condition?: string;
  template?: string;
}

export interface ExportConfig {
  enabled: boolean;
  formats: Array<'pdf' | 'excel' | 'csv' | 'png' | 'json'>;
  scheduled?: ScheduleConfig;
}

export interface SharingConfig {
  enabled: boolean;
  public: boolean;
  password?: string;
  expires?: Date;
  permissions: Array<'view' | 'comment' | 'edit'>;
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm
  recipients: string[];
}

export interface DashboardStats {
  totalViews: number;
  uniqueViewers: number;
  averageViewTime: number; // seconds
  lastViewed?: Date;
  widgetStats: Record<string, WidgetStats>;
  performance: PerformanceStats;
}

export interface PerformanceStats {
  averageLoadTime: number; // milliseconds
  totalDataTransferred: number; // bytes
  errorRate: number; // percentage
  uptime: number; // percentage
}

export interface UpdateEvent {
  id: string;
  widgetId: string;
  dashboardId: string;
  type: UpdateType;
  data: any;
  timestamp: Date;
  metadata: UpdateMetadata;
}

export type UpdateType = 
  | 'data_refresh' 
  | 'config_change' 
  | 'layout_update' 
  | 'widget_add' 
  | 'widget_remove' 
  | 'error' 
  | 'performance';

export interface UpdateMetadata {
  source: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  version?: string;
  latency?: number; // milliseconds
}

export class LiveDashboardUpdater {
  private dashboards: Map<string, Dashboard> = new Map();
  private _widgets: Map<string, DashboardWidget> = new Map();
  private _updateQueue: UpdateEvent[] = [];
  private _subscribers: Map<string, DashboardSubscriber> = new Map();
  private _isProcessing = false;
  private _eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeDefaultDashboards();
    this._startProcessing();
  }

  private initializeDefaultDashboards() {
    const dashboards: Dashboard[] = [
      {
        id: 'MAIN_DASHBOARD',
        name: 'Main Energy Dashboard',
        description: 'Real-time energy monitoring and analytics',
        layout: {
          type: 'grid',
          columns: 12,
          rowHeight: 50,
          gap: 16,
          responsive: true,
          breakpoints: {
            'mobile': { columns: 6, rowHeight: 40 },
            'tablet': { columns: 8, rowHeight: 45 }
          }
        },
        widgets: [],
        permissions: [
          { type: 'view' },
          { type: 'edit', role: 'admin' }
        ],
        config: {
          theme: 'auto',
          autoRefresh: true,
          refreshInterval: 30,
          notifications: {
            enabled: true,
            channels: ['push', 'in_app'],
            triggers: [
              { event: 'threshold_exceeded' },
              { event: 'device_offline' }
            ]
          },
          export: {
            enabled: true,
            formats: ['pdf', 'excel', 'csv']
          },
          sharing: {
            enabled: true,
            public: false,
            permissions: ['view']
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalViews: 0,
          uniqueViewers: 0,
          averageViewTime: 0,
          widgetStats: {},
          performance: {
            averageLoadTime: 0,
            totalDataTransferred: 0,
            errorRate: 0,
            uptime: 100
          }
        }
      }
    ];

    dashboards.forEach(dashboard => {
      this.dashboards.set(dashboard.id, dashboard);
    });

    this.initializeDefaultWidgets();
  }

  private initializeDefaultWidgets() {
    const widgets: DashboardWidget[] = [
      {
        id: 'ENERGY_CONSUMPTION_WIDGET',
        type: 'chart',
        title: 'Energy Consumption',
        description: 'Real-time energy consumption chart',
        config: {
          layout: { width: 6, height: 4, x: 0, y: 0, responsive: true },
          styling: {
            theme: 'auto',
            colors: ['#3b82f6', '#10b981', '#f59e0b'],
            fonts: { family: 'Inter', size: 12, weight: 'normal', color: '#1f2937' },
            borders: { width: 1, style: 'solid', color: '#e5e7eb', radius: 8 },
            animations: { enabled: true, duration: 300, easing: 'ease-in-out' }
          },
          behavior: {
            autoRefresh: true,
            lazyLoading: false,
            caching: true,
            cacheTimeout: 60,
            errorHandling: 'show',
            maxRetries: 3
          },
          data: {
            aggregation: {
              enabled: true,
              function: 'average',
              timeWindow: { type: 'sliding', duration: 300 }
            },
            filtering: { enabled: false, rules: [], logic: 'and' },
            sorting: { enabled: true, field: 'timestamp', direction: 'desc', priority: 1 },
            pagination: { enabled: false, pageSize: 100, showControls: false, infiniteScroll: false },
            transformation: { enabled: false, functions: [] }
          },
          interactions: {
            clickable: true,
            hoverable: true,
            selectable: false,
            draggable: false,
            resizable: true,
            actions: [
              { id: 'drill_down', type: 'navigate', label: 'Drill Down' },
              { id: 'export', type: 'export', label: 'Export Data' }
            ]
          }
        },
        dataSource: {
          id: 'ENERGY_STREAM',
          type: 'websocket',
          connection: { url: 'ws://localhost:8080/energy' },
          refreshStrategy: { type: 'event_driven', events: ['data_update'] },
          cache: { enabled: true, ttl: 30, maxSize: 10, strategy: 'lru' }
        },
        refreshInterval: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalUpdates: 0,
          successfulUpdates: 0,
          failedUpdates: 0,
          averageUpdateTime: 0,
          dataPoints: 0,
          renderTime: 0
        }
      },
      {
        id: 'DEVICE_STATUS_WIDGET',
        type: 'status',
        title: 'Device Status',
        description: 'Real-time device status overview',
        config: {
          layout: { width: 4, height: 3, x: 6, y: 0, responsive: true },
          styling: {
            theme: 'auto',
            colors: ['#10b981', '#f59e0b', '#ef4444'],
            fonts: { family: 'Inter', size: 14, weight: 'bold', color: '#1f2937' },
            borders: { width: 2, style: 'solid', color: '#e5e7eb', radius: 12 },
            animations: { enabled: true, duration: 200, easing: 'ease-out' }
          },
          behavior: {
            autoRefresh: true,
            lazyLoading: false,
            caching: true,
            cacheTimeout: 10,
            errorHandling: 'retry',
            maxRetries: 5
          },
          data: {
            aggregation: { enabled: false, function: 'sum' as const },
            filtering: { enabled: false, rules: [], logic: 'and' },
            sorting: { enabled: false, field: '', direction: 'asc', priority: 0 },
            pagination: { enabled: false, pageSize: 50, showControls: false, infiniteScroll: false },
            transformation: { enabled: false, functions: [] }
          },
          interactions: {
            clickable: true,
            hoverable: true,
            selectable: false,
            draggable: false,
            resizable: false,
            actions: [
              { id: 'view_details', type: 'modal', label: 'View Details' },
              { id: 'restart', type: 'api_call', label: 'Restart' }
            ]
          }
        },
        dataSource: {
          id: 'DEVICE_STATUS_STREAM',
          type: 'websocket',
          connection: { url: 'ws://localhost:8080/devices' },
          refreshStrategy: { type: 'interval', interval: 10 },
          cache: { enabled: true, ttl: 15, maxSize: 5, strategy: 'fifo' }
        },
        refreshInterval: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalUpdates: 0,
          successfulUpdates: 0,
          failedUpdates: 0,
          averageUpdateTime: 0,
          dataPoints: 0,
          renderTime: 0
        }
      },
      {
        id: 'ALERT_WIDGET',
        type: 'alert',
        title: 'System Alerts',
        description: 'Active system alerts and notifications',
        config: {
          layout: { width: 12, height: 2, x: 0, y: 4, responsive: true },
          styling: {
            theme: 'auto',
            colors: ['#dc2626', '#f59e0b', '#3b82f6'],
            fonts: { family: 'Inter', size: 13, weight: 'normal', color: '#1f2937' },
            borders: { width: 1, style: 'solid', color: '#fecaca', radius: 6 },
            animations: { enabled: true, duration: 500, easing: 'ease-in-out', delay: 100 }
          },
          behavior: {
            autoRefresh: true,
            lazyLoading: false,
            caching: false,
            cacheTimeout: 0,
            errorHandling: 'show',
            maxRetries: 1
          },
          data: {
            aggregation: { enabled: false, function: 'sum' as const },
            filtering: { enabled: true, rules: [
              { field: 'severity', operator: 'in', value: ['high', 'critical'] }
            ], logic: 'and' },
            sorting: { enabled: true, field: 'timestamp', direction: 'desc', priority: 1 },
            pagination: { enabled: false, pageSize: 20, showControls: false, infiniteScroll: false },
            transformation: { enabled: false, functions: [] }
          },
          interactions: {
            clickable: true,
            hoverable: true,
            selectable: false,
            draggable: false,
            resizable: false,
            actions: [
              { id: 'acknowledge', type: 'api_call', label: 'Acknowledge' },
              { id: 'resolve', type: 'api_call', label: 'Resolve' }
            ]
          }
        },
        dataSource: {
          id: 'ALERT_STREAM',
          type: 'websocket',
          connection: { url: 'ws://localhost:8080/alerts' },
          refreshStrategy: { type: 'event_driven', events: ['alert_created', 'alert_updated'] },
          cache: { enabled: false, ttl: 0, maxSize: 0, strategy: 'fifo' }
        },
        refreshInterval: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalUpdates: 0,
          successfulUpdates: 0,
          failedUpdates: 0,
          averageUpdateTime: 0,
          dataPoints: 0,
          renderTime: 0
        }
      }
    ];

    widgets.forEach((widget: DashboardWidget) => {
      this._widgets.set(widget.id, widget);
    });

    // Add widgets to main dashboard
    const mainDashboard = this.dashboards.get('MAIN_DASHBOARD');
    if (mainDashboard) {
      mainDashboard.widgets = widgets;
    }
  }

  private _startProcessing(): void {
    setInterval(() => {
      this.processUpdateQueue();
      this.checkWidgetRefresh();
      this.updateStats();
    }, 1000); // Process every second
  }


  async updateWidget(widgetId: string, data: any, metadata?: Partial<UpdateMetadata>): Promise<void> {
    const widget = this._widgets.get(widgetId);
    if (!widget) {
      throw new Error(`Widget ${widgetId} not found`);
    }

    const updateEvent: UpdateEvent = {
      id: `UPDATE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      widgetId,
      dashboardId: 'MAIN_DASHBOARD', // Could be parameterized
      type: 'data_refresh',
      data,
      timestamp: new Date(),
      metadata: {
        source: 'live_updater',
        latency: 0,
        ...metadata
      }
    };

    this._updateQueue.push(updateEvent);
    this.emit('widget_update_queued', { widgetId, updateEvent });
  }

  private async processUpdateQueue(): Promise<void> {
    if (this._isProcessing || this._updateQueue.length === 0) return;

    this._isProcessing = true;
    const batch = this._updateQueue.splice(0, 50); // Process in batches

    for (const update of batch) {
      try {
        await this.processUpdate(update);
      } catch (error) {
        console.error('Error processing widget update:', error);
      }
    }

    this._isProcessing = false;
  }

  private async processUpdate(update: UpdateEvent): Promise<void> {
    const startTime = Date.now();
    const widget = this._widgets.get(update.widgetId);
    
    if (!widget) return;

    try {
      // Apply data transformation if configured
      const transformedData = await this.applyDataTransformation(update.data, widget);

      // Update widget stats
      widget.stats.totalUpdates++;
      widget.stats.successfulUpdates++;
      widget.stats.averageUpdateTime = (widget.stats.averageUpdateTime + (Date.now() - startTime)) / 2;
      widget.stats.dataPoints = Array.isArray(transformedData) ? transformedData.length : 1;
      widget.lastUpdate = new Date();

      // Notify subscribers
      await this.notifySubscribers(update);

      // Emit event
      this.emit('widget_updated', { update, widget, transformedData });

    } catch (error) {
      widget.stats.failedUpdates++;
      widget.stats.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      // Create error update event
      const errorUpdate: UpdateEvent = {
        ...update,
        type: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };

      await this.notifySubscribers(errorUpdate);
      this.emit('widget_update_error', { update, error });
    }
  }

  private async applyDataTransformation(data: any, widget: DashboardWidget): Promise<any> {
    if (!widget.config.data.transformation.enabled) {
      return data;
    }

    let transformedData = data;

    for (const transform of widget.config.data.transformation.functions) {
      transformedData = await this.applyTransformFunction(transformedData, transform);
    }

    return transformedData;
  }

  private async applyTransformFunction(data: any, transform: TransformFunction): Promise<any> {
    switch (transform.type) {
      case 'map':
        return this.mapTransform(data, transform);
      case 'filter':
        return this.filterTransform(data, transform);
      case 'reduce':
        return this.reduceTransform(data, transform);
      case 'format':
        return this.formatTransform(data, transform);
      case 'calculate':
        return this.calculateTransform(data, transform);
      default:
        return data;
    }
  }

  private mapTransform(data: any, transform: TransformFunction): any {
    // Simple map transformation - in production, use proper expression parser
    if (transform.expression === 'multiplyBy100') {
      return Array.isArray(data) ? data.map(item => ({ ...item, value: item.value * 100 })) : data;
    }
    return data;
  }

  private filterTransform(data: any, transform: TransformFunction): any {
    if (transform.expression === 'positiveOnly') {
      return Array.isArray(data) ? data.filter(item => item.value > 0) : data;
    }
    return data;
  }

  private reduceTransform(data: any, transform: TransformFunction): any {
    if (transform.expression === 'sum') {
      return Array.isArray(data) ? data.reduce((sum, item) => sum + item.value, 0) : data;
    }
    return data;
  }

  private formatTransform(data: any, transform: TransformFunction): any {
    if (transform.expression === 'percentage') {
      return Array.isArray(data) ? data.map(item => ({ ...item, value: `${item.value}%` })) : data;
    }
    return data;
  }

  private calculateTransform(data: any, transform: TransformFunction): any {
    if (transform.expression === 'average') {
      return Array.isArray(data) ? data.reduce((sum, item) => sum + item.value, 0) / data.length : data;
    }
    return data;
  }

  private checkWidgetRefresh(): void {
    const now = Date.now();

    for (const widget of this._widgets.values()) {
      if (!widget.isActive) continue;

      const timeSinceLastUpdate = widget.lastUpdate ? 
        now - widget.lastUpdate.getTime() : 
        Infinity;

      if (timeSinceLastUpdate >= widget.refreshInterval * 1000) {
        // Queue refresh
        this._updateQueue.push({
          id: `REFRESH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          widgetId: widget.id,
          dashboardId: 'MAIN_DASHBOARD',
          type: 'data_refresh',
          data: null, // Will trigger data fetch
          timestamp: new Date(),
          metadata: {
            source: 'auto_refresh',
            latency: 0
          }
        });
      }
    }
  }

  private async notifySubscribers(update: UpdateEvent): Promise<void> {
    const subscribers = Array.from(this._subscribers.values())
      .filter(sub => 
        sub.dashboardId === update.dashboardId &&
        (sub.widgetId === update.widgetId || sub.widgetId === '*')
      );

    for (const subscriber of subscribers) {
      try {
        await subscriber.callback(update);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    }
  }

  private updateStats(): void {
    for (const dashboard of this.dashboards.values()) {
      // Update widget stats
      for (const widget of dashboard.widgets) {
        dashboard.stats.widgetStats[widget.id] = { ...widget.stats };
      }

      // Calculate performance stats
      const totalUpdateTime = dashboard.widgets.reduce((sum, widget) => 
        sum + widget.stats.averageUpdateTime, 0
      );
      
      dashboard.stats.performance.averageLoadTime = 
        dashboard.widgets.length > 0 ? totalUpdateTime / dashboard.widgets.length : 0;
      
      dashboard.stats.performance.uptime = 99.9; // Simulated uptime
    }
  }

  async subscribeToDashboard(dashboardId: string, widgetId: string, callback: (update: UpdateEvent) => void): Promise<string> {
    const subscriptionId = `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscriber: DashboardSubscriber = {
      id: subscriptionId,
      dashboardId,
      widgetId,
      callback,
      createdAt: new Date(),
      lastActivity: new Date(),
      stats: {
        totalNotifications: 0,
        successfulNotifications: 0,
        failedNotifications: 0,
        averageLatency: 0
      }
    };

    this._subscribers.set(subscriptionId, subscriber);
    this.emit('subscription_added', { subscriptionId, dashboardId, widgetId });
    
    return subscriptionId;
  }

  async unsubscribe(subscriptionId: string): Promise<boolean> {
    const success = this._subscribers.delete(subscriptionId);
    if (success) {
      this.emit('subscription_removed', { subscriptionId });
    }
    return success;
  }

  async createWidget(widgetData: Omit<DashboardWidget, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<DashboardWidget> {
    const widget: DashboardWidget = {
      ...widgetData,
      id: `WIDGET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalUpdates: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        averageUpdateTime: 0,
        dataPoints: 0,
        renderTime: 0
      }
    };

    this._widgets.set(widget.id, widget);
    this.emit('widget_created', { widget });
    
    return widget;
  }

  async updateWidgetConfig(widgetId: string, config: Partial<WidgetConfig>): Promise<DashboardWidget | null> {
    const widget = this._widgets.get(widgetId);
    if (!widget) return null;

    widget.config = { ...widget.config, ...config };
    widget.updatedAt = new Date();

    // Queue config change update
    this._updateQueue.push({
      id: `CONFIG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      widgetId,
      dashboardId: 'MAIN_DASHBOARD',
      type: 'config_change',
      data: config,
      timestamp: new Date(),
      metadata: {
        source: 'config_update',
        latency: 0
      }
    });

    this._widgets.set(widgetId, widget);
    this.emit('widget_config_updated', { widgetId, config });
    
    return widget;
  }

  async getDashboard(dashboardId: string): Promise<Dashboard | null> {
    return this.dashboards.get(dashboardId) || null;
  }

  async getWidget(widgetId: string): Promise<DashboardWidget | null> {
    return this._widgets.get(widgetId) || null;
  }

  async getDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values());
  }

  async getWidgets(dashboardId?: string): Promise<DashboardWidget[]> {
    if (dashboardId) {
      const dashboard = this.dashboards.get(dashboardId);
      return dashboard ? dashboard.widgets : [];
    }
    return Array.from(this._widgets.values());
  }

  async getStats(dashboardId?: string): Promise<Record<string, any>> {
    if (dashboardId) {
      const dashboard = this.dashboards.get(dashboardId);
      return dashboard ? dashboard.stats : {};
    }

    const allStats: Record<string, any> = {};
    for (const [id, dashboard] of this.dashboards.entries()) {
      allStats[id] = dashboard.stats;
    }
    return allStats;
  }

  // Event system
  on(event: string, listener: Function): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event)!.push(listener);
  }

  private emit(event: string, data: any): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
}

interface DashboardSubscriber {
  id: string;
  dashboardId: string;
  widgetId: string;
  callback: (update: UpdateEvent) => void;
  createdAt: Date;
  lastActivity: Date;
  stats: {
    totalNotifications: number;
    successfulNotifications: number;
    failedNotifications: number;
    averageLatency: number;
  };
}

let liveDashboardUpdaterInstance: LiveDashboardUpdater | null = null;

export function getLiveDashboardUpdater(): LiveDashboardUpdater {
  if (!liveDashboardUpdaterInstance) {
    liveDashboardUpdaterInstance = new LiveDashboardUpdater();
  }
  return liveDashboardUpdaterInstance;
}
