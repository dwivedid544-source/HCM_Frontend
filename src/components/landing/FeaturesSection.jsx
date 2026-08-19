import React from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Calendar, DollarSign, Target, Heart, ShieldCheck, BarChart3, ChevronRight } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const stagger = {
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function FeaturesSection({ setActiveFeature }) {
  return (
    <section id="features" className="pt-12 pb-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Core Capabilities</span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Everything you need to <br /> scale your workforce</h2>
          <p className="text-base text-slate-500 font-medium tracking-tight">Our platform brings together all aspects of HCM into a single, cohesive intelligent ecosystem.</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            { icon: Search, title: 'AI Recruitment', desc: 'Auto-scan resumes and rank candidates with proprietary ML models.' },
            { icon: Zap, title: 'Smart Onboarding', desc: 'Automated document collection and workflow assignment for new hires.' },
            { icon: Calendar, title: 'Time & Attendance Tracking', desc: 'Biometric, geo-fenced and web-based attendance monitoring.' },
            { icon: DollarSign, title: 'Payroll Automation', desc: 'Seamless monthly payouts with integrated tax and deduction rules.' },
            { icon: Target, title: 'Performance KPI', desc: 'Real-time objective tracking and balanced scorecards for teams.' },
            { icon: Heart, title: 'Benefits Mgmt', desc: 'Configure multi-tier insurance, wellness and reimbursement plans.' },
            { icon: ShieldCheck, title: 'Compliance Center', desc: 'Immutable audit logs and organizational policy alignment tools.' },
            { icon: BarChart3, title: 'Reports & Analytics', desc: 'Deep-dive visualization of every metric across your organization.' },
          ].map((feat, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              whileHover={{ y: -8 }}
              className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-100 shadow-soft hover:shadow-2xl transition-all duration-300 group flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-xl w-fit shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all">
                  <feat.icon size={24} />
                </div>
                <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug">{feat.title}</h4>
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed flex-1">{feat.desc}</p>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => setActiveFeature && setActiveFeature(feat)}
                  className="text-xs font-bold text-primary-600 font-bold flex items-center gap-2 group/btn"
                >
                  Learn More <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
