import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, FileKey, CheckCircle } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function SecurityCompliance() {
  return (
    <section className="pt-20 pb-20 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600 rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600 rounded-full blur-[150px] opacity-20 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full mb-6 border border-slate-700">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Enterprise Security</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-6 leading-tight">
              Bank-grade security. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Zero compromises.</span>
            </h2>
            <p className="text-lg text-slate-400 font-medium mb-10 max-w-xl">
              We employ military-grade encryption, automated threat detection, and stringent access controls to ensure your workforce data remains strictly confidential and compliant.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: Lock, title: "End-to-End Encryption", desc: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3)." },
                { icon: FileKey, title: "Role-Based Access Control (RBAC)", desc: "Granular permissions ensure employees only see what they need to see." },
                { icon: CheckCircle, title: "Continuous Auditing", desc: "Automated compliance checks and immutable audit logs for every action." }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="p-3 bg-slate-800 text-emerald-400 rounded-xl mt-1 shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-4 sm:gap-6"
          >
            {[
              { title: "SOC 2 Type II", desc: "Certified secure infrastructure" },
              { title: "GDPR Ready", desc: "Full EU data privacy compliance" },
              { title: "ISO 27001", desc: "Information security management" },
              { title: "HIPAA", desc: "Healthcare data protection" }
            ].map((badge, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-[2rem] hover:bg-slate-800 transition-colors">
                <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center mb-4 text-white">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="text-lg font-black text-white tracking-tight mb-2">{badge.title}</h4>
                <p className="text-xs text-slate-400 font-medium">{badge.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
