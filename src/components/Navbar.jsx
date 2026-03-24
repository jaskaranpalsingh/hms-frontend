import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadMessages } = useSocket();

  const totalUnread = unreadMessages 
    ? Object.values(unreadMessages).reduce((a, b) => a + b, 0) 
    : 0;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-50 flex items-center justify-between px-6 lg:pl-72 shadow-sm">
      <div className="flex items-center gap-4 w-1/2">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search patients, appointments, doctors..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-slate-50 rounded-full transition-colors group">
          <Bell className="w-5 h-5 text-slate-600 group-hover:text-primary-600" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce-slow">
              {totalUnread}
            </span>
          )}
        </button>
        
        <div className="h-8 w-px bg-slate-100 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[150px]">{user?.name || 'Guest'}</span>
            <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">{user?.role}</span>
          </div>
          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 ring-2 ring-white transition-all overflow-hidden border-2 border-white">
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
