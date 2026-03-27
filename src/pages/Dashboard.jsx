import React, { useEffect, useState } from 'react';
import { 
  Users, Calendar, Activity, 
  TrendingUp, ArrowUpRight, ArrowDownRight, 
  ChevronRight, MoreHorizontal 
} from 'lucide-react';
import { analyticsService } from '../services/api';
import QuickAppointmentModal from '../components/QuickAppointmentModal';
import DetailedAnalyticsModal from '../components/DetailedAnalyticsModal';
import useRBAC from '../hooks/useRBAC';  // ← RBAC
import Can from '../components/Can';  // ← RBAC

const StatCard = ({ title, value, icon, change, isPositive, loading }) => (
  <div className="card group hover:bg-primary-600 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-500 transition-colors">
        {icon}
      </div>
      {change && !loading && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
          isPositive ? 'bg-green-100 text-green-600 group-hover:bg-green-500/20 group-hover:text-white' : 'bg-red-100 text-red-600 group-hover:bg-red-500/20 group-hover:text-white'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}%
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-500 text-sm font-medium group-hover:text-primary-100 transition-colors uppercase tracking-wider">{title}</h3>
      {loading ? (
        <div className="h-8 w-24 bg-slate-100 group-hover:bg-primary-500/30 animate-pulse rounded"></div>
      ) : (
        <p className="text-2xl font-bold text-slate-900 group-hover:text-white transition-colors">{value}</p>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const { isAdmin, role } = useRBAC();  // ← RBAC
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getStats();
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data?.stats || {};

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Dashboard Overview
            <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-3 py-1 rounded-full uppercase tracking-widest">v2.0 Beta</span>
          </h1>
          <p className="text-slate-500 font-medium">Welcome back, here's what's happening at Saini's Hospital today.</p>
        </div>
        {/* RBAC: Only clinical personnel/admin can quick book */}
        {role !== 'patient' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 group shadow-lg shadow-primary-500/20"
          >
            <Calendar className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Quick Appointment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-0.5">
        <StatCard 
          title="Total Patients" 
          value={stats.totalPatients?.toLocaleString() || '0'} 
          icon={<Users className="w-6 h-6 text-primary-600 group-hover:text-white" />} 
          change="8.5" 
          isPositive={true}
          loading={loading}
        />
        <StatCard 
          title="All Appointments" 
          value={stats.totalAppointments?.toLocaleString() || '0'} 
          icon={<Calendar className="w-6 h-6 text-primary-600 group-hover:text-white" />} 
          change="12.3" 
          isPositive={true}
          loading={loading}
        />
        <StatCard 
          title="Active Doctors" 
          value={stats.activeDoctors || '0'} 
          icon={<Activity className="w-6 h-6 text-primary-600 group-hover:text-white" />} 
          change="2.1" 
          isPositive={false}
          loading={loading}
        />
        {/* RBAC: Revenue stats only for Admin */}
        {isAdmin && (
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue?.toLocaleString() || '0'}`} 
            icon={<TrendingUp className="w-6 h-6 text-primary-600 group-hover:text-white" />} 
            change="14.8" 
            isPositive={true}
            loading={loading}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Today's Appointments
              <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
            </h2>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-all">View All Schedule</button>
          </div>
          
          <div className="overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4">Patient</th>
                  <th className="pb-4">Doctor</th>
                  <th className="pb-4">Time Slot</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td colSpan="5" className="py-4"><div className="h-10 bg-slate-50 animate-pulse rounded-lg w-full"></div></td>
                    </tr>
                  ))
                ) : data?.todayAppointments?.length > 0 ? (
                  data.todayAppointments.map((app) => (
                    <tr key={app._id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">{app.patientId?.name?.charAt(0)}</div>
                          <span className="text-sm font-semibold text-slate-700">{app.patientId?.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-medium text-slate-600">Dr. {app.doctorId?.name}</span>
                      </td>
                      <td className="py-4 text-sm font-semibold text-primary-600">{app.timeSlot}</td>
                      <td className="py-4">
                         <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-green-100 text-green-700 rounded-md">{app.status}</span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-2 transition-colors rounded-lg hover:bg-white border border-transparent hover:border-slate-100 shadow-sm opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">No appointments scheduled for today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-bold text-slate-800">Hospital Traffic</h2>
             <span className="text-xs font-bold text-slate-400">DAILY UNIT</span>
          </div>
          <div className="space-y-6">
            {(data?.trafficDistribution || [
              { label: 'Outpatient', value: 0 },
              { label: 'Inpatient', value: 0 },
              { label: 'Emergency', value: 0 },
            ]).map((stat, i) => {
              const colors = {
                 Outpatient: 'bg-primary-500',
                 Inpatient: 'bg-green-500',
                 Emergency: 'bg-red-500'
              };
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-slate-600">
                    <span>{stat.label}</span>
                    <span>{stat.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full ${colors[stat.label] || 'bg-slate-400'} transition-all duration-1000 shadow-sm`} 
                      style={{ width: `${stat.value}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* RBAC: Detailed analytics only for Admin */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-50">
              <button 
                onClick={() => setIsAnalyticsOpen(true)}
                className="w-full flex items-center justify-between text-sm font-bold text-primary-600 hover:text-primary-700 group transition-all"
              >
                View Detailed Analytics
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

      <QuickAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchStats}
      />

      <DetailedAnalyticsModal 
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        data={data}
      />
    </div>
  );
};

export default Dashboard;
