import React, { useState, useEffect } from 'react';
import { X, Stethoscope, Plus, Trash2, CheckCircle2, RefreshCw, FileText } from 'lucide-react';
import { recordService } from '../services/api';
import toast from 'react-hot-toast';

const AddDetailModal = ({ isOpen, onClose, appointment, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    notes: '',
    prescription: [{ medicine: '', dosage: '', frequency: '', duration: '' }],
  });

  useEffect(() => {
    if (isOpen && appointment) {
      setFormData(prev => ({
        ...prev,
        patientId: appointment.patientId?._id || appointment.patientId || '',
        doctorId: appointment.doctorId?._id || appointment.doctorId || '',
        diagnosis: '',
        notes: '',
        prescription: [{ medicine: '', dosage: '', frequency: '', duration: '' }]
      }));
    }
  }, [isOpen, appointment]);

  const handleAddMedicine = () => {
    setFormData({
      ...formData,
      prescription: [...formData.prescription, { medicine: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const handleRemoveMedicine = (index) => {
    const updated = formData.prescription.filter((_, i) => i !== index);
    setFormData({ ...formData, prescription: updated });
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...formData.prescription];
    updated[index][field] = value;
    setFormData({ ...formData, prescription: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.diagnosis) return toast.error('Diagnosis is required');

    setLoading(true);
    try {
      await recordService.createRecord(formData);
      toast.success('Clinical record created successfully!');
      if (onRefresh) onRefresh();
      onClose();
      // Reset form (optional, since modal closes)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
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
             <div className="w-14 h-14 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 shadow-inner ring-1 ring-indigo-100">
                <FileText className="w-7 h-7" />
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Consultation Protocol</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 font-medium">Subject: {appointment?.patientId?.name || 'Standard Admission'}</p>
                </div>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-10 space-y-10">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 ml-1">Primary Diagnosis</h3>
            <textarea 
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400 h-24 resize-none"
              placeholder="Enter active clinical diagnosis..."
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-sm font-bold text-slate-800">Pharmacological Regimen</h3>
               <button 
                 type="button"
                 onClick={handleAddMedicine}
                 className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all uppercase tracking-widest shadow-sm ring-1 ring-indigo-100"
               >
                 <Plus className="w-3.5 h-3.5" />
                 Add Instruction
               </button>
            </div>
            
            <div className="space-y-4">
              {formData.prescription.map((med, idx) => (
                <div key={idx} className="group relative grid grid-cols-12 gap-4 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 items-end animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="col-span-12 md:col-span-4 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Medication</p>
                    <input 
                      placeholder="e.g. Paracetamol"
                      value={med.medicine}
                      onChange={(e) => handleMedicineChange(idx, 'medicine', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs shadow-sm focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</p>
                    <input 
                      placeholder="e.g. 500mg"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs shadow-sm focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-3 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</p>
                    <input 
                      placeholder="e.g. 1-0-1"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs shadow-sm focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle</p>
                    <input 
                      placeholder="Days"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs shadow-sm focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 ml-1">Institutional Observations</h3>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400 h-28 resize-none"
              placeholder="Enter detailed clinical observations or specific treatment guidelines..."
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-3xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {loading ? <RefreshCw className="w-5 h-5 animate-spin relative z-10" /> : <CheckCircle2 className="w-5 h-5 relative z-10" />}
              <span className="relative z-10 tracking-tight">Finalize Protocol</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDetailModal;
