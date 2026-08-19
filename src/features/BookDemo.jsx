import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  Activity,
  Brain,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowRight,
  MessageSquare,
  Lock,
  Globe,
  Bot,
  PieChart,
  CheckCircle2,
  HelpCircle,
  Mail,
  ChevronDown,
  Play,
  Phone,
  Building,
  User,
  HeartPulse,
  Network
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import StatsCounter from "../components/StatsCounter";
import PhoneInput from '../shared/components/ui/PhoneInput';
import { publicAPI } from '../utils/apiService';
import DatePicker from '../shared/components/common/DatePicker';

const BookDemo = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companySize, setCompanySize] = useState('50-250');
  const [industry, setIndustry] = useState('Technology');
  const [country, setCountry] = useState('United States');
  const [prefDate, setPrefDate] = useState('');
  const [prefTime, setPrefTime] = useState('');
  const [message, setMessage] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [errors, setErrors] = useState({});

  const moduleOptions = [
    'Payroll HCM',
    'Benefits HCM',
    'Time & Attendance',
    'Recruitment',
    'AI Automation',
    'Analytics',
    'Workflow Automation',
    'Employee Management',
    'Performance Tracking'
  ];

  const [stats, setStats] = useState({
    activeLives: 412,
    growth: 18.2,
    avgAttendance: 96.8,
    totalDisbursed: 412.5,
    taxesAndContributions: 84.2,
    wellnessBudget: 12.4,
    heatmap: [],
    recruitmentInsight: "AI scanned 48 candidate resumes. Identified dwight@hcm.ai as premium fit (Score 96%) with Operations."
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const fetchStats = async () => {
      try {
        const response = await publicAPI.getPlatformStats();
        if (response.data && response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();

    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }

    const telemetryInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeLives: Number(prev.activeLives) + Math.floor(Math.random() * 2),
        totalDisbursed: Number(prev.totalDisbursed) + Math.floor(Math.random() * 5),
        taxesAndContributions: Number(prev.taxesAndContributions) + Math.floor(Math.random() * 2),
        wellnessBudget: Number(prev.wellnessBudget) + Math.floor(Math.random() * 2),
        avgAttendance: Math.min(100, Math.max(0, Number(prev.avgAttendance) + (Math.random() > 0.5 ? 0.1 : -0.1))),
        growth: Number(prev.growth) + (Math.random() > 0.5 ? 0.1 : 0)
      }));
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(telemetryInterval);
    };
  }, []);

  const toggleModule = (moduleName) => {
    if (selectedModules.includes(moduleName)) {
      setSelectedModules(selectedModules.filter(m => m !== moduleName));
    } else {
      setSelectedModules([...selectedModules, moduleName]);
    }
  };

  const handleConsultClick = (title) => {
    const moduleMap = {
      'AI HR Automation': 'AI Automation',
      'Payroll Intelligence': 'Payroll HCM',
      'Workforce Analytics': 'Analytics',
      'Recruitment AI': 'Recruitment',
      'Benefits Optimization': 'Benefits HCM'
    };
    const targetModule = moduleMap[title];
    if (targetModule && !selectedModules.includes(targetModule)) {
      setSelectedModules([...selectedModules, targetModule]);
    }
    const formEl = document.getElementById('demo-form-container');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFeatureClick = (title) => {
    const moduleMap = {
      'AI-Powered HR Operations': 'AI Automation',
      'Real-Time Workforce Analytics': 'Analytics',
      'Automated Payroll': 'Payroll HCM',
      'Smart Attendance Tracking': 'Time & Attendance'
    };
    const targetModule = moduleMap[title];
    if (targetModule && !selectedModules.includes(targetModule)) {
      setSelectedModules([...selectedModules, targetModule]);
    }
    const formEl = document.getElementById('demo-form-container');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fullName) newErrors.fullName = 'Full Name is required';
    if (!companyName) newErrors.companyName = 'Company Name is required';
    if (!workEmail || !workEmail.includes('@')) newErrors.workEmail = 'Please provide a valid work email';
    if (!phone) newErrors.phone = 'Phone Number is required';
    if (!prefDate) newErrors.prefDate = 'Please select a preferred demo date';
    if (!prefTime) newErrors.prefTime = 'Please select a preferred time slot';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to form error section
      const formEl = document.getElementById('demo-form-container');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await publicAPI.bookDemo({
        name: fullName,
        email: workEmail,
        companySize,
        requirement: message || selectedModules.join(', ') || 'Advanced Demo Booking',
        selectedDate: prefDate,
        selectedSlot: prefTime,
        companyName,
        phone,
        industry,
        country,
        message,
        modules: JSON.stringify(selectedModules)
      });
      setSubmitted(true);
      setFullName('');
      setCompanyName('');
      setWorkEmail('');
      setPhone('');
      setPrefDate('');
      setPrefTime('');
      setMessage('');
      setSelectedModules([]);
    } catch (err) {
      console.error("Booking error:", err);
      alert(err.response?.data?.error?.message || "Failed to book demo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-100 selection:text-primary-900 scroll-smooth transition-colors duration-300">

      {/* 1. NAVBAR */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-300 border-b",
        scrolled ? "bg-white/80 backdrop-blur-xl border-slate-100 py-3 shadow-soft" : "bg-transparent border-transparent py-5"
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
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/#${item.toLowerCase()}`}
                className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-[0.15em]"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Login</button>
            <a href="#booking-form" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95">Book Demo</a>
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
                  <Link
                    key={item}
                    to={item === 'Home' ? '/' : `/#${item.toLowerCase()}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-bold text-slate-500"
                  >
                    {item}
                  </Link>
                ))}
                <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
                  <button onClick={() => navigate('/login')} className="w-full py-4 text-slate-600 font-bold border border-slate-100 rounded-2xl">Login</button>
                  <a href="#booking-form" onClick={() => setIsMenuOpen(false)} className="w-full py-4 bg-primary-600 text-white text-center font-bold rounded-2xl shadow-lg">Get Demo</a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 lg:pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-primary-50 rounded-full blur-[120px] opacity-45 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] opacity-35 pointer-events-none" />

        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="flex flex-col items-center justify-center">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-xs font-bold shadow-sm border border-primary-100">
                <SparklesIcon size={14} fill="currentColor" />
                <span>Next-Gen Enterprise Demo</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 tracking-tighter leading-[0.95] dark:from-primary-400 dark:to-indigo-400">
                Transform Your Workforce with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">HCM.ai</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto text-center">
                Book a personalized demo to see how AI‑driven HR, Payroll, Benefits and Workforce Automation can transform your organization.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <a
                  href="#booking-form"
                  className="w-full sm:w-auto px-10 py-5 bg-primary-600 text-white text-center rounded-[2rem] font-black font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-3 group"
                >
                  Book Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#platform-preview"
                  className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 text-center border border-slate-100 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-soft flex items-center justify-center gap-3"
                >
                  Watch Platform Overview
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-slate-50 w-full">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 font-bold">Enterprise Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-primary-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Automation</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. MULTI-COLUMN BOOK DEMO FORM */}
      <section id="booking-form" className="py-24 bg-slate-50 text-left">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-[3.5rem] border border-slate-100 shadow-soft overflow-hidden p-6 lg:p-12" id="demo-form-container">

            {/* Form Info Panel - 4 Cols */}
            <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[2.5rem] p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
              <div className="space-y-8 relative z-10">
                <div>
                  <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Schedule a Demo</span>
                  <h3 className="text-3xl font-black tracking-tighter leading-none mt-3">Let's build your workspace</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed tracking-tight mt-4">
                    Experience first-hand how HCM.ai modernizes enterprise teams through custom workforce tools and dynamic AI integrations.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-white/10 rounded-xl text-primary-400 shrink-0">
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-200">10-Minute Consultation</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Quick diagnostic of company tools and pipeline constraints.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-white/10 rounded-xl text-primary-400 shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-200">Personalized Workspace Sandbox</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">See custom modules mapped precisely to your personnel structure.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-white/10 rounded-xl text-primary-400 shrink-0">
                      <Star size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-200">Exclusive Integration Mapping</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Discuss calendar, webhook, API, and billing integrations with engineers.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Uptime Guarantee</p>
                <div className="flex items-center gap-2 mt-2 text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">All Server Systems Operational</span>
                </div>
              </div>
            </div>

            {/* Main Form Fields Panel - 8 Cols */}
            <div className="lg:col-span-8 flex flex-col justify-center">

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-8 lg:p-12 text-center flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                      <CheckCircle2 size={44} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Demo Booked Successfully!</h3>
                    <p className="text-slate-500 font-medium tracking-tight max-w-md mx-auto leading-relaxed">
                      Thank you for submitting your details. Our AI workforce specialists will prepare your custom workspace sandboxes and reach out in the next 15 minutes.
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={() => setSubmitted(false)}
                        className="btn-primary px-8 py-3.5 font-bold rounded-xl shadow-lg shadow-primary-200 text-xs font-bold"
                      >
                        Book Another Demo
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleFormSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 p-2 lg:p-4 text-left"
                  >
                    {/* Multi-Column Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 font-bold px-1 block">* Full Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className={cn(
                              "w-full bg-glass backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all",
                              errors.fullName ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" : "focus:ring-primary-100 focus:border-primary-600"
                            )}
                          />
                        </div>
                        {errors.fullName && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.fullName}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Company Name</label>
                        <input
                          type="text"
                          placeholder="Acme Corp"
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          className={cn(
                            "w-full bg-glass backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all",
                            errors.companyName ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" : "focus:ring-primary-100 focus:border-primary-600"
                          )}
                        />
                        {errors.companyName && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.companyName}</p>}
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">* Work Email</label>
                        <input
                          type="email"
                          placeholder="johndoe@acme.com"
                          value={workEmail}
                          onChange={e => setWorkEmail(e.target.value)}
                          className={cn(
                            "w-full bg-glass backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all",
                            errors.workEmail ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" : "focus:ring-primary-100 focus:border-primary-600"
                          )}
                        />
                        {errors.workEmail && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.workEmail}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Phone Number</label>
                        <PhoneInput
                          name="phone"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className={cn(
                            "bg-glass backdrop-blur-md border border-white/20 text-sm font-semibold outline-none transition-all",
                            errors.phone ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" : "focus:ring-primary-100 focus:border-primary-600"
                          )}
                        />
                        {errors.phone && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.phone}</p>}
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Company Size</label>
                        <select
                          value={companySize}
                          onChange={e => setCompanySize(e.target.value)}
                          className="w-full bg-glass backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-all text-slate-600"
                        >
                          <option>1-50 employees</option>
                          <option>50-250 employees</option>
                          <option>250-1000 employees</option>
                          <option>1000+ employees</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Industry</label>
                        <select
                          value={industry}
                          onChange={e => setIndustry(e.target.value)}
                          className="w-full bg-glass backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-all text-slate-600"
                        >
                          <option>Technology</option>
                          <option>Financial Services</option>
                          <option>Healthcare</option>
                          <option>Manufacturing</option>
                          <option>Retail & Commerce</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Country</label>
                        <input
                          type="text"
                          placeholder="United States"
                          value={country}
                          onChange={e => setCountry(e.target.value)}
                          className="w-full bg-glass backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-all"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">* Preferred Date</label>
                        <DatePicker 
                          value={prefDate}
                          onChange={e => setPrefDate(e.target.value)}
                          className={cn(
                            "w-full bg-glass backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all text-slate-600",
                            errors.prefDate ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" : "focus:ring-primary-100 focus:border-primary-600"
                          )}
                        />
                        {errors.prefDate && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.prefDate}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">* Preferred Time Slot</label>
                        <input
                          type="time"
                          value={prefTime}
                          onChange={e => setPrefTime(e.target.value)}
                          className={cn(
                            "w-full bg-glass backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all text-slate-600",
                            errors.prefTime ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" : "focus:ring-primary-100 focus:border-primary-600"
                          )}
                        />
                        {errors.prefTime && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.prefTime}</p>}
                      </div>

                    </div>

                    {/* Checkboxes - Interested Modules */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">* Interested Modules</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        {moduleOptions.map((moduleName) => {
                          const isChecked = selectedModules.includes(moduleName);
                          return (
                            <label key={moduleName} className="flex items-center gap-2.5 cursor-pointer group select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleModule(moduleName)}
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-colors"
                              />
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{moduleName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Message / Requirements</label>
                      <textarea
                        rows="3"
                        placeholder="Tell us about your organization's challenges, current systems in use, and goals..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 text-sm font-semibold border border-slate-100 outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-all resize-none"
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-4.5 rounded-2xl font-bold text-xs shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Preparing Sandbox...</span>
                        </>
                      ) : (
                        <>
                          <span>Request Demo</span>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* 4. AI CONSULTATION SECTION */}
      <section className="py-32">
        <div className="container mx-auto px-6 text-left">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-20">
            <div>
              <span className="text-[10px] font-bold text-primary-600 font-bold">Expert Consulting</span>
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter mt-4 dark:text-white">Talk to Our AI <br />Workforce Experts</h2>
            </div>
            <p className="text-slate-500 font-medium max-w-md leading-relaxed">
              Connect with our solution architects to structure highly customizable models aligned precisely to state taxes, EEOC frameworks, and HR governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Brain, title: 'AI HR Automation', desc: 'Structure fully self-running pipeline queues.', color: 'from-violet-500 to-indigo-600', bg: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-600 dark:text-violet-400' },
              { icon: DollarSign, title: 'Payroll Intelligence', desc: 'Deploy automated deduction models safely.', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400' },
              { icon: BarChart3, title: 'Workforce Analytics', desc: 'Map staff heatmaps and predictive attrition.', color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400' },
              { icon: Bot, title: 'Recruitment AI', desc: 'Auto-scan resumes and screen fit metrics.', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400' },
              { icon: HeartPulse, title: 'Benefits Optimization', desc: 'Match wellness campaigns with staff preferences.', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400' }
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                onClick={() => handleConsultClick(card.title)}
                className="bg-white rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between shadow-soft hover:shadow-premium transition-all cursor-pointer hover:border-primary-200/50 dark:hover:border-primary-800/50"
              >
                <div>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-6", card.bg, card.text)}>
                    <card.icon size={20} />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-850 dark:text-slate-200 leading-tight mb-2">{card.title}</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{card.desc}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-wider">Expert Consult</span>
                  <ChevronRight size={14} className="text-primary-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE HCM.AI */}
      <section className="py-32 bg-slate-50 text-left">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Platform Edge</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter dark:text-white">Engineered for the Modern Enterprise</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Brain, title: 'AI-Powered HR Operations', desc: 'Predict exits, evaluate skills, and auto-screen candidate pools instantly.' },
              { icon: BarChart3, title: 'Real-Time Workforce Analytics', desc: 'Visual analytics dashboard showing company size growth, telemetry, and costs.' },
              { icon: DollarSign, title: 'Automated Payroll', desc: 'One-click pay cycles with custom deductions, tax rules, and local regulations.' },
              { icon: Calendar, title: 'Smart Attendance Tracking', desc: 'Web clock-ins, biometric synchronization, and shift planning parameters.' }
            ].map((feat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                onClick={() => handleFeatureClick(feat.title)}
                className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-soft hover:shadow-2xl transition-all duration-300 text-left flex flex-col justify-between cursor-pointer hover:border-primary-200/50 dark:hover:border-primary-800/50"
              >
                <div>
                  <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl mb-6 w-fit">
                    <feat.icon size={24} />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight leading-snug dark:text-white">{feat.title}</h4>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[9px] font-black text-primary-600 font-bold">Built-In Option</span>
                  <CheckCircle2 size={12} className="text-emerald-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. LIVE PLATFORM PREVIEW */}
      <section id="platform-preview" className="py-32 text-left">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Visual Telemetry</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter dark:text-white">Real-Time Platform Preview</h2>
          </div>

          <div className="bg-slate-900 dark text-white rounded-[3.5rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600 rounded-full blur-[150px] opacity-15 -translate-y-1/2 translate-x-1/2" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

              {/* Left Widget Sidebar - 4 Cols */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-left">
                  <h4 className="text-xs font-black text-primary-400 uppercase tracking-widest mb-1">Company Growth</h4>
                  <StatsCounter target={parseFloat(stats.activeLives)} label="Active Lives" />
                  <StatsCounter target={parseFloat(stats.growth)} label="Growth This Quarter" suffix="%" prefix="+" />
                </div>
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-left">
                  <h4 className="text-xs font-black text-primary-400 uppercase tracking-widest mb-3">Attendance Heatmap</h4>
                  <div className="grid grid-cols-7 gap-1.5">
                    {(stats.heatmap && stats.heatmap.length > 0
                      ? stats.heatmap
                      : Array.from({ length: 28 }).map((_, i) => (i % 5 === 0 ? 'warning' : i % 3 === 0 ? 'absent' : 'present'))
                    ).map((status, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-full aspect-square rounded",
                          status === 'present' ? 'bg-primary-500' : status === 'warning' ? 'bg-emerald-500' : status === 'empty' ? 'bg-slate-700/30' : 'bg-slate-700/60'
                        )}
                      />
                    ))}
                  </div>
                  <StatsCounter target={parseFloat(stats.avgAttendance)} label="Average Attendance" suffix="%" />
                </div>
 
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-left space-y-3">
                  <h4 className="text-xs font-black text-primary-400 uppercase tracking-widest">AI Recruitment Insights</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    "{stats.recruitmentInsight}"
                  </p>
                </div>
              </div>

              {/* Central Premium Dashboard Simulator - 8 Cols */}
              <div className="lg:col-span-8 bg-black/45 backdrop-blur-lg border border-white/10 rounded-3xl p-6 lg:p-8 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                        <PieChart size={16} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider">Payroll & Benefits overview</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-3 py-1 rounded-full uppercase tracking-wider">
                      Live Telemetry Simulator
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <StatsCounter target={parseFloat(stats.totalDisbursed)} label="Total Disbursed" prefix="$" suffix="k" />
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <StatsCounter target={parseFloat(stats.taxesAndContributions)} label="Taxes & Contributions" prefix="$" suffix="k" />
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <StatsCounter target={parseFloat(stats.wellnessBudget)} label="Wellness Budget" prefix="$" suffix="k" />
                    </div>
                  </div>

                  {/* SVG mock graph */}
                  <div className="h-40 w-full relative flex items-end">
                    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="previewGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 120 Q 80 50 150 90 T 300 40 T 450 110 T 500 30"
                        fill="url(#previewGrad)"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="500" cy="30" r="5" fill="#6366f1" className="animate-pulse" />
                    </svg>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Showing Active Org Parameters: US-East Edge</span>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span>Real-time platform sync active</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 7. CLIENT TRUST SECTION */}
      <section className="py-24 bg-slate-50 text-slate-900 border-y border-slate-100 text-left">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Client Testimonials</span>
            <p className="text-slate-900 font-extrabold text-lg">“Trusted by modern enterprises for AI-powered workforce transformation.”</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 opacity-60">
            {['Microsoft', 'Stripe', 'Linear', 'Duolingo'].map((company, idx) => (
              <div key={idx} className="flex items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                <span className="text-base font-black text-slate-800 tracking-wider uppercase font-mono">{company}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { name: 'Marcus Aurelius', role: 'COO', co: 'Empire Inc.', text: 'The absolute cleanest workforce suite in enterprise HR. Our managers had zero training but completed full reviews instantly.' },
              { name: 'Sarah Connor', role: 'VP of People', co: 'Operations OS', text: 'Integrating multi-tier health benefits and remote clock-in geo-fences was surprisingly simple. Highly recommend HCM.ai.' },
              { name: 'John Connor', role: 'CTO', co: 'Cyberdyne', text: 'Secure databases, SOC2 ready, and AI screenings that rank developers fairly. This suite has set a massive standard for our group.' }
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-slate-105 p-8 shadow-soft flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-sm font-bold text-slate-600 italic leading-relaxed">"{card.text}"</p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-4 border-t border-slate-50">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 font-black flex items-center justify-center text-sm">{card.name[0]}</div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{card.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{card.role} • {card.co}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION */}
      <section className="py-32 bg-slate-50 text-left">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-20 space-y-4">
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Got Questions?</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter dark:text-white">Frequently Asked Knowledge</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'How long is the demo?', a: 'A standard exploratory demo lasts around 15 to 30 minutes, structured to match your specific needs, personnel counts, and industry parameters.' },
              { q: 'Is onboarding included?', a: 'Yes! Every enterprise plan includes direct dedicated solution architect onboarding to map your existing CSV, SQL, or HCM tools into the platform.' },
              { q: 'Does HCM.ai support multi-company management?', a: 'Absolutely. Superadmins can seamlessly configure multiple corporations, regional hubs, parent orgs, and edge divisions inside a single master console.' },
              { q: 'Is payroll automated?', a: 'Yes. By declaring standard shift configurations, late thresholds, and overtime ratios, HCM.ai automatically processes pay rates and calculates monthly pay rolls.' },
              { q: 'Can modules be customized?', a: 'Yes. Organizations can choose to toggling on specific systems (like only Time Tracker or AI Recruiter) or combine all modules dynamically.' }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-soft p-6 lg:p-8 cursor-pointer select-none group transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-lg font-black text-slate-900 tracking-tight leading-snug dark:text-white">{faq.q}</h4>
                    <div className={cn("w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-all", isOpen ? "bg-primary-600 text-white rotate-180" : "text-slate-400 group-hover:bg-slate-100")}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-sm font-medium text-slate-450 leading-relaxed pt-2 border-t border-slate-50">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION SECTION */}
      <section className="py-40 bg-white border-t border-slate-100 text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            {...fadeIn}
            className="p-12 lg:p-20 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[3.5rem] relative overflow-hidden shadow-2xl flex flex-col items-center space-y-8"
          >
            <div className="absolute top-0 left-0 w-80 h-80 bg-primary-600 rounded-full blur-[120px] opacity-25 -translate-y-1/3 -translate-x-1/3" />
            <div className="w-16 h-16 bg-white/10 text-primary-400 rounded-2xl flex items-center justify-center">
              <Zap size={32} />
            </div>

            <h2 className="text-4xl lg:text-7xl font-black tracking-tighter leading-none leading-[0.9]">
              Ready to Modernize <br />Your Workforce?
            </h2>
            <p className="text-slate-300 text-base font-medium max-w-xl mx-auto leading-relaxed">
              Unlock proprietary resume screens, automated payouts, and real-time attendance maps. Start scaling with the world's most intelligent workspace engine.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center">
              <a
                href="#booking-form"
                className="w-full sm:w-auto px-10 py-5 bg-primary-600 text-white rounded-[2rem] font-bold shadow-xl hover:bg-primary-700 transition-all hover:scale-105 active:scale-95 text-center"
              >
                Schedule Demo
              </a>
              <a
                href="mailto:sales@hcm.ai"
                className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/15 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 text-center"
              >
                Contact Sales
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="pt-32 pb-16 bg-white border-t border-slate-100 text-left">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
            <div className="lg:col-span-2 space-y-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:rotate-6">
                  <Zap size={24} fill="currentColor" />
                </div>
                <span className="text-2xl font-black tracking-tighter">AI HCM <span className="text-primary-600">Platform</span></span>
              </Link>
              <p className="text-sm font-medium text-slate-450 leading-relaxed max-w-sm tracking-tight">
                The world's most intelligent workforce management ecosystem. Built for growth-driven enterprises that prioritize their people.
              </p>
              <div className="flex items-center gap-4">
                {[Phone, Globe, Mail].map((Icon, i) => (
                  <button key={i} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary-600 hover:text-white transition-all">
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'API Docs', 'Integrations'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Brand Guide', 'Contact'] },
              { title: 'Resources', links: ['Help Center', 'Privacy Policy', 'Terms of Use', 'Security'] }
            ].map((col, i) => (
              <div key={i} className="space-y-8">
                <h5 className="text-[10px] font-bold text-slate-900">{col.title}</h5>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors font-bold">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-bold text-slate-400 font-bold">© 2026 AI HCM Platform • Enterprise Grade Workforce OS</p>
            <div className="flex items-center gap-8">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">US • UK • APAC</span>
              <div className="flex items-center gap-2 text-emerald-500">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold">Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

// Custom Sparkles icon for exact matching style
const SparklesIcon = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 2L13.8 6.2L18 8L13.8 9.8L12 14L10.2 9.8L6 8L10.2 6.2L12 2Z" fill="currentColor" />
    <path d="M19 12L20.1 14.9L23 16L20.1 17.1L19 20L17.9 17.1L15 16L17.9 14.9L19 12Z" fill="currentColor" />
    <path d="M5 16L6.5 19.5L10 21L6.5 22.5L5 26L3.5 22.5L0 21L3.5 19.5L5 16Z" fill="currentColor" />
  </svg>
);

export default BookDemo;
