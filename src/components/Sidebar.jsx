import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Calendar, UserPlus, 
  FileText, Activity, ShieldCheck, MessageSquare,
  CreditCard, Package, Settings, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { unreadMessages } = useSocket();

  const totalUnread = Object.values(unreadMessages).reduce((a, b) => a + b, 0);

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" />, roles: ['admin', 'doctor', 'patient', 'staff'] },
    { 
      title: 'Messages', 
      path: '/messages', 
      icon: <MessageSquare className="w-5 h-5" />, 
      roles: ['admin', 'doctor', 'patient', 'staff'], 
      badge: totalUnread > 0 ? totalUnread : null
    },
    { title: 'Appointments', path: '/appointments', icon: <Calendar className="w-5 h-5" />, roles: ['admin', 'doctor', 'patient', 'staff'] },
    { title: 'Patients', path: '/patients', icon: <Users className="w-5 h-5" />, roles: ['admin', 'doctor', 'staff'] },
    { title: 'Doctors', path: '/doctors', icon: <UserPlus className="w-5 h-5" />, roles: ['admin', 'doctor', 'staff', 'patient'] },
    { title: 'Medical Records', path: '/records', icon: <FileText className="w-5 h-5" />, roles: ['admin', 'doctor', 'patient'] },
    { title: 'Billing', path: '/billing', icon: <CreditCard className="w-5 h-5" />, roles: ['admin', 'staff'] },
    { title: 'Doctors Management', path: '/doctors-management', icon: <ShieldCheck className="w-5 h-5" />, roles: ['admin'] },
    { title: 'Staff', path: '/staff', icon: <Activity className="w-5 h-5" />, roles: ['admin'] },
    { title: 'Inventory', path: '/inventory', icon: <Package className="w-5 h-5" />, roles: ['admin', 'staff'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-100 z-50 flex flex-col shadow-sm">
      <div className="h-16 flex items-center px-8 border-b border-slate-100 gap-3 group shrink-0">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-primary-500 transition-all scale-95 group-hover:scale-100">
          <Activity className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1 group-hover:text-primary-600 transition-colors">Saini's</span>
          <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase pl-0.5">Hospital v2.0</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {filteredMenu.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <div className="relative">
              {item.icon}
              {item.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce-slow">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.title}</span>
          </NavLink>
        ))}
        
        <div className="h-px bg-slate-50 mx-4 my-6"></div>
        
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="p-4 bg-slate-50/50 mt-auto border-t border-slate-100">
        <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold uppercase overflow-hidden border-2 border-white shadow-sm">
            {user?.profileImage ? (
               <img 
                 src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:9090${user.profileImage}`} 
                 alt="User" 
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   e.target.onerror = null;
                   e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name);
                 }}
               />
            ) : (
               user?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-900 truncate">{user?.name}</span>
            <span className="text-[10px] text-primary-600 font-medium uppercase tracking-wider">{user?.role}</span>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
