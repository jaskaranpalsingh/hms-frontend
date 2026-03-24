import React, { useEffect, useState } from 'react';
import { 
  FileText, Search, Filter, 
  Calendar, User, Stethoscope, 
  Download, Eye, RefreshCw,
  PlusCircle, ArrowRight
} from 'lucide-react';
import { recordService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MedicalRecords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await recordService.getRecords();
      setRecords(res.data.data);
    } catch (err) {
      toast.error('Failed to load clinical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(r => 
    r.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             Clinical Archive
             <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-widest">{filteredRecords.length} Records</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Access historical consultation data and medical documentation.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by patient, diagnosis or doctor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-[2rem]"></div>
          ))
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record._id} className="card group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border-2 border-transparent hover:border-indigo-100/50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-100">
                  {new Date(record.date).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{record.diagnosis}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                    <User className="w-3 h-3" />
                    {record.patientId?.name}
                  </p>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 group-hover:bg-white transition-colors">
                  <p className="text-xs text-slate-500 line-clamp-2 font-medium italic">
                    "{record.notes || 'No observation notes recorded.'}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-primary-600">
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Dr. {record.doctorId?.name?.split(' ')[1] || 'Medical Staff'}</span>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200 mb-6">
                <FileText className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Clinical archive is empty</h3>
             <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2 font-bold uppercase tracking-wider">No consultation records matched your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
