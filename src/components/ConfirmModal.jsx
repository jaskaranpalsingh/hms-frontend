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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border-2 ${styles.border} overflow-hidden animate-in zoom-in-95 duration-300`}>
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-20 h-20 ${styles.iconBg} rounded-[2rem] flex items-center justify-center shadow-lg border-4 border-white`}>
              {styles.icon}
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{title}</h3>
              <p className="text-sm text-slate-600 font-bold leading-relaxed px-2">
                {message}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full ${styles.btn} text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-[0.2em] text-[11px]`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-100/50 hover:bg-slate-200/50 text-slate-500 font-black py-4 rounded-2xl transition-all uppercase tracking-[0.1em] text-[10px]"
            >
              Cancel & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
