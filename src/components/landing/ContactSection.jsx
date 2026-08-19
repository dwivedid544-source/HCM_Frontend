import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { publicAPI } from '../../utils/apiService';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function ContactSection() {
  const [contactFormStep, setContactFormStep] = useState(1);
  const [contactFormSubmitting, setContactFormSubmitting] = useState(false);
  const [contactFormData, setContactFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [contactFormError, setContactFormError] = useState('');

  return (
    <section id="contact" className="pt-12 pb-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          <motion.div {...fadeIn} className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Get In Touch</span>
              <h2 className="text-4xl lg:text-5xl font-black text-black tracking-tighter leading-none">
                Let's Discuss <br /> Your Workforce.
              </h2>
              <p className="text-base text-slate-500 font-medium leading-relaxed tracking-tight">
                Reach out to our global team for sales inquiries, custom integrations, or dedicated enterprise support.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: Mail, label: 'Email Support', val: 'info@aihcm.com', href: 'mailto:info@aihcm.com' },
                { icon: Phone, label: 'Call HQ', val: '9800000199', href: 'tel:9800000199' },
                { icon: MapPin, label: 'HQ Location', val: '100 Pine St, Suite 1250, San Francisco, CA', href: '#' }
              ].map((item, i) => (
                <a href={item.href} key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-soft hover:border-primary-500 transition-all group">
                  <div className="p-3 bg-primary-50 text-primary-600 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-all">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{item.val}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-[2rem] shadow-soft flex items-center gap-4 w-fit">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                Live Status: Support Desk online (Avg response &lt; 2 hrs)
              </p>
            </div>
          </motion.div>

          <motion.div {...fadeIn} className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-soft h-full flex flex-col justify-center">
              {contactFormStep === 1 ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setContactFormSubmitting(true);
                  setContactFormError('');
                  try {
                    await publicAPI.submitContact(contactFormData);
                    setContactFormStep(2);
                  } catch (err) {
                    setContactFormError(err.response?.data?.error?.message || 'Failed to submit inquiry. Please try again.');
                  } finally {
                    setContactFormSubmitting(false);
                  }
                }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactFormData.name}
                        onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                        placeholder="Alex Rivera"
                        className="w-full px-4 py-4 rounded-xl bg-slate-50 border-transparent font-medium text-slate-950 outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactFormData.email}
                        onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                        placeholder="alex@company.com"
                        className="w-full px-4 py-4 rounded-xl bg-slate-50 border-transparent font-medium text-slate-950 outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Inquiry Topic</label>
                    <select
                      value={contactFormData.subject}
                      onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
                      className="w-full px-4 py-4 rounded-xl bg-slate-50 border-transparent font-medium text-slate-950 cursor-pointer outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Sales / Enterprise Pricing">Sales & Enterprise Pricing</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Partnerships">Partnership Inquiry</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={contactFormData.message}
                      onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                      placeholder="How can we help your team?"
                      className="w-full px-4 py-4 rounded-xl bg-slate-50 border-transparent font-medium text-slate-950 resize-none outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {contactFormError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600">
                      {contactFormError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={contactFormSubmitting}
                    className="w-full bg-primary-600 text-white rounded-xl py-4 shadow-xl shadow-primary-200 font-bold flex items-center justify-center gap-3 text-xs hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {contactFormSubmitting ? "Sending..." : "Submit Inquiry"} <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-8 py-6">
                  <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                    <CheckCircle2 size={48} className="animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-emerald-600 font-bold block">Inquiry Dispatched</span>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                      Thank you, {contactFormData.name}!
                    </h3>
                    <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                      We've received your request regarding <strong>{contactFormData.subject}</strong>. A tracking confirmation has been sent to <strong>{contactFormData.email}</strong>.
                    </p>
                    <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto font-medium">
                      An AI HCM representative will review your message and reach out to you within two business hours.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setContactFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                      setContactFormStep(1);
                    }}
                    className="bg-primary-600 text-white rounded-xl px-8 py-4 shadow-xl shadow-primary-200 font-bold text-[10px] w-full max-w-xs mx-auto hover:bg-primary-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
