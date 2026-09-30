import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  X, 
  BellRing,
  Clock
} from 'lucide-react';
import { AlertNotification, PatientStatus } from '../types';

interface AlertBannerProps {
  status: PatientStatus;
  alerts: AlertNotification[];
  onAcknowledgeAlert: (id: string) => void;
  onDismissAlert: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  status,
  alerts,
  onAcknowledgeAlert,
  onDismissAlert,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (status === 'Normal' && alerts.filter(a => !a.acknowledged).length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-900 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-emerald-950">Patient Status: NORMAL</span>
              <span className="text-[11px] bg-emerald-200/70 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Safe Limits Verified
              </span>
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              All monitored IoT biomedical parameters (Heart Rate, SpO₂, Temperature, Blood Pressure) are within safe clinical ranges.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Real-time telemetry continuous
        </div>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const isCritical = status === 'Critical' || unacknowledgedAlerts.some((a) => a.severity === 'Critical');

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-md ${
        isCritical
          ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-rose-500/10'
          : 'bg-amber-50 border-amber-300 text-amber-950 shadow-amber-500/10'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/70">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 animate-bounce ${
              isCritical ? 'bg-rose-600 shadow-rose-600/30' : 'bg-amber-500 shadow-amber-500/30'
            }`}
          >
            {isCritical ? <AlertOctagon className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-base tracking-tight">
                {isCritical ? 'CRITICAL PATIENT VITAL ALERT' : 'WARNING: VITAL THRESHOLD CROSSING'}
              </h4>
              <span
                className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  isCritical
                    ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                    : 'bg-amber-200 text-amber-900 border-amber-300'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5">
              IoT Sensor Telemetry detected abnormal parameter crossing outside calibrated safety guidelines.
            </p>
          </div>
        </div>

        {/* Audio simulator button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              soundEnabled
                ? 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
                : 'bg-slate-200 text-slate-500'
            }`}
            title="Toggle Buzzer Alarm"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>Audible Alarm Active</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>Alarm Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert list items */}
      <div className="mt-3 space-y-2.5">
        {alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm border transition-all ${
              alert.acknowledged
                ? 'bg-white/60 border-slate-200 text-slate-600 opacity-75'
                : alert.severity === 'Critical'
                ? 'bg-white border-rose-200 text-rose-900 font-medium'
                : 'bg-white border-amber-200 text-amber-900 font-medium'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  alert.severity === 'Critical' ? 'bg-rose-600 animate-ping' : 'bg-amber-500'
                }`}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-950">[{alert.parameter}]</span>
                  <span className="font-mono-num font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">
                    {alert.value}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!alert.acknowledged ? (
                <button
                  onClick={() => onAcknowledgeAlert(alert.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Acknowledge
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Acknowledged
                </span>
              )}
              <button
                onClick={() => onDismissAlert(alert.id)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
