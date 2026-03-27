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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border-2 border-slate-50 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <div className="space-y-0.5">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {editDoctor ? 'Update Specialist Profile' : 'Onboard Clinical Staff'}
                </h2>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.2em]">Administrative Auth v2.0</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Full Legal Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                  placeholder="e.g., Dr. Karandeep Singh"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Medical Speciality</label>
                <select 
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                >
                  {[
                    'Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedic', 
                    'Dermatologist', 'General Physician', 'Gynecologist', 'Oncologist'
                  ].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Professional Email (Login)</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                  placeholder="doctor@hospital.com"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Initial Key/Password</label>
                <input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                  placeholder="••••••••"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Qualification (MD/MBBS)</label>
                <input 
                  required
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Years of Experience</label>
                <input 
                  type="number"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Consultation Fee (Rs.)</label>
                <input 
                  type="number"
                  required
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Contact Number</label>
                <input 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                  placeholder="10-digit number"
                />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Professional Brief / About</label>
             <textarea 
               value={formData.about}
               onChange={(e) => setFormData({...formData, about: e.target.value})}
               className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all h-24 resize-none shadow-inner"
               placeholder="Describe clinical background..."
             />
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {editDoctor ? 'Commit Profile Updates' : 'Authorize & Register Practitioner'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;
