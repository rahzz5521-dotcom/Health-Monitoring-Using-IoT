/**
 * @file TrendCharts.tsx
 * @description Real-Time Physiological Trend Graphing & Waveform Analysis.
 * 
 * Plots dynamic multi-parameter trajectories over sequential sensor telemetry cycles:
 * - Heart Rate (BPM) continuous waveform with upper/lower AHA threshold reference lines
 * - Blood Oxygen Saturation SpO2 (%) area chart with hypoxia danger lines
 * - Core Body Temperature (°C) with pyrexia warning thresholds
 * - Systolic and Diastolic Blood Pressure (mmHg) dual oscillometric curves
 * - Lead-II simulated ECG sweep strip for cardiac rhythm cadence
 * 
 * Fault Tolerance:
 * Every individual chart is isolated within an <ErrorBoundary level="widget"> container
 * to prevent SVG coordinate calculation errors or Recharts rendering exceptions from
 * crashing neighboring telemetry displays.
 * 
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  Legend 
} from 'recharts';
import { 
  LineChart as ChartIcon, 
  Activity, 
  Heart, 
  Thermometer, 
  Gauge, 
  Clock, 
  Info,
  Maximize2
} from 'lucide-react';
import { VitalHistoryRecord } from '../types';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Props for the TrendCharts component.
 */
interface TrendChartsProps {
  /** Historical telemetry logs array (ordered newest to oldest) */
  historyData: VitalHistoryRecord[];
  /** Whether automatic telemetry stream polling is active */
  isSimulating: boolean;
  /** Callback to trigger an on-demand telemetry sampling cycle */
  onTriggerPacket: () => void;
}

/**
 * TrendCharts visualizer rendering real-time vital trends and lead-II ECG strip.
 */
export const TrendCharts: React.FC<TrendChartsProps> = ({
  historyData,
  isSimulating,
  onTriggerPacket,
}) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'hr' | 'spo2' | 'temp' | 'bp'>('all');

  // Format data in chronological order for graphs (oldest to newest)
  const chartData = [...historyData]
    .slice(0, 15)
    .reverse()
    .map((record) => ({
      time: record.time.replace(/ (AM|PM)/, ''),
      fullTime: record.time,
      heartRate: record.heartRate,
      spO2: record.spO2,
      temperature: record.temperature,
      systolic: record.systolicBP,
      diastolic: record.diastolicBP,
      status: record.status,
    }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 mb-2">
            <Activity className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            Continuous IoT Physiological Waveform Analysis
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Real-Time Health Trend Monitoring
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Dynamic trend plots plotting biological parameter trajectories over sequential sensor telemetry cycles.
          </p>
        </div>

        {/* View Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Parameters
          </button>
          <button
            onClick={() => setActiveMetric('hr')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === 'hr'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Heart Rate
          </button>
          <button
            onClick={() => setActiveMetric('spo2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === 'spo2'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-cyan-700'
            }`}
          >
            SpO₂ Oxygen
          </button>
          <button
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === 'temp'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-teal-700'
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => setActiveMetric('bp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === 'bp'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-indigo-700'
            }`}
          >
            Blood Pressure
          </button>
        </div>
      </div>

      {/* Real-time Oscilloscope Banner (Simulated ECG Strip) */}
      <div className="bg-slate-950 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
              Lead-II Real-Time Electrocardiogram (ECG) Strip
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Filter: 0.05 – 40 Hz</span>
            <span>Speed: 25 mm/s</span>
            <span>Gain: 10 mm/mV</span>
          </div>
        </div>

        {/* Oscilloscope Grid & Trace */}
        <div className="relative h-24 sm:h-28 w-full bg-[#05110d] rounded-xl overflow-hidden border border-emerald-900/40 flex items-center">
          {/* Subtle green graph grid */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          {/* Continuous ECG trace */}
          <svg className="w-full h-20 text-emerald-400" viewBox="0 0 1000 80" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M 0,40 L 40,40 L 48,34 L 56,40 L 70,40 L 75,44 L 80,10 L 85,70 L 90,38 L 95,40 L 110,40 L 125,30 L 140,40 L 200,40 L 240,40 L 248,34 L 256,40 L 270,40 L 275,44 L 280,10 L 285,70 L 290,38 L 295,40 L 310,40 L 325,30 L 340,40 L 400,40 L 440,40 L 448,34 L 456,40 L 470,40 L 475,44 L 480,10 L 485,70 L 490,38 L 495,40 L 510,40 L 525,30 L 540,40 L 600,40 L 640,40 L 648,34 L 656,40 L 670,40 L 675,44 L 680,10 L 685,70 L 690,38 L 695,40 L 710,40 L 725,30 L 740,40 L 800,40 L 840,40 L 848,34 L 856,40 L 870,40 L 875,44 L 880,10 L 885,70 L 890,38 L 895,40 L 910,40 L 925,30 L 940,40 L 1000,40" />
          </svg>
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent to-emerald-400/20 animate-ecg-scan pointer-events-none" />
        </div>
      </div>

      {/* Grid of Individual Charts Wrapped in Isolated Widget-Level Error Boundaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: HEART RATE */}
        {(activeMetric === 'all' || activeMetric === 'hr') && (
          <ErrorBoundary level="widget" componentName="Heart Rate Trend Chart">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Heart Rate Trend (BPM)</h4>
                    <p className="text-xs text-slate-500">Nominal range: 60 – 100 BPM</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  MAX30102
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[40, 140]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Upper Limit (100)', fill: '#b45309', fontSize: 10 }} />
                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Lower Limit (60)', fill: '#b45309', fontSize: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="heartRate"
                      name="Heart Rate (BPM)"
                      stroke="#e11d48"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorHr)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* CHART 2: SpO2 OXYGEN */}
        {(activeMetric === 'all' || activeMetric === 'spo2') && (
          <ErrorBoundary level="widget" componentName="SpO2 Trend Chart">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Oxygen Saturation SpO₂ (%)</h4>
                    <p className="text-xs text-slate-500">Nominal threshold: ≥ 95%</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                  Pulse Oximeter
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine y={95} stroke="#0ea5e9" strokeDasharray="3 3" label={{ value: 'Safe SpO₂ (95%)', fill: '#0369a1', fontSize: 10 }} />
                    <ReferenceLine y={90} stroke="#e11d48" strokeDasharray="3 3" label={{ value: 'Critical Hypoxia (90%)', fill: '#be123c', fontSize: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="spO2"
                      name="SpO₂ Saturation (%)"
                      stroke="#0891b2"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSpo2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* CHART 3: BODY TEMPERATURE */}
        {(activeMetric === 'all' || activeMetric === 'temp') && (
          <ErrorBoundary level="widget" componentName="Temperature Trend Chart">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Body Temperature (°C)</h4>
                    <p className="text-xs text-slate-500">Nominal range: 36.5 – 37.5 °C</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  MLX90614 Infrared
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[34.5, 40.0]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine y={37.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Fever (37.5°C)', fill: '#b45309', fontSize: 10 }} />
                    <ReferenceLine y={36.5} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Base (36.5°C)', fill: '#047857', fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      name="Temperature (°C)"
                      stroke="#0d9488"
                      strokeWidth={3}
                      dot={{ fill: '#0d9488', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* CHART 4: BLOOD PRESSURE (SYSTOLIC & DIASTOLIC) */}
        {(activeMetric === 'all' || activeMetric === 'bp') && (
          <ErrorBoundary level="widget" componentName="Blood Pressure Trend Chart">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Blood Pressure (mmHg)</h4>
                    <p className="text-xs text-slate-500">Systolic & Diastolic Oscillometry</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  NIBP Sensor
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[50, 180]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <ReferenceLine y={120} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      name="Systolic (mmHg)"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ fill: '#4f46e5', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      name="Diastolic (mmHg)"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ fill: '#06b6d4', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};
