import React from 'react';
import { AlertTriangle, X, Check, Trash2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'Confirm' }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-500" />,
          iconBg: 'bg-red-50',
          btn: 'bg-red-600 hover:bg-red-700 shadow-red-200',
          border: 'border-red-100'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          iconBg: 'bg-amber-50',
          btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
          border: 'border-amber-100'
        };
      default:
        return {
          icon: <Check className="w-6 h-6 text-primary-600" />,
          iconBg: 'bg-primary-50',
          btn: 'bg-primary-600 hover:bg-primary-700 shadow-primary-200',
          border: 'border-primary-100'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300`}>
        <div className="p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className={`w-24 h-24 ${styles.iconBg} rounded-[2rem] flex items-center justify-center shadow-inner border border-white/40 ring-1 ring-slate-100/50`}>
              {React.cloneElement(styles.icon, { className: 'w-10 h-10' })}
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none px-2">{title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                {message}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full ${styles.btn} text-white font-bold py-5 rounded-[2rem] shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest text-xs relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">{confirmText}</span>
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 font-bold py-4 rounded-[1.5rem] transition-all uppercase tracking-[0.15em] text-[10px] active:scale-[0.98]"
            >
              Revert & Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
