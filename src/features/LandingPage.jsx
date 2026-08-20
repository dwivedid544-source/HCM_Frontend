import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  Activity,
  Brain,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  BarChart3,
  Target,
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Lock,
  Globe,
  Bot,
  PieChart,
  CheckCircle2,
  HelpCircle,
  Mail,
  Share2,
  ChevronDown,
  Search,
  Heart,
  Play,
  MapPin,
  Phone,
  UploadCloud,
  Award,
  Building,
  Code,
  Fingerprint,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useCurrency } from '../hooks/useCurrency';
import PhoneInput from '../shared/components/ui/PhoneInput';
import { publicAPI } from '../utils/apiService';

import HeroSection from '../components/landing/HeroSection';
import EnterpriseLogos from '../components/landing/EnterpriseLogos';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import RoleBasedSection from '../components/landing/RoleBasedSection';
import AiAutomationSection from '../components/landing/AiAutomationSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import DashboardPreview from '../components/landing/DashboardPreview';
import Testimonials from '../components/landing/Testimonials';
import SecurityCompliance from '../components/landing/SecurityCompliance';
import Integrations from '../components/landing/Integrations';
import RoiMetrics from '../components/landing/RoiMetrics';
import PricingSection from '../components/landing/PricingSection';
import FaqSection from '../components/landing/FaqSection';
import CareersSection from '../components/landing/CareersSection';
import ContactSection from '../components/landing/ContactSection';

const LandingPage = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Demo modal states
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [demoFormData, setDemoFormData] = useState({ name: '', email: '', companySize: '11-50', requirement: 'AI Recruitment' });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoError, setDemoError] = useState('');

  // Careers application modal states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyJobTitle, setApplyJobTitle] = useState('');
  const [applyJobId, setApplyJobId] = useState('');
  const [applyStep, setApplyStep] = useState(1);
  const [applyFormData, setApplyFormData] = useState({ name: '', email: '', phone: '', resumeName: '', portfolioUrl: '', explanation: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiScore, setAiScore] = useState(0);
  const [aiEvaluationResult, setAiEvaluationResult] = useState(null);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Contact form states
  const [contactFormData, setContactFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [contactFormStep, setContactFormStep] = useState(1); // 1 = form, 2 = success
  const [contactFormSubmitting, setContactFormSubmitting] = useState(false);
  const [contactFormError, setContactFormError] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
const [activeRole, setActiveRole] = useState(null);

  const navigate = useNavigate();

  // Generate dynamic available dates (next 4 business days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    let currentDate = new Date(today);
    
    // Start from tomorrow
    currentDate.setDate(currentDate.getDate() + 1);
    
    while (dates.length < 4) {
      const dayOfWeek = currentDate.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });
        const dayNum = currentDate.getDate();
        dates.push(`${dayName}, ${monthName} ${dayNum}`);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const stagger = {
    whileInView: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary-200 selection:text-primary-900 scroll-smooth transition-colors duration-300 overflow-x-hidden">
      {/* 1. NAVBAR */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-300 border-b",
        scrolled ? "bg-white/95 backdrop-blur-xl border-slate-200 py-3 shadow-md" : "bg-white/75 backdrop-blur-md border-slate-100 py-5"
      )}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200 group-hover:rotate-6 transition-transform">
              <Zap size={22} fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">AI HCM <span className="text-primary-600">Platform</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {['Home', 'Features', 'Roles', 'Pricing', 'Careers', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-black text-slate-900 hover:text-primary-600 transition-colors uppercase tracking-[0.15em]"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-700 transition-all active:scale-95">Login</button>
            <button onClick={() => { setIsDemoModalOpen(true); setDemoStep(1); }} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95">Book Demo</button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
                {['Home', 'Features', 'Roles', 'Pricing', 'Careers', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-bold text-slate-900"
                  >
                    {item}
                  </a>
                ))}
                <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
                  <button onClick={() => navigate('/login')} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-700 transition-all">Login</button>
                  <button onClick={() => { setIsMenuOpen(false); navigate('/book-demo'); }} className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg">Get Demo</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. HERO SECTION */}
      <HeroSection />

      {/* 3. ENTERPRISE LOGOS */}
      <EnterpriseLogos />

      {/* 4. STATS SECTION */}
      <StatsSection />

      {/* 5. CORE FEATURES SECTION */}
      <FeaturesSection setActiveFeature={setActiveFeature} />

      {/* 6. ROLE-BASED PLATFORM SECTION */}
      <RoleBasedSection />

      {/* 7. AI AUTOMATION SECTION */}
      <AiAutomationSection />

      {/* 8. SECURITY & COMPLIANCE */}
      <SecurityCompliance />

      {/* 9. HOW IT WORKS SECTION */}
      <HowItWorksSection />

      {/* 10. INTEGRATIONS */}
      <Integrations />

      {/* 11. ROI METRICS */}
      <RoiMetrics />

      {/* 12. DASHBOARD PREVIEW SECTION */}
      <DashboardPreview />

      {/* 13. TESTIMONIALS SECTION */}
      <Testimonials />

      {/* 14. PRICING / CTA SECTION */}
      <PricingSection />

      {/* 15. FAQ SECTION */}
      <FaqSection />

      {/* 16. CAREERS SECTION */}
      <CareersSection 
        setApplyJobTitle={setApplyJobTitle} 
        setApplyJobId={setApplyJobId}
        setApplyStep={setApplyStep} 
        setApplyFormData={setApplyFormData} 
        setIsApplyModalOpen={setIsApplyModalOpen} 
      />

      {/* 17. CONTACT SECTION */}
      <ContactSection />


      {/* 12. FOOTER */}
      <footer className="pt-16 pb-8 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16 mb-12">
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform hover:rotate-6">
                  <Zap size={20} fill="currentColor" />
                </div>
                <span className="text-xl font-bold tracking-tighter">AI HCM <span className="text-primary-600">Platform</span></span>
              </Link>
              <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-sm tracking-tight">
                The world's most intelligent workforce management ecosystem. Built for growth-driven enterprises that prioritize their people.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Website link copied to clipboard!");
                  }}
                  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary-600 hover:text-white transition-all"
                  title="Copy Link"
                >
                  <Share2 size={16} />
                </button>
                <a href="/" className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary-600 hover:text-white transition-all" title="Website">
                  <Globe size={16} />
                </a>
                <a href="mailto:support@aihcm.com" className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary-600 hover:text-white transition-all" title="Email Us">
                  <Mail size={16} />
                </a>
              </div>
            </div>

            {[
              {
                title: 'Product',
                links: [
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'API Docs', href: '#features' },
                  { label: 'Integrations', href: '#features' }
                ]
              },
              {
                title: 'Company',
                links: [
                  { label: 'About Us', href: '#roles' },
                  { label: 'Careers', href: '#careers' },
                  { label: 'Brand Guide', href: '#home' },
                  { label: 'Contact', href: '#contact' }
                ]
              },
              {
                title: 'Resources',
                links: [
                  { label: 'Help Center', href: '#faq' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms of Use', href: '#' },
                  { label: 'Security', href: '#' }
                ]
              }
            ].map((col, i) => (
              <div key={i} className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-900">{col.title}</h5>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link.label}>
                      {link.onClick ? (
                        <button
                          onClick={link.onClick}
                          className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors font-bold text-left"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors font-bold"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 AI HCM Platform • Enterprise Grade Workforce OS</p>
            <div className="flex items-center gap-8">

            </div>
          </div>
        </div>
      </footer>

      {/* Book A Demo Modal */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-[calc(100%-2rem)] sm:w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 text-left p-6 sm:p-8 md:p-12 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              {demoStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <span className="text-[10px] font-bold text-primary-600 font-bold mb-2 block">Step 1 of 2</span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                      Tell us about your team
                    </h3>
                    <p className="text-sm font-medium text-slate-400 mt-2">
                      Help us customize the product tour for your organization.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setDemoStep(2);
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 font-bold ml-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={demoFormData.name}
                          onChange={(e) => setDemoFormData({ ...demoFormData, name: e.target.value })}
                          placeholder="Alex Rivera"
                          className="input-field h-14 bg-slate-50 border-transparent font-medium text-slate-950"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                        <input
                          type="email"
                          required
                          value={demoFormData.email}
                          onChange={(e) => setDemoFormData({ ...demoFormData, email: e.target.value })}
                          placeholder="alex@company.com"
                          className="input-field h-14 bg-slate-50 border-transparent font-medium text-slate-950"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Size</label>
                        <select
                          value={demoFormData.companySize}
                          onChange={(e) => setDemoFormData({ ...demoFormData, companySize: e.target.value })}
                          className="input-field h-14 bg-slate-50 border-transparent font-medium text-slate-950 cursor-pointer"
                        >
                          <option value="1-10">1 - 10 Employees</option>
                          <option value="11-50">11 - 50 Employees</option>
                          <option value="51-200">51 - 200 Employees</option>
                          <option value="200+">200+ Employees</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Primary Interest</label>
                        <select
                          value={demoFormData.requirement}
                          onChange={(e) => setDemoFormData({ ...demoFormData, requirement: e.target.value })}
                          className="input-field h-14 bg-slate-50 border-transparent font-medium text-slate-950 cursor-pointer"
                        >
                          <option value="AI Recruitment">AI Recruitment & Scoring</option>
                          <option value="Global Payroll">Global Payroll Suite</option>
                          <option value="Time & Attendance">Time & Attendance Tracking</option>
                          <option value="Enterprise Compliance">Compliance & Policy Mgmt</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full btn-primary h-16 shadow-xl shadow-primary-200 font-bold flex items-center justify-center gap-3 text-xs mt-4"
                    >
                      Choose Date & Time <ArrowRight size={16} />
                    </button>
                  </form>
                </div>
              )}

              {demoStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <span className="text-[10px] font-bold text-primary-600 font-bold mb-2 block">Step 2 of 2</span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                      Schedule a Live Tour
                    </h3>
                    <p className="text-sm font-medium text-slate-400 mt-2">
                      Select a date and time slot for a personalized session with our product strategy team.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Date Cards */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 font-bold ml-1">Available Dates</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {availableDates.map((dateOption) => {
                          const isSelected = selectedDate === dateOption;
                          const [dayName, monthAndNum] = dateOption.split(', ');
                          return (
                            <button
                              key={dateOption}
                              type="button"
                              onClick={() => setSelectedDate(dateOption)}
                              className={cn(
                                "p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center",
                                isSelected
                                  ? "bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-200"
                                  : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600"
                              )}
                            >
                              <span className={cn("text-[9px] font-black uppercase tracking-widest", isSelected ? "text-primary-200" : "text-slate-400")}>
                                {dayName}
                              </span>
                              <span className="text-base font-bold tracking-tight mt-1">
                                {monthAndNum}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 font-bold ml-1">Select Time Slot</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          '09:30 AM',
                          '11:00 AM',
                          '01:30 PM',
                          '03:00 PM'
                        ].map((slot) => {
                          const isSelected = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={cn(
                                "py-3.5 rounded-xl border text-center text-xs font-bold transition-all duration-250",
                                isSelected
                                  ? "bg-primary-600 border-primary-600 text-white shadow-xl"
                                  : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600"
                              )}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {demoError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600">
                        {demoError}
                      </div>
                    )}

                    {/* Submit Confirmation */}
                    <div className="pt-4 flex gap-4">
                      <button
                        onClick={() => setDemoStep(1)}
                        className="flex-1 py-4 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-2xl font-bold text-[10px] transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={async () => {
                          setDemoSubmitting(true);
                          setDemoError('');
                          try {
                            await publicAPI.bookDemo({
                              ...demoFormData,
                              selectedDate,
                              selectedSlot
                            });
                            setDemoStep(3);
                          } catch (err) {
                            setDemoError(err.response?.data?.error?.message || 'Failed to book demo. Please try again.');
                          } finally {
                            setDemoSubmitting(false);
                          }
                        }}
                        disabled={demoSubmitting}
                        className="flex-2 py-4 btn-primary shadow-xl shadow-primary-200 font-bold text-[10px] disabled:opacity-50"
                      >
                        {demoSubmitting ? 'Booking...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {demoStep === 3 && (
                <div className="text-center space-y-10 py-6">
                  <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                    <CheckCircle2 size={48} className="animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-emerald-600 font-bold block">Demo Staged & Booked</span>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none dark:text-white">
                      See you soon, {demoFormData.name}!
                    </h3>
                    <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed mt-2">
                      Your live demonstration of the <strong>{demoFormData.requirement}</strong> module has been scheduled for:
                    </p>
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl max-w-sm mx-auto space-y-2 text-slate-800 mt-4">
                      <div className="flex items-center gap-3 justify-center text-xs font-bold">
                        <Calendar size={16} className="text-primary-600" />
                        <span>{selectedDate}</span>
                      </div>
                      <div className="flex items-center gap-3 justify-center text-xs font-bold">
                        <Clock size={16} className="text-primary-600" />
                        <span>{selectedSlot} (PST Timezone)</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-450 leading-normal max-w-xs mx-auto pt-4">
                      A calendar invite and dynamic meet room link (`meet.google.com/hcm-ai-demo`) has been dispatched to your email: <strong>{demoFormData.email}</strong>.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsDemoModalOpen(false)}
                    className="btn-primary w-full max-w-xs mx-auto py-5 shadow-xl shadow-primary-200 font-bold text-[10px]"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Careers Apply Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-[calc(100%-2rem)] sm:w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 text-left p-6 sm:p-8 md:p-12 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              {applyStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <span className="text-[10px] font-bold text-primary-600 font-bold mb-2 block">Step 1 of 2</span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                      Apply for {applyJobTitle}
                    </h3>
                    <p className="text-sm font-medium text-slate-400 mt-2">
                      Please enter your contact details to begin the application.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setApplyStep(2);
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 font-bold ml-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={applyFormData.name}
                          onChange={(e) => setApplyFormData({ ...applyFormData, name: e.target.value })}
                          placeholder="Alex Rivera"
                          className="input-field h-14 bg-slate-50 border-transparent font-medium text-slate-950"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={applyFormData.email}
                          onChange={(e) => setApplyFormData({ ...applyFormData, email: e.target.value })}
                          placeholder="alex@company.com"
                          className="input-field h-14 bg-slate-50 border-transparent font-medium text-slate-950"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <PhoneInput
                          required
                          value={applyFormData.phone}
                          onChange={(e) => setApplyFormData({ ...applyFormData, phone: e.target.value })}
                          className="h-14 bg-slate-50 border-transparent font-medium text-slate-950"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full btn-primary h-16 shadow-xl shadow-primary-200 font-bold flex items-center justify-center gap-3 text-xs mt-4"
                    >
                      Next: Experience details <ArrowRight size={16} />
                    </button>
                  </form>
                </div>
              )}

              {applyStep === 2 && !isAnalyzing && (
                <div className="space-y-8">
                  <div>
                    <span className="text-[10px] font-bold text-primary-600 font-bold mb-2 block">Step 2 of 2</span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                          Tell us about your background
                    </h3>
                    <p className="text-sm font-medium text-slate-400 mt-2">
                      Upload your resume and links for AI-driven candidate ranking evaluation.
                    </p>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsAnalyzing(true);
                      setApplyError('');
                      try {
                        const response = await publicAPI.submitCareerApplication({
                          jobId: applyJobId,
                          jobTitle: applyJobTitle,
                          ...applyFormData
                        });
                        
                        setIsAnalyzing(false);
                        const appData = response?.data?.data || response?.data || {};
                        const parsedScore = typeof appData.aiScore === 'number' ? appData.aiScore : 0;
                        setAiScore(parsedScore);
                        setAiEvaluationResult(appData);
                        setApplyStep(3);
                      } catch (err) {
                        setIsAnalyzing(false);
                        const errMsg = err.response?.data?.error?.message || 'Failed to submit application. Please try again.';
                        setApplyError(errMsg);
                        if (err.response?.data?.error?.code === 'INVALID_RESUME') {
                          // Reset uploaded file state so the candidate is prompted to upload a real CV/resume
                          setApplyFormData(prev => ({ ...prev, resumeName: '', resumeData: '' }));
                        }
                      }
                    }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 font-bold ml-1">Resume Upload</label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-primary-500 rounded-3xl p-6 text-center cursor-pointer transition-all bg-slate-50 flex flex-col items-center justify-center gap-2 group relative">
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx,.txt"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setApplyFormData({ 
                                  ...applyFormData, 
                                  resumeName: file.name,
                                  resumeData: event.target.result
                                });
                                setApplyError('');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <UploadCloud size={32} className="text-slate-450 group-hover:text-primary-600 transition-colors" />
                        {applyFormData.resumeName ? (
                          <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 z-10">
                            <CheckCircle2 size={16} />
                            <span>{applyFormData.resumeName} uploaded successfully</span>
                          </div>
                        ) : (
                          <div className="z-10 flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-slate-800">Click to upload your resume (PDF, DOCX, TXT)</span>
                            <span className="text-[9px] text-slate-450 uppercase font-black tracking-widest">Max file size 10MB</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Portfolio / LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={applyFormData.portfolioUrl}
                        onChange={(e) => setApplyFormData({ ...applyFormData, portfolioUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/alexrivera"
                        className="input-field h-14 bg-slate-50 border-transparent font-medium text-slate-950"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Why do you want to join AI HCM?</label>
                      <textarea
                        required
                        rows={3}
                        value={applyFormData.explanation}
                        onChange={(e) => setApplyFormData({ ...applyFormData, explanation: e.target.value })}
                        placeholder="Share a brief explanation of your qualifications and interest..."
                        className="input-field bg-slate-50 border-transparent font-medium text-slate-950 p-4 resize-none"
                      />
                    </div>

                    {applyError && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 flex items-start gap-3">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-rose-700 dark:text-rose-300">Document Verification Notice</p>
                          <p className="mt-0.5 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{applyError}</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setApplyStep(1)}
                        className="flex-1 py-4 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-2xl font-bold text-[10px] transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={!applyFormData.resumeName}
                        className="flex-2 py-4 btn-primary shadow-xl shadow-primary-200 font-bold text-[10px] disabled:opacity-50"
                      >
                        Submit Application
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {applyStep === 2 && isAnalyzing && (
                <div className="text-center space-y-8 py-12">
                  <div className="w-20 h-20 bg-primary-50 dark:bg-primary-950/40 rounded-3xl flex items-center justify-center mx-auto text-primary-600 dark:text-primary-400 shadow-xl border border-primary-100 dark:border-primary-900/30">
                    <Sparkles size={36} className="animate-spin" />
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest block">Processing Submission</span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none dark:text-white">
                      Submitting Your Application...
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
                      Securely uploading your resume and registering your candidate profile with our hiring team...
                    </p>
                  </div>
                  <div className="w-full max-w-xs mx-auto h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.2, ease: "easeInOut" }}
                      className="h-full bg-primary-600 rounded-full"
                    />
                  </div>
                </div>
              )}

              {applyStep === 3 && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 size={42} className="stroke-[2.5]" />
                  </div>
                  
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800 inline-block">
                      Application Submitted
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug dark:text-white">
                      Thank You for Applying, {applyFormData.name || 'Candidate'}!
                    </h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                      Your application for the <strong>{applyJobTitle}</strong> position has been successfully received.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-md mx-auto text-left space-y-2.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Sparkles size={14} className="text-primary-500" />
                      <span>Application Status & Next Steps</span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Your resume and profile details have been logged in our recruitment system for <strong className="text-slate-900 dark:text-white">{applyFormData.email}</strong>.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Our talent acquisition team will review your qualifications. If your background aligns with the role, an HR partner will reach out to you directly to arrange an introductory interview.
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">
                    We appreciate your interest in our team and wish you the very best!
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsApplyModalOpen(false);
                        setApplyStep(1);
                        setApplyFormData({ name: '', email: '', phone: '', resumeName: '', portfolioUrl: '', explanation: '' });
                        setAiScore(0);
                        setAiEvaluationResult(null);
                        setApplyError('');
                      }}
                      className="btn-primary w-full max-w-xs mx-auto py-3.5 shadow-xl shadow-primary-200 dark:shadow-none font-bold text-xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Feature Details Modal */}
      <AnimatePresence>
        {activeFeature && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveFeature(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 text-left p-6 sm:p-8 md:p-10 z-10 flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveFeature(null)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3.5 bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400 rounded-2xl w-fit">
                  {React.createElement(activeFeature.icon, { size: 28 })}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary-600 font-bold block">Interactive Feature Demo</span>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mt-1">
                    {activeFeature.title}
                  </h3>
                </div>
              </div>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto pr-1 flex-1 space-y-6">
                <p className="text-sm font-medium text-slate-500 leading-relaxed dark:text-slate-400">
                  {activeFeature.desc} Try the live browser-simulated feature block below to see how our intelligent interface handles real-time workforce actions.
                </p>

                {/* Feature Simulator Component Container */}
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                  <FeatureSimulator featureType={activeFeature.title} />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-400 font-medium font-sans">
                    This sandbox runs locally inside your browser session.
                  </p>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveFeature(null)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-705 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                    >
                      Close Demo
                    </button>
                    <button
                      onClick={() => {
                        setActiveFeature(null);
                        setIsDemoModalOpen(true);
                        setDemoStep(1);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-200 dark:shadow-none transition-all"
                    >
                      Book Full Custom Demo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeatureSimulator = ({ featureType }) => {
  // States for Recruitment
  const [recruitmentSearch, setRecruitmentSearch] = useState('');
  const [candidates, setCandidates] = useState([
    { name: "Alice Cooper", role: "Frontend Developer", skills: ["React", "Tailwind", "JavaScript", "HTML"], score: 95 },
    { name: "John Wick", role: "Security Architect", skills: ["Go", "Rust", "Security", "Python"], score: 88 },
    { name: "Sophia Martinez", role: "Backend Engineer", skills: ["Python", "Django", "SQL", "Docker"], score: 92 },
    { name: "Marcus Lee", role: "UI/UX Designer", skills: ["Figma", "UI/UX", "Product", "HTML"], score: 78 }
  ]);

  // States for Onboarding
  const [onboardingTasks, setOnboardingTasks] = useState([
    { id: 1, text: "Sign offer letter & compliance agreement", completed: true },
    { id: 2, text: "Submit background checks & identification docs", completed: false },
    { id: 3, text: "Configure email, Slack & core system login details", completed: false },
    { id: 4, text: "Schedule technical walkthrough & welcome call", completed: false }
  ]);

  // States for Attendance
  const [attendanceLogs, setAttendanceLogs] = useState([
    { time: "09:02 AM", event: "Standard Check-in Auto-Logged" }
  ]);
  const [isClockedIn, setIsClockedIn] = useState(false);

  // States for Payroll
  const [baseSalary, setBaseSalary] = useState("8500");
  const [isPaid, setIsPaid] = useState(false);

  // States for Performance
  const [perfSales, setPerfSales] = useState(85);
  const [perfCode, setPerfCode] = useState(90);
  const [perfCS, setPerfCS] = useState(80);

  // States for Benefits
  const [activeTier, setActiveTier] = useState("gold");

  // States for Compliance
  const [complianceFilter, setComplianceFilter] = useState("ALL");
  const complianceLogs = [
    { time: "10:14:02 AM", level: "info", text: "Security audit snap verified", category: "SECURITY" },
    { time: "09:30:15 AM", level: "success", text: "Global policy v2.4 signed by Super Admin", category: "POLICY" },
    { time: "Yesterday", level: "warning", text: "Unusual check-in location flagged & auto-resolved", category: "SECURITY" },
    { time: "Yesterday", level: "info", text: "Quarterly payroll sheet compiled & verified", category: "HR" }
  ];

  // States for Reports
  const [reportsTab, setReportsTab] = useState("recruitment");

  // RENDER SIMULATOR BLOCKS
  switch (featureType) {
    case 'AI Recruitment':
      const filtered = candidates.map(cand => {
        if (!recruitmentSearch) return cand;
        const matches = cand.skills.filter(s => s.toLowerCase().includes(recruitmentSearch.toLowerCase())).length;
        const multiplier = cand.skills.length > 0 ? (matches / cand.skills.length) : 0;
        const newScore = Math.round(cand.score * (0.6 + 0.4 * multiplier));
        return { ...cand, score: Math.min(100, Math.max(0, newScore)) };
      }).sort((a, b) => b.score - a.score);

      return (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search skills (e.g. Python, React, Figma)..."
              value={recruitmentSearch}
              onChange={(e) => setRecruitmentSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
            />
            {recruitmentSearch && (
              <button onClick={() => setRecruitmentSearch('')} className="px-3 text-xs bg-slate-200 dark:bg-slate-850 rounded-xl text-slate-655 dark:text-slate-400">Clear</button>
            )}
          </div>
          <div className="space-y-3">
            {filtered.map((cand, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{cand.name}</p>
                  <p className="text-[10px] text-slate-400">{cand.role}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {cand.skills.map((s, si) => (
                      <span key={si} className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        recruitmentSearch && s.toLowerCase().includes(recruitmentSearch.toLowerCase())
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-2 py-1 rounded-lg text-xs font-black ${cand.score > 85 ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {cand.score}% Fit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'Smart Onboarding':
      const completedCount = onboardingTasks.filter(t => t.completed).length;
      const pct = Math.round((completedCount / onboardingTasks.length) * 100);

      const toggleTask = (id) => {
        setOnboardingTasks(onboardingTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      };

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Onboarding Progress (Sophia Martinez)</span>
            <span className="text-xs font-bold text-primary-600">{pct}% Complete</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 transition-all duration-300" style={{ width: `${pct}%` }}></div>
          </div>
          <div className="space-y-2 mt-4">
            {onboardingTasks.map(task => (
              <label key={task.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700"
                />
                <span className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>{task.text}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'Attendance Tracking':
      const handleClock = () => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (!isClockedIn) {
          setAttendanceLogs([{ time: timeStr, event: "Checked-in from HQ geo-fence (Verified GPS)" }, ...attendanceLogs]);
        } else {
          setAttendanceLogs([{ time: timeStr, event: "Checked-out & signed system timesheet" }, ...attendanceLogs]);
        }
        setIsClockedIn(!isClockedIn);
      };

      return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="text-center sm:text-left">
              <span className="text-[9px] font-black text-slate-400 font-bold block">HQ geo-fence active</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">GPS: 40.7128° N, 74.0060° W</p>
            </div>
            <button
              onClick={handleClock}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                isClockedIn 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-200 dark:shadow-none'
              }`}
            >
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
          <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto pr-1">
            <span className="text-[9px] font-bold text-slate-400 font-bold block mb-2">Today's Active Logs</span>
            {attendanceLogs.map((log, li) => (
              <div key={li} className="flex gap-3 text-xs p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-50 dark:border-slate-805">
                <span className="font-black text-primary-600 shrink-0">{log.time}</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{log.event}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'Payroll Automation':
      const salaryNum = parseFloat(baseSalary) || 0;
      const taxDed = salaryNum * 0.15;
      const benefitDed = salaryNum * 0.05;
      const netPay = salaryNum - taxDed - benefitDed;

      return (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 font-bold block mb-1">Enter Monthly Base Salary ($)</label>
            <input
              type="number"
              value={baseSalary}
              onChange={(e) => {
                setIsPaid(false);
                setBaseSalary(e.target.value);
              }}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs font-medium">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Gross Base Salary:</span>
              <span className="font-bold text-slate-900 dark:text-white">${salaryNum.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-rose-500">
              <span>Income Tax (15%):</span>
              <span className="font-bold">-${taxDed.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-rose-500">
              <span>Benefits Premium (5%):</span>
              <span className="font-bold">-${benefitDed.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-slate-800 dark:text-slate-200 font-black">
              <span>Net Direct Deposit:</span>
              <span className="text-primary-600">${netPay.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsPaid(true)} 
            disabled={salaryNum <= 0}
            className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              isPaid 
                ? 'bg-emerald-500 text-white cursor-default'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-200 dark:shadow-none'
            }`}
          >
            {isPaid ? 'Payout Successful & Deposited' : 'Approve & Release Direct Deposit'}
          </button>
        </div>
      );

    case 'Performance KPI':
      const score = Math.round((perfSales * 0.4) + (perfCode * 0.4) + (perfCS * 0.2));
      let perfLabel = "Satisfactory";
      if (score >= 90) perfLabel = "Outstanding";
      else if (score >= 80) perfLabel = "Proficient";
      else if (score < 60) perfLabel = "Needs Review";

      return (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 font-bold mb-1">
                <span>Sales targets Met</span>
                <span className="text-slate-850 dark:text-slate-200">{perfSales}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={perfSales} onChange={(e) => setPerfSales(parseInt(e.target.value))}
                className="w-full accent-primary-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 font-bold mb-1">
                <span>Code Quality review</span>
                <span className="text-slate-850 dark:text-slate-200">{perfCode}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={perfCode} onChange={(e) => setPerfCode(parseInt(e.target.value))}
                className="w-full accent-primary-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                <span>CSAT Score</span>
                <span className="text-slate-850 dark:text-slate-200">{perfCS}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={perfCS} onChange={(e) => setPerfCS(parseInt(e.target.value))}
                className="w-full accent-primary-600"
              />
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Weighted Score</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{score} / 100</span>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
              score >= 90 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
              score >= 80 ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' :
              'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
            }`}>{perfLabel}</span>
          </div>
        </div>
      );

    case 'Benefits Mgmt':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "bronze", name: "Bronze Plan", price: "240", desc: "Base medical, core vision cover" },
              { id: "silver", name: "Silver Plan", price: "480", desc: "Full medical, 50% dental & vision" },
              { id: "gold", name: "Gold Plan", price: "720", desc: "Gold tier health, 100% dental & vision" }
            ].map(plan => (
              <div 
                key={plan.id}
                onClick={() => setActiveTier(plan.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-center flex flex-col justify-between ${
                  activeTier === plan.id
                    ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-950/30 dark:border-primary-500 dark:text-primary-400'
                    : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800'
                }`}
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider">{plan.name}</p>
                  <p className="text-[9px] text-slate-400 mt-1 leading-tight">{plan.desc}</p>
                </div>
                <p className="text-sm font-black mt-3">${plan.price}/mo</p>
              </div>
            ))}
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-55 dark:border-slate-850 text-xs">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Employer Contribution Details</span>
            <p className="text-slate-600 dark:text-slate-300 font-medium">Company pays 75% contribution. Your payroll deduction: <strong className="text-primary-600">${Math.round(parseFloat(activeTier === 'gold' ? '720' : activeTier === 'silver' ? '480' : '240') * 0.25)} / month</strong>.</p>
          </div>
        </div>
      );

    case 'Compliance Center':
      const filteredLogs = complianceFilter === "ALL" 
        ? complianceLogs 
        : complianceLogs.filter(l => l.category === complianceFilter);

      return (
        <div className="space-y-4">
          <div className="flex gap-2 justify-center border-b border-slate-100 dark:border-slate-850 pb-2.5">
            {["ALL", "SECURITY", "POLICY", "HR"].map(cat => (
              <button
                key={cat}
                onClick={() => setComplianceFilter(cat)}
                className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${
                  complianceFilter === cat 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[165px] overflow-y-auto pr-1">
            {filteredLogs.map((log, idx) => (
              <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-sans">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      log.level === 'success' ? 'bg-emerald-500' :
                      log.level === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}></span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{log.text}</p>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">{log.time} • Category: {log.category}</p>
                </div>
                <span className="text-[8px] font-bold uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded dark:bg-emerald-950/30 dark:text-emerald-400 shrink-0">VERIFIED</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'Reports & Analytics':
      return (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[
              { id: "recruitment", label: "Recruitment Score" },
              { id: "retention", label: "Retention Rate" },
              { id: "payout", label: "Payroll Trend" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReportsTab(tab.id)}
                className={`flex-1 py-1.5 text-center rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  reportsTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200 dark:shadow-none'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-4">
            {reportsTab === 'recruitment' && (
              <div className="space-y-2">
                <div className="flex items-end justify-between gap-2 h-20 pt-4">
                  {[34, 45, 67, 85, 92].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full bg-primary-600 rounded-t" style={{ height: `${val}%` }}></div>
                      <span className="text-[8px] font-bold text-slate-400">Q{idx+1}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-2 text-[10px] font-bold text-slate-500">
                  Resumes processed increase: <strong className="text-slate-850 dark:text-slate-200">+17% quarter-on-quarter</strong>
                </div>
              </div>
            )}
            {reportsTab === 'retention' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Average Retention Rate</span>
                  <span className="text-sm font-black text-emerald-500">98.4%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: "98.4%" }}></div>
                </div>
                <p className="text-[10px] font-medium text-slate-400 text-center">Industry average: 84.2% | Outperforming by 14.2%</p>
              </div>
            )}
            {reportsTab === 'payout' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-650">Global Payroll Payout</span>
                  <span className="text-sm font-black text-primary-600">{getSymbol()}124.5K</span>
                </div>
                <div className="flex gap-1 h-12 items-end pt-2">
                  {[60, 68, 75, 92, 100, 124].map((val, idx) => (
                    <div key={idx} className="flex-1 bg-primary-500 dark:bg-primary-950 rounded-t" style={{ height: `${(val / 124) * 100}%` }}></div>
                  ))}
                </div>
                <p className="text-[10px] font-medium text-slate-400 text-center font-sans">Stable scale distribution across 6 operational branches</p>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return <div className="text-xs text-slate-400 text-center py-4">No preview simulator found.</div>;
  }
};

export default LandingPage;
