import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Activity, Users, FileText, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Admin Center', 'Employee Hub', 'Hiring Suite', 'Team Manager'];

  // Mock dashboard content components to make it interactive
  const renderDashboardContent = () => {
    switch(activeTab) {
      case 0:
        return (
          <div className="w-full h-full bg-slate-50 p-6 flex flex-col gap-4">
            <div className="flex gap-4 h-1/3">
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-xs font-bold text-slate-500 mb-2">Total Headcount</p>
                <div className="text-3xl font-black text-slate-900">1,248</div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1">+12 this month</div>
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-xs font-bold text-slate-500 mb-2">System Uptime</p>
                <div className="text-3xl font-black text-slate-900">99.99%</div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1">Operational</div>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col">
              <p className="text-xs font-bold text-slate-500 mb-4">Activity Overview</p>
              <div className="flex-1 border-b border-l border-slate-100 relative">
                {/* Fake chart lines */}
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d="M0 80 Q 25 50 50 60 T 100 20" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className="text-primary-500"
                  />
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    d="M0 90 Q 25 70 50 80 T 100 40" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className="text-emerald-500 opacity-50"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="w-full h-full bg-slate-50 p-6 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200"></div>
              <div>
                <div className="text-lg font-black text-slate-900">Welcome back, Sarah!</div>
                <div className="text-sm text-slate-500">Software Engineer • Product Team</div>
              </div>
            </div>
            <div className="flex gap-4 flex-1">
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-xs font-bold text-slate-500 mb-4">Upcoming Tasks</p>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-slate-300"></div>
                      <div className="flex-1 h-3 bg-slate-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-xs font-bold text-slate-500 mb-4">Time Off Balance</p>
                <div className="text-3xl font-black text-slate-900">14 <span className="text-sm font-medium text-slate-500">days</span></div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <div className="text-slate-400 font-medium">Interactive Demo Available on Booking</div>
          </div>
        );
    }
  };

  return (
    <section className="pt-12 pb-12">
      <div className="container mx-auto px-6">
        <motion.div {...fadeIn} className="text-center mb-10 px-4">
          <h2 className="text-4xl lg:text-5xl font-black text-black tracking-tighter mb-6 leading-none">Designed for <span className="text-primary-600">Visual High Fidelity</span></h2>
          <p className="text-lg text-slate-500 font-medium tracking-tight">Experience our premium interfaces designed for every role.</p>
        </motion.div>

        <div className="p-4 bg-slate-50 rounded-[4rem] border border-slate-100 shadow-inner">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-8 lg:p-12">
              <div className="flex flex-wrap items-center gap-3 lg:gap-6 mb-12">
                {tabs.map((tab, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveTab(i)}
                    className={cn(
                      "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === i ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                    )}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="aspect-video bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center relative overflow-hidden group">
                
                {/* Interactive Dashboard Content */}
                <div className="absolute inset-0 z-10">
                  {renderDashboardContent()}
                </div>

                {/* Overlay for "Play Video" effect */}
                <div className="absolute inset-0 bg-primary-900/5 z-20 pointer-events-none group-hover:bg-transparent transition-colors duration-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
