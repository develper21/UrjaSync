interface Alert {
  id: string;
  userId: string;
  deviceId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

interface AlertStats {
  total: number;
  active: number;
  critical: number;
  acknowledged: number;
  resolved: number;
}

interface AlertRule {
  id: string;
  userId: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
}

interface AlertServiceInterface {
  getAlerts(userId: string): Promise<Alert[]>;
  getAlert(alertId: string): Promise<Alert | null>;
  getStats(userId: string): Promise<AlertStats>;
  createAlert(alertData: Partial<Alert>): Promise<Alert>;
  acknowledgeAlert(alertId: string): Promise<boolean>;
  resolveAlert(alertId: string): Promise<boolean>;
  createRule(ruleData: Partial<AlertRule>): Promise<AlertRule>;
  updateRule(ruleId: string, ruleData: Partial<AlertRule>): Promise<AlertRule>;
  deleteRule(ruleId: string): Promise<boolean>;
}

export const getAlertService = (): AlertServiceInterface => ({
  getAlerts: async (_userId: string): Promise<Alert[]> => {
    // Mock implementation
    return [];
  },

  getAlert: async (_alertId: string): Promise<Alert | null> => {
    // Mock implementation
    return null;
  },

  getStats: async (_userId: string): Promise<AlertStats> => {
    // Mock implementation
    return {
      total: 0,
      active: 0,
      critical: 0,
      acknowledged: 0,
      resolved: 0,
    };
  },

  createAlert: async (alertData: Partial<Alert>): Promise<Alert> => {
    // Mock implementation
    const alert: Alert = {
      id: 'alert_' + Date.now(),
      userId: alertData.userId || '',
      deviceId: alertData.deviceId,
      severity: alertData.severity || 'medium',
      category: alertData.category || 'general',
      message: alertData.message || '',
      timestamp: new Date().toISOString(),
      status: alertData.status || 'active',
    };
    return alert;
  },

  acknowledgeAlert: async (_alertId: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },

  resolveAlert: async (_alertId: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },

  createRule: async (ruleData: Partial<AlertRule>): Promise<AlertRule> => {
    // Mock implementation
    const rule: AlertRule = {
      id: 'rule_' + Date.now(),
      userId: ruleData.userId || '',
      name: ruleData.name || '',
      condition: ruleData.condition || '',
      threshold: ruleData.threshold || 0,
      enabled: ruleData.enabled !== false,
    };
    return rule;
  },

  updateRule: async (ruleId: string, ruleData: Partial<AlertRule>): Promise<AlertRule> => {
    // Mock implementation
    const rule: AlertRule = {
      id: ruleId,
      userId: ruleData.userId || '',
      name: ruleData.name || '',
      condition: ruleData.condition || '',
      threshold: ruleData.threshold || 0,
      enabled: ruleData.enabled !== false,
    };
    return rule;
  },

  deleteRule: async (_ruleId: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },
});
