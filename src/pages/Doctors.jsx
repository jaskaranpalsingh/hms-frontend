import React, { useEffect, useState } from 'react';
import { 
  UserPlus, Search, Star, 
  Mail, Phone, Clock, 
  MapPin, CheckCircle2, MoreHorizontal 
} from 'lucide-react';
import { doctorService } from '../services/api';
import AddDoctorModal from '../components/AddDoctorModal';
import QuickAppointmentModal from '../components/QuickAppointmentModal';
import MessageModal from '../components/MessageModal';
import { useAuth } from '../context/AuthContext';

const Doctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Modal States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getDoctors({ search: searchTerm });
      setDoctors(res.data.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm]);

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Medical Faculty
            <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-3 py-1 rounded-full uppercase tracking-widest">{doctors.length || 0} Specialties</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage hospital doctors, their specialties, and availability schedules.</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center justify-center gap-2 group shadow-lg shadow-primary-500/20"
          >
            <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Add New Doctor
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 focus:text-primary-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or specialization..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} className="card h-64 animate-pulse bg-slate-50 border-dashed"></div>
          ))
        ) : doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div key={doctor._id} className="card group hover:bg-slate-50/50 hover:shadow-xl transition-all duration-500 border-2 hover:border-primary-100">
              <div className="flex gap-5 mb-6">
                <div className="relative">
                   <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold rotate-2 group-hover:rotate-0 transition-transform duration-300 shadow-xl shadow-primary-500/20">
                      {doctor.name?.charAt(0)}
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight transition-colors group-hover:text-primary-600 uppercase">Dr. {doctor.name}</h3>
                    <button className="p-1 hover:bg-white rounded-lg transition-colors">
                       <MoreHorizontal className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                    </button>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-primary-100/50 w-max px-2 py-1 rounded-md mt-1">{doctor.specialization}</span>
                  <div className="flex items-center gap-1 mt-2 text-yellow-500">
                     {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                     <span className="text-xs font-bold text-slate-400 ml-1">5.0</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100/60">
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail className="w-4 h-4 text-primary-500/60" />
                  <span className="text-sm font-medium truncate">{doctor.contact?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Phone className="w-4 h-4 text-primary-500/60" />
                  <span className="text-sm font-medium">{doctor.contact?.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Clock className="w-4 h-4 text-primary-500/60" />
                  <span className="text-sm font-medium truncate">
                     {doctor.availability?.length > 0 
                       ? `${doctor.availability[0].day}: ${doctor.availability[0].startTime} - ${doctor.availability[0].endTime}` 
                       : 'No Schedule'}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <button 
                   onClick={() => {
                     setSelectedDoctor(doctor);
                     setIsMessagingOpen(true);
                   }}
                   className="flex-1 bg-white border-2 border-slate-100 hover:border-primary-600 text-slate-600 hover:text-primary-600 font-bold text-sm py-3 rounded-xl transition-all shadow-sm active:scale-95 group/btn flex items-center justify-center gap-2"
                 >
                    <Mail className="w-4 h-4 group-hover/btn:scale-110" />
                    Message
                 </button>
                 <button 
                   onClick={() => {
                     setSelectedDoctor(doctor);
                     setIsBookingOpen(true);
                   }}
                   className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all text-center"
                 >
                    Book Visit
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-4">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <UserPlus className="w-10 h-10 text-slate-200" />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800">No Specialists Found</h3>
                <p className="text-slate-400 font-medium">Clear search or add a new doctor member profile.</p>
             </div>
          </div>
        )}
      </div>

      <AddDoctorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchDoctors}
      />

      <QuickAppointmentModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialDoctorId={selectedDoctor?._id}
        onRefresh={() => {}} // Could refresh dashboard if needed
      />

      <MessageModal 
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default Doctors;
