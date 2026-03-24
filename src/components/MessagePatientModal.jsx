import React, { useState } from 'react';
import { X, Send, Mail, ShieldCheck, MessageSquare, Clock, Info } from 'lucide-react';
import { messageService } from '../services/api';
import toast from 'react-hot-toast';

const MessagePatientModal = ({ isOpen, onClose, patient }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error('Please compose a clinical message');

    if (!patient.userId) {
      return toast.error('This patient does not have an active clinical portal account to receive messages.');
    }

    setSending(true);
    try {
      await messageService.sendMessage({
        receiver: patient.userId._id || patient.userId,
        content: message
      });
      
      toast.success(`Message transmitted to ${patient.name}`);
      setMessage('');
      onClose();
    } catch (err) {
      toast.error('Clinical transmission protocols failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border-2 border-slate-50 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-primary-600 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/20">
                <Mail className="w-6 h-6" />
             </div>
             <div className="space-y-0.5">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Patient Comms</h2>
                <p className="text-[10px] text-primary-100 font-bold uppercase tracking-[0.2em]">Secure Patient Communication</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                {patient.name?.charAt(0)}
             </div>
             <div className="flex flex-col">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{patient.name}</h3>
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">ID: #{patient.patientId}</span>
             </div>
             <div className="ml-auto flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase bg-green-50 px-2 py-1 rounded-md">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   Verified Patient
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                   <MessageSquare className="w-3 h-3 text-primary-500" />
                   Clinical Dispatch Message
                </label>
                <textarea 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Compose your message regarding prescriptions, test results, or follow-ups..."
                  className="w-full h-40 px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all resize-none shadow-inner text-sm leading-relaxed"
                />
             </div>

             <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100/50">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tight">
                   Note: This message will be recorded in the patient communication log and is legally discoverable.
                </p>
             </div>

             <button 
               type="submit"
               disabled={sending}
               className="w-full bg-slate-900 hover:bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50 group"
             >
               {sending ? (
                 <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Transmitting...
                 </>
               ) : (
                 <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Transmit Message
                 </>
               )}
             </button>
          </form>

          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-50">
             <ShieldCheck className="w-4 h-4 text-slate-300" />
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">End-to-End Hospital Encryption Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePatientModal;
