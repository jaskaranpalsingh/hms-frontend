import React, { useState, useEffect } from 'react';
import { X, Activity, Thermometer, Droplets, Scale, ArrowUpCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { patientService } from '../services/api';
import toast from 'react-hot-toast';

const AddVitalsModal = ({ isOpen, onClose, patient, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    spO2: '',
    weight: '',
    height: '',
    respiratoryRate: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        spO2: '',
        weight: '',
        height: '',
        respiratoryRate: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient?._id) return toast.error('Invalid Patient Data');

    setLoading(true);
    try {
      await patientService.addVitals(patient._id, formData);
      toast.success(`Vitals recorded for ${patient.name}`);
      if (onRefresh) onRefresh();
      onClose();
      // Reset form
      setFormData({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        spO2: '',
        weight: '',
        height: '',
        respiratoryRate: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record vitals');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header Section: Professional & Silkier */}
        <div className="relative px-10 py-8 border-b border-slate-50 bg-gradient-to-br from-white to-slate-50/50 flex-shrink-0">
          <div className="absolute top-0 right-0 p-6">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200 text-slate-400 hover:text-slate-600 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
          
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-rose-50 rounded-[1.5rem] flex items-center justify-center text-rose-600 shadow-inner ring-1 ring-rose-100">
                <Activity className="w-7 h-7" />
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bio-Metric Registry</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 font-medium">Subject: {patient?.name || 'Standard Entry'}</p>
                </div>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-10 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 ml-1">Blood Pressure</h3>
              <div className="relative group">
                <Activity className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors pointer-events-none" />
                <input 
                  placeholder="e.g. 120/80"
                  required
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 ml-1">Pulse (BPM)</h3>
              <div className="relative group">
                <Activity className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 group-focus-within:text-rose-600 transition-colors pointer-events-none" />
                <input 
                  type="number"
                  placeholder="e.g. 72"
                  required
                  value={formData.heartRate}
                  onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 ml-1">Temperature (°F)</h3>
              <div className="relative group">
                <Thermometer className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 group-focus-within:text-orange-600 transition-colors pointer-events-none" />
                <input 
                  type="number"
                  step="0.1"
                  placeholder="e.g. 98.6"
                  required
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 ml-1">Oxygen (SpO2 %)</h3>
              <div className="relative group">
                <Droplets className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                <input 
                  type="number"
                  placeholder="e.g. 98"
                  required
                  value={formData.spO2}
                  onChange={(e) => setFormData({...formData, spO2: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 ml-1">Body Weight (kg)</h3>
              <div className="relative group">
                <Scale className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
                <input 
                  type="number"
                  placeholder="e.g. 70"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 ml-1">Resp. Rate (BPM)</h3>
              <div className="relative group">
                <ArrowUpCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                <input 
                  type="number"
                  placeholder="e.g. 16"
                  value={formData.respiratoryRate}
                  onChange={(e) => setFormData({...formData, respiratoryRate: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-3xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {loading ? <RefreshCw className="w-5 h-5 animate-spin relative z-10" /> : <CheckCircle2 className="w-5 h-5 relative z-10" />}
              <span className="relative z-10 tracking-tight">Authorize Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVitalsModal;
