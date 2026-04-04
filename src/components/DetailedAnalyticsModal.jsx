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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-3xl border border-white/20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header Section: Professional & Silkier */}
        <div className="relative px-12 py-10 border-b border-slate-50 bg-gradient-to-br from-white to-slate-50/50 flex-shrink-0">
          <div className="absolute top-0 right-0 p-8">
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-200 text-slate-400 hover:text-slate-600 group active:scale-90"
            >
              <X className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200 ring-1 ring-slate-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <PieChart className="w-8 h-8 relative z-10" />
             </div>
             <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Institutional Intelligence Matrix</h2>
                <div className="flex items-center gap-3 mt-1">
                   <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Clinical Feed</p>
                   </div>
                   <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Operational Unit Alpha-9</p>
                </div>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 space-y-14 custom-scrollbar">
           
           {/* Detailed Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="p-10 bg-white rounded-[2.8rem] space-y-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 group">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Revenue</span>
                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                       <TrendingUp className="w-4 h-4" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                       <span className="text-lg font-bold text-slate-300">₹</span>
                       <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{stats.totalRevenue?.toLocaleString()}</h3>
                    </div>
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 pt-2">
                       <ArrowUpRight className="w-4 h-4" /> 
                       <span className="tracking-tight uppercase tracking-widest text-[10px]">+14.8% Institutional Growth</span>
                    </p>
                 </div>
              </div>

              <div className="p-10 bg-white rounded-[2.8rem] space-y-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 group">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Patient Base</span>
                    <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                       <Users className="w-4 h-4" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{(stats.totalPatients + 120)?.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 pt-2">
                       <Zap className="w-4 h-4" /> 
                       <span className="tracking-tight uppercase tracking-widest text-[10px]">8.5% Retention Efficiency</span>
                    </p>
                 </div>
              </div>

              <div className="p-10 bg-white rounded-[2.8rem] space-y-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 group">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Adherence</span>
                    <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                       <Target className="w-4 h-4" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">98.4%</h3>
                    <p className="text-xs font-bold text-amber-600 flex items-center gap-1.5 pt-2">
                       <Activity className="w-4 h-4" /> 
                       <span className="tracking-tight uppercase tracking-widest text-[10px]">Operational Peak Performance</span>
                    </p>
                 </div>
              </div>
           </div>

           {/* Hospital Traffic Breakdown */}
           <div className="space-y-10">
              <div className="flex items-center justify-between px-2">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Operational Flow Distribution</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Clinical Movements • Cycle 742</p>
                 </div>
                 <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Temporal Window: Last 30 Cycles</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 <div className="space-y-10">
                    {traffic.map((stat, i) => {
                       const colors = {
                          Outpatient: 'bg-indigo-600',
                          Inpatient: 'bg-emerald-500',
                          Emergency: 'bg-rose-500'
                       };
                       const textColors = {
                          Outpatient: 'text-indigo-600',
                          Inpatient: 'text-emerald-500',
                          Emergency: 'text-rose-500'
                       };
                       return (
                          <div key={i} className="space-y-4 group">
                             <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${colors[stat.label]}`}></div>
                                      <p className="text-sm font-black text-slate-800 uppercase tracking-wider">{stat.label} Services</p>
                                   </div>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] ml-4">Clinical Priority Protocol: Delta-0{i+1}</p>
                                </div>
                                <span className={`text-4xl font-black tracking-tighter ${textColors[stat.label]}`}>{stat.value}%</span>
                             </div>
                             <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                <div 
                                  className={`h-full ${colors[stat.label] || 'bg-slate-400'} transition-all duration-1000 shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)] rounded-full`} 
                                  style={{ width: `${stat.value}%` }}
                                >
                                   <div className="w-full h-full bg-gradient-to-r from-transparent to-white/20"></div>
                                </div>
                             </div>
                          </div>
                        );
                    })}
                 </div>

                 {/* Departmental Metrics Bar Chart (CSS) */}
                 <div className="bg-slate-900 rounded-[3rem] p-12 flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-indigo-900/10">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 to-slate-900 pointer-events-none"></div>
                    <div className="relative z-10 w-full">
                       <div className="flex items-center justify-between mb-10">
                          <h4 className="text-white/60 font-black uppercase text-[10px] tracking-[0.3em]">Clinical Resource Saturation</h4>
                          <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                             <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Active Units</span>
                          </div>
                       </div>
                       <div className="flex items-end justify-between h-56 gap-6 px-4">
                          {[65, 84, 45, 92, 72, 58].map((height, i) => (
                             <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                <div 
                                  className="w-full bg-white/5 group-hover:bg-indigo-500/20 transition-all duration-700 rounded-2xl relative group/bar overflow-hidden"
                                  style={{ height: `100%` }}
                                >
                                   <div 
                                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-1000 delay-[i*100ms] rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                                      style={{ height: `${height}%` }}
                                   >
                                      <div className="absolute top-0 left-0 w-full h-8 bg-white/20 blur-sm"></div>
                                   </div>
                                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity z-20">
                                      {height}%
                                   </div>
                                </div>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">UNIT 0{i+1}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                    <Activity className="absolute bottom-[-60px] right-[-60px] w-64 h-64 text-white/[0.02] group-hover:rotate-12 transition-all duration-1000 pointer-events-none" />
                 </div>
              </div>
           </div>

           {/* Prediction Row */}
           <div className="bg-indigo-950 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between border border-white/10 shadow-3xl shadow-indigo-900/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-10 relative z-10 w-full md:w-auto">
                 <div className="w-20 h-20 bg-white/5 rounded-[1.8rem] flex items-center justify-center text-indigo-100 shadow-inner group-hover:scale-105 transition-transform duration-500 backdrop-blur-xl">
                    <Zap className="w-10 h-10" />
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                       <h4 className="text-xl font-black text-white uppercase tracking-tight">Predictive Clinical Forecasting</h4>
                       <span className="px-2 py-0.5 bg-indigo-500 text-white text-[8px] font-black uppercase rounded-[4px] tracking-widest">AI Core Active</span>
                    </div>
                    <p className="text-indigo-200/60 font-medium text-sm max-w-lg leading-relaxed">
                       Heuristic modeling anticipates a <span className="text-white font-bold">12.4% influx</span> in Outpatient requirements over the next 48 hours. Strategic resource buffer of <span className="text-indigo-400 font-bold">Grade-A Medical Personnel</span> is highly recommended.
                    </p>
                 </div>
              </div>
              <button className="mt-8 md:mt-0 bg-white text-slate-950 font-black px-12 py-5 rounded-[1.5rem] hover:bg-indigo-50 transition-all uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95 relative z-10 overflow-hidden group/btn">
                 <span className="relative z-10">Run Neural Simulation</span>
                 <div className="absolute inset-0 bg-indigo-100 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
              </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default DetailedAnalyticsModal;
