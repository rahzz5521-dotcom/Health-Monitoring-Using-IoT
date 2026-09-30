import React, { useState } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  LineChart, 
  History, 
  Stethoscope, 
  Cpu, 
  Wifi, 
  Menu, 
  X, 
  Bell, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon,
  FileCheck2
} from 'lucide-react';
import { PatientStatus } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  patientStatus: PatientStatus;
  unreadAlertCount: number;
  isSimulating: boolean;
  onOpenAlerts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  patientStatus,
  unreadAlertCount,
  isSimulating,
  onOpenAlerts,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Activity },
    { id: 'dashboard', label: 'Patient Dashboard', icon: LayoutDashboard },
    { id: 'trends', label: 'Real-Time Trends', icon: LineChart },
    { id: 'history', label: 'Health History', icon: History },
    { id: 'doctor', label: 'Doctor Section', icon: Stethoscope },
    { id: 'hardware', label: 'IoT Architecture', icon: Cpu },
    { id: 'review_docs', label: 'Review 1 & Docs', icon: FileCheck2, highlight: true },
  ];

  const getStatusBadge = () => {
    switch (patientStatus) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5" />
            CRITICAL
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            WARNING
          </span>
        );
      case 'Normal':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            NORMAL
          </span>
        );
    }
  };

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavClick('home')}
            id="nav-brand-button"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-cyan-600/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base tracking-tight leading-none sm:text-lg">
                  SmartCare
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md border border-teal-200">
                  ESP32 Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Smart Patient Health Monitoring System Using IoT
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? item.highlight
                        ? 'bg-teal-600 text-white font-bold shadow-xs'
                        : 'bg-cyan-50 text-cyan-700 font-semibold shadow-xs'
                      : item.highlight
                        ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (item.highlight ? 'text-white' : 'text-cyan-600') : (item.highlight ? 'text-teal-700' : 'text-slate-400')}`} />
                  {item.label}
                  {item.highlight && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isActive ? 'bg-white text-teal-800' : 'bg-teal-200 text-teal-900'
                    }`}>
                      35%
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* IoT status indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 py-1.5 px-3 rounded-full text-xs font-medium text-slate-700 border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <Wifi className="w-3.5 h-3.5 text-cyan-600" />
              <span className="font-mono text-[11px]">IoT Link 100%</span>
            </div>

            {/* Current Patient Status Badge */}
            <div className="cursor-pointer" onClick={() => handleNavClick('dashboard')} title="View Live Status">
              {getStatusBadge()}
            </div>

            {/* Alert Bell Button */}
            <button
              id="nav-alerts-button"
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="View Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? item.highlight
                      ? 'bg-teal-600 text-white font-bold'
                      : 'bg-cyan-50 text-cyan-700 font-semibold'
                    : item.highlight
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                    Review 1 (35%)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
