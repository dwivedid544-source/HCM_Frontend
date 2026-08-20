import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, X, MessageSquare, 
  User, Paperclip, Send, ChevronRight, ShieldCheck, Monitor, CreditCard, Zap, Calendar, 
  MessageCircle, Hash, ArrowRight, Star, Trash, Sparkles, Copy, Check, RefreshCw, HelpCircle, FileText, Bot,
  Headphones, CheckCheck, Download, Building2
} from 'lucide-react';
import { getBackendURL } from '../../utils/apiService';
import { cn } from '../../utils/cn';
import { useDateFormat } from '../../hooks/useDateFormat';
import { useEmployee } from '../../context/EmployeeContext';
import CenterModal from '../../shared/components/layout/CenterModal';
import { usePersistedTab } from '../../hooks/usePersistedTab';

// Simple Markdown Formatter Helper
const PolicyMarkdown = ({ content }) => {
  if (!content) return null;
  const lines = content.split('\n');
  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-700">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;
        
        if (trimmed.startsWith('# ')) {
          return <h3 key={idx} className="text-sm font-black text-slate-900 mt-2 mb-1">{trimmed.replace('# ', '')}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h4 key={idx} className="text-xs font-bold text-slate-900 mt-2 mb-1">{trimmed.replace('## ', '')}</h4>;
        }
        if (trimmed.startsWith('### ')) {
          return <h5 key={idx} className="text-xs font-bold text-slate-800 mt-1 mb-1">{trimmed.replace('### ', '')}</h5>;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>{renderFormattedText(trimmed.substring(2))}</span>
            </div>
          );
        }
        return <p key={idx}>{renderFormattedText(trimmed)}</p>;
      })}
    </div>
  );
};

const renderFormattedText = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const EmployeeHelpDesk = () => {
  const { profile, tickets, createTicket, replyTicket, deleteTicketMessage, showToast, loading, error, refetchAll } = useEmployee();
  const { formatDate } = useDateFormat();
  const [activeTab, setActiveTab] = usePersistedTab('emp_helpdesk', 'All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [attachmentBase64, setAttachmentBase64] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [createAttachmentBase64, setCreateAttachmentBase64] = useState(null);
  const [createAttachmentName, setCreateAttachmentName] = useState('');
  const fileInputRef = useRef(null);
  const createFileInputRef = useRef(null);

  // ── AI Policy Assistant State ─────────────────────────────
  const [isPolicyDrawerOpen, setIsPolicyDrawerOpen] = useState(false);
  const [policyInput, setPolicyInput] = useState('');
  const [policyMessages, setPolicyMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: "Hi! I'm your **HCM.ai Policy Assistant**. I can help you understand company policies, employee handbook rules, leave quotas, attendance rules, benefits, and more.\n\nWhat would you like to know today?",
      confidence: 1.0,
      sources: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const policyChatEndRef = useRef(null);
  const policyInputRef = useRef(null);

  const suggestedQuestions = [
    "What is the WFH policy?",
    "How many leaves can I take?",
    "What is the attendance policy?",
    "What is the notice period?",
    "What are the working hours?",
    "What is the overtime policy?",
    "How does medical insurance work?",
    "What is the maternity/paternity policy?"
  ];

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets]);

  const ticketChatEndRef = useRef(null);

  useEffect(() => {
    if (selectedTicket) {
      const timer = setTimeout(() => {
        ticketChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [selectedTicket, selectedTicket?.messages]);

  const checkIsMe = (sender) => {
    if (!sender) return false;
    if (typeof sender === 'string') {
      const s = sender.toLowerCase().trim();
      const myEmail = (profile?.email || '').toLowerCase().trim();
      const myName = (profile?.fullName || '').toLowerCase().trim();
      if (s === myEmail || s === myName || s === 'you' || s === 'employee') return true;
      if (['hr', 'admin', 'superadmin', 'support', 'support agent', 'manager'].includes(s)) return false;
      return Boolean((myEmail && s.includes(myEmail)) || (myName && s.includes(myName)));
    }
    if (typeof sender === 'object') {
      if (profile?.id && sender.id === profile.id) return true;
      if (profile?.userId && (sender.userId === profile.userId || sender.id === profile.userId)) return true;
      if (profile?.email && sender.email === profile.email) return true;
      if (sender.role === 'EMPLOYEE' && !sender.role?.includes('HR')) return true;
    }
    return false;
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleAttachmentClick = (url, name = 'attachment') => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scroll to bottom of AI chat
  useEffect(() => {
    if (isPolicyDrawerOpen) {
      policyChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => policyInputRef.current?.focus(), 150);
    }
  }, [policyMessages, isPolicyDrawerOpen, policyLoading]);

  // Handle ESC key for policy drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPolicyDrawerOpen) {
        setIsPolicyDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPolicyDrawerOpen]);

  const getSenderName = (sender) => {
    if (!sender) return 'Support Agent';
    if (typeof sender === 'string') return sender;
    if (typeof sender === 'object') {
      if (sender.name) return String(sender.name);
      if (sender.employeeProfile) {
        const p = sender.employeeProfile;
        const full = `${p.firstName || ''} ${p.lastName || ''}`.trim();
        if (full) return full;
      }
      return String(sender.email || sender.role || 'Support Agent');
    }
    return String(sender);
  };

  const getMessageText = (msg) => {
    const raw = msg?.text || msg?.content || '';
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'object') return JSON.stringify(raw);
    return String(raw);
  };

  const getFriendlyStatus = (status) => {
    if (!status) return '';
    const s = status.toUpperCase();
    if (s === 'OPEN') return 'Open';
    if (s === 'IN_PROGRESS') return 'In Progress';
    if (s === 'RESOLVED') return 'Resolved';
    return status;
  };

  const stats = [
    { label: 'Active Support', value: tickets.filter(t => getFriendlyStatus(t.status) !== 'Resolved').length, icon: MessageSquare, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Average Resolution', value: '2.4h', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Tickets', value: tickets.length, icon: Hash, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Satisfaction', value: '98%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || getFriendlyStatus(t.status) === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createTicket({
      subject: formData.get('subject'),
      category: formData.get('category'),
      priority: formData.get('priority'),
      description: formData.get('description'),
      attachmentBase64: createAttachmentBase64,
      status: 'Open'
    });
    setIsNewTicketModalOpen(false);
    setCreateAttachmentBase64(null);
    setCreateAttachmentName('');
    if (createFileInputRef.current) createFileInputRef.current.value = '';
    showToast('Support ticket created successfully');
  };

  const handleCreateFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File too large (max 5MB)', 'error');
        return;
      }
      setCreateAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setCreateAttachmentBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File too large (max 5MB)', 'error');
        return;
      }
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setAttachmentBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !attachmentBase64) return;
    await replyTicket(selectedTicket.id, replyText, attachmentBase64);
    setReplyText('');
    setAttachmentBase64(null);
    setAttachmentName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Reply sent');
  };

  // ── AI Policy Assistant Handler ──────────────────────────
  const handleSendPolicyQuery = async (queryText) => {
    const textToSend = (queryText || policyInput).trim();
    if (!textToSend || policyLoading) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...policyMessages, userMsg];
    setPolicyMessages(newMessages);
    setPolicyInput('');
    setPolicyLoading(true);

    const history = newMessages
      .filter(m => m.id !== 'welcome-1')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await api.aiPolicyAssistant(textToSend, history, '/employee/help');
      
      if (res && res.data && res.data.success) {
        const payload = res.data.data;
        const aiMsg = {
          id: 'msg-' + (Date.now() + 1),
          role: 'assistant',
          content: payload.answer || 'No policy answer retrieved.',
          confidence: payload.confidence || 0.88,
          sources: payload.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setPolicyMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(res?.data?.error?.message || 'Failed to query AI Policy Assistant.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'AI Policy Assistant unavailable';
      setPolicyMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: "I couldn't find a definitive answer to that in the current company policy documents. If you need further assistance, please consider raising a support ticket.",
          confidence: 0.25,
          sources: [],
          isError: true,
          failedQuery: textToSend,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      showToast(errorMsg, 'error');
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copied answer to clipboard!');
  };

  const handleClearPolicyChat = () => {
    setPolicyMessages([
      {
        id: 'welcome-1',
        role: 'assistant',
        content: "Hi! I'm your **HCM.ai Policy Assistant**. I can help you understand company policies, employee handbook rules, leave quotas, attendance rules, benefits, and more.\n\nWhat would you like to know today?",
        confidence: 1.0,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast('Policy conversation reset');
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-0 min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 text-left">
        <AlertCircle className="text-rose-500 w-12 h-12" />
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">Failed to Load Support Ecosystem</h3>
        <p className="text-sm text-slate-500 max-w-md">{error}</p>
        <button onClick={refetchAll} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2">
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (loading || !tickets) {
    return (
      <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto px-4 sm:px-0 text-left">
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-t-indigo-600 border-indigo-100 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Loading Support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative max-w-7xl mx-auto text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Support Ecosystem</h1>
          <p className="text-slate-500 font-bold tracking-tight">Need assistance? Engage with our expert support team or IT specialist hubs</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsNewTicketModalOpen(true)}
            className="btn-primary w-full md:w-auto px-8 py-2.5 font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary-200 active:scale-95 transition-all"
          >
             <Plus size={18} />
             <span>Raise Ticket</span>
          </button>

          {/* AI Policy Assistant Drawer Trigger */}
          <button 
            onClick={() => setIsPolicyDrawerOpen(true)}
            className="btn-primary w-full md:w-auto px-6 py-2.5 font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-95 transition-all bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white"
          >
             <Sparkles size={16} />
             <span>✨ Ask AI Policy Assistant</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card p-6"
          >
            <div className="flex items-center gap-4 text-left">
               <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 font-bold leading-none mb-1.5">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ticket Management */}
      <div className="space-y-8">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
               {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                       "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                       activeTab === tab ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-y-[-2px]" : "bg-white text-slate-400 border border-slate-100 hover:border-primary-200"
                    )}
                  >
                     {tab}
                  </button>
               ))}
            </div>
            <div className="relative w-full lg:w-96">
               <Search className="absolute left-4 top-3 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search registry..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-white border border-slate-100 rounded-xl pl-12 pr-4 h-12 text-xs font-bold w-full focus:ring-2 focus:ring-primary-50 outline-none transition-all shadow-sm" 
               />
            </div>
         </div>

         <div className="card p-0 border-none bg-white shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Ticket Identity</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Category</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Priority</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Status</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-right">Activity</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredTickets.length > 0 ? filteredTickets.map((t) => (
                        <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedTicket(t)}>
                           <td className="px-8 py-7">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                                    <Hash size={16} className="opacity-40" />
                                    <span className="text-[10px] font-black leading-none mt-1">{t.id.split('-')[0]}</span>
                                 </div>
                                 <div className="min-w-0 max-w-sm">
                                    <p className="text-sm font-black text-slate-900 leading-none truncate italic tracking-tight">{t.subject}</p>
                                    <p className="text-[9px] font-black text-slate-400 font-bold mt-2">
                                       {formatDate(t.createdAt)}
                                    </p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-7">
                              <span className="text-[10px] font-black text-slate-500 font-bold px-3 py-1 bg-slate-50 rounded-lg">{t.category}</span>
                           </td>
                           <td className="px-8 py-7 text-center">
                              <span className={cn(
                                 "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border italic",
                                 t.priority === 'High' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                 t.priority === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                 "bg-primary-50 text-primary-600 border-primary-100"
                              )}>
                                 {t.priority}
                              </span>
                           </td>
                           <td className="px-8 py-7 text-center">
                              <span className={cn(
                                 "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                 getFriendlyStatus(t.status) === 'Resolved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                 getFriendlyStatus(t.status) === 'In Progress' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                 "bg-slate-100 text-slate-500 border-slate-200"
                              )}>
                                 {getFriendlyStatus(t.status)}
                              </span>
                           </td>
                           <td className="px-8 py-7 text-right">
                              <button className="p-3 bg-slate-50 text-slate-400 hover:text-primary-600 border border-slate-100 rounded-2xl shadow-sm transition-all group-hover:scale-110"><MessageCircle size={20} /></button>
                           </td>
                        </tr>
                     )) : (
                       <tr>
                         <td colSpan="5" className="py-20 text-center">
                            <div className="flex flex-col items-center gap-4 text-slate-300">
                               <MessageSquare size={48} className="animate-pulse" />
                               <p className="text-[10px] font-bold">No support records found</p>
                            </div>
                         </td>
                       </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* New Ticket Modal */}
      <CenterModal isOpen={isNewTicketModalOpen} onClose={() => setIsNewTicketModalOpen(false)} title="Register Support Ticket">
         <form onSubmit={handleCreateSubmit} className="p-10 space-y-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 font-bold px-1">Engagement Subject</label>
                  <input name="subject" type="text" required placeholder="e.g. Identity Access Issue" className="input-field h-14 bg-slate-50 border-transparent font-black" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 font-bold px-1">Functional Category</label>
                  <select name="category" className="input-field h-14 bg-slate-50 border-transparent font-black">
                     <option>IT Support</option>
                     <option>Payroll Query</option>
                     <option>HR Policy</option>
                     <option>Hardware Request</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priority Strategy</label>
                  <select name="priority" className="input-field h-14 bg-slate-50 border-transparent font-black">
                     <option>Low</option>
                     <option>Medium</option>
                     <option>High</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Attachment (Optional)</label>
                  <input type="file" ref={createFileInputRef} onChange={handleCreateFileSelect} className="hidden" />
                  <button type="button" onClick={() => createFileInputRef.current?.click()} className="input-field h-14 bg-slate-50 border-transparent font-black flex items-center justify-between text-slate-400 hover:text-slate-600">
                    <span className="truncate">{createAttachmentName || 'Choose file...'}</span>
                    <Paperclip size={18} />
                  </button>
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Detailed Context</label>
               <textarea name="description" rows="4" required placeholder="Describe the operational challenge..." className="input-field p-4 bg-slate-50 border-transparent font-black resize-none" />
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
               <button type="button" onClick={() => setIsNewTicketModalOpen(false)} className="w-full sm:flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
               <button type="submit" className="w-full sm:flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200">Submit Ticket</button>
            </div>
         </form>
      </CenterModal>

      {/* WhatsApp / Messenger Style Ticket Chat Modal */}
      <CenterModal 
        isOpen={!!selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        maxWidth="max-w-2xl"
        showClose={false}
      >
        {selectedTicket && (
          <div className="flex flex-col h-[75vh] max-h-[640px] text-left">
            {/* WhatsApp Messenger Header */}
            <div className="px-5 py-3.5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-indigo-400/20">
                    <Headphones size={20} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[280px] sm:max-w-[360px]">
                      {selectedTicket.subject}
                    </h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0",
                      getFriendlyStatus(selectedTicket.status) === 'Resolved' 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    )}>
                      {getFriendlyStatus(selectedTicket.status)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                    HR & Support Desk • {selectedTicket.category || 'General'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                title="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body - WhatsApp Style Bubble Scroll Area */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-slate-100/80 dark:bg-slate-950/70 space-y-3">
              {/* Date Badge */}
              <div className="flex justify-center my-1">
                <span className="px-3 py-1 bg-white dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full shadow-xs border border-slate-200/60 dark:border-slate-700/60">
                  {formatDate(selectedTicket.createdAt) || 'Today'}
                </span>
              </div>

              {/* Initial Message (Description) rendered as first chat bubble from employee */}
              {selectedTicket.description && (
                <div className="flex justify-end">
                  <div className="max-w-[82%] sm:max-w-[75%] bg-indigo-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-sm space-y-1.5 relative group">
                    <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap font-normal">
                      {selectedTicket.description}
                    </p>
                    {selectedTicket.attachmentUrl && (
                      <div 
                        onClick={() => handleAttachmentClick(selectedTicket.attachmentUrl, 'initial_attachment')}
                        className="flex items-center gap-2 p-2 bg-black/15 hover:bg-black/25 rounded-xl text-xs cursor-pointer transition-colors"
                      >
                        <Paperclip size={14} className="shrink-0" />
                        <span className="truncate underline font-medium">View Attachment</span>
                        <Download size={13} className="ml-auto shrink-0" />
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 text-[10px] text-indigo-200 mt-1">
                      <span>{formatMessageTime(selectedTicket.createdAt)}</span>
                      <CheckCheck size={14} className="text-indigo-200" />
                    </div>
                  </div>
                </div>
              )}

              {/* Subsequent Messages */}
              {selectedTicket.messages && selectedTicket.messages.map((msg, i) => {
                const isMe = checkIsMe(msg.sender);
                const senderLabel = isMe ? 'You' : getSenderName(msg.sender);
                const msgTime = formatMessageTime(msg.timestamp || msg.createdAt);
                const text = getMessageText(msg);

                return (
                  <div key={msg.id || i} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 mb-0.5 ring-1 ring-indigo-200 dark:ring-indigo-800">
                        {senderLabel.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className={cn(
                      "max-w-[82%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm space-y-1 relative group",
                      isMe 
                        ? "bg-indigo-600 text-white rounded-tr-xs" 
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs"
                    )}>
                      {!isMe && (
                        <p className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 leading-none mb-1">
                          {senderLabel}
                        </p>
                      )}

                      <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap font-normal">
                        {text}
                      </p>

                      {msg.attachmentUrl && (
                        <div 
                          onClick={() => handleAttachmentClick(msg.attachmentUrl, `attachment_${i}`)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer transition-colors mt-1.5",
                            isMe ? "bg-black/15 hover:bg-black/25 text-white" : "bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                          )}
                        >
                          <Paperclip size={14} className="shrink-0" />
                          <span className="truncate underline font-medium">Attachment</span>
                          <Download size={13} className="ml-auto shrink-0" />
                        </div>
                      )}

                      <div className={cn(
                        "flex items-center justify-end gap-1 text-[10px] mt-1",
                        isMe ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
                      )}>
                        <span>{msgTime}</span>
                        {isMe && <CheckCheck size={14} className="text-indigo-200" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={ticketChatEndRef} />
            </div>

            {/* Fixed Chat Input Composer */}
            <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shrink-0">
              {/* Attachment Preview Chip */}
              {attachmentName && (
                <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold">
                  <Paperclip size={13} />
                  <span className="max-w-[200px] truncate">{attachmentName}</span>
                  <button 
                    type="button" 
                    onClick={() => { setAttachmentName(''); setAttachmentBase64(null); }}
                    className="p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-full"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              <form onSubmit={handleReply} className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-all shrink-0"
                  title="Attach file"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(e);
                    }
                  }}
                  placeholder="Type a message... (Press Enter to send)"
                  className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />

                <button 
                  type="submit" 
                  disabled={!replyText.trim() && !attachmentBase64}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </CenterModal>

      {/* ── ✨ HCM.ai Policy Assistant Fixed Right-Side Panel ─────────────── */}
      <AnimatePresence>
        {isPolicyDrawerOpen && (
          <>
            {/* Subtle Backdrop - Leaves page readable underneath */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPolicyDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/15 backdrop-blur-[1.5px] z-[90]"
            />

            {/* Fixed Right Panel Overlay */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 h-screen w-full sm:w-[440px] md:w-[460px] max-w-full bg-white shadow-2xl z-[100] flex flex-col border-l border-slate-200/80"
            >
              {/* Panel Header */}
              <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shadow-md border-b border-indigo-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black tracking-tight text-white">
                        HCM.ai Policy Assistant
                      </h3>
                      <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[9px] font-bold text-emerald-300">Online</span>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-indigo-200/70 font-semibold tracking-wide mt-0.5">
                      Enterprise Knowledge Base · RAG Specialist
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleClearPolicyChat} 
                    title="New Conversation"
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button 
                    onClick={() => setIsPolicyDrawerOpen(false)} 
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Chat Messages Conversation Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 scrollbar-thin">
                {policyMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col gap-1 max-w-[92%]",
                      msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    {/* Role & Timestamp */}
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 px-1">
                      {msg.role === 'user' ? (
                        <span>You • {msg.timestamp}</span>
                      ) : (
                        <span className="flex items-center gap-1 text-indigo-650 font-black">
                          <Bot size={11} />
                          <span>HCM.ai Policy Specialist</span>
                        </span>
                      )}
                    </div>

                    {/* Chat Bubble Card */}
                    <div className={cn(
                      "p-3.5 rounded-2xl shadow-xs text-xs relative group border",
                      msg.role === 'user'
                        ? "bg-indigo-600 border-indigo-700 text-white rounded-tr-xs"
                        : "bg-white border-slate-150 text-slate-800 rounded-tl-xs"
                    )}>
                      {msg.role === 'user' ? (
                        <p className="font-semibold whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <PolicyMarkdown content={msg.content} />
                      )}

                      {/* Confidence Badge & Copy Action */}
                      {msg.role === 'assistant' && msg.id !== 'welcome-1' && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-semibold">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border text-[8.5px]",
                            msg.confidence >= 0.8 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : msg.confidence >= 0.4
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          )}>
                            {msg.confidence >= 0.8 ? "✓ Based on company policy" : msg.confidence >= 0.4 ? "Based on available docs" : "Policy document not found"}
                          </span>

                          <div className="flex items-center gap-2">
                            {msg.isError && msg.failedQuery && (
                              <button
                                type="button"
                                onClick={() => handleSendPolicyQuery(msg.failedQuery)}
                                className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-md text-[8.5px] font-bold transition-all flex items-center gap-1"
                              >
                                <RefreshCw size={9} />
                                <span>Retry</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                            >
                              {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                              <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Source Citations */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Citations & Sources</span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, i) => (
                              <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[9.5px] font-bold flex items-center gap-1 border border-slate-200/60">
                                <FileText size={10} className="text-indigo-500" />
                                <span>{src.title}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Animated Typing Indicator */}
                {policyLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 items-center text-slate-600 text-xs p-3 bg-white border border-slate-150 rounded-2xl w-fit shadow-xs">
                    <Bot size={14} className="text-indigo-600" />
                    <span className="font-bold text-[11px]">HCM.ai is checking company policies...</span>
                    <div className="flex items-center gap-1 ml-1">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </motion.div>
                )}

                {/* Suggested Questions Chips */}
                {policyMessages.length <= 2 && !policyLoading && (
                  <div className="pt-3 space-y-2">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 px-1">Suggested Questions</span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendPolicyQuery(q)}
                          className="px-3 py-1.5 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs hover:scale-102"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={policyChatEndRef} />
              </div>

              {/* Sticky Input Area */}
              <div className="p-3.5 bg-white border-t border-slate-200/80 space-y-2.5 shadow-lg">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPolicyQuery();
                  }}
                  className="relative flex items-center"
                >
                  <textarea
                    ref={policyInputRef}
                    value={policyInput}
                    onChange={(e) => setPolicyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendPolicyQuery();
                      }
                    }}
                    placeholder="Ask about company policies, rules, benefits..."
                    rows="2"
                    maxLength={1000}
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-3 pr-12 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!policyInput.trim() || policyLoading}
                    className="absolute right-2.5 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-all"
                  >
                    <Send size={14} />
                  </button>
                </form>

                {/* Human Support Escalation Link */}
                <div className="flex items-center justify-between text-[10px] text-slate-450 px-1">
                  <span>Still need human support?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPolicyDrawerOpen(false);
                      setIsNewTicketModalOpen(true);
                    }}
                    className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus size={11} />
                    <span>Raise Support Ticket</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeHelpDesk;
