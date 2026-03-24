import React, { useState, useEffect } from 'react';
import { X, User, Activity, FileText, Calendar, Clock, Thermometer, Droplets, Scale, ArrowUpCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { patientService, recordService } from '../services/api';
import toast from 'react-hot-toast';

const ViewPatientModal = ({ isOpen, onClose, patientId }) => {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('history');

  const fetchData = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const [patientRes, recordsRes] = await Promise.all([
        patientService.getPatient(patientId),
        recordService.getPatientRecords(patientId)
      ]);
      setPatient(patientRes.data.data);
      setRecords(recordsRes.data.data);
    } catch (err) {
      toast.error('Failed to retrieve clinical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl border-2 border-slate-50 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 px-10 py-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-primary-100 rounded-[2rem] flex items-center justify-center text-primary-700 text-3xl font-black border-4 border-white shadow-xl rotate-3">
                {patient?.name?.charAt(0)}
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{patient?.name}</h2>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-bold bg-primary-600 text-white px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-primary-500/20">ID: {patient?.patientId}</span>
                   <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-3 py-1 rounded-lg uppercase tracking-widest">{patient?.age} Yrs • {patient?.gender}</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-slate-400 hover:text-white">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="bg-slate-50 px-10 py-1.5 border-b border-slate-200 flex items-center gap-1 shrink-0">
           {['history', 'vitals', 'account'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-primary-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
              </button>
           ))}
        </div>

        <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
               <RefreshCw className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'history' && (
                <div className="space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {records.length > 0 ? (
                        records.map(record => (
                          <div key={record._id} className="p-6 bg-white border-2 border-slate-50 rounded-[2rem] shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
                             <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                   <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(record.date).toLocaleDateString()}</span>
                             </div>
                             <h4 className="text-sm font-black text-slate-900 uppercase mb-2 group-hover:text-indigo-600 transition-colors">{record.diagnosis}</h4>
                             <p className="text-xs text-slate-500 font-medium line-clamp-2 italic mb-4">"{record.notes}"</p>
                             <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">By Dr. {record.doctorId?.name}</span>
                                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition-all cursor-pointer" />
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-16 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-xs">No clinical history recorded</div>
                      )}
                   </div>
                </div>
              )}

              {activeTab === 'vitals' && (
                <div className="space-y-10 animate-in slide-in-from-right-4">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { label: 'BP', value: patient?.vitals?.length > 0 ? patient.vitals[patient.vitals.length-1].bloodPressure : '--', icon: Activity, color: 'text-red-500', bg: 'bg-red-50' },
                        { label: 'HEART', value: patient?.vitals?.length > 0 ? patient.vitals[patient.vitals.length-1].heartRate : '--', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
                        { label: 'TEMP', value: patient?.vitals?.length > 0 ? patient.vitals[patient.vitals.length-1].temperature : '--', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50' },
                        { label: 'SpO2', value: patient?.vitals?.length > 0 ? patient.vitals[patient.vitals.length-1].spO2 : '--', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
                      ].map((vital, i) => (
                        <div key={i} className="p-6 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center group hover:border-primary-100 transition-all">
                           <div className={`w-12 h-12 ${vital.bg} ${vital.color} rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110`}>
                              <vital.icon className="w-6 h-6" />
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{vital.label}</p>
                           <p className="text-xl font-black text-slate-900 tracking-tight">{vital.value}</p>
                        </div>
                      ))}
                   </div>
                   
                   <div className="p-8 bg-slate-900 rounded-[3rem] text-white">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-400">Biological Trends</h3>
                         <button className="text-[10px] font-black uppercase tracking-widest underline opacity-60 hover:opacity-100">View Full Report</button>
                      </div>
                      <div className="h-40 flex items-end gap-2 px-2">
                         {Array.from({length: 12}).map((_, i) => (
                           <div key={i} className="flex-1 bg-primary-600/20 rounded-t-xl hover:bg-primary-500 transition-all" style={{height: `${Math.random() * 100}%`}}></div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="card !bg-slate-50 border-none space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Calendar className="w-4 h-4" />
                         Registry Information
                      </h3>
                      <div className="space-y-4 pt-2">
                         <div className="flex items-center justify-between py-3 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-500 uppercase">Enrollment Date</span>
                            <span className="text-xs font-black text-slate-900">{new Date(patient?.createdAt).toLocaleDateString()}</span>
                         </div>
                         <div className="flex items-center justify-between py-3 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-500 uppercase">Emergency Protocol</span>
                            <span className="text-xs font-black text-red-600 uppercase tracking-tighter">Level 1 Primary</span>
                         </div>
                         <div className="flex items-center justify-between py-3">
                            <span className="text-xs font-bold text-slate-500 uppercase">Medical Gateway</span>
                            <span className="text-xs font-black text-slate-900">{patient?.contact?.email || 'N/A'}</span>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPatientModal;
