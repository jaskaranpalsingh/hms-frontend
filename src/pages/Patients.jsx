import React, { useEffect, useState } from 'react';
import { 
  Users, Search, Plus, Filter, 
  MoreVertical, Edit, Trash2, Eye,
  ChevronLeft, ChevronRight, CheckCircle2,
  Clock, XCircle, MoreHorizontal, Download
} from 'lucide-react';
import { patientService } from '../services/api';
import AddPatientModal from '../components/AddPatientModal';
import ViewPatientModal from '../components/ViewPatientModal';
import MessagePatientModal from '../components/MessagePatientModal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientService.getPatients({ 
        search: searchTerm, 
        status: statusFilter, 
        page 
      });
      setPatients(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to load clinical registry');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm, statusFilter, page]);

  const handleDelete = (id, name) => {
    setDeleteId(id);
    setSelectedPatient({ name }); // Just to show the name in modal
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const deletePromise = patientService.deletePatient(deleteId);
      toast.promise(deletePromise, {
        loading: 'Processing deletion...',
        success: 'Patient record purged successfully',
        error: (err) => err.response?.data?.message || 'Failed to delete record. Access denied?',
      });
      await deletePromise;
      await fetchPatients();
    } catch (err) { 
      console.error('Deletion failure:', err); 
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100/50 text-green-700 border-green-200';
      case 'Admitted': return 'bg-blue-100/50 text-blue-700 border-blue-200';
      case 'Discharged': return 'bg-slate-100/50 text-slate-700 border-slate-200';
      default: return 'bg-red-100/50 text-red-700 border-red-200';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500 pb-12"> {/* Root (1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6"> {/* Header (2) */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
             Registry Control
             <span className="text-[10px] font-bold bg-primary-600 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-primary-500/30">Total: {patients?.length || 0}</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] pl-1">Clinical Data Management Layer v2.0</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-100 text-slate-600 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
             <Download className="w-5 h-5" />
             Export CSV
           </button>
           <button 
             onClick={() => {
               setSelectedPatient(null);
               setIsAddOpen(true);
             }}
             className="btn-primary flex items-center justify-center gap-2 group shadow-xl shadow-primary-600/20 px-6 py-3.5 scale-95 hover:scale-100 transition-all font-black text-xs uppercase tracking-widest"
           >
             <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
             Register Patient
           </button>
        </div>
      </div> {/* Close Header (2) */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Filter Bar (3) */}
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, ID or record number..." 
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
            className="w-full pl-14 pr-4 py-5 bg-white border-2 border-slate-100 rounded-3xl text-sm font-bold focus:ring-8 focus:ring-primary-600/5 focus:border-primary-600 transition-all outline-none shadow-sm"
          />
        </div>
        
        <div className="relative group">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors z-20 pointer-events-none" />
          <select 
             value={statusFilter}
             onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}
             className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-600 focus:ring-8 focus:ring-primary-600/5 focus:border-primary-600 transition-all outline-none shadow-sm appearance-none cursor-pointer uppercase tracking-widest relative z-10"
          >
            <option value="">Filter By Status</option>
            <option value="Active">Active Registry</option>
            <option value="Admitted">In-Patient</option>
            <option value="Discharged">Released</option>
          </select>
        </div>
      </div> {/* Close Filter Bar (3) */}

      <div className="card !p-0 overflow-hidden shadow-2xl shadow-primary-500/5 rounded-3xl border-2 border-slate-50"> {/* Card (4) */}
        <div className="overflow-x-auto min-w-[1000px]"> {/* Table Cont (5) */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-7">Patient Information</th>
                <th className="px-8 py-7">Clinical ID</th>
                <th className="px-8 py-7">Contact Gateway</th>
                <th className="px-8 py-7">Demographics</th>
                <th className="px-8 py-7">Module Status</th>
                <th className="px-8 py-7 text-right">Registry Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan="6" className="px-8 py-8"><div className="h-12 bg-slate-50 animate-pulse rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : patients?.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 border-4 border-white rounded-2xl flex items-center justify-center text-primary-700 font-black text-xs rotate-3 group-hover:rotate-0 transition-all shadow-sm">
                          {patient.name?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors uppercase">{patient.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Joined: {new Date(patient.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[10px] font-black bg-white text-slate-600 px-4 py-2 rounded-xl border-2 border-slate-100 shadow-sm group-hover:border-primary-200 transition-colors tracking-widest uppercase">#{patient.patientId}</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-700">
                       <span className="flex items-center gap-2 group-hover:text-primary-600 transition-colors">{patient.contact?.phone || 'UNAVAILABLE'}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                             <div className={`w-1.5 h-1.5 rounded-full ${patient.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                             {patient.gender}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-3">{patient.age} Cycles / Yrs</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-4 py-2 rounded-xl border-2 flex items-center justify-center gap-2 w-max shadow-sm scale-95 group-hover:scale-100 transition-all ${getStatusStyle(patient.status)}`}>
                          {patient.status}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsViewOpen(true);
                          }}
                          className="p-3 bg-white border-2 border-slate-100 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-90"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsMessageOpen(true);
                          }}
                          className="p-3 bg-white border-2 border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-90"
                          title="Message Patient"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsAddOpen(true);
                          }}
                          className="p-3 bg-white border-2 border-slate-100 text-slate-400 hover:text-green-600 hover:border-green-100 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-90"
                          title="Edit Patient"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient._id, patient.name)}
                          className="p-3 bg-white border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-90"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-white border-2 border-slate-100 text-slate-400 hover:bg-slate-50 rounded-2xl shadow-sm transition-all active:scale-90">
                           <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center space-y-5 bg-slate-50/10">
                    <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-200 animate-pulse shadow-inner">
                       <Users className="w-12 h-12" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-slate-900 font-black text-2xl tracking-tighter uppercase">No Registry Sync</p>
                       <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto uppercase tracking-widest leading-relaxed">No medical records match your current filter parameters in our clinical database.</p>
                    </div>
                    <button onClick={() => {setSearchTerm(''); setStatusFilter(''); setPage(1);}} className="text-xs font-black text-primary-600 hover:text-primary-700 underline tracking-widest uppercase">Reset Filters</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>  {/* Close Table Cont (5) */}
        
        {/* Pagination Section (6) */}
        <div className="px-10 py-10 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Registry Volume: <span className="text-slate-900">{patients?.length || 0}</span> Records Synced / Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-3"> {/* Nav Group (7) */}
            <button 
              disabled={page === 1}
              onClick={() => {setPage(p => p - 1); window.scrollTo(0,0);}}
              className="px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-xs text-slate-500 hover:text-primary-600 hover:border-primary-600 disabled:opacity-30 disabled:border-slate-100 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Stream
            </button>
            <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center font-black shadow-xl shadow-primary-600/30 text-sm">
               {page}
            </div>
            <button 
              disabled={page === totalPages}
              onClick={() => {setPage(p => p + 1); window.scrollTo(0,0);}}
              className="px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-xs text-slate-500 hover:text-primary-600 hover:border-primary-600 disabled:opacity-30 disabled:border-slate-100 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest"
            >
              Next Stream
              <ChevronRight className="w-4 h-4" />
            </button>
          </div> {/* Close Nav Group (7) */}
        </div> {/* Close Pagination Section (6) */}
      </div> {/* Close Card (4) */}

      <AddPatientModal 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onRefresh={fetchPatients}
        editPatient={selectedPatient}
      />

      <ViewPatientModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        patientId={selectedPatient?._id}
      />

      <MessagePatientModal
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        patient={selectedPatient}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Purge Clinical Record?"
        message={`You are about to permanently delete the medical record for ${selectedPatient?.name}. This action is irreversible and restricted to senior clinical staff.`}
        confirmText="Yes, Purge Record"
      />
    </div> 
  ); // Close Root (1)
};

export default Patients;
