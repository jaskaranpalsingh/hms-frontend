import React from 'react';
import { 
  X, TrendingUp, Users, 
  Calendar, Briefcase, Activity,
  ArrowUpRight, ArrowDownRight,
  Target, Zap, PieChart
} from 'lucide-react';

const DetailedAnalyticsModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const stats = data?.stats || {};
  const traffic = data?.trafficDistribution || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-3xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-primary-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
                <PieChart className="w-7 h-7" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Global Clinical Analytics</h2>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Performance Metrics</p>
                </div>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900 active:scale-95 group"
          >
            <X className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
           
           {/* Detailed Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-4 border border-slate-100">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Revenue</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Rs. {stats.totalRevenue?.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                       <ArrowUpRight className="w-4 h-4" /> +14.8% growth
                    </p>
                 </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-4 border border-slate-100">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Base</span>
                    <Users className="w-4 h-4 text-primary-500" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{(stats.totalPatients + 120)?.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-primary-600 flex items-center gap-1">
                       <Zap className="w-4 h-4" /> 8.5% retention
                    </p>
                 </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-4 border border-slate-100">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                    <Target className="w-4 h-4 text-amber-500" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">98.4%</h3>
                    <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
                       <Activity className="w-4 h-4" /> Operational Peak
                    </p>
                 </div>
              </div>
           </div>

           {/* Hospital Traffic Breakdown */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Hospital Traffic Distribution</h3>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 30 Days</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    {traffic.map((stat, i) => {
                       const colors = {
                          Outpatient: 'bg-primary-600',
                          Inpatient: 'bg-green-500',
                          Emergency: 'bg-red-500'
                       };
                       return (
                          <div key={i} className="space-y-3">
                             <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                   <p className="text-sm font-black text-slate-900 uppercase">{stat.label}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Clinical Priority Level: 0{i+1}</p>
                                </div>
                                <span className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}%</span>
                             </div>
                             <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className={`h-full ${colors[stat.label] || 'bg-slate-400'} transition-all duration-1000 shadow-lg`} 
                                  style={{ width: `${stat.value}%` }}
                                ></div>
                             </div>
                          </div>
                       );
                    })}
                 </div>

                 {/* Departmental Metrics Bar Chart (CSS) */}
                 <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                       <h4 className="text-white font-black uppercase text-sm tracking-widest mb-8">Departmental Load Factor</h4>
                       <div className="flex items-end justify-between h-48 gap-4 px-2">
                          {[65, 84, 45, 92, 72, 58].map((height, i) => (
                             <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <div 
                                  className="w-full bg-primary-500/20 group-hover:bg-primary-500 transition-all duration-700 rounded-t-xl relative group/bar"
                                  style={{ height: `${height}%` }}
                                >
                                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                      {height}%
                                   </div>
                                </div>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">D0{i+1}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                    <Activity className="absolute bottom-[-40px] right-[-40px] w-48 h-48 text-white/[0.03] group-hover:scale-110 transition-transform duration-1000" />
                 </div>
              </div>
           </div>

           {/* Prediction Row */}
           <div className="bg-primary-50 rounded-[2.5rem] p-10 flex items-center justify-between border-2 border-primary-100">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-xl shadow-primary-500/10">
                    <Zap className="w-8 h-8" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-900 uppercase">Intelligent Prediction</h4>
                    <p className="text-sm font-bold text-slate-500 max-w-md">Based on current trends, we anticipate a 12% increase in outpatient traffic next week. Operational buffers recommended.</p>
                 </div>
              </div>
              <button className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10">
                 Run Full Simulation
              </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default DetailedAnalyticsModal;
