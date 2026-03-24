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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border-2 border-slate-50 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <FileText className="w-6 h-6" />
             </div>
             <div className="space-y-0.5">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Clinical Consultation</h2>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.2em]">Patient: {appointment?.patientId?.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Medical Diagnosis</label>
            <textarea 
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all h-20 resize-none"
              placeholder="Enter active diagnosis..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prescription module</label>
               <button 
                 type="button"
                 onClick={handleAddMedicine}
                 className="flex items-center gap-2 text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-all uppercase tracking-widest"
               >
                 <Plus className="w-3.5 h-3.5" />
                 Add Medicine
               </button>
            </div>
            
            <div className="space-y-3">
              {formData.prescription.map((med, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-50 items-end animate-in slide-in-from-right-2">
                  <div className="col-span-12 md:col-span-4 space-y-1">
                    <input 
                      placeholder="Medicine Name"
                      value={med.medicine}
                      onChange={(e) => handleMedicineChange(idx, 'medicine', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-1">
                    <input 
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-3 space-y-1">
                    <input 
                      placeholder="Frequency"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2 space-y-1">
                    <input 
                      placeholder="Days"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Clinical Notes & Observations</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all h-24 resize-none"
              placeholder="Detailed treatment plan or observation notes..."
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs shrink-0"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Finalize Clinical Record
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDetailModal;
