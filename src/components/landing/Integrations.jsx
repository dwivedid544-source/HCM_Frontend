import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, AppWindow, Database, MessagesSquare, LayoutGrid } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function Integrations() {
  const integrations = [
    { name: "Slack", icon: MessagesSquare, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Google Workspace", icon: LayoutGrid, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Microsoft Teams", icon: AppWindow, color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Salesforce", icon: Database, color: "text-cyan-600", bg: "bg-cyan-50" },
    { name: "Workday ERP", icon: Workflow, color: "text-orange-600", bg: "bg-orange-50" }
  ];

  return (
    <section className="pt-24 pb-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4 inline-block">Ecosystem Connectivity</span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-6">
            Plays perfectly with your <br /> existing tech stack.
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Over 100+ native integrations. Connect your favorite tools in one click and build automated workflows across your entire organization.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting lines graphic (CSS only) */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent -translate-y-1/2 hidden md:block" />
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {integrations.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center group cursor-pointer relative z-10"
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 border border-slate-100`}>
                  <item.icon size={36} className={`${item.color} group-hover:scale-110 transition-transform`} />
                </div>
                <span className="text-sm font-bold text-slate-700 tracking-tight">{item.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
