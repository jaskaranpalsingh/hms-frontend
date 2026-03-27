import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, 
  Filter, MoreHorizontal, Mail, 
  Phone, Briefcase, GraduationCap,
  IndianRupee, Trash2, Edit3, X,
  CheckCircle2, RefreshCw, ShieldCheck
} from 'lucide-react';
import { doctorService } from '../services/api';
import AddDoctorModal from '../components/AddDoctorModal';
import useRBAC from '../hooks/useRBAC';  // ← RBAC
import toast from 'react-hot-toast';

const DoctorsManagement = () => {
  const { can } = useRBAC();  // ← RBAC
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('All');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getDoctors();
      setDoctors(res.data.data);
    } catch (err) {
      toast.error('Failed to load doctor directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this doctor record? This action is permanent.')) {
      try {
        const deletePromise = doctorService.deleteDoctor(id);
        toast.promise(deletePromise, {
          loading: 'Deleting clinical record...',
          success: 'Doctor profile removed',
          error: (err) => err.response?.data?.message || 'Deletion failed',
        });
        await deletePromise;
        fetchDoctors();
      } catch (err) { console.error(err); }
    }
  };

  const handleEdit = (doc) => {
    setSelectedDoctor(doc);
    setIsModalOpen(true);
  };

  const specialties = ['All', ...new Set(doctors.map(doc => doc.specialization))];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'All' || doc.specialization === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3 uppercase">
            Clinic Personnel
            <span className="text-xs font-bold bg-primary-600 text-white px-3 py-1 rounded-full tracking-widest">ADMIN</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage hospital's elite medical staff and specializations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 group shadow-xl shadow-primary-500/20 py-4 px-6"
        >
          <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Add New Doctor
        </button>
      </div>

      <div className="card !p-0 overflow-hidden border-2 border-slate-50 shadow-2xl">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name or specialization..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:border-primary-600 outline-none font-bold text-slate-800 transition-all shadow-sm"
              />
           </div>
           <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                  className="pl-11 pr-10 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 font-bold hover:border-primary-600 transition-all shadow-sm outline-none appearance-none cursor-pointer"
                >
                  {specialties.map(s => <option key={s} value={s}>{s === 'All' ? 'All Specialities' : s}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <MoreHorizontal className="w-4 h-4 rotate-90" />
                </div>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50/30">
                <th className="px-8 py-5">Medical Specialist</th>
                <th className="px-8 py-5">Specialization</th>
                <th className="px-8 py-5">Experience</th>
                <th className="px-8 py-5">Fee</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}><td colSpan="6" className="p-8"><div className="h-12 bg-slate-50 animate-pulse rounded-2xl w-full"></div></td></tr>
                ))
              ) : filteredDoctors.length > 0 ? (
                filteredDoctors.map(doc => (
                  <tr key={doc._id} className="group hover:bg-primary-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-black text-lg border-2 border-white shadow-md">
                            {doc.name.charAt(0)}
                         </div>
                         <div className="space-y-0.5">
                            <p className="font-black text-slate-900 uppercase">Dr. {doc.name}</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                               <Mail className="w-3 h-3" />
                               {doc.contact?.email}
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider">{doc.specialization}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <Briefcase className="w-4 h-4 text-slate-300" />
                          {doc.experience} Years
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-black text-primary-600">₹{doc.consultationFee}</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         doc.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                       }`}>
                         {doc.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(doc)}
                            className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary-600 hover:border-primary-100 shadow-sm transition-all"
                          >
                             <Edit3 className="w-4 h-4" />
                          </button>
                          {/* RBAC: Delete guarded */}
                          {can('delete') && (
                          <button 
                            onClick={() => handleDelete(doc._id)}
                            className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 shadow-sm transition-all"
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
                  <td colSpan="6" className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest">
                    No clinical personnel registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddDoctorModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoctor(null);
        }} 
        onRefresh={fetchDoctors}
        editDoctor={selectedDoctor}
      />
    </div>
  );
};

export default DoctorsManagement;
