import React from 'react';
import CenterModal from './CenterModal';
import { AlertCircle, HelpCircle, LogOut } from 'lucide-react';
import { cn } from '../../../utils/cn';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning" // warning, danger, info
}) => {
  const icons = {
    warning: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
    danger: { icon: LogOut, color: 'text-rose-500', bg: 'bg-rose-50' },
    info: { icon: HelpCircle, color: 'text-primary-500', bg: 'bg-primary-50' }
  };

  const { icon: Icon, color, bg } = icons[type] || icons.warning;

  return (
    <CenterModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-8 text-center">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6", bg)}>
          <Icon size={32} className={color} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2 dark:text-white">{title}</h3>
        <p className="text-sm font-medium text-slate-500 mb-8">{message}</p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={onClose}
            className="w-full sm:flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "w-full sm:flex-1 py-3.5 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95",
              type === 'danger' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" : "bg-primary-600 hover:bg-primary-700 shadow-primary-200"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </CenterModal>
  );
};

export default ConfirmDialog;
