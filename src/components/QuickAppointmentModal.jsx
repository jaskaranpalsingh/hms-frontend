import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, 
  User, UserPlus, CheckCircle2, 
  AlertCircle, RefreshCw, Plus 
} from 'lucide-react';
import { patientService, doctorService, appointmentService } from '../services/api';
import toast from 'react-hot-toast';

const QuickAppointmentModal = ({ isOpen, onClose, onRefresh, editAppointment, initialDoctorId, initialPatientId }) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM',
    reason: '',
  });

  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: ''
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [pRes, dRes] = await Promise.all([
            patientService.getPatients(),
            doctorService.getDoctors()
          ]);
          setPatients(pRes.data.data || []);
          setDoctors(dRes.data.data || []);
        } catch (err) {
          toast.error('Failed to load clinical directory');
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();

      if (editAppointment) {
        setFormData({
          patientId: editAppointment.patientId?._id || editAppointment.patientId || '',
          doctorId: editAppointment.doctorId?._id || editAppointment.doctorId || '',
          date: new Date(editAppointment.date).toISOString().split('T')[0],
          timeSlot: editAppointment.timeSlot || '09:00 AM',
          reason: editAppointment.reason || '',
        });
        setIsNewPatient(false);
      } else {
        setFormData({
          patientId: initialPatientId || '',
          doctorId: initialDoctorId || '',
          date: new Date().toISOString().split('T')[0],
          timeSlot: '09:00 AM',
          reason: '',
        });
        setIsNewPatient(false);
      }
    }
  }, [isOpen, editAppointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      let finalPatientId = formData.patientId;

      if (isNewPatient) {
        if (!newPatient.phone) {
          setLoading(false);
          return toast.error('Please provide patient contact number');
        }
        
        // Strictly format payload for backend schema
        const patientData = {
          name: newPatient.name,
          age: parseInt(newPatient.age),
          gender: newPatient.gender,
          contact: {
            phone: newPatient.phone
          }
        };

        const pRes = await patientService.createPatient(patientData);
        finalPatientId = pRes.data.data._id;
        toast.success(`Patient ${newPatient.name} registered!`);
      }

      if (!finalPatientId || !formData.doctorId) {
        setLoading(false);
        return toast.error('Check patient and doctor selection');
      }

      if (editAppointment) {
        await appointmentService.updateAppointment(editAppointment._id, {
          ...formData,
          patientId: finalPatientId
        });
        toast.success('Clinical appointment updated!');
      } else {
        await appointmentService.createAppointment({
          ...formData,
          patientId: finalPatientId
        });
        toast.success('Appointment scheduled successfully!');
      }
      onRefresh();
      onClose();
      // Reset state
      setIsNewPatient(false);
      setNewPatient({ name: '', age: '', gender: 'Male', phone: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
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
             <div className="w-14 h-14 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner ring-1 ring-emerald-100">
                <Calendar className="w-7 h-7" />
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Protocol</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 font-medium">Scheduling Infrastructure v3.1</p>
                </div>
             </div>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Patient Selection Segment */}
            <div className="space-y-5">
              <div className="flex items-center justify-between px-1">
                 <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-800">Subject Identification</h3>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Select verified record or register new</p>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setIsNewPatient(!isNewPatient)}
                   className={`flex items-center gap-2 text-[10px] font-bold px-5 py-2.5 rounded-xl transition-all duration-300 uppercase tracking-widest ${
                     isNewPatient 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 ring-1 ring-slate-100'
                   }`}
                 >
                   {isNewPatient ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                   {isNewPatient ? 'Return to Registry' : 'New Enrollment'}
                 </button>
              </div>

              {isNewPatient ? (
                 <div className="grid grid-cols-6 gap-6 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="col-span-6 space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</p>
                       <input 
                         placeholder="Enter full name"
                         required
                         value={newPatient.name}
                         onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                         className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 transition-all text-xs font-semibold shadow-sm outline-none"
                       />
                    </div>
                    <div className="col-span-3 space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</p>
                       <input 
                         placeholder="Years"
                         type="number"
                         required
                         value={newPatient.age}
                         onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                         className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 transition-all text-xs font-semibold shadow-sm outline-none"
                       />
                    </div>
                    <div className="col-span-3 space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</p>
                       <select 
                         required
                         value={newPatient.gender}
                         onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                         className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 transition-all text-xs font-semibold shadow-sm outline-none cursor-pointer appearance-none"
                       >
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                         <option value="Other">Other</option>
                       </select>
                    </div>
                    <div className="col-span-6 space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Contact</p>
                       <input 
                         placeholder="10-digit primary number"
                         required
                         value={newPatient.phone}
                         onChange={(e) => setNewPatient({...newPatient, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                         className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 transition-all text-xs font-semibold shadow-sm outline-none"
                       />
                    </div>
                 </div>
              ) : (
                 <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                    <select 
                      required={!isNewPatient}
                      value={formData.patientId}
                      onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer shadow-sm"
                    >
                      <option value="">Select from Institutional Repository</option>
                      {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                 </div>
              )}
            </div>

            {/* Practitioner Selection */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-800 ml-1">Credentialed Practitioner</h3>
               <div className="relative group">
                  <ShieldCheckIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                  <select 
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                    className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="">Authorize clinical practitioner...</option>
                    {doctors.length > 0 ? (
                      doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>)
                    ) : (
                      <option disabled>No practitioners found</option>
                    )}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
               </div>
            </div>

            {/* Time and Date Grid */}
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 ml-1">Consultation Date</h3>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm"
                    />
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 ml-1">Preferred Slot</h3>
                  <div className="relative group">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                    <select 
                      required
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                      className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer shadow-sm"
                    >
                      {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(slot => (
                         <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-800 ml-1">Clinical Instruction</h3>
               <textarea 
                 value={formData.reason}
                 onChange={(e) => setFormData({...formData, reason: e.target.value})}
                 className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-semibold text-slate-700 transition-all h-28 resize-none shadow-sm placeholder:text-slate-400 leading-relaxed"
                 placeholder="Briefly describe the clinical protocol for this visit..."
               />
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-3xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {loading ? <RefreshCw className="w-5 h-5 animate-spin relative z-10" /> : <CheckCircle2 className="w-5 h-5 relative z-10" />}
                <span className="relative z-10 tracking-tight">
                  {editAppointment ? 'Update Protocol' : 'Authorize Appointment'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ShieldCheckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default QuickAppointmentModal;
