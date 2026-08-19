import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Send, Brain, User, Loader2,
  Minimize2, Maximize2, RotateCcw, ChevronDown,
  Zap, MessageSquare, Copy, Check, AlertCircle
} from 'lucide-react';
import { employeeAPI } from '../../../utils/apiService';
import { useLocation } from 'react-router-dom';

// ── Page-aware suggested prompts ─────────────────────────────
const PAGE_PROMPTS = {
  '/employee/leaves':      ['What is my leave balance?', 'How do I apply for sick leave?', 'Show my recent leave history'],
  '/employee/payroll':     ['Explain my payslip structure', 'What is my monthly CTC?', 'What deductions are applied to my salary?'],
  '/employee/attendance':  ['What are my work hours this week?', 'How do I correct my attendance?', 'Am I late today?'],
  '/employee/performance': ['How are my performance goals tracked?', 'What is the appraisal cycle?'],
  '/employee/profile':     ['How do I update my profile information?', 'Who do I contact for bank details update?'],
};

const DEFAULT_PROMPTS = [
  'What is my leave balance?',
  'Explain my payslip structure',
  'How do I request attendance correction?',
  'What is the probation confirmation process?',
];

// ── Inline style parses (bold, italic, code) ──────────────────
const parseInlineStyles = (text) => {
  const boldRegex = /\*\/(.*?)\*\//g; // standard check helper
  const cleanText = text;
  
  let parts = [cleanText];

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
  applyRegex(/\*(.*?)\*/g, (txt) => <em key={txt} className="italic">{txt}</em>);
  applyRegex(/`(.*?)`/g, (txt) => <code key={txt} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1 py-0.5 rounded text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{txt}</code>);

  return parts;
};

// ── Markdown block parser (headers, lists, tables) ──────────
const parseMarkdownText = (text) => {
  const blocks = [];
  const lines = text.split('\n');
  let currentList = [];
  let isBulletList = false;
  let isNumList = false;
  let isTable = false;
  let tableHeader = [];
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle Table
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
        <div key={`table-${i}`} className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                {tableHeader.map((th, hIdx) => (
                  <th key={hIdx} className="px-3 py-2 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{th}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-900">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-350">{cell}</td>
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

    // Handle Lists
    const bulletMatch = line.match(/^[\-\*]\s+(.+)/);
    const numMatch = line.match(/^\d+\.\s+(.+)/);

    if (bulletMatch) {
      if (isNumList) {
        blocks.push(<ol key={`ol-${i}`} className="list-decimal pl-4 mb-2 space-y-1">{currentList}</ol>);
        currentList = [];
        isNumList = false;
      }
      isBulletList = true;
      currentList.push(<li key={`li-${i}`} className="text-slate-600 dark:text-slate-400">{parseInlineStyles(bulletMatch[1])}</li>);
      continue;
    } else if (numMatch) {
      if (isBulletList) {
        blocks.push(<ul key={`ul-${i}`} className="list-disc pl-4 mb-2 space-y-1">{currentList}</ul>);
        currentList = [];
        isBulletList = false;
      }
      isNumList = true;
      currentList.push(<li key={`li-${i}`} className="text-slate-600 dark:text-slate-400">{parseInlineStyles(numMatch[1])}</li>);
      continue;
    } else {
      if (isBulletList) {
        blocks.push(<ul key={`ul-${i}`} className="list-disc pl-4 mb-2 space-y-1">{currentList}</ul>);
        currentList = [];
        isBulletList = false;
      }
      if (isNumList) {
        blocks.push(<ol key={`ol-${i}`} className="list-decimal pl-4 mb-2 space-y-1">{currentList}</ol>);
        currentList = [];
        isNumList = false;
      }
    }

    // Handle Headings
    if (line.startsWith('### ')) {
      blocks.push(<h3 key={`h3-${i}`} className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1">{parseInlineStyles(line.slice(4))}</h3>);
    } else if (line.startsWith('## ')) {
      blocks.push(<h2 key={`h2-${i}`} className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-4 mb-1.5">{parseInlineStyles(line.slice(3))}</h2>);
    } else if (line.startsWith('# ')) {
      blocks.push(<h1 key={`h1-${i}`} className="text-base font-extrabold text-slate-900 dark:text-slate-50 mt-4 mb-2">{parseInlineStyles(line.slice(2))}</h1>);
    } else if (line.trim() !== '') {
      blocks.push(<p key={`p-${i}`} className="text-slate-700 dark:text-slate-350 leading-relaxed mb-2">{parseInlineStyles(line)}</p>);
    }
  }

  // Flush remaining elements
  if (isTable) {
    blocks.push(
      <div key="table-end" className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              {tableHeader.map((th, hIdx) => (
                <th key={hIdx} className="px-3 py-2 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{th}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-900">
            {tableRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (isBulletList) {
    blocks.push(<ul key="ul-end" className="list-disc pl-4 mb-2 space-y-1">{currentList}</ul>);
  }
  if (isNumList) {
    blocks.push(<ol key="ol-end" className="list-decimal pl-4 mb-2 space-y-1">{currentList}</ol>);
  }

  return blocks;
};

// ── Metrics Extractor / Elegant Data Cards ──────────────────
const parseParagraphsAndLists = (text) => {
  const lines = text.split('\n');
  const cards = [];
  const processedLines = [];

  for (let line of lines) {
    const cleanLine = line.replace(/\*\*/g, '').trim();
    
    // Pattern checks
    const ctcMatch = cleanLine.match(/^(Monthly CTC|Annual CTC|Basic Pay|Net Salary|Net Pay|Leave Balance|Total Approved Days|Pending Requests)\s*:\s*(.+)$/i);
    if (ctcMatch) {
      const [, key, val] = ctcMatch;
      cards.push({ key, value: val });
    } else {
      processedLines.push(line);
    }
  }

  const elements = [];
  if (cards.length > 0) {
    elements.push(
      <div key="metrics" className="grid grid-cols-2 gap-2.5 my-2">
        {cards.map((card, i) => (
          <div key={i} className="bg-gradient-to-br from-indigo-50/60 to-indigo-100/30 dark:from-indigo-950/20 dark:to-indigo-950/40 border border-indigo-100/85 dark:border-indigo-900/40 rounded-2xl p-3 shadow-xs">
            <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-500 block mb-0.5">{card.key}</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{card.value}</span>
          </div>
        ))}
      </div>
    );
  }

  const remainingText = processedLines.join('\n');
  elements.push(...parseMarkdownText(remainingText));
  return elements;
};

// ── Message Content Renderer ────────────────────────────────
const renderMessageContent = (content) => {
  if (!content) return null;

  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'code', lang: match[1], value: match[2] });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.substring(lastIndex) });
  }

  return parts.map((part, index) => {
    if (part.type === 'code') {
      return (
        <pre key={index} className="bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto text-[11px] font-mono my-2 border border-slate-850">
          <code>{part.value}</code>
        </pre>
      );
    }
    return (
      <div key={index} className="space-y-1.5">
        {parseParagraphsAndLists(part.value)}
      </div>
    );
  });
};

// ── Message Bubble Component ─────────────────────────────────
const MessageBubble = ({ msg, index }) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={`flex gap-2.5 group ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
        isUser
          ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-405'
          : 'bg-gradient-to-br from-indigo-600 to-violet-600 border-indigo-400/20 text-white'
      }`}>
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>

      {/* Bubble */}
      <div className={`relative max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-[12px] leading-relaxed shadow-xs ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-xs font-medium'
            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-205 border border-slate-100 dark:border-slate-800/80 rounded-tl-xs'
        }`}>
          {isUser
            ? <p className="whitespace-pre-wrap">{msg.content}</p>
            : renderMessageContent(msg.content)
          }
        </div>

        {/* Action tray */}
        <div className="flex items-center gap-2 mt-0.5 px-1 min-h-[14px]">
          {!isUser && (
            <button
              onClick={handleCopy}
              title="Copy answer"
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-650 dark:hover:text-slate-350"
            >
              {copied ? <><Check size={10} className="text-emerald-500" /> Copied</> : <><Copy size={10} /> Copy</>}
            </button>
          )}
          {msg.timestamp && (
            <span className="text-[9px] text-slate-350 dark:text-slate-550">
              {msg.timestamp}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Typing Dots Indicator ─────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-2.5">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 border border-indigo-450/20 text-white flex items-center justify-center shrink-0 shadow-xs">
      <Sparkles size={14} />
    </div>
    <div className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-slate-450">
      <span className="text-[11px] font-medium animate-pulse">HCM.ai is thinking</span>
      <div className="flex items-center gap-1 ml-0.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-500"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ── Main Copilot Component ────────────────────────────────────
const AICopilot = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your **HCM.ai Copilot** — your intelligent HR assistant.\n\nI can help you with:\n- Leave balances & requests\n- Payroll & salary queries\n- Attendance corrections\n- Company policies\n- Performance goals\n\nWhat would you like to know?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const panelRef       = useRef(null);
  const location       = useLocation();

  const pageSuggestions = PAGE_PROMPTS[location.pathname] || DEFAULT_PROMPTS;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Click outside listener (Desktop only, since mobile uses backdrop)
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

  // Auto-focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setInput('');
    setError(null);
    setIsLoading(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user', content: text, timestamp: now };
    setMessages(prev => [...prev, userMessage]);

    try {
      const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const response = await employeeAPI.aiCopilotChat(text, history, location.pathname);

      const resData = response.data?.data || response.data || {};
      const answer = resData.answer || resData.reply || 'I could not generate a response. Please try again.';

      if (response.data?.success || resData.success || resData.answer) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent: resData.intent,
            dataUsed: resData.dataUsed
          }
        ]);
      } else {
        throw new Error(resData.error || 'Failed to get response');
      }
    } catch (err) {
      const errMsg = err?.response?.status === 401
        ? 'Please log in again to use the Copilot.'
        : err?.response?.status === 500
        ? 'The AI service encountered an error. Please try again in a moment.'
        : err?.message || 'I encountered a connection issue. Please check your network and try again.';

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
      content: 'Chat cleared. How can I help you?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setError(null);
  };

  return (
    <>
      {/* ── Floating AI Button (Only visible when closed) ────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-[9999]">
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsOpen(true)}
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 border border-white/10 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              title="Open HCM.ai Copilot"
              aria-label="Open HCM.ai Copilot"
            >
              <span className="absolute inset-0 bg-indigo-500/20 rounded-2xl animate-pulse pointer-events-none" />
              <Brain size={24} className="relative z-10" />
              
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-slate-900" />
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* ── Copilot Sliding Panel ─────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (Visible & dims page ONLY on mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9990] sm:bg-slate-900/40"
            />

            {/* Floating Drawer Container */}
            <motion.div
              ref={panelRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className={`fixed right-0 top-0 bottom-0 w-full sm:w-[480px] sm:max-w-[480px] bg-white dark:bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.25)] border-l border-slate-200/80 dark:border-slate-800 z-[9995] flex flex-col overflow-hidden rounded-none`}
            >
              {/* ── Header ────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-650 to-violet-650 relative overflow-hidden shrink-0 border-b border-indigo-700/20">
                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <Sparkles className="text-white animate-pulse" size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-tight">HCM.ai Copilot</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                      <span className="text-[9px] font-semibold text-indigo-100 tracking-wide">Online · GPT-4o-mini</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 relative z-10">
                  <button
                    onClick={handleClearChat}
                    title="Clear Chat history"
                    aria-label="Clear Chat history"
                    className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close Copilot"
                    aria-label="Close Copilot"
                    className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* ── Context aware indicator ───────────────────────────── */}
              {location.pathname !== '/' && (
                <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 shrink-0">
                  <Zap size={10} className="text-indigo-500 shrink-0" />
                  <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                    Context-aware: <span className="font-bold text-slate-700 dark:text-slate-200">{location.pathname}</span>
                  </span>
                </div>
              )}

              {/* ── Messages & Chat Area ───────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/40 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} index={i} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Dynamic Suggested Prompts ──────────────────────────── */}
              <AnimatePresence>
                {messages.length === 1 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-4 py-3 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shrink-0"
                  >
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <MessageSquare size={9} /> Suggested Questions
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {pageSuggestions.map((p, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleSend(p)}
                          className="text-left px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[11px] font-semibold text-slate-650 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all group flex items-center gap-2 focus:outline-none"
                        >
                          <ChevronDown size={11} className="rotate-[-90deg] text-slate-400 group-hover:text-indigo-500 shrink-0 transition-colors" />
                          {p}
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
                    className="mx-4 mb-2 px-3.5 py-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-xl flex items-start gap-2 text-[11px] text-red-650 dark:text-red-400 shrink-0 shadow-xs"
                  >
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <span className="font-bold block text-[10px] mb-0.5 opacity-80 uppercase tracking-widest">Error</span>
                        <span>{error.message}</span>
                      </div>
                      {error.lastAttempt && (
                        <button
                          onClick={() => handleSend(error.lastAttempt)}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-md font-bold text-[10px] transition-all ml-2 border border-red-200 dark:border-red-800 shadow-sm shrink-0 whitespace-nowrap"
                        >
                          Retry Message
                        </button>
                      )}
                    </div>
                    <button onClick={() => setError(null)} className="shrink-0 text-red-400 hover:text-red-600 ml-1"><X size={12} /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Chat Input composer ────────────────────────────────── */}
              <div className="px-4 pb-4 pt-2.5 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shrink-0">
                <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all p-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask HCM.ai anything..."
                    disabled={isLoading}
                    rows={1}
                    className="flex-1 bg-transparent py-2.5 pl-3.5 text-[12px] outline-none text-slate-900 dark:text-white placeholder-slate-450 resize-none min-h-[38px] max-h-[120px] leading-relaxed"
                    style={{ height: '38px' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="w-9 h-9 mb-0.5 mr-0.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-650 hover:to-violet-650 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center shadow-md shadow-indigo-500/20 transition-all shrink-0 focus:outline-none"
                    aria-label="Send query"
                  >
                    {isLoading
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Send size={13} />
                    }
                  </motion.button>
                </div>
                <div className="flex justify-between items-center px-1.5 mt-2">
                  <span className="text-[9px] text-slate-400">
                    Press <kbd className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded text-[8px] font-mono">Enter</kbd> to send · <kbd className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded text-[8px] font-mono">Shift+Enter</kbd> line
                  </span>
                  <span className="text-[9px] text-slate-400">
                    ESC to close
                  </span>
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
