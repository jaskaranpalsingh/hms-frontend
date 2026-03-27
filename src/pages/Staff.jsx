import React, { useEffect, useState } from 'react';
import { 
  Users, Search, Filter, 
  Plus, Edit, Trash2, 
  Mail, Phone, Shield, 
  Clock, Briefcase, RefreshCw,
  MoreVertical, CheckCircle2, XCircle
} from 'lucide-react';
import { staffService } from '../services/api';
import AddStaffModal from '../components/AddStaffModal';
import Can from '../components/Can';  // ← RBAC
import useRBAC from '../hooks/useRBAC';  // ← RBAC
import toast from 'react-hot-toast';

const Staff = () => {
  const { can } = useRBAC();  // ← RBAC
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await staffService.getStaff();
      setStaff(res.data.data);
    } catch (err) {
      toast.error('Failed to load personnel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        await staffService.deleteStaff(id);
        toast.success('Personnel removed successfully');
        fetchStaff();
      } catch (err) {
        toast.error('Failed to remove staff member');
      }
    }
  };

  const filteredStaff = staff.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === '' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'On Leave': return 'bg-amber-100 text-amber-700';
      case 'Inactive': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             Personnel Directory
             <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-3 py-1 rounded-full uppercase tracking-widest">{filteredStaff.length} Staff</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage hospital personnel, roles, and administrative accessibility.</p>
        </div>
        {/* RBAC: Only admin/manager can onboard staff */}
        <Can action="create">
          <button 
            onClick={() => {
              setEditingStaff(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center justify-center gap-2 group shadow-xl shadow-primary-600/20"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Onboard Staff
          </button>
        </Can>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, role or dept..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all outline-none shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-slate-400 hidden md:block" />
          <select 
             value={roleFilter}
             onChange={(e) => setRoleFilter(e.target.value)}
             className="w-full md:w-48 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all outline-none shadow-sm appearance-none cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="Nurse">Nurse</option>
            <option value="Admin">Admin</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Technician">Technician</option>
            <option value="Pharmacist">Pharmacist</option>
          </select>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden shadow-2xl shadow-primary-500/5">
        <div className="overflow-x-auto min-w-[1000px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6">Staff Member</th>
                <th className="px-8 py-6">Designation</th>
                <th className="px-8 py-6">Shift & Dept</th>
                <th className="px-8 py-6">Contact info</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i}>
                    <td colSpan="5" className="px-8 py-6"><div className="h-12 bg-slate-50 animate-pulse rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredStaff.length > 0 ? (
                filteredStaff.map((person) => (
                  <tr key={person._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-sm uppercase border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:bg-primary-600 group-hover:text-white transition-all">
                             {person.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{person.name}</span>
                             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Hired: {new Date(person.hireDate).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-slate-700">{person.role}</span>
                             <div className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${getStatusStyle(person.status)}`}>{person.status}</div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">₹{person.salary}/mo</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                             <Clock className="w-3.5 h-3.5 text-primary-500" />
                             {person.shift}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 pl-5">{person.department}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                             <Mail className="w-3.5 h-3.5 text-slate-300" />
                             {person.contact.email}
                          </span>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                             <Phone className="w-3.5 h-3.5 text-slate-300" />
                             {person.contact.phone}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                          {/* RBAC: Only users with update permission can edit staff */}
                          {can('update') && (
                            <button 
                              onClick={() => {
                                setEditingStaff(person);
                                setIsModalOpen(true);
                              }}
                              className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 rounded-xl shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
                            >
                               <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {/* RBAC: Only users with delete permission can remove staff */}
                          {can('delete') && (
                            <button 
                              onClick={() => handleDelete(person._id)}
                              className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
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
                   <td colSpan="5" className="px-8 py-24 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200 mb-4 border-2 border-dashed border-slate-200">
                         <Users className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">No personnel records found</h3>
                      <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1 font-medium">Refine your search parameters or onboard your first staff member.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchStaff}
        editStaff={editingStaff}
      />
    </div>
  );
};

export default Staff;
