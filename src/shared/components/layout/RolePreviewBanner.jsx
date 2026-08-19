import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RolePreviewBanner = () => {
  const { previewRole, exitPreview } = useAuth();

  return (
    <AnimatePresence>
      {previewRole && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          <div className="bg-slate-900 text-white px-6 py-2 rounded-b-2xl shadow-xl border border-slate-700 flex items-center gap-4 pointer-events-auto">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-amber-400" />
              <span className="text-sm font-bold tracking-wide">
                Previewing as <span className="uppercase text-amber-400 ml-1">{previewRole}</span>
              </span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <button
              onClick={exitPreview}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg"
            >
              <X size={14} />
              Exit Preview
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RolePreviewBanner;
