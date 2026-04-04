import React, { useEffect, useState } from 'react';
import { 
  Calendar, Search, Filter, 
  MoreVertical, Clock, CheckCircle2,
  XCircle, Edit, Trash2, Plus,
  ChevronLeft, ChevronRight, User, 
  Stethoscope, Info, Activity, FileText
} from 'lucide-react';
import { appointmentService } from '../services/api';
import AddVitalsModal from '../components/AddVitalsModal';
import AddDetailModal from '../components/AddDetailModal';
import QuickAppointmentModal from '../components/QuickAppointmentModal';
import ConfirmModal from '../components/ConfirmModal';
import useRBAC from '../hooks/useRBAC';  // ← RBAC
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Appointments = () => {
  const { user } = useAuth();
  const { can } = useRBAC();  // ← RBAC
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  
  // Modal states
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments({ 
        search: searchTerm, 
        status: statusFilter, 
        page 
      });
      setAppointments(res.data.data);
    } catch (err) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [searchTerm, statusFilter, page]);

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const deletePromise = appointmentService.deleteAppointment(deleteId);
      toast.promise(deletePromise, {
        loading: 'Deleting clinical entry...',
        success: 'Appointment removed',
        error: (err) => err.response?.data?.message || 'Failed to remove',
      });
      await deletePromise;
      fetchAppointments();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (app) => {
    setEditingAppointment(app);
    setIsQuickOpen(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-700';
      case 'Scheduled': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-slate-100 text-slate-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-top-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             Appointment Schedule
             <span className="text-xs font-bold bg-primary-50 text-primary-700 px-3 py-1 rounded-full border border-primary-100 uppercase tracking-widest shadow-sm">{appointments.length || 0} Scheduled</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-xs text-slate-500 font-medium">Real-time Clinical Synchronization Active</p>
          </div>
        </div>
        <button 
          onClick={() => setIsQuickOpen(true)}
          className="group bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-7 rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2.5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Calendar className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-12 duration-300" />
          <span className="relative z-10 tracking-tight">New Appointment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search appointments by name, doctor or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-semibold focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none shadow-sm placeholder:text-slate-400"
          />
        </div>
        
        <div className="relative group">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors pointer-events-none z-20" />
          <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="w-full md:w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold text-slate-600 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none shadow-sm appearance-none cursor-pointer relative z-10"
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden shadow-2xl shadow-primary-500/5">
        <div className="overflow-x-auto min-w-[1000px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-6">Patient Profile</th>
                <th className="px-8 py-6">Doctor / Specialist</th>
                <th className="px-8 py-6">Date & Time</th>
                <th className="px-8 py-6">Purpose of Visit</th>
                <th className="px-8 py-6">Current Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan="6" className="px-8 py-6"><div className="h-10 bg-slate-50 animate-pulse rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : appointments.length > 0 ? (
                appointments.map((app) => (
                  <tr key={app._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 font-bold shadow-inner ring-1 ring-primary-100 transition-transform group-hover:scale-105">
                             {app.patientId?.name?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-primary-600 transition-colors uppercase">{app.patientId?.name}</span>
                                <span className="text-[10px] font-bold text-slate-400">ID #{app.id}</span>
                             </div>
                             <span className="text-[10px] text-slate-400 font-semibold tracking-widest">{app.patientId?.patientId}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100">
                            <Stethoscope className="w-4 h-4" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 capitalize">Dr. {app.doctorId?.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{app.doctorId?.specialization}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary-600 flex items-center gap-1.5 uppercase">
                             <Calendar className="w-3 h-3" />
                             {new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-1 tracking-widest pl-4 uppercase">
                             <Clock className="w-3 h-3" />
                             {app.timeSlot}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 capitalize group-hover:text-primary-600 transition-all">{app.reason}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 bg-slate-50 px-2 py-0.5 rounded w-max border border-slate-100">{app.type}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${getStatusStyle(app.status)}`}>
                          {app.status}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                          {can('update') && (
                            <>
                              <button 
                                onClick={() => {
                                  setSelectedAppointment(app);
                                  setIsVitalsOpen(true);
                                }}
                                className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                                title="Add Vitals"
                              >
                                 <Activity className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedAppointment(app);
                                  setIsDetailOpen(true);
                                }}
                                className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                                title="Add Notes"
                              >
                                 <FileText className="w-4 h-4" />
                              </button>
                              <div className="w-px h-6 bg-slate-100 mx-1"></div>
                            </>
                          )}
                          <button 
                            onClick={() => handleEdit(app)}
                            className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                            title="Reschedule"
                          >
                             <Edit className="w-4 h-4" />
                          </button>
                          {can('delete') && (
                            <button 
                              onClick={() => handleDelete(app._id)}
                              className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                              title="Cancel Slot"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="6" className="px-8 py-24 text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-300 border border-slate-100 mb-6">
                         <Calendar className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-xl font-bold text-slate-900 tracking-tight">No Appointments Planned</h3>
                         <p className="text-slate-400 font-medium text-sm max-w-sm mx-auto leading-relaxed">Looks like your schedule is empty. Use the quick book feature to create a new clinical entry.</p>
                      </div>
                      <button 
                        onClick={() => setIsQuickOpen(true)}
                        className="mt-6 text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest bg-primary-50 px-5 py-2.5 rounded-xl transition-all"
                      >
                         Schedule First Appointment
                      </button>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddVitalsModal 
        isOpen={isVitalsOpen} 
        onClose={() => setIsVitalsOpen(false)} 
        patient={selectedAppointment?.patientId}
        onRefresh={fetchAppointments}
      />

      <AddDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        appointment={selectedAppointment}
        onRefresh={fetchAppointments}
      />

      <QuickAppointmentModal 
        isOpen={isQuickOpen} 
        onClose={() => {
          setIsQuickOpen(false);
          setEditingAppointment(null);
        }} 
        onRefresh={fetchAppointments}
        editAppointment={editingAppointment}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Cancel Appointment?"
        message="This action will permanently remove this slot from the clinical schedule and notify the patient. This cannot be undone."
        confirmText="Yes, Cancel Slot"
      />
    </div>
  );
};

export default Appointments;
