import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Send, 
  Paperclip, Smile, Image as ImageIcon, MessageSquare, 
  CheckCheck, ChevronLeft, SquarePen, CheckCircle, X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useAuth } from '../../hooks/useAuth';
import CenterModal from '../../shared/components/layout/CenterModal';
import { getBackendURL } from '../../utils/apiService';

const Messages = () => {
  const { tickets = [], createTicket, replyToTicket, closeTicket, employees = [], showToast } = useHR();
  const { user } = useAuth();

  const [selectedChat, setSelectedChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [newThreadData, setNewThreadData] = useState({ to: '', subject: '', message: '' });
  
  const fileInputRef = useRef(null);
  const [attachment, setAttachment] = useState(null);

  // Map tickets to conversations format
  const conversations = tickets.map(ticket => {
    const lastMessage = ticket.messages?.[ticket.messages.length - 1];
    return {
      id: ticket.id,
      name: ticket.user?.employeeProfile?.fullName || ticket.user?.email || 'Unknown User',
      role: 'Employee',
      lastMsg: lastMessage?.text || ticket.subject,
      time: lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.user?.employeeProfile?.fullName || ticket.user?.email || 'U')}&background=random`,
      status: ticket.status === 'OPEN' ? 'online' : 'offline',
      rawTicket: ticket
    };
  });

  const messages = {};
  tickets.forEach(ticket => {
    messages[ticket.id] = (ticket.messages || []).map(msg => ({
      id: msg.id,
      text: msg.text,
      time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: msg.senderId === user?.id ? 'sent' : 'received',
      attachmentUrl: msg.attachmentUrl
    }));
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachment) || !selectedChat) return;

    if (attachment) {
      const formData = new FormData();
      if (inputText.trim()) formData.append('text', inputText);
      formData.append('file', attachment);
      await replyToTicket(selectedChat, formData);
    } else {
      await replyToTicket(selectedChat, inputText); // Or we can pass { text: inputText } if hrAPI expects it, wait hrAPI in HRContext does {text: text}, but if we pass formData... let's check HRContext!
      // Wait, HRContext replyToTicket takes (id, text). I should pass FormData directly!
      // Let's modify HRContext instead to accept payload directly, or we can just send FormData from HRContext.
    }
    
    setInputText('');
    setAttachment(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleStartThread = async (e) => {
    e.preventDefault();
    if (!newThreadData.to || !newThreadData.subject || !newThreadData.message) return;
    await createTicket(newThreadData);
    setIsNewThreadOpen(false);
    setNewThreadData({ to: '', subject: '', message: '' });
  };

  const handleSelectChat = (id) => {
    setSelectedChat(id);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in focus:outline-none">
      <div className="flex-1 flex overflow-hidden card p-0 border-none bg-white shadow-soft">
        
        <div className={cn("w-full lg:w-96 flex flex-col border-r border-slate-50 transition-all z-10", selectedChat ? "hidden lg:flex" : "flex")}>
          <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
             <h2 className="text-xl font-extrabold text-slate-900 tracking-tight dark:text-white">Messages</h2>
             <button onClick={() => setIsNewThreadOpen(true)} className="p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-100 hover:bg-primary-700 active:scale-95 transition-all">
                <SquarePen size={20} />
             </button>
          </div>

          <div className="p-6 space-y-4 shrink-0">
             <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" placeholder="Search conversations..." className="input-field pl-10 h-11" />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-slate-50">
             {conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={cn("w-full p-6 flex items-start gap-4 transition-all hover:bg-slate-50/50 text-left relative group", selectedChat === chat.id ? "bg-primary-50/30 ring-1 ring-primary-100/50" : "")}
                >
                   <div className="relative shrink-0">
                      <img src={chat.img} alt={chat.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" />
                      <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white", chat.status === 'online' ? "bg-emerald-500" : "bg-slate-300")} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                         <h4 className="text-sm font-bold text-slate-900 truncate dark:text-white">{chat.name}</h4>
                         <span className="text-[10px] font-bold text-slate-400 font-bold">{chat.time}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 truncate mb-1">{chat.lastMsg}</p>
                      <span className="text-[9px] font-bold text-primary-600 font-bold">{chat.role}</span>
                   </div>
                   {chat.unread > 0 && (
                      <div className="ml-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-primary-200">
                         {chat.unread}
                      </div>
                   )}
                </button>
             ))}
          </div>
        </div>

        <div className={cn("flex-1 flex flex-col relative", !selectedChat ? "hidden lg:flex" : "flex")}>
          {selectedChat ? (
            <>
              <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedChat(null)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
                       <ChevronLeft size={24} />
                    </button>
                    <div className="relative">
                       <img src={conversations.find(c => c.id === selectedChat)?.img} className="w-11 h-11 rounded-2xl object-cover" alt="" />
                       <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 dark:text-white">
                          {conversations.find(c => c.id === selectedChat)?.name}
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded-md font-bold">{conversations.find(c => c.id === selectedChat)?.role}</span>
                       </h3>
                    </div>
                 </div>
                 <div className="flex items-center gap-1.5">
                    {conversations.find(c => c.id === selectedChat)?.rawTicket?.status !== 'RESOLVED' && (
                       <button onClick={() => closeTicket(selectedChat)} className="p-2.5 text-emerald-500 hover:text-white hover:bg-emerald-500 rounded-xl transition-all flex items-center gap-2" title="Mark as Resolved">
                          <CheckCircle size={20} />
                       </button>
                    )}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/30">
                 {(messages[selectedChat] || []).map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[75%]", msg.type === 'sent' ? "ml-auto items-end" : "items-start")}>
                       <div className={cn("px-5 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm transition-all", msg.type === 'sent' ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none")}>
                          {msg.attachmentUrl && (
                             <a href={msg.attachmentUrl.startsWith('/') ? `${getBackendURL()}${msg.attachmentUrl}` : msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block mb-2 text-primary-300 hover:text-primary-200 underline break-all" onClick={(e) => e.stopPropagation()}>
                                📎 View Attachment
                             </a>
                          )}
                          {msg.text}
                       </div>
                       <div className="flex items-center gap-1.5 mt-2 px-1">
                          <span className="text-[10px] font-bold text-slate-400 font-bold">{msg.time}</span>
                          {msg.type === 'sent' && <CheckCheck size={12} className="text-primary-500" />}
                       </div>
                    </div>
                 ))}
              </div>

              <div className="p-6 border-t border-slate-50 bg-white shrink-0">
                 {attachment && (
                    <div className="mb-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                       <span className="text-sm font-medium text-slate-700 truncate flex-1">{attachment.name}</span>
                       <button type="button" onClick={() => setAttachment(null)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                          <X size={16} />
                       </button>
                    </div>
                 )}
                 <form onSubmit={handleSendMessage} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-2 pl-6 pr-2 flex items-center gap-4 focus-within:ring-4 focus-within:ring-primary-50 transition-all overflow-visible relative group">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button type="button" className="text-slate-400 hover:text-primary-600 transition-colors"><Smile size={22} /></button>
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder="Type your message here..." 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-900 h-10"
                    />
                    <div className="flex items-center gap-1">
                       <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-white rounded-full transition-all"><Paperclip size={20} /></button>
                       <button type="submit" disabled={!inputText.trim() && !attachment} className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-200 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 transition-all ml-1">
                          <Send size={18} />
                       </button>
                    </div>
                 </form>
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
                <div className="w-24 h-24 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center text-primary-600 shadow-xl mb-8">
                   <MessageSquare size={48} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2 dark:text-white">Select a Conversation</h3>
                <p className="text-slate-500 font-medium max-w-sm mb-10">Choose a candidate or team member from the sidebar to start corresponding.</p>
                <button onClick={() => setIsNewThreadOpen(true)} className="px-8 py-3.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                   <SquarePen size={18} />
                   <span>Start a New Thread</span>
                </button>
             </div>
          )}
        </div>
      </div>

      <CenterModal isOpen={isNewThreadOpen} onClose={() => setIsNewThreadOpen(false)} title="Start New Thread" maxWidth="max-w-md">
         <form onSubmit={handleStartThread} className="space-y-4 p-8 pt-0">
            <div>
               <label className="block text-xs font-bold text-slate-700 font-bold mb-2">To</label>
               <select 
                 value={newThreadData.to} 
                 onChange={e => setNewThreadData({...newThreadData, to: e.target.value})}
                 className="input-field w-full"
                 required
               >
                  <option value="">Select recipient...</option>
                  {employees.map(emp => (
                     <option key={emp.id} value={emp.userId}>{emp.fullName}</option>
                  ))}
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-700 font-bold mb-2">Subject</label>
               <input 
                 type="text" 
                 value={newThreadData.subject}
                 onChange={e => setNewThreadData({...newThreadData, subject: e.target.value})}
                 className="input-field w-full"
                 required
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Message</label>
               <textarea 
                 value={newThreadData.message}
                 onChange={e => setNewThreadData({...newThreadData, message: e.target.value})}
                 className="input-field h-24 py-3 w-full resize-none"
                 required
               ></textarea>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
               <button type="button" onClick={() => setIsNewThreadOpen(false)} className="btn-secondary w-full sm:flex-1">Cancel</button>
               <button type="submit" className="btn-primary w-full sm:flex-1">Send Message</button>
            </div>
         </form>
      </CenterModal>
    </div>
  );
};

export default Messages;
