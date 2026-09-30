import React from 'react';
import { X, Bell, AlertOctagon, AlertTriangle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { AlertNotification } from '../types';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertNotification[];
  onAcknowledgeAlert: (id: string) => void;
  onDismissAlert: (id: string) => void;
  onClearAll: () => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledgeAlert,
  onDismissAlert,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Active Telemetry Alerts
              </h3>
              <p className="text-xs text-slate-500">
                Automated threshold violations triggered by biomedical IoT sensors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-slate-500 hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
                title="Clear All Alerts"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-700">No Active Health Alerts</p>
              <p className="text-xs text-slate-500 mt-1">
                All patient vitals are currently operating within safe parameters.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 transition-all ${
                  alert.severity === 'Critical'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {alert.severity === 'Critical' ? (
                      <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900">
                      {alert.parameter} Alert: {alert.value}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono-num">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      alert.severity === 'Critical'
                        ? 'bg-rose-200 text-rose-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {alert.severity} Severity
                  </span>

                  <div className="flex items-center gap-2">
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acknowledged
                      </span>
                    )}
                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
