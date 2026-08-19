import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingDown, Users } from 'lucide-react';

export default function RoiMetrics() {
  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4 inline-block">Measurable Impact</span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-6">
            Real results. Real fast.
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            See the immediate business value of consolidating your HCM processes into a single, intelligent platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: "Time Saved",
              value: "15 hrs",
              subtitle: "per week per HR admin",
              desc: "Automated workflows and self-service portals drastically reduce manual administrative tasks.",
              icon: Clock,
              color: "text-emerald-600",
              bg: "bg-emerald-50"
            },
            {
              title: "Onboarding Time",
              value: "-40%",
              subtitle: "reduction in time-to-productivity",
              desc: "Smart onboarding flows ensure new hires are equipped and ready to contribute faster.",
              icon: TrendingDown,
              color: "text-primary-600",
              bg: "bg-primary-50"
            },
            {
              title: "Retention Rate",
              value: "+22%",
              subtitle: "increase in employee retention",
              desc: "Better engagement, clear performance tracking, and AI-driven attrition prediction.",
              icon: Users,
              color: "text-indigo-600",
              bg: "bg-indigo-50"
            }
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-100 flex flex-col hover:-translate-y-2 transition-transform duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${metric.bg} flex items-center justify-center mb-6`}>
                <metric.icon size={28} className={metric.color} />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{metric.title}</p>
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{metric.value}</h3>
              <p className="text-sm font-bold text-slate-600 mb-6">{metric.subtitle}</p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-6 mt-auto">
                {metric.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
