import React, { useState } from 'react';
import { 
  Stethoscope, 
  UserCheck, 
  FileText, 
  ClipboardList, 
  Plus, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  Pill, 
  PhoneCall, 
  Heart, 
  Activity, 
  Thermometer, 
  Gauge, 
  Check 
} from 'lucide-react';
import { Patient, DoctorNote, VitalHistoryRecord } from '../types';
import { DOCTOR_NOTES } from '../data/mockData';

interface DoctorSectionProps {
  currentPatient: Patient;
  recentHistory: VitalHistoryRecord[];
  onTriggerEmergencyAlert: () => void;
}

export const DoctorSection: React.FC<DoctorSectionProps> = ({
  currentPatient,
  recentHistory,
  onTriggerEmergencyAlert,
}) => {
  const [notes, setNotes] = useState<DoctorNote[]>(DOCTOR_NOTES);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newPrescriptions, setNewPrescriptions] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [doctorActionSuccess, setDoctorActionSuccess] = useState<string | null>(null);

  const vitals = currentPatient.currentVitals;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: DoctorNote = {
      id: `NOTE-${Date.now()}`,
      doctorName: currentPatient.attendingDoctor,
      specialty: 'Clinical Attending Physician',
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: newNoteTitle,
      content: newNoteContent,
      prescriptions: newPrescriptions
        ? newPrescriptions.split('\n').filter((p) => p.trim())
        : [],
    };

    setNotes([newNote, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewPrescriptions('');
    setShowNoteForm(false);
    showFeedbackMessage('Clinical consultation note recorded successfully.');
  };

  const showFeedbackMessage = (msg: string) => {
    setDoctorActionSuccess(msg);
    setTimeout(() => setDoctorActionSuccess(null), 4000);
  };

  const handleNotifyNursingStation = () => {
    showFeedbackMessage('Immediate paging dispatched to Floor 3 Nursing Station.');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Feedback Toast */}
      {doctorActionSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{doctorActionSuccess}</span>
          </div>
          <button onClick={() => setDoctorActionSuccess(null)}>✕</button>
        </div>
      )}

      {/* Doctor Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
              Physician & Specialist Portal
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Telemetry Review
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Assigned Physician: <strong className="text-slate-800">{currentPatient.attendingDoctor}</strong>
            </p>
          </div>
        </div>

        {/* Doctor Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleNotifyNursingStation}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-300"
          >
            <PhoneCall className="w-4 h-4 text-cyan-700" />
            Page Floor Nurse
          </button>

          <button
            onClick={() => {
              onTriggerEmergencyAlert();
              showFeedbackMessage('Code Alert triggered on bedside IoT node & dashboard.');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <ShieldAlert className="w-4 h-4" />
            Trigger Medical Alert
          </button>
        </div>
      </div>

      {/* Patient Clinical Overview Strip */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-indigo-800/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Active Patient Profile
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">
              {currentPatient.name}
            </h3>
            <p className="text-xs text-indigo-200 mt-1">
              {currentPatient.age} y/o {currentPatient.gender} • ID: {currentPatient.id} • {currentPatient.roomNumber} ({currentPatient.bedNumber})
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-indigo-300 block">Current Triage Status</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                  vitals.status === 'Critical'
                    ? 'bg-rose-500 text-white'
                    : vitals.status === 'Warning'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-emerald-400 text-slate-950'
                }`}
              >
                {vitals.status} Condition
              </span>
            </div>
          </div>
        </div>

        {/* Real-time vitals row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-indigo-200 flex items-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Heart Rate
            </span>
            <span className="font-mono-num text-2xl sm:text-3xl font-bold text-white">
              {vitals.heartRate}{' '}
              <span className="text-xs font-normal text-indigo-300">BPM</span>
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-indigo-200 flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Oxygen SpO₂
            </span>
            <span className="font-mono-num text-2xl sm:text-3xl font-bold text-white">
              {vitals.spO2}%
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-indigo-200 flex items-center gap-1.5 mb-1">
              <Thermometer className="w-3.5 h-3.5 text-teal-400" />
              Temperature
            </span>
            <span className="font-mono-num text-2xl sm:text-3xl font-bold text-white">
              {vitals.temperature.toFixed(1)}°C
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-indigo-200 flex items-center gap-1.5 mb-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Blood Pressure
            </span>
            <span className="font-mono-num text-2xl sm:text-3xl font-bold text-white">
              {vitals.systolicBP}/{vitals.diastolicBP}{' '}
              <span className="text-xs font-normal text-indigo-300">mmHg</span>
            </span>
          </div>
        </div>
      </div>

      {/* Doctor Clinical Notes Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Clinical Consultation & Progress Notes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Document clinical impressions, vital trend correlations, and medication orders.
            </p>
          </div>

          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showNoteForm ? 'Close Form' : 'Add Clinical Note'}
          </button>
        </div>

        {/* New Note Form */}
        {showNoteForm && (
          <form onSubmit={handleAddNote} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 space-y-4">
            <h4 className="font-bold text-sm text-slate-900">New Clinical Assessment Entry</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assessment Title / Subject
              </label>
              <input
                type="text"
                required
                placeholder="E.g., Morning Cardiovascular Rounds & Titration"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Observations & Telemetry Correlation
              </label>
              <textarea
                required
                rows={3}
                placeholder="Detail clinical findings, cardiac rhythm interpretation, and patient response..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prescriptions & Medication Orders (one per line)
              </label>
              <textarea
                rows={2}
                placeholder="E.g., Metoprolol 25mg PO BID&#10;Aspirin 81mg Daily"
                value={newPrescriptions}
                onChange={(e) => setNewPrescriptions(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNoteForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save Clinical Note
              </button>
            </div>
          </form>
        )}

        {/* Existing Doctor Notes */}
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">{note.title}</h4>
                  <p className="text-xs text-indigo-700 font-medium">
                    {note.doctorName} • <span className="text-slate-500">{note.specialty}</span>
                  </p>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {note.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {note.time}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {note.content}
              </p>

              {note.prescriptions && note.prescriptions.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <Pill className="w-3.5 h-3.5 text-indigo-600" />
                    Prescriptions & Orders:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {note.prescriptions.map((rx, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-mono-num font-medium"
                      >
                        {rx}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
