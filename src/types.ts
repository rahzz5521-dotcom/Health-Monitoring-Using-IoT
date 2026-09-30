/**
 * @file types.ts
 * @description Core Domain Models and Type Definitions for SmartCare IoT Patient Health Monitoring.
 * 
 * Complies with AHA (American Heart Association) & WHO Clinical Standards.
 * @license Apache-2.0
 */

/**
 * Triage status classification for an admitted patient.
 * - 'Normal': All physiological parameters within safe baseline limits.
 * - 'Warning': At least one vital sign marginally elevated/depressed; warrants close observation.
 * - 'Critical': Acute physiological emergency (severe arrhythmia, hypoxemia, fever pyrexia, or hypertensive crisis).
 */
export type PatientStatus = 'Normal' | 'Warning' | 'Critical';

/**
 * High-frequency physiological vital signs streamed from IoT edge sensors.
 */
export interface HealthVitals {
  /** Heart Rate measured in Beats Per Minute (BPM) via MAX30102 PPG sensor */
  heartRate: number;
  /** Peripheral capillary blood oxygen saturation percentage (%) via MAX30102 Red/IR absorption */
  spO2: number;
  /** Core body temperature in degrees Celsius (°C) via DS18B20 digital probe */
  temperature: number;
  /** Systolic blood pressure (mmHg) */
  systolicBP: number;
  /** Diastolic blood pressure (mmHg) */
  diastolicBP: number;
  /** Formatted timestamp of last telemetry capture (HH:MM:SS) */
  timestamp: string;
  /** Evaluated triage severity level */
  status: PatientStatus;
}

/**
 * Real-time operational diagnostics and telemetry for an ESP32 edge device node.
 */
export interface IoTDeviceStatus {
  /** Unique hardware node identifier (e.g. 'ESP32-NODE-01') */
  deviceId: string;
  /** Hardware chipset and peripheral assembly description */
  sensorModel: string;
  /** Remaining rechargeable LiPo battery level percentage (0 - 100%) */
  batteryLevel: number;
  /** Wireless signal strength in dBm or percentage representation */
  wifiSignal: number;
  /** Network connection availability status */
  status: 'Online' | 'Offline';
  /** Human-readable delta since last UDP/MQTT heartbeat ping */
  lastPing: string;
  /** Local subnet IP address allocated by DHCP */
  ipAddress: string;
}

/**
 * Complete patient demographic dossier and attached telemetry node.
 */
export interface Patient {
  /** Unique patient UUID (e.g. 'PT-8024-A') */
  id: string;
  /** Full legal name */
  name: string;
  /** Age in years */
  age: number;
  /** Biological gender */
  gender: 'Male' | 'Female' | 'Other';
  /** ABO blood type with Rh factor (e.g. 'O+', 'A-') */
  bloodGroup: string;
  /** Hospital ward room number */
  roomNumber: string;
  /** Inpatient bed assignment number */
  bedNumber: string;
  /** Date of hospital admission (YYYY-MM-DD) */
  admissionDate: string;
  /** Primary medical diagnosis or chief clinical complaint */
  primaryCondition: string;
  /** Name of attending physician */
  attendingDoctor: string;
  /** Paired wearable ESP32 IoT node telemetry metadata */
  iotDevice: IoTDeviceStatus;
  /** Current real-time vital signs snapshot */
  currentVitals: HealthVitals;
}

/**
 * Historical time-series record for medical trend analysis and charting.
 */
export interface VitalHistoryRecord {
  /** Unique log entry identifier */
  id: string;
  /** Date of telemetry recording (YYYY-MM-DD) */
  date: string;
  /** Time of telemetry recording (HH:MM:SS) */
  time: string;
  /** Heart rate (BPM) */
  heartRate: number;
  /** Blood oxygen saturation (%) */
  spO2: number;
  /** Body temperature (°C) */
  temperature: number;
  /** Combined blood pressure string (e.g. '120/80') */
  bloodPressure: string;
  /** Systolic blood pressure (mmHg) */
  systolicBP: number;
  /** Diastolic blood pressure (mmHg) */
  diastolicBP: number;
  /** Overall triage classification at recording instant */
  status: PatientStatus;
  /** Clinical annotation or automated system notation */
  notes?: string;
}

/**
 * Clinical alert notification dispatched when vital thresholds are violated.
 */
export interface AlertNotification {
  /** Unique alert event ID */
  id: string;
  /** Timestamp when the violation was detected */
  timestamp: string;
  /** Breached physiological or hardware parameter */
  parameter: 'Heart Rate' | 'SpO₂' | 'Temperature' | 'Blood Pressure' | 'IoT Device';
  /** Exact numerical reading with unit of measurement */
  value: string;
  /** Severity level determining auditory buzzer and visual priority */
  severity: 'Warning' | 'Critical';
  /** Clinical alert narrative description */
  message: string;
  /** Clinician acknowledgment status */
  acknowledged: boolean;
}

/**
 * Clinical note or physician observation stored in patient chart.
 */
export interface DoctorNote {
  /** Unique note record ID */
  id: string;
  /** Name of attending physician */
  doctorName: string;
  /** Medical specialty department */
  specialty: string;
  /** Date of note creation */
  date: string;
  /** Time of note creation */
  time: string;
  /** Clinical summary headline */
  title: string;
  /** Detailed clinical observation text */
  content: string;
  /** List of ordered medications and dosages */
  prescriptions: string[];
}

/**
 * Configurable safety threshold boundaries for alert generation.
 */
export interface SafeLimits {
  heartRate: { min: number; max: number; criticalMin: number; criticalMax: number };
  spO2: { min: number; criticalMin: number };
  temperature: { min: number; max: number; criticalMin: number; criticalMax: number };
  systolicBP: { min: number; max: number; criticalMax: number };
  diastolicBP: { min: number; max: number; criticalMax: number };
}
