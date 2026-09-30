# SmartCare: REST API Endpoints & Database Schema Specification
> **Technical Specification Document - Project Review 1 & 2 Deliverables**  
> **System:** Smart Patient Health Monitoring System Using IoT (SmartCare)  
> **Document Code:** SC-TECH-DOC-API-DB-02  
> **Classification:** Backend Systems & Telemetry Ingestion Architecture

---

## 1. REST API Architecture Overview

The SmartCare backend provides high-performance, asynchronous RESTful HTTP and WebSocket endpoints designed for dual-channel operations:
1. **IoT Machine-to-Machine (M2M) Channel:** Lightweight JSON telemetry ingestion from wearable ESP32 microcontrollers.
2. **Clinical Management Channel:** Secure, authenticated operations for hospital workstations, nurses, and attending physicians.

### Base URL & Standards
* **Development URL:** `http://localhost:3000/api/v1`
* **Production Gateway:** `https://api.smartcare-iot.hospital/api/v1`
* **Data Format:** UTF-8 encoded `application/json`
* **Authentication:**
  * Node Telemetry: `X-Device-Token: <Node_Secret_Token>`
  * Clinical Staff: `Authorization: Bearer <JWT_Token>`

---

## 2. API Endpoints Catalog

### Summary Table
| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/telemetry/packet` | ESP32 Sensor Node | Ingests real-time vital readings from patient wearable. |
| `GET` | `/api/v1/patients` | Clinician / Nurse | Lists all admitted patients with current status summary. |
| `GET` | `/api/v1/patients/:id` | Clinician / Nurse | Retrieves single patient demographic dossier and node health. |
| `GET` | `/api/v1/patients/:id/vitals/live` | Clinician / Nurse | Fetches the latest single telemetry snapshot for a patient. |
| `GET` | `/api/v1/patients/:id/vitals/history`| Clinician / Nurse | Time-series query for historical vital records with filters. |
| `GET` | `/api/v1/alerts/active` | Clinician / Nurse | Retrieves all unacknowledged Warning and Critical alerts. |
| `POST` | `/api/v1/alerts/ack/:alertId` | Clinician | Acknowledges an active alert and records clinical response. |
| `POST` | `/api/v1/clinical/notes` | Attending Doctor | Appends a medical progress note and prescription regimen. |
| `GET` | `/api/v1/devices/:deviceId/health` | Biomedical Engineer | Queries ESP32 hardware diagnostics, RSSI, and battery. |

---

### Detailed Endpoint Specifications

#### 1. Ingest IoT Telemetry Packet
* **Route:** `POST /api/v1/telemetry/packet`
* **Description:** Streamed by the ESP32 node every 2 to 4 seconds over HTTP or converted from MQTT.
* **Headers:**
  ```http
  Content-Type: application/json
  X-Device-Token: sc_node_sec_9941a2f
  ```
* **Request Payload Schema:**
  ```json
  {
    "deviceId": "ESP32-NODE-HEALTH-01",
    "patientId": "PT-8024-A",
    "timestamp": "2026-09-30T09:15:30Z",
    "vitals": {
      "heartRate": 74,
      "spO2": 98,
      "temperature": 36.8,
      "systolicBP": 118,
      "diastolicBP": 76
    },
    "diagnostics": {
      "batteryLevel": 92,
      "wifiSignalRssi": -58,
      "sensorHealth": {
        "max30102": "OK",
        "ds18b20": "OK"
      }
    }
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "packetId": "PKT-1727685330124",
    "evaluatedStatus": "Normal",
    "alertTriggered": false,
    "ingestedAt": "2026-09-30T09:15:30.142Z"
  }
  ```
* **Validation Error Response (422 Unprocessable Entity):**
  ```json
  {
    "success": false,
    "errorCode": "E_INVALID_VITAL_BOUNDS",
    "errors": [
      "Heart rate 999 BPM exceeds physiological limit (20-250 BPM)",
      "SpO2 120% exceeds physical saturation limit (0-100%)"
    ]
  }
  ```

#### 2. Fetch Patient Historical Vitals
* **Route:** `GET /api/v1/patients/:id/vitals/history`
* **Query Parameters:**
  * `startDate` (optional, ISO8601 string): `2026-09-29T00:00:00Z`
  * `endDate` (optional, ISO8601 string): `2026-09-30T23:59:59Z`
  * `limit` (optional, default `50`): Max records to retrieve
* **Sample Request:**
  ```bash
  curl -X GET "http://localhost:3000/api/v1/patients/PT-8024-A/vitals/history?limit=3" \
    -H "Authorization: Bearer eyJhbGciOi..."
  ```
* **Success Response (200 OK):**
  ```json
  {
    "patientId": "PT-8024-A",
    "count": 3,
    "records": [
      {
        "id": "REC-1727685000",
        "date": "2026-09-30",
        "time": "09:10:00",
        "heartRate": 74,
        "spO2": 98,
        "temperature": 36.8,
        "bloodPressure": "118/76",
        "systolicBP": 118,
        "diastolicBP": 76,
        "status": "Normal"
      }
    ]
  }
  ```

#### 3. Acknowledge Clinical Alert
* **Route:** `POST /api/v1/alerts/ack/:alertId`
* **Request Payload:**
  ```json
  {
    "acknowledgedBy": "Dr. Evelyn Martinez, MD",
    "clinicalActionTaken": "Administered 2L/min O2 via nasal cannula. Re-evaluating in 10 minutes."
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "alertId": "ALT-1727684000",
    "acknowledged": true,
    "acknowledgedAt": "2026-09-30T09:12:04Z"
  }
  ```

---

## 3. MQTT IoT Telemetry Protocol

For edge bandwidth conservation and low latency, ESP32 nodes support direct MQTT broker publishing (Port 1883 TCP or Port 8883 MQTTS with TLS 1.3):

### Topic Hierarchy
* **Telemetry Uplink:** `smartcare/v1/nodes/{deviceId}/telemetry` (QoS 1)
* **Node Heartbeat:** `smartcare/v1/nodes/{deviceId}/heartbeat` (QoS 0, retain=true)
* **Local Alert Trigger:** `smartcare/v1/nodes/{deviceId}/alerts` (QoS 2)
* **Buzzer Silence Command:** `smartcare/v1/nodes/{deviceId}/commands/silence` (QoS 1)

---

## 4. PostgreSQL Relational Database Schema & DDL

The persistence layer is structured for PostgreSQL 16 with TimescaleDB extension compatibility for high-speed time-series analytics.

### 4.1 Entity Relationship Diagram (ERD)

```
       +-----------------------+              1:1           +-----------------------+
       |       PATIENTS        |--------------------------->|    IOT_DEVICE_NODES   |
       +-----------------------+                            +-----------------------+
       | PK patient_id         |<----+                      | PK device_id          |
       |    mrn (UNIQUE)       |     |                      | FK patient_id         |
       |    full_name          |     |                      |    mac_address        |
       |    age, gender        |     |                      |    battery_level      |
       |    blood_group        |     |                      |    wifi_signal_rssi   |
       |    room_no, bed_no    |     |                      |    firmware_version   |
       |    admission_date     |     |                      |    status, last_ping  |
       |    primary_condition  |     |                      +-----------------------+
       |    attending_doctor   |     |
       +-----------+-----------+     |
                   | 1:N             |
                   |                 |
     +-------------+-------------+   | 1:N
     |                           |   +--------------------------+
     v                           v                              v
+-----------------------+   +-----------------------+   +-----------------------+
|  VITALS_TELEMETRY_LOG |   |   CLINICAL_ALERTS     |   | DOCTOR_CLINICAL_NOTES |
+-----------------------+   +-----------------------+   +-----------------------+
| PK log_id (BIGSERIAL) |   | PK alert_id           |   | PK note_id            |
| FK patient_id         |   | FK patient_id         |   | FK patient_id         |
| FK device_id          |   | FK device_id          |   |    doctor_name        |
|    heart_rate         |   |    parameter          |   |    specialty          |
|    spo2               |   |    trigger_value      |   |    title, content     |
|    temperature        |   |    severity           |   |    prescriptions JSONB|
|    systolic_bp        |   |    message            |   |    created_at         |
|    diastolic_bp       |   |    acknowledged       |   +-----------------------+
|    status             |   |    acknowledged_by    |
|    recorded_at        |   |    acknowledged_at    |
+-----------------------+   +-----------------------+
```

### 4.2 Production SQL DDL Script

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Table: PATIENTS
-- ============================================================================
CREATE TABLE patients (
    patient_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    mrn VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 130),
    gender VARCHAR(16) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(8) NOT NULL,
    room_number VARCHAR(16) NOT NULL,
    bed_number VARCHAR(16) NOT NULL,
    admission_date DATE NOT NULL,
    primary_condition TEXT NOT NULL,
    attending_doctor VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. Table: IOT_DEVICE_NODES
-- ============================================================================
CREATE TABLE iot_device_nodes (
    device_id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) UNIQUE REFERENCES patients(patient_id) ON DELETE SET NULL,
    mac_address VARCHAR(17) NOT NULL UNIQUE,
    sensor_model VARCHAR(64) NOT NULL DEFAULT 'ESP32 + MAX30102 + DS18B20 + NIBP',
    firmware_version VARCHAR(16) NOT NULL DEFAULT 'v1.4.2-freertos',
    battery_level INT NOT NULL CHECK (battery_level BETWEEN 0 AND 100),
    wifi_signal_rssi INT NOT NULL CHECK (wifi_signal_rssi BETWEEN -100 AND 0),
    ip_address VARCHAR(45) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('Online', 'Offline', 'Degraded')),
    last_ping TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. Table: VITALS_TELEMETRY_LOG (High-throughput Timeseries)
-- ============================================================================
CREATE TABLE vitals_telemetry_log (
    log_id BIGSERIAL PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    device_id VARCHAR(36) NOT NULL REFERENCES iot_device_nodes(device_id),
    heart_rate INT NOT NULL CHECK (heart_rate BETWEEN 20 AND 260),
    spo2 INT NOT NULL CHECK (spo2 BETWEEN 40 AND 100),
    temperature NUMERIC(4,1) NOT NULL CHECK (temperature BETWEEN 30.0 AND 45.0),
    systolic_bp INT NOT NULL CHECK (systolic_bp BETWEEN 50 AND 280),
    diastolic_bp INT NOT NULL CHECK (diastolic_bp BETWEEN 30 AND 180),
    status VARCHAR(16) NOT NULL CHECK (status IN ('Normal', 'Warning', 'Critical')),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Compound Index for sub-millisecond historical chart queries
CREATE INDEX idx_vitals_patient_time ON vitals_telemetry_log (patient_id, recorded_at DESC);

-- ============================================================================
-- 4. Table: CLINICAL_ALERTS (Emergency Triage Log)
-- ============================================================================
CREATE TABLE clinical_alerts (
    alert_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    device_id VARCHAR(36) NOT NULL REFERENCES iot_device_nodes(device_id),
    parameter VARCHAR(32) NOT NULL CHECK (parameter IN ('Heart Rate', 'SpO₂', 'Temperature', 'Blood Pressure', 'IoT Device')),
    trigger_value VARCHAR(32) NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('Warning', 'Critical')),
    message TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by VARCHAR(128),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_patient_active ON clinical_alerts (patient_id, acknowledged, severity);

-- ============================================================================
-- 5. Table: DOCTOR_CLINICAL_NOTES (Physician Observations & Orders)
-- ============================================================================
CREATE TABLE doctor_clinical_notes (
    note_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_name VARCHAR(128) NOT NULL,
    specialty VARCHAR(64) NOT NULL,
    title VARCHAR(256) NOT NULL,
    content TEXT NOT NULL,
    prescriptions JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---
*Authored by the SmartCare Backend & IoT Integration Team for Review 1 & 2 Technical Deliverables.*
