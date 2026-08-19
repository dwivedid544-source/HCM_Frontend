import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Activity, Bot, TrendingUp, Brain } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative min-h-screen lg:h-screen flex items-center pt-28 lg:pt-24 pb-8 overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-primary-50 rounded-full blur-[120px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 w-full mt-2 lg:mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 lg:space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-sm border border-primary-100">
              <Sparkles size={14} fill="currentColor" />
              <span>Next-Gen Workforce OS</span>
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-black drop-shadow-lg tracking-tighter leading-[1.05]">
              Transform Workforce <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Management</span> with AI
            </h1>
            <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              Manage recruitment, onboarding, payroll, attendance, performance and compliance in one intelligent platform powered by proprietary AI models.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/book-demo')} 
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                Book Demo
              </button>
            </div>
            <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 font-bold">Enterprise Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-primary-500" />
                <span className="text-[10px] font-black text-slate-400 font-bold">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Automation</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-lg lg:max-w-none mx-auto"
          >
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-3 border border-slate-100 relative z-10">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                alt="Dashboard Preview"
                className="rounded-[2rem] w-full object-cover"
              />
            </div>
            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 w-56 p-4 bg-white rounded-2xl shadow-xl border border-slate-50 z-20 hidden xl:block"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hiring Efficiency</p>
                  <p className="text-lg font-black text-slate-900">+42%</p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '74%' }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -left-6 w-56 p-4 bg-slate-900 rounded-2xl shadow-xl z-20 hidden xl:block"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  <Brain size={16} />
                </div>
                <span className="text-[10px] font-bold text-white tracking-tight">AI Screening Success</span>
              </div>
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: i === 1 ? '90%' : '75%' }} className="h-full bg-primary-400" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
