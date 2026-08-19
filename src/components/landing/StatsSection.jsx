import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Users, Brain } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function StatsSection() {
  return (
    <section className="pt-20 pb-12 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[
            { label: 'Faster Hiring', val: '10x', desc: 'AI-driven screening', icon: Zap },
            { label: 'System Uptime', val: '99.9%', desc: 'Enterprise reliability', icon: ShieldCheck },
            { label: 'Experience Roles', val: '5', desc: 'Custom portals', icon: Users },
            { label: 'Smart Insights', val: '24/7', desc: 'Real-time analytics', icon: Brain },
          ].map((stat, i) => (
            <motion.div
              key={i}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-soft border border-slate-100 flex flex-col items-center text-center group hover:bg-primary-600 transition-all duration-500"
            >
              <div className="p-4 bg-primary-100 text-primary-700 rounded-2xl mb-6 group-hover:bg-white/20 group-hover:text-white transition-colors">
                <stat.icon size={28} />
              </div>
              <h3 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter group-hover:text-white">{stat.val}</h3>
              <p className="text-sm font-black text-slate-800 uppercase tracking-widest group-hover:text-primary-100 mb-1">{stat.label}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-white/60">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
