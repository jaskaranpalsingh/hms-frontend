import React, { useState, useEffect } from 'react';
import { X, UserPlus, Briefcase, Mail, Phone, Calendar, Clock, IndianRupee, CheckCircle2, RefreshCw } from 'lucide-react';
import { staffService } from '../services/api';
import toast from 'react-hot-toast';

const AddStaffModal = ({ isOpen, onClose, onRefresh, editStaff }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    shift: '',
    salary: '',
    hireDate: new Date().toISOString().split('T')[0],
    contact: { phone: '', email: '' }
  });

  useEffect(() => {
    if (editStaff) {
      setFormData({
        ...editStaff,
        hireDate: editStaff.hireDate ? editStaff.hireDate.split('T')[0] : ''
      });
    } else {
      setFormData({
        name: '',
        role: '',
        department: '',
        shift: '',
        salary: '',
        hireDate: new Date().toISOString().split('T')[0],
        contact: { phone: '', email: '' }
      });
    }
  }, [editStaff, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editStaff) {
        await staffService.updateStaff(editStaff._id, formData);
        toast.success('Personnel updated successfully!');
      } else {
        await staffService.createStaff(formData);
        toast.success('New personnel added to the clinical team!');
      }
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save staff record');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
        
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
             <div className="w-14 h-14 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-600 shadow-inner ring-1 ring-amber-100">
                <UserPlus className="w-7 h-7" />
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {editStaff ? 'Profile Modification' : 'Personnel Onboarding'}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Institutional Staff Ledger v4.2</p>
                </div>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Legal Identity</h3>
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
                placeholder="Full Personnel Name"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Designated Role</h3>
              <div className="relative group">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" />
                <select 
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">Select Protocol Role</option>
                  <option value="Nurse">Medical Nurse</option>
                  <option value="Admin">Administrative Dir.</option>
                  <option value="Receptionist">Front Desk Coordinator</option>
                  <option value="Technician">Lab Technician</option>
                  <option value="Pharmacist">Clinical Pharmacist</option>
                  <option value="Janitor">Facility Maintenance</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Assigned Unit</h3>
              <div className="relative group/dep">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/dep:text-amber-500 transition-colors pointer-events-none z-10">
                   <Briefcase className="w-4 h-4" />
                </div>
                <select 
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">Select Dept. Unit</option>
                  <option value="Emergency">Emergency Res.</option>
                  <option value="Pediatrics">Pediatrics Unit</option>
                  <option value="Surgery">Surgical Services</option>
                  <option value="Cardiology">Cardiology Center</option>
                  <option value="Radiology">Imaging & Radiology</option>
                  <option value="Pharmacy">Institutional Pharmacy</option>
                  <option value="Administration">Hospital Admin</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Duty Matrix</h3>
              <div className="relative group">
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" />
                <select 
                  required
                  value={formData.shift}
                  onChange={(e) => setFormData({...formData, shift: e.target.value})}
                  className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">Select Shift Cycle</option>
                  <option value="Morning">Alpha (08:00 - 16:00)</option>
                  <option value="Evening">Beta (16:00 - 00:00)</option>
                  <option value="Night">Gamma (00:00 - 08:00)</option>
                  <option value="Rotating">Delta (Rotating Duty)</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Primary Telecom</h3>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" />
                <input 
                  type="tel"
                  required
                  maxLength="10"
                  pattern="[0-9]{10}"
                  value={formData.contact.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) {
                      setFormData({...formData, contact: { ...formData.contact, phone: val }});
                    }
                  }}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-amber-500 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="987xxxxxxx"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Institutional Email</h3>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" />
                <input 
                  type="email"
                  required
                  value={formData.contact.email}
                  onChange={(e) => setFormData({...formData, contact: { ...formData.contact, email: e.target.value }})}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-amber-500 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="staff@gateway.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Salary Allocation (₹)</h3>
              <div className="relative group">
                <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" />
                <input 
                  type="number"
                  required
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-amber-500 outline-none font-bold text-slate-800 transition-all shadow-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Commission Date</h3>
              <div className="relative group">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" />
                <input 
                  type="date"
                  required
                  value={formData.hireDate}
                  onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-amber-500 outline-none font-semibold text-slate-700 transition-all shadow-sm cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-3xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {loading ? (
                <>
                   <RefreshCw className="w-5 h-5 animate-spin relative z-10" />
                   <span className="relative z-10 tracking-tight uppercase tracking-widest text-xs">Processing Entry...</span>
                </>
              ) : (
                <>
                   <CheckCircle2 className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                   <span className="relative z-10 tracking-tight uppercase tracking-widest text-xs">
                     {editStaff ? 'Save Modification' : 'Finalize Enrollment'}
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

export default AddStaffModal;
