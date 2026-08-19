import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onCancel, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) => {
  const handleClose = onCancel || onClose || (() => {});

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl z-[210] overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                  <AlertTriangle size={24} />
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                  <X size={20} />
                </button>
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 dark:text-white">{title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
              
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={handleClose}
                  className="flex-1 py-3.5 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    handleClose();
                  }}
                  className={`flex-1 py-3.5 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                    type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
