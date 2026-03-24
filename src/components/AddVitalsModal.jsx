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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border-2 border-slate-50 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Activity className="w-6 h-6" />
             </div>
             <div className="space-y-0.5">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Vitals Entry</h2>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.2em]">Patient: {patient?.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Blood Pressure (mmHg)</label>
              <div className="relative group">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  placeholder="e.g. 120/80"
                  required
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Pulse Rate (BPM)</label>
              <div className="relative group">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                <input 
                  type="number"
                  placeholder="e.g. 72"
                  required
                  value={formData.heartRate}
                  onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Temperature (°F)</label>
              <div className="relative group">
                <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                <input 
                  type="number"
                  step="0.1"
                  placeholder="e.g. 98.6"
                  required
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">SpO2 (%)</label>
              <div className="relative group">
                <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input 
                  type="number"
                  placeholder="e.g. 98"
                  required
                  value={formData.spO2}
                  onChange={(e) => setFormData({...formData, spO2: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Body Weight (kg)</label>
              <div className="relative group">
                <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number"
                  placeholder="e.g. 70"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Resp. Rate (BPM)</label>
              <div className="relative group">
                <ArrowUpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number"
                  placeholder="e.g. 16"
                  value={formData.respiratoryRate}
                  onChange={(e) => setFormData({...formData, respiratoryRate: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs mt-4"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Secure Clinical Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVitalsModal;
