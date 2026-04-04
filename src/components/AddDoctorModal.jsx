import React, { useState } from 'react';
import { 
  X, ShieldCheck, RefreshCw, 
  User, Mail, Phone, 
  Briefcase, GraduationCap, IndianRupee 
} from 'lucide-react';
import { doctorService } from '../services/api';
import toast from 'react-hot-toast';

const AddDoctorModal = ({ isOpen, onClose, onRefresh, editDoctor }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'General Physician',
    qualification: '',
    experience: '',
    consultationFee: '',
    phone: '',
    about: ''
  });

  React.useEffect(() => {
    if (editDoctor) {
      setFormData({
        name: editDoctor.name || '',
        email: editDoctor.contact?.email || '',
        password: '', // Keep empty for security
        specialization: editDoctor.specialization || 'General Physician',
        qualification: editDoctor.qualification || '',
        experience: editDoctor.experience || '',
        consultationFee: editDoctor.consultationFee || '',
        phone: editDoctor.contact?.phone || '',
        about: editDoctor.about || ''
      });
    } else {
      setFormData({
        name: '', email: '', password: '', 
        specialization: 'General Physician', qualification: '',
        experience: '', consultationFee: '', phone: '', about: ''
      });
    }
  }, [editDoctor, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        contact: {
          phone: formData.phone,
          email: formData.email
        }
      };

      // Remove password if empty during edit
      if (editDoctor && !payload.password) {
        delete payload.password;
      }

      if (editDoctor) {
        await doctorService.updateDoctor(editDoctor._id, payload);
        toast.success(`Dr. ${formData.name}'s profile updated!`);
      } else {
        await doctorService.createDoctor(payload);
        toast.success(`Dr. ${formData.name} registered successfully!`);
      }

      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
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
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {editDoctor ? 'Credential Modification' : 'Clinical Credentialing'}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Specialist Registry System v5.1</p>
                </div>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-10 space-y-10 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Practitioner Identity</h3>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none z-10" />
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
                    placeholder="Full Legal Name"
                  />
                </div>
             </div>

             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Clinical Specialization</h3>
                <div className="relative group">
                  <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none z-10" />
                  <select 
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer shadow-sm"
                  >
                    {[
                      'Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedic', 
                      'Dermatologist', 'General Physician', 'Gynecologist', 'Oncologist'
                    ].map(s => <option key={s} value={s}>{s} Specialist</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
             </div>

             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Institutional Email</h3>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none z-10" />
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
                    placeholder="doctor@medical.gov"
                  />
                </div>
             </div>

             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Access Credentials</h3>
                <div className="relative group">
                  <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none z-10" />
                  <input 
                    type="password"
                    required={!editDoctor}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                </div>
             </div>

             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Academic Qualification</h3>
                <div className="relative group">
                  <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none z-10" />
                  <input 
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
                    placeholder="e.g. MS, FACS, MBBS"
                  />
                </div>
             </div>

             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Clinical Seniority (Yrs)</h3>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors flex items-center justify-center font-bold text-[10px]">XY</div>
                  <input 
                    type="number"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all shadow-sm placeholder:text-slate-300"
                    placeholder="0"
                  />
                </div>
             </div>

             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Consultation Protocol (₹)</h3>
                <div className="relative group">
                  <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none z-10" />
                  <input 
                    type="number"
                    required
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all shadow-sm placeholder:text-slate-300"
                    placeholder="0.00"
                  />
                </div>
             </div>

             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Authenticated Telecom</h3>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none z-10" />
                  <input 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
                    placeholder="Mobile Number"
                  />
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Clinical Summary Portfolio</h3>
             <textarea 
               value={formData.about}
               onChange={(e) => setFormData({...formData, about: e.target.value})}
               className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700 transition-all h-32 resize-none shadow-sm placeholder:text-slate-300 leading-relaxed"
               placeholder="Identify primary expertise, clinical focus, and professional milestones..."
             />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-3xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {submitting ? (
                <>
                   <RefreshCw className="w-5 h-5 animate-spin relative z-10" />
                   <span className="relative z-10 tracking-tight uppercase tracking-widest text-xs">Processing Credentials...</span>
                </>
              ) : (
                <>
                   <ShieldCheck className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                   <span className="relative z-10 tracking-tight uppercase tracking-widest text-xs">
                     {editDoctor ? 'Save Credential Changes' : 'Complete Credentialing'}
                   </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;
