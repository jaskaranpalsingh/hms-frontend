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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border-2 border-slate-50 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Plus className="w-6 h-6" />
             </div>
             <div className="space-y-0.5">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Rapid Scheduler</h2>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.2em]">Clinical Intake Module v2.0</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex items-center justify-between px-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Selection</label>
             <button 
               type="button"
               onClick={() => setIsNewPatient(!isNewPatient)}
               className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                 isNewPatient ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
               }`}
             >
               {isNewPatient ? 'Select Existing' : 'Register New Patient'}
             </button>
          </div>

          {isNewPatient ? (
             <div className="grid grid-cols-2 gap-4 bg-primary-50/50 p-4 rounded-2xl border-2 border-primary-50 animate-in slide-in-from-top-2">
                <div className="col-span-2 space-y-1">
                   <input 
                     placeholder="Full Patient Name"
                     required
                     value={newPatient.name}
                     onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                     className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-primary-600 outline-none font-bold text-sm"
                   />
                </div>
                <div className="space-y-1">
                   <input 
                     placeholder="Age"
                     type="number"
                     required
                     value={newPatient.age}
                     onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                     className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-primary-600 outline-none font-bold text-sm"
                   />
                </div>
                <div className="space-y-1">
                   <select 
                     required
                     value={newPatient.gender}
                     onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                     className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-primary-600 outline-none font-bold text-sm"
                   >
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                     <option value="Other">Other</option>
                   </select>
                </div>
                <div className="col-span-2 space-y-1">
                   <input 
                     placeholder="Phone Number"
                     required
                     value={newPatient.phone}
                     onChange={(e) => setNewPatient({...newPatient, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                     className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-primary-600 outline-none font-bold text-sm"
                   />
                </div>
             </div>
          ) : (
             <div className="space-y-2">
                <div className="relative group">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <select 
                     required={!isNewPatient}
                     value={formData.patientId}
                     onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                     className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                   >
                     <option value="">Choose Patient from Directory</option>
                     {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
                   </select>
                </div>
             </div>
          )}

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Assigned Clinical Specialist</label>
             <div className="relative group">
                <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  required
                  value={formData.doctorId}
                  onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Authorize clinical staff...</option>
                  {doctors.length > 0 ? (
                    doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization})</option>)
                  ) : (
                    <option disabled>No Doctors Available</option>
                  )}
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Consultation Date</label>
                <input 
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Available Time-Slot</label>
                <select 
                  required
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                >
                  {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(slot => (
                     <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Clinical Note / Reason</label>
             <textarea 
               value={formData.reason}
               onChange={(e) => setFormData({...formData, reason: e.target.value})}
               className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all h-24 resize-none"
               placeholder="Briefly describe the symptoms or reason for visit..."
             />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
            {editAppointment ? 'Commit Reschedule' : 'Confirm Appointment'}
          </button>
        </form>
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
