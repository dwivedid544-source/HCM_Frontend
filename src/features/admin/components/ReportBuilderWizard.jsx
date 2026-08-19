import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X, ChevronRight, CheckCircle2, Download } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';

const steps = ['Select Modules', 'Configure Visuals', 'Export & Run'];

const ReportBuilderWizard = ({ isOpen, onClose, initialCategory = null }) => {
  const { showToast } = useAdmin();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModules, setSelectedModules] = useState(initialCategory ? [initialCategory] : []);
  const [visuals, setVisuals] = useState('Charts & Tables');
  const [status, setStatus] = useState('idle');

  const modules = ['Workforce Analytics', 'Financials', 'Hiring Performance', 'Compliance', 'AI Insights'];

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setSelectedModules(initialCategory ? [initialCategory] : []);
      setStatus('idle');
    }
  }, [isOpen, initialCategory]);

  const toggleModule = (mod) => {
    setSelectedModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
  };

  const handleRun = () => {
    setStatus('generating');
    setTimeout(() => {
      setStatus('finished');
      showToast('Custom Report generated successfully.');
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status !== 'generating' ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-3xl max-h-[85vh] bg-white shadow-2xl z-[120] flex flex-col rounded-[2.5rem] overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <BarChart3 size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">Report Builder</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Custom Analytics Engine</p>
                 </div>
              </div>
              {status !== 'generating' && (
                 <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                   <X size={20} />
                 </button>
              )}
            </div>

            <div className="flex bg-slate-50 border-b border-slate-100">
              {steps.map((step, idx) => (
                <div key={idx} className={cn("flex-1 py-4 text-center border-b-2 font-bold text-xs uppercase tracking-widest transition-colors", currentStep === idx ? "border-indigo-600 text-indigo-600" : currentStep > idx ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : "border-transparent text-slate-400")}>
                  {idx + 1}. {step}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
               {currentStep === 0 && (
                 <div className="space-y-6 animate-fade-in">
                    <h3 className="font-extrabold text-slate-900 dark:text-white">Which datasets should be included?</h3>
                    <div className="grid grid-cols-2 gap-4">
                       {modules.map(mod => (
                          <div key={mod} onClick={() => toggleModule(mod)} className={cn("p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between", selectedModules.includes(mod) ? "border-indigo-600 bg-indigo-50/20" : "border-slate-100 bg-white hover:border-slate-200")}>
                             <span className="font-bold text-slate-700">{mod}</span>
                             <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", selectedModules.includes(mod) ? "bg-indigo-600 text-white" : "bg-slate-100")}>
                                {selectedModules.includes(mod) && <CheckCircle2 size={14} />}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {currentStep === 1 && (
                 <div className="space-y-6 animate-fade-in">
                    <h3 className="font-extrabold text-slate-900 dark:text-white">Select visualization format</h3>
                    <div className="space-y-4">
                       {['Charts & Tables', 'Summary Only', 'Raw Data (CSV format)'].map(vis => (
                          <div key={vis} onClick={() => setVisuals(vis)} className={cn("p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4", visuals === vis ? "border-indigo-600 bg-indigo-50/20" : "border-slate-100 bg-white hover:border-slate-200")}>
                             <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", visuals === vis ? "border-indigo-600" : "border-slate-300")}>
                                {visuals === vis && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                             </div>
                             <span className="font-bold text-slate-700">{vis}</span>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {currentStep === 2 && (
                 <div className="space-y-8 animate-fade-in flex flex-col items-center justify-center min-h-[300px]">
                    {status === 'idle' && (
                       <div className="text-center max-w-sm">
                          <h3 className="text-2xl font-bold text-slate-900 mb-2 dark:text-white">Ready to compile</h3>
                          <p className="text-sm font-medium text-slate-500 mb-8">Selected {selectedModules.length} module(s) to render with {visuals}.</p>
                          <button onClick={handleRun} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl w-full">Compile & Generate</button>
                       </div>
                    )}
                    {status === 'generating' && (
                       <div className="text-center">
                          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aggregating Data...</h3>
                          <p className="text-xs font-bold text-slate-400 font-bold mt-2">{selectedModules.join(', ')}</p>
                       </div>
                    )}
                    {status === 'finished' && (
                       <div className="text-center space-y-6">
                          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                             <CheckCircle2 size={40} />
                          </div>
                          <div>
                             <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Custom Report Ready</h3>
                             <p className="text-sm font-medium text-slate-500 mt-2">Available in your downloads.</p>
                          </div>
                          <button onClick={onClose} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 mx-auto"><Download size={18} /> Download Now</button>
                       </div>
                    )}
                 </div>
               )}
            </div>

            {status === 'idle' && (
               <div className="p-8 border-t border-slate-100 bg-white flex justify-between shrink-0">
                  <button onClick={() => currentStep > 0 ? setCurrentStep(p => p - 1) : onClose()} className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50">{currentStep > 0 ? 'Back' : 'Cancel'}</button>
                  {currentStep < 2 && (
                     <button onClick={() => selectedModules.length > 0 && setCurrentStep(p => p + 1)} disabled={selectedModules.length === 0} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">Next Step <ChevronRight size={18} /></button>
                  )}
               </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default ReportBuilderWizard;
