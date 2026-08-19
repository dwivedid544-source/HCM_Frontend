import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function Testimonials() {
  return (
    <section className="pt-24 pb-24 bg-slate-50 text-slate-900 border-t border-slate-100">
      <div className="container mx-auto px-6">
        <motion.div {...fadeIn} className="text-center mb-16 space-y-4">
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Customer Success</span>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-black">Loved by Industry Leaders</h2>
          <p className="text-slate-500 font-medium">Join 500+ enterprises modernizing their workforce with our platform.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            { name: 'Sarah Jenkins', role: 'HR Director', co: 'TechGlobal', quote: "The AI recruitment engine saved us 200+ hours in the first month of implementation." },
            { name: 'David Chen', role: 'COO', co: 'ScaleUp Systems', quote: "Unified payroll and compliance across 12 countries. It just works seamlessly." },
            { name: 'Marcus Aurelius', role: 'Founder', co: 'Empire Inc.', quote: "The cleanest HCM interface I've seen in 20 years. My employees actually love using it." },
          ].map((t, i) => (
            <motion.div
              key={i}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-100 p-10 lg:p-12 rounded-[3.5rem] relative hover:shadow-2xl transition-all group shadow-soft flex flex-col"
            >
              <div className="flex gap-1 mb-8">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" className="text-amber-400" />)}
              </div>
              <p className="text-xl font-bold italic text-slate-600 leading-relaxed mb-10 group-hover:text-slate-900 transition-colors flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-5 mt-auto">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center text-lg font-black shrink-0">{t.name[0]}</div>
                <div>
                  <p className="font-black tracking-tight text-slate-900">{t.name}</p>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{t.role} • {t.co}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
