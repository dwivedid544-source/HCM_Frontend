import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Send, Brain, User, Loader2,
  RotateCcw, ChevronRight, Zap, MessageSquare,
  Copy, Check, AlertCircle, ArrowUpRight, Calendar, ShieldCheck
} from 'lucide-react';
import { employeeAPI } from '../../../utils/apiService';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

// ── Role & Route-Aware Suggested Prompts ─────────────────────────
const getDynamicSuggestedPrompts = (role = 'EMPLOYEE', pathname = '') => {
  const normalizedRole = (role || 'EMPLOYEE').toUpperCase();

  // Route-specific prompts
  if (pathname.includes('/leaves')) {
    return [
      'What is my leave balance?',
      'Show my pending leave requests',
      'How many annual leave days do I have remaining?',
      'What is today\'s date?'
    ];
  }
  if (pathname.includes('/payroll') || pathname.includes('/compensation')) {
    return [
      'Explain my latest payslip',
      'What deductions were applied to my salary?',
      'What is my monthly CTC and compensation?',
      'What is today\'s date?'
    ];
  }
  if (pathname.includes('/attendance')) {
    return [
      'Show my recent attendance punch logs',
      'What are my shift hours this week?',
      'Am I marked late for any recent days?',
      'What is today\'s date?'
    ];
  }
  if (pathname.includes('/reports')) {
    if (['ADMIN', 'SUPERADMIN', 'HR'].includes(normalizedRole)) {
      return [
        'Summarize this report',
        'What are the key workforce trends?',
        'Generate an executive summary of this data',
        'What is today\'s date?'
      ];
    }
  }
  if (pathname.includes('/candidates') || pathname.includes('/pipeline')) {
    return [
      'Show recruitment pipeline summary',
      'How many candidates are currently in screening?',
      'List active job openings in our organization',
      'What is today\'s date?'
    ];
  }
  if (pathname.includes('/team')) {
    return [
      'Who is on my direct team?',
      'Who has pending leave requests?',
      'Summarize team attendance today',
      'What is today\'s date?'
    ];
  }

  // Role-specific default prompts
  if (normalizedRole === 'MANAGER') {
    return [
      'Who has pending leave requests in my team?',
      'Summarize my direct team\'s attendance',
      'What is my own leave balance?',
      'What is today\'s date?'
    ];
  }

  if (normalizedRole === 'HR') {
    return [
      'Show recruitment pipeline summary',
      'What is our total organization headcount?',
      'Which job openings are currently active?',
      'What is today\'s date?'
    ];
  }

  if (normalizedRole === 'ADMIN') {
    return [
      'Summarize organization workforce metrics',
      'Show pending leave and reimbursement approvals',
      'What is today\'s date?',
      'What is my leave balance?'
    ];
  }

  if (normalizedRole === 'SUPERADMIN') {
    return [
      'Show platform organization metrics',
      'What is the current system health and status?',
      'What is today\'s date?'
    ];
  }

  if (normalizedRole === 'CANDIDATE') {
    return [
      'What is the status of my job applications?',
      'Do I have any interviews scheduled?',
      'What open jobs can I apply for?',
      'What is today\'s date?'
    ];
  }

  // Default Employee Prompts
  return [
    'What is my leave balance?',
    'Explain my latest payslip',
    'Show my recent attendance records',
    'What is today\'s date?'
  ];
};

// ── Inline Markdown Formatter ────────────────────────────────────
const parseInlineStyles = (text) => {
  if (typeof text !== 'string') return text;
  
  let parts = [text];

  const applyRegex = (regex, wrapperFn) => {
    let newParts = [];
    for (let part of parts) {
      if (typeof part !== 'string') {
        newParts.push(part);
        continue;
      }
      let match;
      let lastIdx = 0;
      while ((match = regex.exec(part)) !== null) {
        if (match.index > lastIdx) {
          newParts.push(part.substring(lastIdx, match.index));
        }
        newParts.push(wrapperFn(match[1]));
        lastIdx = regex.lastIndex;
      }
      if (lastIdx < part.length) {
        newParts.push(part.substring(lastIdx));
      }
    }
    parts = newParts;
  };

  applyRegex(/\*\*(.*?)\*\*/g, (txt) => <strong key={txt} className="font-bold text-slate-900 dark:text-slate-100">{txt}</strong>);
  applyRegex(/\*(.*?)\*/g, (txt) => <em key={txt} className="italic text-slate-800 dark:text-slate-200">{txt}</em>);
  applyRegex(/`(.*?)`/g, (txt) => <code key={txt} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono text-indigo-600 dark:text-indigo-400">{txt}</code>);

  return parts;
};

// ── Markdown Block Renderer (Headings, Lists, Tables) ────────────
const parseMarkdownContent = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const blocks = [];
  let currentList = [];
  let isBulletList = false;
  let isNumList = false;
  let isTable = false;
  let tableHeader = [];
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Markdown Headings
    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={`h3-${i}`} className="text-xs font-black text-slate-900 dark:text-white mt-3 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={12} className="text-indigo-500" />
          {line.replace('### ', '')}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={`h2-${i}`} className="text-sm font-black text-slate-900 dark:text-white mt-3 mb-2 tracking-tight">
          {line.replace('## ', '')}
        </h3>
      );
      continue;
    }

    // Markdown Table
    if (line.startsWith('|')) {
      isTable = true;
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (line.includes('---') || line.includes('===') || cells.every(c => c === '')) {
        continue;
      }
      
      if (tableHeader.length === 0) {
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (isTable) {
      blocks.push(
        <div key={`table-${i}`} className="overflow-x-auto my-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                {tableHeader.map((th, hIdx) => (
                  <th key={hIdx} className="px-3 py-2 text-left font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{th}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-900">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">{parseInlineStyles(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      isTable = false;
      tableHeader = [];
      tableRows = [];
    }

    // Lists
    const bulletMatch = line.match(/^[\-\*]\s+(.+)/);
    const numMatch = line.match(/^\d+\.\s+(.+)/);

    if (bulletMatch) {
      if (isNumList) {
        blocks.push(<ol key={`ol-${i}`} className="list-decimal pl-4 mb-2 space-y-1">{currentList}</ol>);
        currentList = [];
        isNumList = false;
      }
      isBulletList = true;
      currentList.push(
        <li key={`li-${i}`} className="text-slate-700 dark:text-slate-300 text-[12px] leading-relaxed">
          {parseInlineStyles(bulletMatch[1])}
        </li>
      );
      continue;
    } else if (numMatch) {
      if (isBulletList) {
        blocks.push(<ul key={`ul-${i}`} className="list-disc pl-4 mb-2 space-y-1.5">{currentList}</ul>);
        currentList = [];
        isBulletList = false;
      }
      isNumList = true;
      currentList.push(
        <li key={`li-${i}`} className="text-slate-700 dark:text-slate-300 text-[12px] leading-relaxed">
          {parseInlineStyles(numMatch[1])}
        </li>
      );
      continue;
    } else {
      if (isBulletList) {
        blocks.push(<ul key={`ul-${i}`} className="list-disc pl-4 mb-2 space-y-1.5">{currentList}</ul>);
        currentList = [];
        isBulletList = false;
      }
      if (isNumList) {
        blocks.push(<ol key={`ol-${i}`} className="list-decimal pl-4 mb-2 space-y-1.5">{currentList}</ol>);
        currentList = [];
        isNumList = false;
      }

      if (line.trim().length > 0) {
        blocks.push(
          <p key={`p-${i}`} className="text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
            {parseInlineStyles(line)}
          </p>
        );
      }
    }
  }

  if (isBulletList && currentList.length > 0) {
    blocks.push(<ul key={`ul-end`} className="list-disc pl-4 mb-2 space-y-1.5">{currentList}</ul>);
  }
  if (isNumList && currentList.length > 0) {
    blocks.push(<ol key={`ol-end`} className="list-decimal pl-4 mb-2 space-y-1.5">{currentList}</ol>);
  }

  return blocks;
};

// ── Message Bubble Component ─────────────────────────────────────
const MessageBubble = ({ msg, onActionClick }) => {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!msg.content) return;
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 group`}
    >
      <div className={`flex items-start gap-2 max-w-[90%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-xs font-bold ${
          isUser
            ? 'bg-gradient-to-tr from-primary-600 to-indigo-600 text-white'
            : 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white shadow-indigo-500/20'
        }`}>
          {isUser ? <User size={13} /> : <Sparkles size={13} />}
        </div>

        {/* Bubble */}
        <div className={`rounded-2xl px-4 py-3 shadow-xs text-left relative ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
        }`}>
          {isUser ? (
            <p className="text-[12px] leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
          ) : (
            <div className="space-y-1">
              {parseMarkdownContent(msg.content)}

              {/* Action Link Chips */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {msg.actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => onActionClick(act.route)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] transition-all border border-indigo-100 dark:border-indigo-900/40 shadow-xs"
                    >
                      <span>{act.label}</span>
                      <ArrowUpRight size={11} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Copy Button on Assistant Message */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-all text-[10px]"
              title="Copy message"
            >
              {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
            </button>
          )}
        </div>
      </div>

      {/* Timestamp and Verification Meta */}
      <div className={`flex items-center gap-2 px-1 text-[9px] text-slate-400 font-medium ${isUser ? 'pr-9' : 'pl-9'}`}>
        <span>{msg.timestamp}</span>
        {!isUser && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck size={10} />
            Verified DB Context
          </span>
        )}
      </div>
    </motion.div>
  );
};

// ── Typing Indicator ─────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-center gap-2 pl-2 py-1">
    <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
      <Loader2 size={12} className="animate-spin" />
    </div>
    <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      <span className="text-[10px] font-bold text-slate-400 ml-1">Consulting enterprise database...</span>
    </div>
  </div>
);

// ── Main Copilot Component ───────────────────────────────────────
const AICopilot = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your **HCM.ai Copilot** — your enterprise HR and operations assistant.\n\nEvery response is grounded in your verified account data and real-time database records.\n\nHow can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: []
    }
  ]);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const panelRef       = useRef(null);
  const location       = useLocation();
  const navigate       = useNavigate();
  const { user, effectiveRole } = useAuth();

  const userRole = effectiveRole || user?.role || 'EMPLOYEE';
  const pageSuggestions = getDynamicSuggestedPrompts(userRole, location.pathname);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Click outside listener for desktop
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target)) {
        if (window.innerWidth >= 640) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Escape key close listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setInput('');
    setError(null);
    setIsLoading(true);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user', content: text, timestamp: nowStr };
    setMessages(prev => [...prev, userMessage]);

    try {
      const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const response = await employeeAPI.aiCopilotChat(text, history, location.pathname);

      const resData = response.data?.data || response.data || {};
      const answer = resData.answer || resData.reply || 'I was unable to retrieve a response. Please try again.';
      const actions = resData.actions || [];

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions,
          intent: resData.intent
        }
      ]);
    } catch (err) {
      console.error('[Copilot Frontend Error]:', err);
      const errMsg = err?.response?.status === 401
        ? 'Your session expired. Please log in again.'
        : err?.response?.status === 403
        ? 'You are not authorized to perform this operation.'
        : 'Unable to connect to the HCM assistant. Please check your network and try again.';

      setError({ message: errMsg, lastAttempt: text });
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${errMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat history cleared. How can I assist you with your HCM tasks today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: []
    }]);
    setError(null);
  };

  const handleActionNavigate = (route) => {
    if (route) {
      navigate(route);
      if (window.innerWidth < 640) {
        setIsOpen(false);
      }
    }
  };

  const formatRouteLabel = (path) => {
    if (!path || path === '/') return 'Dashboard';
    const parts = path.split('/').filter(Boolean);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
  };

  return (
    <>
      {/* ── Floating AI Trigger Button ──────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-[9990]">
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/25 border border-white/20 overflow-hidden group focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              title="Open HCM.ai Copilot"
              aria-label="Open HCM.ai Copilot"
            >
              <span className="absolute inset-0 bg-indigo-500/20 rounded-2xl animate-pulse pointer-events-none" />
              <Brain size={24} className="relative z-10" />
              
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* ── Copilot Right Sliding Panel ─────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[9992] sm:bg-slate-900/20"
            />

            {/* Right-Anchored Panel */}
            <motion.div
              ref={panelRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                height: '100dvh',
                zIndex: 9995
              }}
              className="w-full sm:w-[420px] sm:max-w-[420px] bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-left"
            >
              {/* ── Fixed Header ───────────────────────────────────────── */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shrink-0 border-b border-indigo-800/40 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <Sparkles className="text-white animate-pulse" size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white tracking-tight">HCM.ai Copilot</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                      <span className="text-[10px] font-bold text-indigo-100 tracking-wide">
                        Online · {userRole} Engine
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearChat}
                    title="Clear Conversation"
                    aria-label="Clear Conversation"
                    className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close Copilot"
                    aria-label="Close Copilot"
                    className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* ── Context Bar ────────────────────────────────────────── */}
              <div className="px-5 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Zap size={11} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    Context: <span className="font-extrabold text-slate-800 dark:text-slate-200">{formatRouteLabel(location.pathname)}</span>
                  </span>
                </div>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 uppercase tracking-widest shrink-0">
                  {userRole}
                </span>
              </div>

              {/* ── Scrollable Messages Area ───────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/40 dark:bg-slate-950/60 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    onActionClick={handleActionNavigate}
                  />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Dynamic Suggested Questions ────────────────────────── */}
              <AnimatePresence>
                {messages.length === 1 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-4 py-3 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-950 shrink-0"
                  >
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <MessageSquare size={10} /> Suggested Questions
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {pageSuggestions.map((promptText, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          onClick={() => handleSend(promptText)}
                          className="text-left px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-between group focus:outline-none"
                        >
                          <span className="truncate pr-2">{promptText}</span>
                          <ChevronRight size={12} className="text-slate-400 group-hover:text-indigo-500 shrink-0 transition-colors" />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Error Banner ───────────────────────────────────────── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-4 mb-2 px-3 py-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-300 shrink-0"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <AlertCircle size={14} className="shrink-0 text-rose-500" />
                      <span className="truncate">{error.message}</span>
                    </div>
                    {error.lastAttempt && (
                      <button
                        onClick={() => handleSend(error.lastAttempt)}
                        className="px-2 py-1 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 rounded-lg font-bold text-[10px] shrink-0 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Fixed Chat Input Composer ──────────────────────────── */}
              <div className="px-4 pb-4 pt-2.5 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-950 shrink-0">
                <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all p-1.5">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask HCM Copilot anything..."
                    disabled={isLoading}
                    rows={1}
                    className="flex-1 bg-transparent py-1.5 pl-2.5 text-[12px] font-medium outline-none text-slate-900 dark:text-white placeholder:text-slate-400 resize-none min-h-[36px] max-h-[120px] leading-relaxed"
                    style={{ height: '36px' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center shadow-md shadow-indigo-500/20 transition-all shrink-0 focus:outline-none"
                    aria-label="Send message"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </motion.button>
                </div>
                <div className="flex justify-between items-center px-1 mt-2 text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                  <span>
                    Press <kbd className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[8px] font-mono">Enter</kbd> to send · <kbd className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[8px] font-mono">Shift+Enter</kbd> line
                  </span>
                  <span>ESC to close</span>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilot;
