import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { publicAPI, settingsAPI } from '../../utils/apiService';
import { useCurrency } from '../../hooks/useCurrency';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function PricingSection() {
  const navigate = useNavigate();
  const { getSymbol, convertAmount } = useCurrency();
  const currencySymbol = getSymbol();
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('Monthly'); // 'Monthly' | 'Yearly'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch plans
        const plansRes = await publicAPI.getPricingPlans();
        if (plansRes.data && plansRes.data.success) {
          setPlans(plansRes.data.data || []);
        }
      } catch (err) {
        setError('Failed to fetch pricing options.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter out only active plans and sort by displayOrder
  const activePlans = plans
    .filter(plan => plan.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section id="pricing" className="pt-24 pb-24 bg-slate-50 relative overflow-hidden text-left">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-50 rounded-full blur-[160px] opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto space-y-6 mb-16">
          <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg rotate-12 transition-transform hover:rotate-0">
            <Zap size={36} />
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Simple pricing for <br /> modern enterprises.
          </h2>
          <p className="text-lg text-slate-500 font-medium tracking-tight max-w-2xl mx-auto">
            Choose a plan that fits your workforce size. No hidden fees or onboarding costs.
          </p>

          {/* Billing Cycle Toggle */}
          {activePlans.length > 0 && (
            <div className="inline-flex items-center gap-2 p-1.5 bg-slate-200/60 backdrop-blur-md rounded-2xl border border-slate-200 mt-6 select-none">
              <button
                onClick={() => setBillingCycle('Monthly')}
                className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  billingCycle === 'Monthly' 
                    ? 'bg-white text-slate-900 shadow-md' 
                    : 'text-slate-550 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('Yearly')}
                className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 ${
                  billingCycle === 'Yearly' 
                    ? 'bg-white text-slate-900 shadow-md' 
                    : 'text-slate-550 hover:text-slate-900'
                }`}
              >
                Yearly Billing
                <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-bold">
                  Save
                </span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft h-[500px] animate-pulse space-y-6">
                <div className="w-1/3 h-6 bg-slate-150 rounded-lg"></div>
                <div className="w-2/3 h-4 bg-slate-100 rounded"></div>
                <div className="w-1/2 h-12 bg-slate-150 rounded-xl my-6"></div>
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="flex gap-3">
                      <div className="w-5 h-5 bg-slate-150 rounded-full"></div>
                      <div className="flex-1 h-4 bg-slate-100 rounded"></div>
                    </div>
                  ))}
                </div>
                <div className="w-full h-12 bg-slate-150 rounded-2xl pt-10"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card p-12 text-center border border-slate-150 bg-rose-50/20 max-w-md mx-auto rounded-3xl">
            <AlertCircle className="mx-auto text-rose-500 mb-4" size={36} />
            <h4 className="text-lg font-bold text-slate-900">Failed to load options</h4>
            <p className="text-slate-500 text-sm mt-1">{error}</p>
          </div>
        ) : activePlans.length === 0 ? (
          <div className="card p-16 text-center border border-slate-100 shadow-soft max-w-lg mx-auto rounded-3xl bg-white">
            <Sparkles className="mx-auto text-primary-400 mb-4" size={48} />
            <h4 className="text-lg font-bold text-slate-800">Custom Subscription Plans</h4>
            <p className="text-slate-500 text-sm mt-2">
              Our workforce solutions are tailored to your company's custom SLA requirements. Contact our enterprise team to build your sandbox mapping.
            </p>
            <button
              onClick={() => navigate('/book-demo')}
              className="btn-primary mt-6 px-8 py-3.5 font-bold rounded-xl"
            >
              Contact Solutions Desk
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {activePlans.map((plan, idx) => {
              // Calculate price based on toggle
              const displayPrice = billingCycle === 'Yearly' 
                ? (plan.billingCycle === 'Monthly' ? plan.monthlyPrice : plan.yearlyPrice / 12)
                : plan.monthlyPrice;
              
              const convertedDisplayPrice = Math.round(convertAmount(displayPrice));
              const convertedYearlyPrice = Math.round(convertAmount(plan.yearlyPrice));
              
              const commitmentText = billingCycle === 'Yearly' && plan.billingCycle !== 'Monthly'
                ? `Billed annually (${currencySymbol}${convertedYearlyPrice.toLocaleString()}/yr)`
                : `Billed monthly`;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className={`relative rounded-[2.5rem] p-8 lg:p-10 border transition-all flex flex-col justify-between hover:shadow-premium ${
                    plan.isPopular 
                      ? 'bg-white border-primary-500 shadow-xl shadow-primary-500/5 ring-2 ring-primary-500/10' 
                      : 'bg-white/80 backdrop-blur-md border-slate-100 shadow-soft'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <span className="absolute -top-3.5 right-8 px-4 py-1.5 bg-primary-600 rounded-full text-[9px] font-bold text-white shadow-lg shadow-primary-900/10">
                      Most Popular
                    </span>
                  )}

                  <div>
                    {/* Header Details */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold font-bold text-slate-800">{plan.name}</h3>
                      <p className="text-slate-500 text-xs font-bold leading-relaxed h-10 line-clamp-2">{plan.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="my-8">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-black tracking-tighter text-slate-900">
                          {currencySymbol}{convertedDisplayPrice.toLocaleString()}
                        </span>
                        <span className="text-sm font-semibold text-slate-400 ml-1.5">/month</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 font-bold mt-2">{commitmentText}</p>
                    </div>

                    {/* Core Plan Limits & Features */}
                    <div className="space-y-4 pt-6 border-t border-slate-100 mb-10">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-slate-600">
                          {plan.maxEmployees === 9999 ? 'Unlimited' : `Up to ${plan.maxEmployees}`} Employees
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-slate-600">
                          {plan.supportLevel}
                        </span>
                      </div>
                      {plan.features && plan.features.map((item, fIdx) => (
                        <div key={item.id || fIdx} className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-xs font-bold text-slate-650">{item.feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Action */}
                  <button
                    onClick={() => {
                      if (plan.buttonLink.startsWith('http')) {
                        window.location.href = plan.buttonLink;
                      } else if (plan.buttonLink === '/book-demo') {
                        navigate(plan.buttonLink);
                      } else {
                        // Route to the SaaS onboarding signup with selected plan details
                        navigate(`/register-organization?plan=${encodeURIComponent(plan.name)}&billing=${billingCycle}`);
                      }
                    }}
                    className={`w-full py-4.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                      plan.isPopular
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-750'
                        : 'bg-slate-900 text-white shadow-lg shadow-slate-100 hover:bg-slate-800'
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                  </button>

                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Trust Footer */}
        <p className="text-[10px] font-bold text-slate-400 font-bold text-center mt-16">
          Trusted by 5,000+ Teams Worldwide
        </p>
      </div>
    </section>
  );
}
