import React, { useState, useEffect } from 'react';
import { X, UserPlus, Briefcase, Mail, Phone, Calendar, Clock, DollarSign, CheckCircle2, RefreshCw } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border-2 border-slate-50 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <UserPlus className="w-6 h-6" />
             </div>
             <div className="space-y-0.5">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {editStaff ? 'Edit Personnel' : 'Hire Personnel'}
                </h2>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.2em]">Clinical & Administrative Staff</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Full Name</label>
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all text-sm"
                placeholder="Staff Member Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Designation / Role</label>
              <select 
                required
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all text-sm appearance-none"
              >
                <option value="">Select Role</option>
                <option value="Nurse">Nurse</option>
                <option value="Admin">Admin</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Technician">Technician</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Janitor">Janitor</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Department</label>
              <select 
                required
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all text-sm appearance-none"
              >
                <option value="">Select Department</option>
                <option value="Emergency">Emergency</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Surgery">Surgery</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Radiology">Radiology</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Assigned Shift</label>
              <select 
                required
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all text-sm appearance-none"
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning (8AM - 4PM)</option>
                <option value="Evening">Evening (4PM - 12AM)</option>
                <option value="Night">Night (12AM - 8AM)</option>
                <option value="Rotating">Rotating</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Contact Phone</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="tel"
                  required
                  value={formData.contact.phone}
                  onChange={(e) => setFormData({...formData, contact: { ...formData.contact, phone: e.target.value }})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all text-sm"
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  value={formData.contact.email}
                  onChange={(e) => setFormData({...formData, contact: { ...formData.contact, email: e.target.value }})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all text-sm"
                  placeholder="staff@medicare.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Monthly Salary ($)</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <input 
                  type="number"
                  required
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all text-sm"
                  placeholder="e.g. 4500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Hiring Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date"
                  required
                  value={formData.hireDate}
                  onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all text-sm"
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
            {editStaff ? 'Save Changes' : 'Onboard Staff Member'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
