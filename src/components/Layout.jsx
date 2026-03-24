import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex transition-all duration-300">
      {/* Sidebar - Fixed Left */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64">
        {/* Navbar - Fixed Top */}
        <Navbar onLogout={() => console.log('User logged out')} />

        {/* Dynamic Page Content */}
        <main className="p-8 pt-24 bg-slate-50 min-h-screen smooth-scroll overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-top-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
