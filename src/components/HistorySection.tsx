import React, { useState } from 'react';
import { 
  History, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Heart, 
  Activity, 
  Thermometer, 
  Gauge, 
  CheckCircle, 
  AlertTriangle, 
  AlertOctagon, 
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { VitalHistoryRecord, PatientStatus } from '../types';

interface HistorySectionProps {
  history: VitalHistoryRecord[];
  onAddManualRecord: (record: Omit<VitalHistoryRecord, 'id'>) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onAddManualRecord,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state for adding record
  const [formHR, setFormHR] = useState('75');
  const [formSpO2, setFormSpO2] = useState('98');
  const [formTemp, setFormTemp] = useState('36.8');
  const [formSys, setFormSys] = useState('120');
  const [formDia, setFormDia] = useState('80');
  const [formNotes, setFormNotes] = useState('');

  const filteredHistory = history.filter((record) => {
    const matchesFilter =
      filterStatus === 'ALL' || record.status.toUpperCase() === filterStatus;
    const matchesSearch =
      record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertOctagon className="w-3 h-3" />
            Critical
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            Warning
          </span>
        );
      case 'Normal':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Normal
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = ['Record ID,Date,Time,Heart Rate (BPM),SpO2 (%),Temperature (C),Blood Pressure (mmHg),Systolic,Diastolic,Status,Notes'];
    const rows = history.map(r => 
      `"${r.id}","${r.date}","${r.time}",${r.heartRate},${r.spO2},${r.temperature},"${r.bloodPressure}",${r.systolicBP},${r.diastolicBP},"${r.status}","${r.notes || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IoT_Patient_Vital_History_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hr = parseInt(formHR, 10) || 75;
    const spo2 = parseInt(formSpO2, 10) || 98;
    const temp = parseFloat(formTemp) || 36.8;
    const sys = parseInt(formSys, 10) || 120;
    const dia = parseInt(formDia, 10) || 80;

    let computedStatus: PatientStatus = 'Normal';
    if (hr > 120 || hr < 50 || spo2 < 90 || temp >= 38.5 || sys >= 145 || dia >= 95) {
      computedStatus = 'Critical';
    } else if (hr > 100 || hr < 60 || spo2 < 95 || temp >= 37.6 || sys >= 125 || dia >= 85) {
      computedStatus = 'Warning';
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().slice(0, 10);

    onAddManualRecord({
      date: dateStr,
      time: timeStr,
      heartRate: hr,
      spO2: spo2,
      temperature: temp,
      bloodPressure: `${sys}/${dia}`,
      systolicBP: sys,
      diastolicBP: dia,
      status: computedStatus,
      notes: formNotes || 'Manual nurse reading logged via bedside portal.',
    });

    setShowAddModal(false);
    setFormNotes('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-2">
            <History className="w-3.5 h-3.5 text-teal-600" />
            Audit Logging & Historical Physiological Database
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patient Health History
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Chronological log of vital readings captured from IoT biomedical sensors.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Log Manual Vital
          </button>

          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search date, time, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {['ALL', 'NORMAL', 'WARNING', 'CRITICAL'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* History Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                <th className="py-3.5 px-4">Heart Rate</th>
                <th className="py-3.5 px-4">SpO₂ Oxygen</th>
                <th className="py-3.5 px-4">Temperature</th>
                <th className="py-3.5 px-4">Blood Pressure</th>
                <th className="py-3.5 px-4">Patient Status</th>
                <th className="py-3.5 px-4 sm:px-6">Clinical Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No vital records found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            {record.date}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono-num">
                            {record.time}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono-num">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        {record.heartRate}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">BPM</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono-num">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                        <Activity className="w-3.5 h-3.5 text-cyan-600" />
                        {record.spO2}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono-num">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                        <Thermometer className="w-3.5 h-3.5 text-teal-600" />
                        {record.temperature.toFixed(1)}°C
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono-num">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                        <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                        {record.bloodPressure}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(record.status)}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-500 max-w-xs truncate">
                      {record.notes || 'Routine periodic IoT recording.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Log Bedside Vital Entry
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Record a manual nurse confirmation check or calibrate against the IoT telemetry node.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={formHR}
                    onChange={(e) => setFormHR(e.target.value)}
                    required
                    min="30"
                    max="220"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SpO₂ Oxygen (%)
                  </label>
                  <input
                    type="number"
                    value={formSpO2}
                    onChange={(e) => setFormSpO2(e.target.value)}
                    required
                    min="60"
                    max="100"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formTemp}
                    onChange={(e) => setFormTemp(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={formSys}
                    onChange={(e) => setFormSys(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={formDia}
                    onChange={(e) => setFormDia(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Assessment Notes
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="E.g., Patient ambulating well, breathing comfortably on room air."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs"
                >
                  Save Vital Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
