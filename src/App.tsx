/**
 * @file App.tsx
 * @description Main Application Controller for Smart Patient Health Monitoring System Using IoT.
 * 
 * Coordinates:
 * - Real-time physiological telemetry generation and threshold triage calculation
 * - Multi-patient dossier switching and vital records history state
 * - Clinical alert dispatch and acknowledgment pipeline
 * - Fault-tolerant Error Boundary integration across sub-views
 * - Technical Review 1 Documentation and in-browser Unit Test Suite
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { DashboardSection } from './components/DashboardSection';
import { TrendCharts } from './components/TrendCharts';
import { HistorySection } from './components/HistorySection';
import { DoctorSection } from './components/DoctorSection';
import { HardwareSection } from './components/HardwareSection';
import { ReviewDocsSection } from './components/ReviewDocsSection';
import { AlertsModal } from './components/AlertsModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SAMPLE_PATIENTS, INITIAL_HISTORY, INITIAL_ALERTS } from './data/mockData';
import { Patient, PatientStatus, VitalHistoryRecord, AlertNotification } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [patients, setPatients] = useState<Patient[]>(SAMPLE_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PT-8024-A');
  const [history, setHistory] = useState<VitalHistoryRecord[]>(INITIAL_HISTORY);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);

  // Active patient reference currently selected in dashboard
  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  /**
   * Evaluates patient triage level based on WHO and AHA clinical threshold guidelines.
   * 
   * @param hr - Heart Rate (BPM)
   * @param spo2 - Blood Oxygen Saturation (%)
   * @param temp - Body Temperature (°C)
   * @param sys - Systolic Blood Pressure (mmHg)
   * @param dia - Diastolic Blood Pressure (mmHg)
   * @returns PatientStatus: 'Normal' | 'Warning' | 'Critical'
   */
  const computeStatus = (
    hr: number, 
    spo2: number, 
    temp: number, 
    sys: number, 
    dia: number
  ): PatientStatus => {
    // Critical emergency limits: severe arrhythmia, profound hypoxemia, high pyrexia, hypertensive crisis
    if (hr > 120 || hr < 50 || spo2 < 90 || temp >= 38.5 || sys >= 145 || dia >= 95) {
      return 'Critical';
    }
    // Cautionary warning limits
    if (hr > 100 || hr < 60 || spo2 < 95 || temp >= 37.6 || sys >= 125 || dia >= 85) {
      return 'Warning';
    }
    return 'Normal';
  };

  /**
   * Simulates an incoming IoT telemetry packet from the ESP32 edge node.
   * Can either generate natural stochastic vital fluctuations or force a specific clinical test state.
   */
  const generateTelemetryUpdate = useCallback((forcedState?: PatientStatus) => {
    setPatients((prevPatients) => {
      return prevPatients.map((patient) => {
        if (patient.id !== selectedPatientId) return patient;

        let newHR = patient.currentVitals.heartRate;
        let newSpO2 = patient.currentVitals.spO2;
        let newTemp = patient.currentVitals.temperature;
        let newSys = patient.currentVitals.systolicBP;
        let newDia = patient.currentVitals.diastolicBP;

        if (forcedState === 'Normal') {
          newHR = 72 + Math.floor(Math.random() * 6);
          newSpO2 = 98 + Math.floor(Math.random() * 2);
          newTemp = 36.7 + Math.random() * 0.3;
          newSys = 116 + Math.floor(Math.random() * 6);
          newDia = 74 + Math.floor(Math.random() * 4);
        } else if (forcedState === 'Warning') {
          newHR = 104 + Math.floor(Math.random() * 6);
          newSpO2 = 93 + Math.floor(Math.random() * 2);
          newTemp = 37.8 + Math.random() * 0.3;
          newSys = 130 + Math.floor(Math.random() * 6);
          newDia = 86 + Math.floor(Math.random() * 4);
        } else if (forcedState === 'Critical') {
          newHR = 126 + Math.floor(Math.random() * 10);
          newSpO2 = 88 + Math.floor(Math.random() * 2);
          newTemp = 38.7 + Math.random() * 0.4;
          newSys = 155 + Math.floor(Math.random() * 10);
          newDia = 98 + Math.floor(Math.random() * 6);
        } else {
          // Subtle natural physiological drift with sensor noise model
          const hrDelta = (Math.random() - 0.5) * 4;
          newHR = Math.round(Math.max(45, Math.min(145, newHR + hrDelta)));

          const spo2Delta = Math.random() > 0.7 ? (Math.random() - 0.5) * 2 : 0;
          newSpO2 = Math.round(Math.max(82, Math.min(100, newSpO2 + spo2Delta)));

          const tempDelta = (Math.random() - 0.5) * 0.15;
          newTemp = parseFloat(Math.max(35.2, Math.min(40.0, newTemp + tempDelta)).toFixed(1));

          const sysDelta = (Math.random() - 0.5) * 3;
          newSys = Math.round(Math.max(85, Math.min(175, newSys + sysDelta)));

          const diaDelta = (Math.random() - 0.5) * 2;
          newDia = Math.round(Math.max(50, Math.min(110, newDia + diaDelta)));
        }

        const newStatus = computeStatus(newHR, newSpO2, newTemp, newSys, newDia);
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toISOString().slice(0, 10);

        // Check for new triage alert trigger
        if (newStatus !== 'Normal') {
          const alertParam = 
            newHR > 120 || newHR < 50 ? 'Heart Rate' :
            newSpO2 < 90 ? 'SpO₂' :
            newTemp >= 38.5 ? 'Temperature' : 'Blood Pressure';

          const alertVal = 
            alertParam === 'Heart Rate' ? `${newHR} BPM` :
            alertParam === 'SpO₂' ? `${newSpO2}%` :
            alertParam === 'Temperature' ? `${newTemp.toFixed(1)}°C` : `${newSys}/${newDia} mmHg`;

          const newAlert: AlertNotification = {
            id: `ALT-${Date.now()}`,
            timestamp: timeStr,
            parameter: alertParam,
            value: alertVal,
            severity: newStatus === 'Critical' ? 'Critical' : 'Warning',
            message: `${alertParam} crossed safe limit (${alertVal}) on IoT Node ${patient.iotDevice.deviceId}.`,
            acknowledged: false,
          };

          setAlerts((prevAlerts) => [newAlert, ...prevAlerts.slice(0, 14)]);
        }

        // Add to historical telemetry series
        const newRecord: VitalHistoryRecord = {
          id: `REC-${Date.now()}`,
          date: dateStr,
          time: timeStr,
          heartRate: newHR,
          spO2: newSpO2,
          temperature: newTemp,
          bloodPressure: `${newSys}/${newDia}`,
          systolicBP: newSys,
          diastolicBP: newDia,
          status: newStatus,
          notes: newStatus === 'Normal' 
            ? 'Nominal automated IoT telemetry stream.' 
            : `Telemetry threshold violation: ${newStatus} state observed.`,
        };

        setHistory((prevHistory) => [newRecord, ...prevHistory.slice(0, 49)]);

        return {
          ...patient,
          currentVitals: {
            heartRate: newHR,
            spO2: newSpO2,
            temperature: newTemp,
            systolicBP: newSys,
            diastolicBP: newDia,
            timestamp: timeStr,
            status: newStatus,
          },
          iotDevice: {
            ...patient.iotDevice,
            lastPing: 'Just now',
          },
        };
      });
    });
  }, [selectedPatientId]);

  // Automated telemetry polling interval (every 3.5 seconds)
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      generateTelemetryUpdate();
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating, generateTelemetryUpdate]);

  // Alert management handlers
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearAllAlerts = () => {
    setAlerts([]);
  };

  // Add manual record from clinical history section
  const handleAddManualRecord = (recordData: Omit<VitalHistoryRecord, 'id'>) => {
    const newRecord: VitalHistoryRecord = {
      ...recordData,
      id: `MAN-${Date.now()}`,
    };

    setHistory((prev) => [newRecord, ...prev]);

    // Also update current patient vitals
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPatientId) return p;
        return {
          ...p,
          currentVitals: {
            heartRate: recordData.heartRate,
            spO2: recordData.spO2,
            temperature: recordData.temperature,
            systolicBP: recordData.systolicBP,
            diastolicBP: recordData.diastolicBP,
            timestamp: recordData.time,
            status: recordData.status,
          },
        };
      })
    );
  };

  const unreadAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <ErrorBoundary level="root" componentName="SmartCare Application Root">
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
        {/* Top Sticky Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          patientStatus={currentPatient.currentVitals.status}
          unreadAlertCount={unreadAlertCount}
          isSimulating={isSimulating}
          onOpenAlerts={() => setIsAlertsModalOpen(true)}
        />

        {/* Main Content Area Protected by Section Error Boundary */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <ErrorBoundary level="section" componentName={`${activeTab.toUpperCase()} Section`}>
            {activeTab === 'home' && (
              <HomeSection
                onNavigateToDashboard={() => setActiveTab('dashboard')}
                onNavigateToHardware={() => setActiveTab('hardware')}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardSection
                currentPatient={currentPatient}
                patients={patients}
                onSelectPatient={(id) => setSelectedPatientId(id)}
                isSimulating={isSimulating}
                onToggleSimulation={() => setIsSimulating(!isSimulating)}
                onTriggerPresetState={(state) => generateTelemetryUpdate(state)}
                onRefreshManual={() => generateTelemetryUpdate()}
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onDismissAlert={handleDismissAlert}
                onNavigateToTrends={() => setActiveTab('trends')}
              />
            )}

            {activeTab === 'trends' && (
              <TrendCharts
                historyData={history}
                isSimulating={isSimulating}
                onTriggerPacket={() => generateTelemetryUpdate()}
              />
            )}

            {activeTab === 'history' && (
              <HistorySection
                history={history}
                onAddManualRecord={handleAddManualRecord}
              />
            )}

            {activeTab === 'doctor' && (
              <DoctorSection
                currentPatient={currentPatient}
                recentHistory={history.slice(0, 10)}
                onTriggerEmergencyAlert={() => generateTelemetryUpdate('Critical')}
              />
            )}

            {activeTab === 'hardware' && <HardwareSection />}

            {activeTab === 'review_docs' && <ReviewDocsSection />}
          </ErrorBoundary>
        </main>

        {/* Global Alerts Drawer/Modal */}
        <AlertsModal
          isOpen={isAlertsModalOpen}
          onClose={() => setIsAlertsModalOpen(false)}
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onDismissAlert={handleDismissAlert}
          onClearAll={handleClearAllAlerts}
        />

        {/* Site Footer */}
        <Footer onNavigate={(tab) => setActiveTab(tab)} />
      </div>
    </ErrorBoundary>
  );
}
