import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, MapPin, Activity, CheckCircle2, RefreshCw, Scale, ArrowUpCircle } from 'lucide-react';
import { patientService } from '../services/api';
import toast from 'react-hot-toast';

const AddPatientModal = ({ isOpen, onClose, onRefresh, editPatient = null }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    address: '',
    status: 'Active'
  });

  useEffect(() => {
    if (editPatient) {
      setFormData({
        name: editPatient.name || '',
        email: editPatient.contact?.email || editPatient.email || '',
        phone: editPatient.contact?.phone || editPatient.phone || '',
        age: editPatient.age || '',
        gender: editPatient.gender || 'Male',
        address: editPatient.address || '',
        status: editPatient.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'Male',
        address: '',
        status: 'Active'
      });
    }
  }, [editPatient, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const submitData = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      contact: {
        phone: formData.phone,
        email: formData.email
      },
      address: formData.address,
      status: formData.status
    };

    try {
      if (editPatient) {
        await patientService.updatePatient(editPatient._id, submitData);
        toast.success('Patient record updated');
      } else {
        await patientService.createPatient(submitData);
        toast.success('New patient registered successfully');
      }
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save patient record');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border-2 border-slate-50 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <User className="w-6 h-6" />
             </div>
             <div className="space-y-0.5">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {editPatient ? 'Update Clinical Record' : 'Enroll New Patient'}
                </h2>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.2em]">Medical Registry Entry v2.0</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Full Legal Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Primary Contact</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                  placeholder="10-digit phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email Identity</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                  placeholder="email@gateway.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Cycles (Age)</label>
                 <input 
                   required
                   type="number"
                   value={formData.age}
                   onChange={(e) => setFormData({...formData, age: e.target.value})}
                   className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Gender</label>
                 <select 
                   value={formData.gender}
                   onChange={(e) => setFormData({...formData, gender: e.target.value})}
                   className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                 >
                   <option value="Male">Male</option>
                   <option value="Female">Female</option>
                   <option value="Other">Other</option>
                 </select>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Module Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all appearance-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Biological Address</label>
               <input 
                 value={formData.address}
                 onChange={(e) => setFormData({...formData, address: e.target.value})}
                 className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                 placeholder="Street, City, Zip"
               />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs mt-4"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {editPatient ? 'Commit Record Changes' : 'Initialize Patient Enrollment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
