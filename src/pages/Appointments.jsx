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
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             Appointments Manager
             <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-3 py-1 rounded-full uppercase tracking-widest">{appointments.length || 0} Scheduled</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage and reschedule hospital appointments with real-time slot tracking.</p>
        </div>
        <button 
          onClick={() => setIsQuickOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 group shadow-xl shadow-primary-600/20"
        >
          <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Book Visit
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 focus:text-primary-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search patient, doctor or reason..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all outline-none shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-slate-400 hidden md:block" />
          <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="w-full md:w-48 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all outline-none shadow-sm appearance-none cursor-pointer"
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
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6">ID & Patient Details</th>
                <th className="px-8 py-6">Medical Personnel</th>
                <th className="px-8 py-6">Appt Date / Time</th>
                <th className="px-8 py-6">Visit Reason / Type</th>
                <th className="px-8 py-6">Current Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan="6" className="px-8 py-6"><div className="h-10 bg-slate-50 animate-pulse rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : appointments.length > 0 ? (
                appointments.map((app) => (
                  <tr key={app._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:bg-primary-600 group-hover:text-white transition-all">
                             {app.patientId?.name?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 truncate uppercase group-hover:text-primary-600 transition-colors">{app.patientId?.name}</span>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase">#{app.id}</span>
                             </div>
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1 pl-0.5">{app.patientId?.patientId}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-primary-100/50 rounded-lg text-primary-600">
                            <Stethoscope className="w-4 h-4" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 capitalize">Dr. {app.doctorId?.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{app.doctorId?.specialization}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-700">
                       <div className="flex flex-col">
                          <span className="flex items-center gap-1.5 text-primary-600">
                             <Calendar className="w-3 h-3" />
                             {new Date(app.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-400 mt-1 pl-4">
                             <Clock className="w-3 h-3 text-slate-300" />
                             {app.timeSlot}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 capitalize group-hover:text-primary-600 transition-all">{app.reason}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{app.type}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-max ${getStatusStyle(app.status)} shadow-sm border border-transparent hover:border-white shadow-slate-200/50 transition-all`}>
                          {app.status === 'Confirmed' && <CheckCircle2 className="w-3 h-3" />}
                          {app.status === 'Scheduled' && <Clock className="w-3 h-3" />}
                          {app.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                          {app.status}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center justify-end gap-2 transition-all">
                          {/* RBAC: Vitals & Details — only if user can update */}
                          {can('update') && (
                            <>
                              <button 
                                onClick={() => {
                                  setSelectedAppointment(app);
                                  setIsVitalsOpen(true);
                                }}
                                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 rounded-xl shadow-sm hover:shadow transition-all group/btn transform hover:-translate-y-0.5 active:scale-95"
                                title="Add Vitals"
                              >
                                 <Activity className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedAppointment(app);
                                  setIsDetailOpen(true);
                                }}
                                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 rounded-xl shadow-sm hover:shadow transition-all group/btn transform hover:-translate-y-0.5 active:scale-95"
                                title="Add Consultation Details"
                              >
                                 <FileText className="w-4 h-4" />
                              </button>
                              <div className="w-px h-6 bg-slate-100 mx-1"></div>
                            </>
                          )}
                          <button 
                            onClick={() => handleEdit(app)}
                            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 rounded-xl shadow-sm hover:shadow transition-all group/btn transform hover:-translate-y-0.5 active:scale-95"
                            title="Edit / Reschedule"
                          >
                             <Edit className="w-4 h-4" />
                          </button>
                          {/* RBAC: Only admin can delete appointments */}
                          {can('delete') && (
                            <button 
                              onClick={() => handleDelete(app._id)}
                              className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl shadow-sm hover:shadow transition-all group/btn transform hover:-translate-y-0.5 active:scale-95"
                              title="Delete Slot"
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
                   <td colSpan="6" className="px-8 py-24 text-center space-y-4 bg-slate-50/20">
                      <div className="w-20 h-20 bg-white border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-200 animate-pulse">
                         <Calendar className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                         <h3 className="text-xl font-bold text-slate-800 tracking-tight">No Appointments Planned</h3>
                         <p className="text-slate-400 font-medium">Looks like your schedule is empty. Use the quick book feature to get started.</p>
                      </div>
                      <button className="btn-primary mt-4 scale-90 opacity-80 hover:scale-100 hover:opacity-100">
                         Initial Appointment
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
