import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Gauge, 
  Play, 
  Pause, 
  RotateCcw, 
  User, 
  Bed, 
  MapPin, 
  Calendar, 
  Stethoscope, 
  Droplet, 
  Wifi, 
  Battery, 
  Cpu, 
  CheckCircle, 
  AlertTriangle, 
  AlertOctagon, 
  RefreshCw, 
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Patient, PatientStatus } from '../types';
import { AlertBanner } from './AlertBanner';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Props definition for the DashboardSection component.
 */
interface DashboardSectionProps {
  /** Active selected patient dossier */
  currentPatient: Patient;
  /** Complete list of admitted patients across hospital wards */
  patients: Patient[];
  /** Callback fired when a clinician selects a different patient */
  onSelectPatient: (patientId: string) => void;
  /** Whether the automated 3-second stochastic telemetry generator is running */
  isSimulating: boolean;
  /** Toggle callback to play/pause IoT stream generation */
  onToggleSimulation: () => void;
  /** Forces the simulation engine into a predetermined clinical state ('Normal' | 'Warning' | 'Critical') */
  onTriggerPresetState: (state: PatientStatus) => void;
  /** Manually polls a single telemetry packet from the virtual node */
  onRefreshManual: () => void;
  /** List of active system notifications and physiological violations */
  alerts: any[];
  /** Acknowledges and silences an alert */
  onAcknowledgeAlert: (id: string) => void;
  /** Permanently dismisses an alert from view */
  onDismissAlert: (id: string) => void;
  /** Navigates clinician directly to the multi-axis trend charting view */
  onNavigateToTrends: () => void;
}

/**
 * Patient Health Monitoring Dashboard Section.
 * 
 * Displays:
 * - Patient admission dossier & demographic details
 * - ESP32 IoT node connection health, battery %, WiFi RSSI, and IP address
 * - Real-time simulation controls & clinical emergency presets
 * - 4 Key Vital Sign Cards wrapped in isolated Widget-Level Error Boundaries
 * - Active alert banner for urgent threshold breaches
 */
export const DashboardSection: React.FC<DashboardSectionProps> = ({
  currentPatient,
  patients,
  onSelectPatient,
  isSimulating,
  onToggleSimulation,
  onTriggerPresetState,
  onRefreshManual,
  alerts,
  onAcknowledgeAlert,
  onDismissAlert,
  onNavigateToTrends,
}) => {
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const vitals = currentPatient.currentVitals;

  // Convert temperature if needed
  const displayTemp = tempUnit === 'C' 
    ? vitals.temperature.toFixed(1) 
    : ((vitals.temperature * 9) / 5 + 32).toFixed(1);

  // Status-based color helpers
  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case 'Critical':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          text: 'text-rose-700',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: AlertOctagon,
          label: 'CRITICAL',
        };
      case 'Warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-700',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: AlertTriangle,
          label: 'WARNING',
        };
      case 'Normal':
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: CheckCircle,
          label: 'NORMAL',
        };
    }
  };

  // Evaluate individual parameters
  const hrStatus: PatientStatus = 
    vitals.heartRate > 120 || vitals.heartRate < 50 ? 'Critical' :
    vitals.heartRate > 100 || vitals.heartRate < 60 ? 'Warning' : 'Normal';

  const spo2Status: PatientStatus = 
    vitals.spO2 < 90 ? 'Critical' :
    vitals.spO2 < 95 ? 'Warning' : 'Normal';

  const tempStatus: PatientStatus = 
    vitals.temperature >= 38.5 || vitals.temperature < 35.0 ? 'Critical' :
    vitals.temperature >= 37.6 || vitals.temperature < 36.2 ? 'Warning' : 'Normal';

  const bpStatus: PatientStatus = 
    vitals.systolicBP >= 145 || vitals.diastolicBP >= 95 ? 'Critical' :
    vitals.systolicBP >= 125 || vitals.diastolicBP >= 85 ? 'Warning' : 'Normal';

  const hrConfig = getStatusColor(hrStatus);
  const spo2Config = getStatusColor(spo2Status);
  const tempConfig = getStatusColor(tempStatus);
  const bpConfig = getStatusColor(bpStatus);
  const overallConfig = getStatusColor(vitals.status);

  return (
    <div className="space-y-8 pb-12">
      {/* Patient Information & IoT Device Bar */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* Patient Profile */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-cyan-600/20 shrink-0">
              {currentPatient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {currentPatient.name}
                </h2>
                <span className="font-mono-num text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  ID: {currentPatient.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${overallConfig.badgeBg}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  STATUS: {overallConfig.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Condition: <strong className="text-slate-800">{currentPatient.primaryCondition}</strong>
              </p>
            </div>
          </div>

          {/* Patient Selector for College Demo */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 self-start sm:self-center">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Select Patient:
            </label>
            <select
              value={currentPatient.id}
              onChange={(e) => onSelectPatient(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.currentVitals.status}) - {p.roomNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Patient Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs text-slate-600">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-0.5">Demographics</span>
            <span className="font-semibold text-slate-800 text-sm">
              {currentPatient.age} yrs • {currentPatient.gender}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-0.5">Blood Group</span>
            <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-rose-500" />
              {currentPatient.bloodGroup}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-0.5">Location</span>
            <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              {currentPatient.roomNumber} ({currentPatient.bedNumber})
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-0.5">Admission Date</span>
            <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              {currentPatient.admissionDate}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-2">
            <span className="text-slate-400 block text-[11px] mb-0.5">Attending Physician</span>
            <span className="font-semibold text-slate-800 text-sm flex items-center gap-1 truncate">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              {currentPatient.attendingDoctor}
            </span>
          </div>
        </div>

        {/* IoT Node Telemetry Status */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-teal-700 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              Node: {currentPatient.iotDevice.deviceId}
            </span>
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-slate-400" />
              Wi-Fi: {currentPatient.iotDevice.wifiSignal}%
            </span>
            <span className="flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-emerald-600" />
              Battery: {currentPatient.iotDevice.batteryLevel}%
            </span>
            <span className="hidden md:inline text-slate-400">
              IP: {currentPatient.iotDevice.ipAddress}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Sensors: {currentPatient.iotDevice.sensorModel}
          </span>
        </div>
      </section>

      {/* Real-time Simulation & Test Controls (Perfect for Viva Demonstration) */}
      <section className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-base font-bold text-white tracking-wide">
                IoT Real-Time Simulation Engine
              </h3>
              <span className="text-[11px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                {isSimulating ? 'Stream Active (3s)' : 'Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulates live sensor telemetry packets streamed from the ESP32 hardware to test alert triggers and trend logging.
            </p>
          </div>

          {/* Quick Simulation Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="toggle-simulation-btn"
              onClick={onToggleSimulation}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSimulating
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400'
              }`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isSimulating ? 'Pause IoT Stream' : 'Start Auto-Stream'}
            </button>

            <button
              id="manual-refresh-packet-btn"
              onClick={onRefreshManual}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
              title="Simulate Single IoT Packet"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Packet
            </button>

            {/* State Trigger Shortcuts for College Defense */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 px-2">Demo:</span>
              <button
                onClick={() => onTriggerPresetState('Normal')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                title="Simulate Normal Health Vitals"
              >
                Normal
              </button>
              <button
                onClick={() => onTriggerPresetState('Warning')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                title="Simulate Warning Health State"
              >
                Warning
              </button>
              <button
                onClick={() => onTriggerPresetState('Critical')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                title="Simulate Critical Health Anomaly"
              >
                Critical
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Alert Notification Banner (Warning or Critical alerts) */}
      <AlertBanner
        status={vitals.status}
        alerts={alerts}
        onAcknowledgeAlert={onAcknowledgeAlert}
        onDismissAlert={onDismissAlert}
      />

      {/* Live Health Parameter Cards (4 Key Parameters) Wrapped in Isolated Widget-Level Error Boundaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. HEART RATE CARD */}
        <ErrorBoundary level="widget" componentName="Heart Rate Vital Card">
          <div
            id="vital-card-heart-rate"
            className={`rounded-3xl p-6 border transition-all duration-300 shadow-sm hover:shadow-md ${hrConfig.bg} ${hrConfig.border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                    hrStatus === 'Critical'
                      ? 'bg-rose-600 animate-pulse'
                      : hrStatus === 'Warning'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isSimulating ? 'animate-pulse-slow' : ''}`} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Heart Rate</h4>
                  <p className="text-[11px] text-slate-500">MAX30102 Optical PPG</p>
                </div>
              </div>

              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${hrConfig.badgeBg}`}>
                {hrStatus}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-3">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono-num text-slate-900 tracking-tight">
                {vitals.heartRate}
              </span>
              <span className="text-sm font-bold text-slate-500 uppercase">BPM</span>
            </div>

            {/* Mini Simulated ECG Wave */}
            <div className="relative h-10 w-full overflow-hidden rounded-lg bg-white/70 border border-slate-200/60 my-3 flex items-center px-2">
              <svg viewBox="0 0 200 40" className="w-full h-8 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0,20 L30,20 L38,15 L46,25 L54,5 L62,35 L70,20 L100,20 L108,15 L116,25 L124,5 L132,35 L140,20 L200,20" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-ecg-scan pointer-events-none" />
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Nominal Safe Limit:</span>
              <span className="font-mono-num font-semibold text-slate-800">60 – 100 BPM</span>
            </div>
          </div>
        </ErrorBoundary>

        {/* 2. SpO2 BLOOD OXYGEN CARD */}
        <ErrorBoundary level="widget" componentName="SpO2 Oxygen Vital Card">
          <div
            id="vital-card-spo2"
            className={`rounded-3xl p-6 border transition-all duration-300 shadow-sm hover:shadow-md ${spo2Config.bg} ${spo2Config.border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                    spo2Status === 'Critical'
                      ? 'bg-rose-600 animate-pulse'
                      : spo2Status === 'Warning'
                      ? 'bg-amber-500'
                      : 'bg-cyan-600'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">SpO₂ Oxygen</h4>
                  <p className="text-[11px] text-slate-500">Blood Saturation</p>
                </div>
              </div>

              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${spo2Config.badgeBg}`}>
                {spo2Status}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-3">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono-num text-slate-900 tracking-tight">
                {vitals.spO2}
              </span>
              <span className="text-sm font-bold text-slate-500">%</span>
            </div>

            {/* Saturation Progress Bar */}
            <div className="my-3 space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    vitals.spO2 >= 95
                      ? 'bg-cyan-500'
                      : vitals.spO2 >= 90
                      ? 'bg-amber-500'
                      : 'bg-rose-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, vitals.spO2))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono-num">
                <span>85% Crit</span>
                <span>95% Safe</span>
                <span>100%</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Nominal Safe Limit:</span>
              <span className="font-mono-num font-semibold text-slate-800">≥ 95%</span>
            </div>
          </div>
        </ErrorBoundary>

        {/* 3. BODY TEMPERATURE CARD */}
        <ErrorBoundary level="widget" componentName="Temperature Vital Card">
          <div
            id="vital-card-temperature"
            className={`rounded-3xl p-6 border transition-all duration-300 shadow-sm hover:shadow-md ${tempConfig.bg} ${tempConfig.border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                    tempStatus === 'Critical'
                      ? 'bg-rose-600 animate-pulse'
                      : tempStatus === 'Warning'
                      ? 'bg-amber-500'
                      : 'bg-teal-600'
                  }`}
                >
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Body Temp</h4>
                  <p className="text-[11px] text-slate-500">MLX90614 Infrared</p>
                </div>
              </div>

              {/* Unit Toggle (°C / °F) */}
              <div className="flex items-center bg-white/80 rounded-lg p-0.5 border border-slate-300/80 text-[11px] font-bold">
                <button
                  onClick={() => setTempUnit('C')}
                  className={`px-1.5 py-0.5 rounded ${tempUnit === 'C' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit('F')}
                  className={`px-1.5 py-0.5 rounded ${tempUnit === 'F' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                >
                  °F
                </button>
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-3">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono-num text-slate-900 tracking-tight">
                {displayTemp}
              </span>
              <span className="text-sm font-bold text-slate-500">°{tempUnit}</span>
            </div>

            {/* Temperature Spectrum Bar */}
            <div className="my-3 space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    vitals.temperature >= 38.5
                      ? 'bg-rose-600'
                      : vitals.temperature >= 37.6
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(10, ((vitals.temperature - 35) / 5) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono-num">
                <span>35°C Hypo</span>
                <span>37°C Norm</span>
                <span>40°C Fever</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Nominal Safe Limit:</span>
              <span className="font-mono-num font-semibold text-slate-800">
                {tempUnit === 'C' ? '36.5 – 37.5 °C' : '97.7 – 99.5 °F'}
              </span>
            </div>
          </div>
        </ErrorBoundary>

        {/* 4. BLOOD PRESSURE CARD */}
        <ErrorBoundary level="widget" componentName="Blood Pressure Vital Card">
          <div
            id="vital-card-blood-pressure"
            className={`rounded-3xl p-6 border transition-all duration-300 shadow-sm hover:shadow-md ${bpConfig.bg} ${bpConfig.border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                    bpStatus === 'Critical'
                      ? 'bg-rose-600 animate-pulse'
                      : bpStatus === 'Warning'
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                >
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Blood Pressure</h4>
                  <p className="text-[11px] text-slate-500">Oscillometric NIBP</p>
                </div>
              </div>

              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${bpConfig.badgeBg}`}>
                {bpStatus}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-3">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono-num text-slate-900 tracking-tight">
                {vitals.systolicBP}/{vitals.diastolicBP}
              </span>
              <span className="text-sm font-bold text-slate-500 uppercase">mmHg</span>
            </div>

            {/* Systolic & Diastolic Sub-indicators */}
            <div className="grid grid-cols-2 gap-2 my-3 text-center">
              <div className="bg-white/80 rounded-xl p-2 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">SYSTOLIC</span>
                <span className="font-mono-num font-bold text-sm text-slate-800">{vitals.systolicBP}</span>
              </div>
              <div className="bg-white/80 rounded-xl p-2 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-semibold">DIASTOLIC</span>
                <span className="font-mono-num font-bold text-sm text-slate-800">{vitals.diastolicBP}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Nominal Safe Limit:</span>
              <span className="font-mono-num font-semibold text-slate-800">&lt; 120 / 80 mmHg</span>
            </div>
          </div>
        </ErrorBoundary>
      </div>

      {/* Quick Jump to Trends CTA */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-transparent p-4 sm:p-5 rounded-2xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Need deep physiological wave analysis?</h4>
            <p className="text-xs text-slate-600">
              Explore dynamic multi-axis trend charts, rolling averages, and threshold boundary visualizers.
            </p>
          </div>
        </div>
        <button
          onClick={onNavigateToTrends}
          className="self-start sm:self-center text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all shadow-xs"
        >
          View Real-Time Trends →
        </button>
      </div>
    </div>
  );
};
