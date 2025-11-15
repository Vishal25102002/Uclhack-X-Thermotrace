// System state types (Equipment, Sensor, Status)
// This file will be implemented later

export type SystemStatus = 'operational' | 'degraded' | 'maintenance' | 'offline';

export type EquipmentType = 'hvac' | 'lighting' | 'generator' | 'sensor' | 'controller';

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  status: SystemStatus;
  location?: string;
  metadata?: Record<string, unknown>;
}

export type SensorType = 'temperature' | 'humidity' | 'power' | 'pressure' | 'flow';

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  value: number;
  unit: string;
  timestamp: string;
  equipmentId?: string;
}

export interface SensorReading {
  sensorId: string;
  value: number;
  timestamp: string;
  quality?: 'good' | 'fair' | 'poor';
}

export interface SystemState {
  status: SystemStatus;
  equipment: Equipment[];
  sensors: Sensor[];
  lastUpdate: string;
  alerts?: SystemAlert[];
}

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  equipmentId?: string;
  sensorId?: string;
  acknowledged?: boolean;
}

export interface SystemMetrics {
  uptime: number;
  powerConsumption: number;
  efficiency: number;
  activeAlerts: number;
  timestamp: string;
}
