import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function RoleBasedSection() {
  const [activeRole, setActiveRole] = useState(null);

  return (
    <section id="roles" className="pt-16 pb-4 bg-slate-50 text-slate-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-primary-600 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeIn}>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-6 inline-block">Experience-Centric Design</span>
            <h2 className="text-4xl lg:text-7xl font-black tracking-tighter leading-none mb-10 text-black">
              Unified Experience, <br />
              <span className="text-primary-600">Dedicated Portals.</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium mb-12 leading-relaxed">
              We've engineered specialized high-fidelity interfaces for every role in your organization, ensuring maximum efficiency and minimal learning curve.
            </p>
            <div className="space-y-6">
              {[
                { role: 'Candidate', action: 'Apply jobs, check resume score' },
                { role: 'Employee', action: 'Track attendance, manage payroll' },
                { role: 'Manager', action: 'Approve leave, review team KPI' },
                { role: 'HR / Recruiter', action: 'Manage pipeline, publish job posts' },
                { role: 'Admin', action: 'Full organization oversight & AI config' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 group cursor-pointer p-4 rounded-2xl hover:bg-white hover:shadow-soft transition-all" onClick={() => setActiveRole(item)}>
                  <div className="w-2 h-2 bg-primary-500 rounded-full group-hover:scale-125 transition-transform" />
                  <div className="flex-1">
                    <span className="text-lg font-black tracking-tight text-slate-800 group-hover:text-primary-600 transition-colors">{item.role}</span>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{item.action}</p>
                  </div>
                  <ArrowRight size={20} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeIn}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {[
              { title: 'Candidate Portal', img: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=2671' },
              { title: 'Manager Suite', img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2670' },
              { title: 'Employee Hub', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671' },
              { title: 'Admin Control', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670' },
            ].map((card, i) => (
              <div key={i} className={cn("relative group rounded-[2.5rem] overflow-hidden aspect-[4/5]", i % 2 !== 0 ? "sm:mt-12" : "")}>
                <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-xs font-black uppercase tracking-widest text-primary-300 mb-2">Role Experience</p>
                  <h4 className="text-2xl font-black tracking-tight text-white drop-shadow-lg">{card.title}</h4>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
        {activeRole && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            >
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => setActiveRole(null)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-slate-800"
                >
                  <X size={20} />
                </button>
                <h3 className="text-xl font-bold mb-4">{activeRole.role}</h3>
                <p className="text-sm text-slate-600">{activeRole.action}</p>
                {/* Additional dynamic content can be placed here */}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
