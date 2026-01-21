import { EnergyData, DeviceStatus } from '../iot/mqtt-client';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: any;
}

export interface DataValidationRule {
  field: string;
  required: boolean;
  type: 'number' | 'string' | 'boolean' | 'date';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export class DataValidator {
  private energyDataRules: DataValidationRule[] = [
    { field: 'deviceId', required: true, type: 'string', pattern: /^[a-zA-Z0-9_-]+$/ },
    { field: 'timestamp', required: true, type: 'number', min: 0 },
    { field: 'consumption', required: true, type: 'number', min: 0, max: 1000 }, // kWh
    { field: 'voltage', required: true, type: 'number', min: 200, max: 250 }, // V
    { field: 'current', required: true, type: 'number', min: 0, max: 100 }, // A
    { field: 'power', required: true, type: 'number', min: 0, max: 10000 }, // W
    { field: 'frequency', required: true, type: 'number', min: 45, max: 55 }, // Hz
  ];

  private deviceStatusRules: DataValidationRule[] = [
    { field: 'deviceId', required: true, type: 'string', pattern: /^[a-zA-Z0-9_-]+$/ },
    { field: 'timestamp', required: true, type: 'number', min: 0 },
    { field: 'online', required: true, type: 'boolean' },
    { field: 'status', required: true, type: 'string', pattern: /^(On|Off|Standby|Error)$/ },
  ];

  validateEnergyData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitized: Partial<EnergyData> = {};

    // Check required fields and types
    this.energyDataRules.forEach(rule => {
      const value = data[rule.field];
      
      if (rule.required && (value === undefined || value === null)) {
        errors.push(`Missing required field: ${rule.field}`);
        return;
      }

      if (value !== undefined && value !== null) {
        // Type validation
        if (!this.validateType(value, rule.type)) {
          errors.push(`Invalid type for ${rule.field}: expected ${rule.type}`);
          return;
        }

        // Range validation
        if (rule.type === 'number') {
          const numValue = Number(value);
          if (rule.min !== undefined && numValue < rule.min) {
            errors.push(`${rule.field} is below minimum value: ${numValue} < ${rule.min}`);
          }
          if (rule.max !== undefined && numValue > rule.max) {
            errors.push(`${rule.field} is above maximum value: ${numValue} > ${rule.max}`);
          }
        }

        // Pattern validation
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors.push(`Invalid format for ${rule.field}: ${value}`);
        }

        // Custom validation
        if (rule.custom) {
          const customError = rule.custom(value);
          if (customError) {
            errors.push(customError);
          }
        }

        // Sanitize and store valid data
        sanitized[rule.field as keyof EnergyData] = value;
      }
    });

    // Business logic validation
    if (sanitized.power && sanitized.voltage && sanitized.current) {
      const calculatedPower = sanitized.voltage * sanitized.current;
      const powerDifference = Math.abs(sanitized.power - calculatedPower) / calculatedPower;
      
      if (powerDifference > 0.2) { // 20% tolerance
        warnings.push(`Power calculation mismatch: measured ${sanitized.power}W, calculated ${calculatedPower}W`);
      }
    }

    // Timestamp validation (not too old or future)
    if (sanitized.timestamp) {
      const now = Date.now();
      const timestamp = sanitized.timestamp;
      const hoursDiff = Math.abs(now - timestamp) / (1000 * 60 * 60);
      
      if (timestamp > now + 60000) { // 1 minute future tolerance
        warnings.push('Timestamp is in the future');
      }
      
      if (hoursDiff > 24) { // 24 hours old
        warnings.push('Timestamp is more than 24 hours old');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData: errors.length === 0 ? sanitized : undefined
    };
  }

  validateDeviceStatus(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitized: Partial<DeviceStatus> = {};

    this.deviceStatusRules.forEach(rule => {
      const value = data[rule.field];
      
      if (rule.required && (value === undefined || value === null)) {
        errors.push(`Missing required field: ${rule.field}`);
        return;
      }

      if (value !== undefined && value !== null) {
        if (!this.validateType(value, rule.type)) {
          errors.push(`Invalid type for ${rule.field}: expected ${rule.type}`);
          return;
        }

        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors.push(`Invalid format for ${rule.field}: ${value}`);
        }

        sanitized[rule.field as keyof DeviceStatus] = value;
      }
    });

    // Business logic validation
    if (sanitized.online !== undefined && sanitized.status) {
      if (sanitized.online && sanitized.status === 'Off') {
        warnings.push('Device is online but status is Off');
      }
      if (!sanitized.online && sanitized.status === 'On') {
        warnings.push('Device is offline but status is On');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData: errors.length === 0 ? sanitized : undefined
    };
  }

  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'number':
        return !isNaN(Number(value)) && isFinite(Number(value));
      case 'string':
        return typeof value === 'string';
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      default:
        return true;
    }
  }

  // Batch validation for multiple records
  validateBatch<T>(data: any[], validator: (data: any) => ValidationResult): {
    valid: T[];
    invalid: { data: any; errors: string[]; warnings: string[] }[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
      errorRate: number;
    };
  } {
    const valid: T[] = [];
    const invalid: { data: any; errors: string[]; warnings: string[] }[] = [];

    data.forEach(item => {
      const result = validator(item);
      if (result.isValid && result.sanitizedData) {
        valid.push(result.sanitizedData);
      } else {
        invalid.push({
          data: item,
          errors: result.errors,
          warnings: result.warnings
        });
      }
    });

    return {
      valid,
      invalid,
      summary: {
        total: data.length,
        valid: valid.length,
        invalid: invalid.length,
        errorRate: invalid.length / data.length
      }
    };
  }
}

// Singleton instance
let validator: DataValidator | null = null;

export function getDataValidator(): DataValidator {
  if (!validator) {
    validator = new DataValidator();
  }
  return validator;
}
