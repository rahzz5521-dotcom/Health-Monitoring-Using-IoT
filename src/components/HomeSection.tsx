import React from 'react';
import { 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Cpu, 
  Heart, 
  Thermometer, 
  Gauge, 
  BellRing, 
  ShieldCheck, 
  Radio, 
  Clock, 
  Stethoscope,
  Database
} from 'lucide-react';

interface HomeSectionProps {
  onNavigateToDashboard: () => void;
  onNavigateToHardware: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onNavigateToDashboard,
  onNavigateToHardware,
}) => {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-slate-700/50">
        {/* Subtle decorative background grid/glow */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-6">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            IoT Engineering Academic Capstone Project
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Smart Patient Health Monitoring System Using IoT
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
            An automated tele-health monitoring ecosystem integrating physiological IoT sensors,
            microcontrollers, and a real-time web telemetry dashboard to monitor patient vitals, detect critical
            threshold anomalies, and instantly notify healthcare professionals.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              id="hero-view-dashboard-btn"
              onClick={onNavigateToDashboard}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm sm:text-base hover:from-teal-400 hover:to-cyan-400 shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              View Live Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-view-hardware-btn"
              onClick={onNavigateToHardware}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm sm:text-base border border-slate-600 transition-all"
            >
              <Cpu className="w-4 h-4 text-teal-400" />
              IoT Hardware & Architecture
            </button>
          </div>

          {/* Key Quick Highlight Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Parameter 01</p>
                <p className="text-sm font-bold text-white">Heart Rate (BPM)</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Parameter 02</p>
                <p className="text-sm font-bold text-white">SpO₂ Oxygen (%)</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Parameter 03</p>
                <p className="text-sm font-bold text-white">Temperature (°C)</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Parameter 04</p>
                <p className="text-sm font-bold text-white">Blood Pressure (mmHg)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Problem → Solution → Features Section */}
      <section className="space-y-8" id="problem-solution-features">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 inline-block px-3 py-1 rounded-full border border-teal-200 mb-2">
            Project Genesis & Design Rationale
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Problem → Solution → Core Features
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            A comprehensive overview demonstrating why the smart IoT monitoring system was developed and its functional architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Problem Card */}
          <div className="bg-white rounded-2xl p-7 border border-rose-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="w-2 h-full bg-rose-500 absolute left-0 top-0" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Step 01</span>
                <h4 className="text-lg font-bold text-slate-900">The Problem</h4>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Traditional patient monitoring relies heavily on episodic, manual observations conducted by hospital doctors or nurses every 2 to 4 hours.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Critical delays in identifying sudden physiological deterioration between scheduled rounds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Substantial healthcare staff fatigue and high nurse-to-patient monitoring burden.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Risk of human transcription errors in paper or manual vital log entries.</span>
              </li>
            </ul>
          </div>

          {/* 2. Solution Card */}
          <div className="bg-white rounded-2xl p-7 border border-teal-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="w-2 h-full bg-teal-500 absolute left-0 top-0" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Step 02</span>
                <h4 className="text-lg font-bold text-slate-900">The IoT Solution</h4>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              A responsive, web-based IoT telemetry system utilizing biomedical sensors attached to the patient, controlled by an ESP32 microcontroller that streams data continuously.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Non-invasive automated capture of Heart Rate, SpO₂, Body Temperature, and Blood Pressure.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Wi-Fi/HTTP transmission to a centralized hospital dashboard updated in real-time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Automated multi-tier status evaluation (Normal, Warning, Critical) with instant audible and visual alerts.</span>
              </li>
            </ul>
          </div>

          {/* 3. Features Card */}
          <div className="bg-white rounded-2xl p-7 border border-cyan-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="w-2 h-full bg-cyan-600 absolute left-0 top-0" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Step 03</span>
                <h4 className="text-lg font-bold text-slate-900">Key Features</h4>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Comprehensive telemetry features engineered for both nursing stations and attending physicians.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Live Vitals Dashboard:</strong> High-visibility sensor cards with real-time numeric and graphical updates.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Historical Logging & CSV Export:</strong> Granular audit records for medical trend analysis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Doctor Clinical Section:</strong> Physician assessment notes, treatment plans, and emergency alerts.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* IoT Architecture & Data Flow Diagram */}
      <section className="bg-gradient-to-b from-slate-50 to-teal-50/40 rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              System Architecture & IoT Data Pipeline
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              End-to-end data transmission pipeline from biomedical hardware sensors to clinical decision support.
            </p>
          </div>
          <button
            onClick={onNavigateToHardware}
            className="self-start sm:self-auto text-xs font-semibold text-teal-700 bg-teal-100 hover:bg-teal-200 px-3.5 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            Detailed Pinouts & Code
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pipeline Step Sequence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs mb-3">
                01
              </div>
              <h5 className="font-bold text-slate-900 text-sm">Biomedical Sensors</h5>
              <p className="text-xs text-slate-500 mt-1">
                MAX30102 (PPG / SpO₂), MLX90614 (Infrared Temp), and NIBP Transducer detect physiological signals.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-teal-700">
              Analog & I2C Bus
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs mb-3">
                02
              </div>
              <h5 className="font-bold text-slate-900 text-sm">ESP32 Processing</h5>
              <p className="text-xs text-slate-500 mt-1">
                240MHz MCU filters noise, calculates BPM & SpO₂ percentages, and verifies local threshold safety rules.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-cyan-700">
              On-Chip Edge Computing
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mb-3">
                03
              </div>
              <h5 className="font-bold text-slate-900 text-sm">Wi-Fi / Cloud Stream</h5>
              <p className="text-xs text-slate-500 mt-1">
                Formatted JSON telemetry payloads are pushed via HTTP REST/WebSocket over secure 2.4GHz Wi-Fi network.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-indigo-700">
              JSON Telemetry Stream
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
                04
              </div>
              <h5 className="font-bold text-slate-900 text-sm">Web Dashboard</h5>
              <p className="text-xs text-slate-500 mt-1">
                Visualizes vitals, updates trend graphs, logs readings to history, and raises multi-tier alerts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-emerald-700">
              Clinical Telemetry UI
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience / College Evaluation Highlights */}
      <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
        <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          System Operational Highlights
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">Continuous 24/7 Telemetry</span>
            <p className="text-slate-600 text-xs leading-relaxed">
              Eliminates the blind spot between manual nurse rounds, capturing silent arrhythmia or hypoxia events instantaneously.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">Automated Triage Algorithm</span>
            <p className="text-slate-600 text-xs leading-relaxed">
              Parameters are mapped dynamically against medical thresholds to categorize patients into Normal, Warning, or Critical states.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">Cost-Effective College Implementation</span>
            <p className="text-slate-600 text-xs leading-relaxed">
              Constructed using readily available, off-the-shelf microcontrollers and standardized medical-grade sensor modules.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
