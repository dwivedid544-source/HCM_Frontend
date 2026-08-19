import React from 'react';
import { motion } from 'framer-motion';

export default function EnterpriseLogos() {
  const logos = [
    "Acme Corp",
    "GlobalTech",
    "Nexus Industries",
    "Pinnacle Group",
    "Apex Solutions",
    "Quantum Innovations",
    "Vanguard Systems"
  ];

  return (
    <section className="py-10 bg-white border-b border-slate-100 overflow-hidden">
      <div className="container mx-auto px-6 mb-6 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trusted by modern enterprises globally</p>
      </div>
      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden flex flex-col items-center">
        {/* Gradient fades for edges */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10" />
        
        <div className="flex w-max space-x-12 px-6">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 25,
            }}
            className="flex items-center space-x-12"
          >
            {/* Duplicate array for seamless loop */}
            {[...logos, ...logos].map((logo, index) => (
              <div 
                key={index} 
                className="flex items-center justify-center opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
              >
                <span className="text-xl lg:text-2xl font-black text-slate-800 tracking-tighter whitespace-nowrap">
                  {logo}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
