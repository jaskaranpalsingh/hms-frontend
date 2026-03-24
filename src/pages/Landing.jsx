import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Phone, Calendar, HeartPulse, 
  Stethoscope, Activity, FileText, ArrowRight, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-500 selection:text-white">

      {/* Main Navbar */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
                <img src="/hospital-logo.png" alt="Saini's Hospital Logo" className="w-full h-full object-cover scale-150" onError={(e) => { e.target.onerror=null; e.target.parentElement.innerHTML = '<Activity class="w-6 h-6"/>'; }} />
             </div>
             <div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">Saini's</h1>
                <p className="text-[10px] font-bold tracking-widest uppercase text-primary-600">Hospital</p>
             </div>
          </NavLink>

          <nav className="hidden xl:flex items-center gap-6 text-sm font-bold text-slate-700">
             <a href="#" className="hover:text-primary-600 transition-colors">Hospitals ▾</a>
             <a href="#" className="hover:text-primary-600 transition-colors">Specialities ▾</a>
             <a href="#" className="hover:text-primary-600 transition-colors">Centre of Excellence ▾</a>
             <a href="#" className="hover:text-primary-600 transition-colors">Media Centre ▾</a>
             <a href="#" className="hover:text-primary-600 transition-colors">Medical Services ▾</a>
             <a href="#" className="hover:text-primary-600 transition-colors">Patient Corner ▾</a>
          </nav>

          <div className="flex items-center gap-3">
             <NavLink to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-primary-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all">
                Sign In
             </NavLink>
             <NavLink to="/register" className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-95 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Register
             </NavLink>
          </div>
        </div>
        
        {/* Quick Actions Bar */}
        <div className="bg-white border-t border-slate-100 hidden md:block">
           <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-center gap-12 text-sm font-bold text-slate-700">
              <a href="#" className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                 <Phone className="w-4 h-4 text-primary-600" /> Request a Callback
              </a>
              <a href="#" className="flex items-center gap-2 px-6 py-2 bg-rose-50 text-rose-700 rounded-full hover:bg-rose-100 transition-colors shadow-sm">
                 <Calendar className="w-4 h-4" /> Book Appointment
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                 <Stethoscope className="w-4 h-4 text-primary-600" /> Get Health Checkup
              </a>
           </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-900">
           <img 
             src="/hero-bg.png" 
             alt="Doctors in modern hospital" 
             className="w-full h-full object-cover opacity-60"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center w-full max-w-4xl px-4 animate-in slide-in-from-bottom-8 duration-1000">
          <div className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-[3rem] shadow-2xl inline-block mb-10 border border-white/50">
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Healthcare for Good <br/>
                <span className="text-primary-600">Today. Tomorrow. Always</span>
             </h1>
          </div>
          
          <div className="max-w-2xl mx-auto relative group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
             <input 
               type="text" 
               placeholder="Search for Doctors, Specialities and Hospitals" 
               className="w-full pl-16 pr-6 py-6 rounded-[2rem] text-lg font-bold bg-white text-slate-900 focus:outline-none focus:ring-8 focus:ring-primary-500/20 shadow-2xl placeholder:text-slate-400 transition-all border border-slate-100"
             />
             <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-3 rounded-full hover:bg-primary-600 transition-colors active:scale-95">
                <ArrowRight className="w-5 h-5" />
             </button>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           
           {/* Left Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer border border-amber-100 group">
                 <h3 className="text-xl font-black text-slate-800">Book an <br/> Appointment</h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 mb-8">With country's leading experts</p>
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm ml-auto group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Calendar className="w-5 h-5" />
                 </div>
              </div>
              <div className="bg-sky-50 rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer border border-sky-100 group">
                 <h3 className="text-xl font-black text-slate-800">Hospitals</h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 mb-8">Health needs under one roof</p>
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-sky-500 shadow-sm ml-auto group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <Activity className="w-5 h-5" />
                 </div>
              </div>
              <div className="bg-indigo-50 rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer border border-indigo-100 group">
                 <h3 className="text-xl font-black text-slate-800">Specialities</h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 mb-8">Focusing on your health</p>
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm ml-auto group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <HeartPulse className="w-5 h-5" />
                 </div>
              </div>
              <div className="bg-rose-50 rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer border border-rose-100 group">
                 <h3 className="text-xl font-black text-slate-800">Doctors</h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 mb-8">Treatment by experienced medics</p>
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm ml-auto group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <Stethoscope className="w-5 h-5" />
                 </div>
              </div>
           </div>

           {/* Right Section */}
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">We can help you book</h2>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 hover:border-primary-600 transition-colors cursor-pointer text-center group">
                    <div className="w-16 h-16 mx-auto bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                       <Stethoscope className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900">Health Checkups</h4>
                 </div>
                 <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 hover:border-primary-600 transition-colors cursor-pointer text-center group">
                    <div className="w-16 h-16 mx-auto bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                       <FileText className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900">Tests & Services</h4>
                 </div>
                 <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 hover:border-primary-600 transition-colors cursor-pointer text-center group">
                    <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                       <Phone className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900">Online Consultations</h4>
                 </div>
              </div>
           </div>
        </div>
      </section>
      

    </div>
  );
};

export default Landing;
