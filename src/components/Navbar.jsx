import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'Alert': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'Emergency': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Check': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'Reminder': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-primary-500" />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 flex items-center justify-between px-8 lg:pl-72 transition-all duration-300">
      <div className="flex items-center gap-4 w-1/2">
        <div className="relative w-full max-w-md hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-medium focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-2xl transition-all duration-300 border ${
              showNotifications ? 'bg-primary-50 border-primary-100 text-primary-600 shadow-inner' : 'hover:bg-slate-50 border-transparent text-slate-600'
            }`}
          >
            <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-swing' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-1 ring-primary-100">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100/50 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-300 origin-top-right">
              <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-gradient-to-br from-white to-slate-50/50">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-900 tracking-tight">Notifications</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Medical Updates</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar px-2 py-2">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id}
                      onClick={() => !notif.isRead && markNotificationAsRead(notif._id)}
                      className={`p-4 rounded-2xl mb-1 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer relative group ${!notif.isRead ? 'bg-primary-50/20' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-sm border ${
                          notif.type === 'Alert' || notif.type === 'Emergency' ? 'bg-rose-50 border-rose-100' : 
                          notif.type === 'Check' ? 'bg-emerald-50 border-emerald-100' : 
                          notif.type === 'Reminder' ? 'bg-blue-50 border-blue-100' : 'bg-primary-50 border-primary-100'
                        }`}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm font-bold truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] font-bold text-slate-300 uppercase shrink-0">{getTimeAgo(notif.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-slate-100/50">
                      <Bell className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">All caught up!</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium px-10">No new medical alerts or reminders for your account.</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50/50 border-t border-slate-50">
                <Link 
                  to="/notifications" 
                  onClick={() => setShowNotifications(false)}
                  className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm flex items-center justify-center"
                >
                  View Activity Center
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-slate-100 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[150px]">{user?.name || 'Guest'}</span>
            <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">{user?.role}</span>
          </div>
          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 ring-2 ring-white transition-all overflow-hidden border-2 border-white shadow-sm">
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
               <User className="w-5 h-5" />
            )}
          </div>
          <button 
            onClick={logout}
            className="ml-2 p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors tooltip flex items-center gap-1 group"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs hidden group-hover:block transition-all font-bold">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
