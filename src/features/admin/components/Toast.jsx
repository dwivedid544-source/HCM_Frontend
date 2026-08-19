import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';

const Toast = () => {
  const { toasts } = useAdmin();

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl min-w-[320px] max-w-md border backdrop-blur-md",
              toast.type === 'success' ? "bg-emerald-50/90 border-emerald-100 text-emerald-800" :
              toast.type === 'error' ? "bg-rose-50/90 border-rose-100 text-rose-800" :
              "bg-indigo-50/90 border-indigo-100 text-indigo-800"
            )}
          >
            <div className={cn(
              "shrink-0 p-2 rounded-xl",
              toast.type === 'success' ? "bg-emerald-100 text-emerald-600" :
              toast.type === 'error' ? "bg-rose-100 text-rose-600" :
              "bg-indigo-100 text-indigo-600"
            )}>
              {toast.type === 'success' && <CheckCircle2 size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold tracking-tight leading-tight">{toast.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
