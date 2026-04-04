import React, { useState } from 'react';
import { X, Send, Mail, ShieldCheck, MessageSquare, Clock, Info } from 'lucide-react';
import { messageService } from '../services/api';
import toast from 'react-hot-toast';

const MessageModal = ({ isOpen, onClose, doctor }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen || !doctor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error('Please compose a clinical message');

    if (!doctor.userId) {
      return toast.error('This specialist does not have an active clinical portal account to receive messages.');
    }

    setSending(true);
    try {
      // Direct integration with backend messageService
      await messageService.sendMessage({
        receiver: doctor.userId._id || doctor.userId,
        content: message
      });
      
      toast.success(`Message transmitted to Dr. ${doctor.name}`);
      setMessage('');
      onClose();
    } catch (err) {
      toast.error('Clinical transmission protocols failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header Section: Professional & Silkier */}
        <div className="relative px-10 py-8 border-b border-slate-50 bg-gradient-to-br from-white to-slate-50/50 flex-shrink-0">
          <div className="absolute top-0 right-0 p-6">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200 text-slate-400 hover:text-slate-600 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
          
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 shadow-inner ring-1 ring-indigo-100">
                <Mail className="w-7 h-7" />
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Practitioner Dispatch</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Institutional Message Protocol v5.1</p>
                </div>
             </div>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-10 space-y-8">
          {/* Practitioner Identification Card */}
          <div className="flex items-center gap-5 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck className="w-16 h-16" />
             </div>
             <div className="w-16 h-16 bg-white rounded-[1.25rem] flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-sm border border-slate-100 ring-1 ring-slate-100/50 relative z-10">
                {doctor.name?.charAt(0)}
             </div>
             <div className="flex flex-col relative z-10 space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Dr. {doctor.name}</h3>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">{doctor.specialization}</span>
             </div>
             <div className="ml-auto hidden sm:flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase bg-white px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm relative z-10">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                Verified
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
             <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <h3 className="text-sm font-bold text-slate-800">Clinical Narrative</h3>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      Transmission
                   </div>
                </div>
                <textarea 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Compose symptoms briefing, follow-up request, or clinical inquiry..."
                  className="w-full h-44 px-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700 transition-all shadow-sm placeholder:text-slate-400 resize-none leading-relaxed"
                />
             </div>

             <div className="flex items-start gap-4 p-5 bg-amber-50/50 text-amber-900 rounded-[1.5rem] border border-amber-100 shadow-sm">
                <Info className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
                <p className="text-[11px] font-semibold leading-relaxed tracking-tight">
                   Emergency Protocol: Dispatches are for clinical record keeping. In case of acute medical distress, contact emergency services (ER) immediately.
                </p>
             </div>

             <div className="pt-2">
                <button 
                  type="submit"
                  disabled={sending}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-3xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-4 relative overflow-hidden group disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {sending ? (
                    <>
                       <Clock className="w-5 h-5 animate-spin relative z-10" />
                       <span className="relative z-10 tracking-tight">Transmitting dispatch...</span>
                    </>
                  ) : (
                    <>
                       <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
                       <span className="relative z-10 tracking-tight uppercase tracking-widest text-xs">Dispatch Message</span>
                    </>
                  )}
                </button>
             </div>
          </form>

          <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-50 select-none opacity-50">
             <ShieldCheck className="w-4 h-4 text-slate-400" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutional Encryption Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
