import React from 'react';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function HowItWorksSection() {
  return (
    <section className="pt-12 pb-12 bg-slate-50">
      <div className="container mx-auto px-6 text-center">
        <motion.div {...fadeIn} className="max-w-2xl mx-auto mb-12 space-y-4">
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Implementation</span>
          <h2 className="text-4xl lg:text-6xl font-black text-black tracking-tighter">Your journey to <br /> smart HR in 4 steps</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-[60px] inset-x-32 h-[2px] bg-slate-200 border-dashed border-t-2" />

          {[
            { step: '01', title: 'Setup Org', desc: 'Define roles, departments and global branding in minutes.' },
            { step: '02', title: 'Invite Users', desc: 'Seamlessly onboard your entire workforce with one-click.' },
            { step: '03', title: 'Automate', desc: 'Deploy AI modules to handle hiring and compliance.' },
            { step: '04', title: 'Grow', desc: 'Leverage data insights to enhance productivity and retention.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 space-y-6 flex flex-col items-center group"
            >
              <div className="w-16 h-16 bg-white border-2 border-primary-600 rounded-full flex items-center justify-center text-xl font-black text-primary-600 shadow-xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                {item.step}
              </div>
              <h4 className="text-2xl font-black text-black tracking-tight">{item.title}</h4>
              <p className="text-sm font-medium text-slate-600 tracking-tight leading-relaxed max-w-[200px]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
