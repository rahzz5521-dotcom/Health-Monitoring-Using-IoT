import React from 'react';
import { Activity, Cpu, ShieldCheck, Heart, Github, GraduationCap } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
          {/* Col 1: Title & Project Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <span>Smart Patient Health Monitoring System Using IoT</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A modern biomedical IoT project developed for college engineering coursework. Demonstrating automated real-time physiological parameter telemetry, threshold anomaly classification, and remote clinical decision support.
            </p>
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-[11px]">
              <GraduationCap className="w-4 h-4" />
              <span>Department of Electronics & Biomedical Engineering</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider">System Modules</h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home & Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">
                  Live Patient Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trends')} className="hover:text-white transition-colors">
                  Real-Time Wave Trends
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')} className="hover:text-white transition-colors">
                  Health History Logs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('doctor')} className="hover:text-white transition-colors">
                  Doctor's Clinical Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: IoT Hardware Specs */}
          <div className="space-y-2">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider">IoT Hardware Stack</h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• ESP32 NodeMCU Wi-Fi MCU</li>
              <li>• MAX30102 Heart Rate & SpO₂</li>
              <li>• MLX90614 Contactless Infrared Temp</li>
              <li>• NIBP Blood Pressure Sensor</li>
              <li>• Active 5V Piezo Alarm Buzzer</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Smart Patient Health Monitoring System Using IoT. College Engineering Project.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-teal-500">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Ready to Run in VS Code
            </span>
            <span>Local & Responsive</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
