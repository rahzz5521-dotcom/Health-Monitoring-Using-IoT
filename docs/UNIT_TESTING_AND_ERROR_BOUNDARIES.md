# SmartCare: Granular Technical Documentation on Unit Testing & Error Boundaries
> **Technical Specification Document - Project Review 1 & 2 Follow-Up**  
> **System:** Smart Patient Health Monitoring System Using IoT (SmartCare)  
> **Document Code:** SC-TECH-DOC-UT-EB-01  
> **Classification:** Clinical Device Software Architecture (IEC 62304 / ISO 13485 Standards Oriented)

---

## 1. Executive Summary & Purpose

The SmartCare system is an Internet of Things (IoT) patient monitoring solution streaming physiological telemetric data (Heart Rate, Blood Oxygen Saturation SpO₂, Core Body Temperature, and Blood Pressure) from wearable ESP32 sensor nodes to hospital workstations. 

Because medical telemetry systems monitor life-critical human physiological signals, the software architecture demands:
1. **Rigorous Unit Testing:** Verifying that clinical triage algorithms, boundary value classifications, telemetry packets, and alert triggers perform with 100% mathematical determinism and zero false negatives.
2. **Multi-Tier Error Boundaries:** Isolating runtime exceptions and malformed sensor packets so that an isolated rendering crash in a sub-widget (such as a chart or battery indicator) never takes down the patient vital sign display or alarm dispatch pipeline.

---

## 2. Unit Testing Strategy & Test Harness Architecture

### 2.1 Testing Methodology & Philosophy
Unit tests in SmartCare are structured around three fundamental software engineering testing methodologies:
* **Boundary Value Analysis (BVA):** Testing inputs at the extreme boundaries of clinical parameter partitions (e.g. at precisely 49 BPM, 50 BPM, 100 BPM, 120 BPM, and 121 BPM for Heart Rate).
* **Equivalence Class Partitioning (ECP):** Grouping physiological ranges into valid (Normal), cautionary (Warning), and emergency (Critical) partitions.
* **Fault Injection & Malformed Payload Testing:** Verifying that corrupted IoT serial packets, missing JSON keys, type errors (e.g. strings instead of floats), and NaN/infinite values are gracefully intercepted and rejected before polluting the state store.

### 2.2 Mathematical & Clinical Formulas

#### A. Blood Oxygen Saturation (SpO₂) Evaluation
SpO₂ is computed at the hardware level using the ratio of normalized AC to DC photoplethysmogram (PPG) signals:
$$R = \frac{(AC_{\text{red}} / DC_{\text{red}})}{(AC_{\text{ir}} / DC_{\text{ir}})}$$
$$\text{SpO}_2 (\%) = 110 - 25 \times R$$

* **Safe Nominal Partition:** $\text{SpO}_2 \ge 95\%$
* **Mild Hypoxemia (Warning):** $90\% \le \text{SpO}_2 < 95\%$
* **Severe Hypoxemia (Critical Emergency):** $\text{SpO}_2 < 90\%$

#### B. Mean Arterial Pressure (MAP) and Blood Pressure Triage
$$\text{MAP} \approx \text{Diastolic BP} + \frac{1}{3} (\text{Systolic BP} - \text{Diastolic BP})$$

Classification follows American Heart Association (AHA) and WHO definitions:
* **Normal:** $\text{Systolic} < 120\text{ mmHg}$ and $\text{Diastolic} < 80\text{ mmHg}$
* **Elevated / Warning:** $120 \le \text{Systolic} \le 139\text{ mmHg}$ or $80 \le \text{Diastolic} \le 89\text{ mmHg}$
* **Stage 2 Hypertension / Critical:** $\text{Systolic} \ge 140\text{ mmHg}$ or $\text{Diastolic} \ge 90\text{ mmHg}$
* **Hypertensive Emergency:** $\text{Systolic} \ge 180\text{ mmHg}$ or $\text{Diastolic} \ge 120\text{ mmHg}$

#### C. Core Body Temperature (DS18B20 12-Bit Digital Sensor)
* **Hypothermia (Critical):** $T < 35.0^\circ\text{C}$
* **Normal Range:** $36.5^\circ\text{C} \le T \le 37.5^\circ\text{C}$
* **Low-Grade Fever / Warning:** $37.6^\circ\text{C} \le T \le 38.4^\circ\text{C}$
* **High Pyrexia (Critical Emergency):** $T \ge 38.5^\circ\text{C}$

---

## 3. Comprehensive Unit Test Matrix (16 Test Cases)

| Test ID | Test Case Name | Target Module | Input Vector $(HR, SpO_2, Temp, BP)$ | Expected Result | Boundary Class |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Baseline Resting Vitals | `computeStatusLogic` | $HR: 72, SpO_2: 98, T: 36.8, BP: 118/76$ | `'Normal'` | Nominal Interior |
| **TC-02** | Extreme Bradycardia | `computeStatusLogic` | $HR: 48, SpO_2: 98, T: 36.6, BP: 115/75$ | `'Critical'` | Lower Boundary ($<50$) |
| **TC-03** | Bradycardia Exact Lower Limit | `computeStatusLogic` | $HR: 50, SpO_2: 98, T: 36.6, BP: 115/75$ | `'Normal'` | Lower Nominal Edge ($=50$) |
| **TC-04** | Cautionary Tachycardia | `computeStatusLogic` | $HR: 105, SpO_2: 97, T: 37.1, BP: 120/80$ | `'Warning'` | Warning Partition ($101-120$) |
| **TC-05** | Extreme Tachycardia Critical | `computeStatusLogic` | $HR: 132, SpO_2: 97, T: 37.0, BP: 124/82$ | `'Critical'` | Upper Boundary ($>120$) |
| **TC-06** | Critical Hypoxemic Event | `computeStatusLogic` | $HR: 88, SpO_2: 87, T: 36.9, BP: 118/76$ | `'Critical'` | Lower Critical Boundary ($<90$) |
| **TC-07** | Mild Hypoxemia Warning | `computeStatusLogic` | $HR: 76, SpO_2: 93, T: 36.7, BP: 116/74$ | `'Warning'` | Warning Partition ($90-94$) |
| **TC-08** | Pyrexia High Fever | `computeStatusLogic` | $HR: 84, SpO_2: 97, T: 39.2, BP: 122/80$ | `'Critical'` | Upper Boundary ($\ge 38.5^\circ\text{C}$) |
| **TC-09** | Sub-Febrile Pyrexia Warning | `computeStatusLogic` | $HR: 78, SpO_2: 98, T: 37.9, BP: 120/78$ | `'Warning'` | Warning Partition ($37.6-38.4^\circ\text{C}$) |
| **TC-10** | Hypothermia Severe Drop | `computeStatusLogic` | $HR: 62, SpO_2: 96, T: 34.4, BP: 110/70$ | `'Critical'` | Lower Boundary ($<35.0^\circ\text{C}$) |
| **TC-11** | AHA Stage 2 Hypertension | `classifyBloodPressure` | $Sys: 154, Dia: 98$ | `Category: Stage 2 HTN, Severity: Critical` | Upper Boundary ($Sys \ge 140$) |
| **TC-12** | Hypertensive Crisis Emergency | `classifyBloodPressure` | $Sys: 195, Dia: 128$ | `Category: Hypertensive Crisis, Severity: Critical` | Extreme Emergency ($Sys \ge 180$) |
| **TC-13** | IoT Packet Schema Validation | `validateTelemetryPayload`| Valid JSON with all 5 vitals & device ID | `{ valid: true, errors: [] }` | Compliant Schema |
| **TC-14** | Corrupted Packet Rejection | `validateTelemetryPayload`| Payload with missing ID and $HR=999$ | `{ valid: false, errors: [...] }` | Fault Injection |
| **TC-15** | Heartbeat Ping Timeout | `evaluateNodeConnection` | $\Delta t = 24,000\text{ ms}$ (threshold: $15,000\text{ ms}$) | `'Offline'` | Liveness Boundary |
| **TC-16** | Alert Deduplication Throttling | `isDuplicateAlert` | Parameter: SpO2, repeat after $18\text{ seconds}$ | `isDuplicate = true` (Suppressed) | Temporal Cooldown ($<60\text{s}$) |

---

## 4. React Error Boundaries: Technical Whitepaper & Architecture

### 4.1 The Healthcare Availability Challenge
In non-critical web applications, an unhandled JavaScript error typically presents a white screen of death. The user refreshes the page and resumes work.

In **clinical patient monitoring systems**, a white screen of death is life-threatening:
* An attending nurse may lose visibility over a patient undergoing cardiac arrest or respiratory failure.
* A single corrupted byte transmitted over 2.4 GHz WiFi from an ESP32 must not incapacitate the monitoring of other patients.
* Charting libraries (such as SVG coordinate rendering or canvas transformations) are susceptible to `NaN` values during rapid sensor drift.

### 4.2 Multi-Tier Fault Containment Hierarchy

SmartCare deploys a three-level nesting structure:

```
[Level 1: Root Error Boundary]
  ├── Wraps: Global application state, notification manager, and socket stream
  ├── Trigger: Unhandled global state corruption
  └── Fallback: Full screen clinical recovery terminal with session restart button
        │
        ▼
[Level 2: Section Error Boundary]
  ├── Wraps: Active View (Dashboard, Trends, History, Doctor, Review Docs)
  ├── Trigger: Component mounting or tab transition failures
  └── Fallback: Clean sectional banner allowing immediate navigation to other tabs
        │
        ▼
[Level 3: Widget Error Boundary]
  ├── Wraps: Individual Vital Cards (HR, SpO2, Temp, BP) and PPG Trend Charts
  ├── Trigger: Local SVG rendering bugs or single-field parsing exceptions
  └── Fallback: Compact "Widget Interrupted - Retry" card; sibling gauges continue updating!
```

### 4.3 Component Lifecycle Implementation Details

The `ErrorBoundary` class leverages React's dual-phase error handling:

```typescript
// Phase 1: Static render-phase derivation (pure, synchronous)
public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
  return {
    hasError: true,
    error,
    errorTimestamp: new Date().toLocaleTimeString(),
  };
}

// Phase 2: Commit-phase side effect (logging, telemetry, external audit)
public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  console.error(`[SmartCare Intercept] ${this.props.componentName}:`, error, errorInfo);
  // In production, dispatches diagnostic telemetry to /api/v1/diagnostics/errors
  this.setState({ errorInfo });
}
```

### 4.4 In-App Fault Injection Simulator
To allow academic reviewers, QA engineers, and medical auditors to test Error Boundary containment live without modifying code, SmartCare provides an **interactive Fault Lab** under the `Review 1 & Docs` tab:
1. **CRC-32 Checksum Error:** Throws an intentional CRC validation error on the live PPG widget.
2. **Null Pointer Exception:** Attempts to access an uninitialized property on a simulated sensor stream.
3. **I2C Bus Timeout:** Emulates a disconnected MAX30102 sensor failing to acknowledge the 0x57 address.

In all three scenarios, examiners can observe that only the targeted widget falls back into its recovery container, while the master navigation, patient header, and global alert banner remain live and operational.

---

## 5. Continuous Testing Pipeline & Command Line Execution

For CI/CD automated test verification:

```bash
# Execute unit testing suite via Vitest / Jest
npm run test

# Execute TypeScript strict type checking
npm run lint

# Compile and verify production build integrity
npm run build
```

---
*Authored by the SmartCare Software Engineering Team for Review 1 & 2 Technical Deliverables.*
