# Smart Patient Health Monitoring System Using IoT (SmartCare)
> **Review 1 Evaluation Follow-up & Comprehensive Technical Documentation (35% Milestone Deliverables)**
>
> **Project Title:** Smart Patient Health Monitoring System Using IoT  
> **Repository:** `https://github.com/rahzz5521-dotcom/SmartCare.git`  
> **Target Deployment:** Web-Based Clinical Monitoring Dashboard & IoT ESP32 Sensor Network  
> **Document Version:** 1.2.0 (Review 1 Technical Specifications & Architecture)

---

## 1. Executive Summary & Review 1 Milestones

SmartCare is an end-to-end Internet of Things (IoT) patient vital sign tracking and triage alert system designed for continuous patient care in intensive care units (ICUs), general hospital wards, and remote patient monitoring scenarios. 

The system captures real-time physiological vitals from wearable sensor nodes (Pulse Oximetry, Heart Rate, Body Temperature, and Blood Pressure estimates), streams them over wireless local networks (WiFi/MQTT) to a central clinical dashboard, automatically flags physiological abnormalities, and maintains complete historical records for attending physicians.

### Dedicated Technical Documentation Files
For complete, granular technical documentation:
* **[Unit Testing & Error Boundaries Whitepaper](docs/UNIT_TESTING_AND_ERROR_BOUNDARIES.md):** Granular test cases (TC-01 through TC-16), boundary value mathematical proofs, fault injection, and React Error Boundary multi-tier architecture.
* **[REST API & Database Schema Specification](docs/API_AND_DATABASE_SCHEMA.md):** Complete RESTful HTTP and MQTT specifications, OpenAPI 3.0 representations, and PostgreSQL 16 relational DDL schema.

---

### Review 1 Audit & Deliverables Matrix (35% Completion Milestone)
| Deliverable / Requirement | Review 1 Status | Implemented Solution |
| :--- | :---: | :--- |
| **Foundational Structure & Repository** | **Completed (100%)** | Clean modular React 19 + TypeScript + Tailwind CSS structure with dedicated domains for Dashboard, Trends, Historical Records, Doctor Notes, and Hardware. |
| **Functional Components Description** | **Completed (100%)** | Real-time multi-patient telemetry streamer, alert banner, vital sign gauge cards, interactive trend graphs, and medical record logs. |
| **Granular Unit Testing Documentation** | **Addressed (100%)** | Documented unit testing strategy, boundary value analysis (BVA), clinical threshold validation matrix (16 test cases), and implemented an in-browser interactive unit test runner. |
| **React Error Boundaries & Fault Tolerance** | **Addressed (100%)** | Configured multi-tier React Error Boundaries with graceful degradation, component isolation, error telemetry logging, and an interactive crash simulation playground. |
| **API Endpoints Documentation** | **Addressed (100%)** | Documented RESTful HTTP & MQTT streaming specifications for sensor data ingestion, patient records, alerts acknowledgment, and clinical notes. |
| **Database Schema & ERD Specifications** | **Addressed (100%)** | Detailed PostgreSQL relational schema, Entity Relationship Diagram (ERD), table constraints, primary/foreign keys, and performance indexing strategies. |
| **Codebase Documentation & JSDoc Comments** | **Addressed (100%)** | Comprehensive JSDoc annotations across TypeScript types, telemetry calculation algorithms, and React components. |

---

## 2. System Architecture & IoT Data Pipeline

The SmartCare ecosystem is organized into four interconnected architectural tiers:

```
+-----------------------------------------------------------------------------------+
|                            1. HARDWARE SENSOR TIER                                |
|  +--------------------+   +---------------------+   +--------------------------+  |
|  | MAX30102 PPG       |   | DS18B20 Digital     |   | NIBP Non-Invasive        |  |
|  | Heart Rate & SpO2  |   | Body Temp Sensor    |   | Blood Pressure Unit      |  |
|  +---------+----------+   +----------+----------+   +------------+-------------+  |
+------------|-------------------------|---------------------------|----------------+
             | I2C (0x57)              | 1-Wire (GPIO 4)           | UART / ADC
+------------v-------------------------v---------------------------v----------------+
|                       2. MICROCONTROLLER EDGE TIER (ESP32)                        |
|  * FreeRTOS Dual-Core Processing: Core 0 (WiFi/MQTT Stack), Core 1 (Sensor Loop)  |
|  * Onboard Kalmann & Moving Average Signal Filtering (Noise Reduction)           |
|  * Local Threshold Watchdog & Emergency Buzzer / I2C OLED Display                |
|  * JSON Payload Serialization & MQTT QoS-1 Publishing / HTTP POST Fallback        |
+--------------------------------------|--------------------------------------------+
                                       | WiFi 802.11 b/g/n (WPA2-Enterprise)
                                       v
+-----------------------------------------------------------------------------------+
|                        3. BACKEND & GATEWAY SERVICES TIER                         |
|  +---------------------+   +---------------------+   +--------------------------+  |
|  | MQTT Broker (EMQX/  |   | REST API Gateway    |   | Clinical Rule Engine     |  |
|  | Mosquitto) Port 1883|   | Express / Node.js   |   | (AHA/WHO Vitals Bounds)  |  |
|  +----------+----------+   +----------+----------+   +------------+-------------+  |
|             |                         |                           |                |
|             +-------------------------+---------------------------+                |
|                                       |                                            |
|                                       v                                            |
|                    +------------------------------------+                          |
|                    | PostgreSQL 16 Database Storage     |                          |
|                    | TimescaleDB Telemetry Timeseries   |                          |
|                    +------------------------------------+                          |
+---------------------------------------|-------------------------------------------+
                                        | WebSocket / SSE / REST APIs
                                        v
+-----------------------------------------------------------------------------------+
|                       4. CLINICAL DASHBOARD (FRONTEND TIER)                       |
|  * React 19 + TypeScript + Tailwind CSS UI                                        |
|  * Resilient Error Boundary Isolation per Clinical Widget                         |
|  * Live Vitals Telemetry Gauges, Recharts Historical Trend Graphs                 |
|  * Sound Alert Dispatcher & Acknowledgment Queue                                  |
|  * Interactive Review 1 Verification & In-App 16-Test Suite Runner                 |
+-----------------------------------------------------------------------------------+
```

---

## 3. Database Schema & Data Models

The persistence layer uses a normalized relational PostgreSQL schema optimized for continuous time-series telemetry storage and instant patient clinical lookup.

### 3.1 Entity Relationship Diagram (ERD)

```
       +-----------------------+              1:1           +-----------------------+
       |       PATIENTS        |--------------------------->|    IOT_DEVICE_NODES   |
       +-----------------------+                            +-----------------------+
       | PK patient_id         |<----+                      | PK device_id          |
       |    mrn                |     |                      | FK patient_id         |
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
| PK log_id             |   | PK alert_id           |   | PK note_id            |
| FK patient_id         |   | FK patient_id         |   | FK patient_id         |
| FK device_id          |   | FK device_id          |   |    doctor_name        |
|    heart_rate_bpm     |   |    parameter          |   |    specialty          |
|    spo2_percentage    |   |    breach_value       |   |    title, content     |
|    temp_celsius       |   |    severity           |   |    prescriptions_json |
|    systolic_bp        |   |    message            |   |    created_at         |
|    diastolic_bp       |   |    acknowledged       |   +-----------------------+
|    calculated_status  |   |    acknowledged_by    |
|    recorded_at        |   |    acknowledged_at    |
+-----------------------+   +-----------------------+
```

### 3.2 SQL DDL Schema Specifications

```sql
-- 1. Table: PATIENTS
CREATE TABLE patients (
    patient_id VARCHAR(36) PRIMARY KEY,
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

-- 2. Table: IOT_DEVICE_NODES
CREATE TABLE iot_device_nodes (
    device_id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) UNIQUE REFERENCES patients(patient_id) ON DELETE SET NULL,
    mac_address VARCHAR(17) NOT NULL UNIQUE,
    sensor_model VARCHAR(64) NOT NULL DEFAULT 'ESP32-WROOM-32D + MAX30102 + DS18B20',
    firmware_version VARCHAR(16) NOT NULL DEFAULT 'v1.4.2',
    battery_level INT NOT NULL CHECK (battery_level BETWEEN 0 AND 100),
    wifi_signal_rssi INT NOT NULL CHECK (wifi_signal_rssi BETWEEN -100 AND 0),
    ip_address VARCHAR(45) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('Online', 'Offline', 'Degraded')),
    last_ping TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: VITALS_TELEMETRY_LOG
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

-- Index for rapid patient telemetry time-series lookup
CREATE INDEX idx_vitals_patient_recorded ON vitals_telemetry_log (patient_id, recorded_at DESC);

-- 4. Table: CLINICAL_ALERTS
CREATE TABLE clinical_alerts (
    alert_id VARCHAR(36) PRIMARY KEY,
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

CREATE INDEX idx_alerts_patient_severity ON clinical_alerts (patient_id, severity, acknowledged);

-- 5. Table: DOCTOR_CLINICAL_NOTES
CREATE TABLE doctor_clinical_notes (
    note_id VARCHAR(36) PRIMARY KEY,
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

## 4. API Endpoints Specification

All backend endpoints are standard RESTful JSON interfaces protected via API key authentication (`X-Device-Token` for ESP32 nodes, `Authorization: Bearer <JWT>` for clinical staff).

### Summary Matrix
| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/v1/telemetry/packet` | `POST` | ESP32 Node | Ingest real-time sensor packet from edge device |
| `/api/v1/patients` | `GET` | Clinical UI | List all admitted patients with current vitals status |
| `/api/v1/patients/:id` | `GET` | Clinical UI | Fetch single patient dossier & hardware state |
| `/api/v1/patients/:id/vitals/live` | `GET` | Clinical UI | Poll latest vital record for selected patient |
| `/api/v1/patients/:id/vitals/history`| `GET` | Clinical UI | Retrieve time-range historical telemetry entries |
| `/api/v1/alerts/active` | `GET` | Clinical UI | Retrieve unacknowledged Warning & Critical alerts |
| `/api/v1/alerts/ack/:alertId` | `POST` | Clinician | Acknowledge and silence a clinical alert |
| `/api/v1/doctor/notes` | `POST` | Clinician | Submit clinical assessment and prescription update |
| `/api/v1/devices/:deviceId/health` | `GET` | Tech Support| ESP32 hardware diagnostics (battery, WiFi RSSI, uptime)|

---

## 5. Granular Unit Testing Strategy & Clinical Threshold Matrix

Medical monitoring software requires strict boundary value testing because false negatives risk human life, while excessive false positives cause alarm fatigue among hospital staff.

### 5.1 Clinical Threshold Rules (WHO & AHA Standards)

| Parameter | Nominal / Safe (Normal) | Cautionary (Warning) | Urgent / Emergency (Critical) | Clinical Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Heart Rate** | 60 – 100 BPM | 50 – 59 or 101 – 120 BPM | < 50 BPM (Severe Bradycardia) or > 120 BPM (Severe Tachycardia) | Risk of cardiac arrest, ventricular arrhythmia, or decompensated shock. |
| **SpO₂ (Pulse Oximetry)** | ≥ 95% | 90% – 94% (Mild Hypoxemia) | < 90% (Severe Hypoxemia / Respiratory Distress) | Risk of tissue hypoxia and organ failure. |
| **Body Temperature** | 36.5°C – 37.5°C | 36.0°C – 36.4°C or 37.6°C – 38.4°C | < 35.0°C (Hypothermia) or ≥ 38.5°C (High Pyrexia) | Indicator of systemic inflammatory response (SIRS) or sepsis. |
| **Blood Pressure** | Sys < 120 & Dia < 80 | Sys 120–139 or Dia 80–89 (Prehypertension) | Sys ≥ 140 or Dia ≥ 90 (Stage 2 Hypertension) / Sys ≥ 180 (Hypertensive Crisis) | Risk of acute stroke, intracranial hemorrhage, or myocardial infarction. |

### 5.2 Unit Test Matrix (16 Executable Test Cases)

| Test ID | Test Name | Tested Function | Input Vector | Expected Output |
| :--- | :--- | :--- | :--- | :--- |
| `TC-01` | Baseline Resting Vitals | `computeStatusLogic` | 72 BPM, 98% SpO2, 36.8°C, 118/76 mmHg | `Normal` |
| `TC-02` | Extreme Bradycardia | `computeStatusLogic` | 48 BPM, 98% SpO2, 36.6°C, 115/75 mmHg | `Critical` |
| `TC-03` | Bradycardia Exact Lower Limit | `computeStatusLogic` | 50 BPM, 98% SpO2, 36.6°C, 115/75 mmHg | `Warning` |
| `TC-04` | Cautionary Tachycardia | `computeStatusLogic` | 105 BPM, 97% SpO2, 37.1°C, 120/80 mmHg | `Warning` |
| `TC-05` | Extreme Tachycardia Critical | `computeStatusLogic` | 132 BPM, 97% SpO2, 37.0°C, 124/82 mmHg | `Critical` |
| `TC-06` | Critical Hypoxemic Event | `computeStatusLogic` | 78 BPM, 88% SpO2, 36.7°C, 120/80 mmHg | `Critical` |
| `TC-07` | Mild Hypoxemia Warning | `computeStatusLogic` | 76 BPM, 93% SpO2, 36.7°C, 116/74 mmHg | `Warning` |
| `TC-08` | High Pyrexia Fever Threshold | `computeStatusLogic` | 82 BPM, 97% SpO2, 39.2°C, 122/78 mmHg | `Critical` |
| `TC-09` | Sub-Febrile Pyrexia Warning | `computeStatusLogic` | 78 BPM, 98% SpO2, 37.9°C, 120/78 mmHg | `Warning` |
| `TC-10` | Hypothermia Severe Drop | `computeStatusLogic` | 62 BPM, 96% SpO2, 34.4°C, 110/70 mmHg | `Critical` |
| `TC-11` | Stage 2 Hypertension Boundary | `classifyBloodPressure` | 152 / 96 mmHg | `Category: Stage 2 HTN, Critical` |
| `TC-12` | Hypertensive Crisis Emergency | `classifyBloodPressure` | 195 / 128 mmHg | `Category: Hypertensive Crisis, Critical`|
| `TC-13` | Valid ESP32 Telemetry Packet | `validateTelemetryPayload` | All 5 vitals present and valid | `valid: true, 0 errors` |
| `TC-14` | Corrupted Packet Rejection | `validateTelemetryPayload` | HR = 999 BPM, missing patientId | `valid: false, >=3 errors` |
| `TC-15` | Heartbeat Timeout & Disconnect | `evaluateNodeConnection` | Ping delta = 24,000 ms | `Offline` |
| `TC-16` | Alert Deduplication Throttling | `isDuplicateAlert` | Repeat alert in 18s | `isDuplicate: true` (Suppressed) |

---

## 6. Error Boundary Architecture & Fault Tolerance

In healthcare IoT applications, a JavaScript runtime error (such as a null pointer from an unexpected sensor format) must **never crash the entire application** or interrupt vital sign monitoring for other patients.

### 6.1 Multi-Layered React Error Boundary Design
1. **Root-Level Error Boundary (`level="root"`):** Handles catastrophic app-level errors with emergency recovery.
2. **Section-Level Error Boundary (`level="section"`):** Isolates failures to a single view (e.g., Trends or History), allowing clinicians to switch tabs and continue viewing live vitals.
3. **Widget-Level Error Boundary (`level="widget"`):** Wraps each individual vital gauge card (HR, SpO2, Temp, BP) and SVG trend chart, rendering an isolated "Reload Widget" button without disrupting neighboring telemetry streams.

---

## 7. Review 2 (65% Milestone) & Review 3 (100%) Roadmap

- [x] **Review 1 (35% Completed):**
  - Foundational UI layout and responsive design.
  - Multi-vital simulation engine with realistic noise and drift.
  - Documented REST API endpoints and SQL database schema in README and `/docs`.
  - Documented unit testing strategy, boundary values, and React Error Boundaries.
  - In-app interactive 16-test suite runner & error boundary simulator.
- [ ] **Review 2 (65% Target):**
  - Physical ESP32 microcontroller flashing with FreeRTOS dual-task loop.
  - Live MQTT integration over WebSockets (`ws://broker.emqx.io:8083/mqtt`).
  - SMS / Email emergency notification triggers via Twilio / SendGrid webhook.
  - Multiple concurrent bed monitoring grid.
- [ ] **Review 3 (100% Final Defense):**
  - End-to-end hardware enclosure 3D print and patient trial validation.
  - HIPAA-compliant encrypted patient storage.
  - Automated PDF report generator for clinical discharge summaries.

---

## 8. Development & Local Run Instructions

```bash
# Clone the repository
git clone https://github.com/rahzz5521-dotcom/SmartCare.git

# Navigate into project directory
cd SmartCare

# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Run TypeScript type-checker / linting
npm run lint

# Build production bundle
npm run build
```

---
*Prepared by the SmartCare Development Team for Academic & Technical Review 1 Evaluation.*
