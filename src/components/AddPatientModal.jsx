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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
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
             <div className="w-14 h-14 bg-sky-50 rounded-[1.5rem] flex items-center justify-center text-sky-600 shadow-inner ring-1 ring-sky-100">
                <User className="w-7 h-7" />
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                   {editPatient ? 'Update Patient Profile' : 'New Patient Registry'}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 font-medium">Institutional Enrollment Protocol v2.4</p>
                </div>
             </div>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 ml-1">Full Legal Name</h3>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400"
                    placeholder="Enter patient name"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 ml-1">Primary Contact</h3>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                  <input 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <h3 className="text-sm font-bold text-slate-800 ml-1">Electronic Mail</h3>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400"
                    placeholder="patient@medical-registry.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                 <h3 className="text-sm font-bold text-slate-800 ml-1">Patient Age</h3>
                 <div className="relative group">
                   <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                   <input 
                     required
                     type="number"
                     value={formData.age}
                     onChange={(e) => setFormData({...formData, age: e.target.value})}
                     className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm"
                     placeholder="Age"
                   />
                 </div>
              </div>

              <div className="space-y-3">
                 <h3 className="text-sm font-bold text-slate-800 ml-1">Gender</h3>
                 <div className="relative group">
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer shadow-sm pr-10"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 ml-1">Registry Status</h3>
                <div className="relative group">
                   <select 
                     value={formData.status}
                     onChange={(e) => setFormData({...formData, status: e.target.value})}
                     className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer shadow-sm pr-10"
                   >
                     <option value="Active">Active / Regular</option>
                     <option value="Admitted">In-Patient (Admitted)</option>
                     <option value="Discharged">Discharged</option>
                   </select>
                   <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                 <h3 className="text-sm font-bold text-slate-800 ml-1">Residential Data</h3>
                 <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                    <input 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm"
                      placeholder="Street, City, State"
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
                <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {loading ? <RefreshCw className="w-5 h-5 animate-spin relative z-10" /> : <CheckCircle2 className="w-5 h-5 relative z-10" />}
                <span className="relative z-10 tracking-tight">
                  {editPatient ? 'Update Secure Record' : 'Complete Enrollment Protocol'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;
