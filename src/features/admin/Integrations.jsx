import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
   Plus,
   Search,
   ExternalLink,
   Settings,
   Database,
   MessageSquare,
   Mail,
   Video,
   ShieldCheck,
   Activity,
   CheckCircle2,
   XCircle,
   Zap,
   Lock,
   SearchCheck,
   RefreshCw,
   MoreVertical,
   Terminal,
   Grid,
   Bot,
   Unplug,
   Link,
   Trash2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAdmin } from '../../context/AdminContext';
import IntegrationModal from '../../shared/components/admin/IntegrationModal';
import APIDocsDrawer from '../../shared/components/admin/APIDocsDrawer';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';

const Integrations = () => {
   const { integrations, updateIntegration, deleteIntegration, showToast } = useAdmin();
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [isDocsOpen, setIsDocsOpen] = useState(false);
   const [integrationToEdit, setIntegrationToEdit] = useState(null);
   const [integrationToDelete, setIntegrationToDelete] = useState(null);
   const [searchTerm, setSearchTerm] = useState('');
   const visualMap = {
      'Google Workspace': { icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      'Slack Enterprise': { icon: MessageSquare, color: 'text-primary-600', bg: 'bg-primary-50' },
      'Zoom Meetings': { icon: Video, color: 'text-blue-500', bg: 'bg-blue-50' },
      'OpenAI GPT-4': { icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      'WhatsApp Business': { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
      'SMTP Service': { icon: Mail, color: 'text-slate-400', bg: 'bg-slate-50' },
      'Oracle ERP': { icon: Database, color: 'text-rose-600', bg: 'bg-rose-50' },
      'Zapier': { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
   };

   const filteredIntegrations = integrations.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const activeCount = integrations.filter(t => t.status === 'Connected').length;
   const totalCount = integrations.length;

   return (
      <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="hcm-page-title">System Integrations</h1>
               <p className="text-slate-500 font-medium tracking-tight">Connect third-party tools, manage API credentials and monitor realtime data sync</p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => setIsDocsOpen(true)} className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2 cursor-pointer">
                  <Terminal size={18} />
                  <span className="hidden sm:inline">API Docs</span>
               </button>
               <button onClick={() => { setIntegrationToEdit(null); setIsAddModalOpen(true); }} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200 cursor-pointer">
                  <Plus size={18} />
                  <span>Add Integration</span>
               </button>
            </div>
         </div>

         {/* Hero Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 bg-slate-900 border-none shadow-soft text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <Grid size={100} />
               </div>
               <p className="text-[10px] font-bold text-primary-400 mb-8">Ecosystem Health</p>
               <div className="flex items-end justify-between">
                  <div>
                     <h3 className="text-4xl font-bold mb-2 tracking-tighter">{activeCount}/{totalCount}</h3>
                     <p className="text-xs font-bold text-slate-500 font-bold leading-none">Active Connectors</p>
                  </div>
                  <div className="text-right">
                     <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1 mb-2">
                        <Activity size={14} className="animate-pulse" /> Smooth
                     </span>
                     <p className="text-[9px] font-bold text-slate-600">Last health check: 2m ago</p>
                  </div>
               </div>
            </div>
            <div className="md:col-span-2 card p-8 flex flex-col justify-center">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                     <RefreshCw size={28} className="animate-spin-slow" />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900 font-bold dark:text-white">Global Data Sync Rate</h4>
                        <span className="text-xs font-black text-indigo-600 tracking-tight">8.4 GB/hr</span>
                     </div>
                     <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                        <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: '74%' }}
                           className="h-full bg-indigo-600 rounded-full shadow-lg shadow-indigo-100"
                        />
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Peak performance maintained across 12 nodes</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Integration Grid */}
         <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-50">
               <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Available Connections</h3>
               <div className="relative w-full lg:w-96">
                  <Search className="absolute left-3 top-3 text-slate-300" size={18} />
                  <input
                     type="text"
                     placeholder="Search by name or category..."
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                     className="input-field pl-10 h-11 bg-white shadow-sm border-none"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {filteredIntegrations.map((tool) => {
                  const visuals = visualMap[tool.name] || { icon: Database, color: 'text-slate-600', bg: 'bg-slate-50' };
                  const Icon = visuals.icon;
                  return (
                     <motion.div
                        key={tool.id}
                        whileHover={{ y: -5, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        className="card p-6 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 shadow-soft group flex flex-col min-h-[300px] h-auto"
                     >
                        <div className="flex items-start justify-between mb-8">
                           <div className={cn("p-4 rounded-[1.5rem] group-hover:scale-110 transition-transform", visuals.bg, visuals.color)}>
                              <Icon size={26} />
                           </div>
                           <div className={cn(
                              "px-2 py-1 rounded-lg text-[8px] font-extrabold uppercase tracking-widest border transition-all shrink-0",
                              tool.status === 'Connected' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                           )}>
                              {tool.status}
                           </div>
                        </div>
                        <div className="flex-1">
                           <h4 className="text-lg font-extrabold text-slate-900 mb-1 dark:text-white">{tool.name}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tool.category}</p>
                           {tool.status === 'Connected' && <p className="text-xs text-slate-500 font-medium mt-3 border-t border-slate-50 pt-3">Health: <span className="font-bold text-emerald-600">{tool.health}</span></p>}
                        </div>
                        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50 transition-opacity">
                           <button onClick={() => { setIntegrationToEdit(tool); setIsAddModalOpen(true); }} className="text-[9px] font-bold text-primary-600 flex items-center gap-1.5 hover:gap-2 transition-all">
                              {tool.status === 'Connected' ? 'Manage Keys' : 'Connect Now'} <ExternalLink size={12} />
                           </button>
                           <ActionDropdown
                              actions={[
                                 { label: tool.status === 'Connected' ? 'Configure' : 'Setup', icon: Settings, onClick: () => { setIntegrationToEdit(tool); setIsAddModalOpen(true); } },
                                 { label: tool.status === 'Connected' ? 'Sync Now' : 'Connect', icon: tool.status === 'Connected' ? RefreshCw : Link, onClick: () => tool.status === 'Connected' ? showToast(`Sync triggered for ${tool.name}`) : updateIntegration(tool.id, { status: 'Connected' }) },
                                 { label: 'View Logs', icon: Terminal, onClick: () => showToast(`Logs opened for ${tool.name}`) },
                                 ...(tool.status === 'Connected' ? [{ label: 'Disconnect', icon: Unplug, danger: true, onClick: () => updateIntegration(tool.id, { status: 'Disconnected' }) }] : []),
                                 { label: 'Delete', icon: Trash2, danger: true, onClick: () => setIntegrationToDelete(tool) },
                              ]}
                           />
                        </div>
                     </motion.div>
                  )
               })}
            </div>
         </div>



         <IntegrationModal
            isOpen={isAddModalOpen}
            onClose={() => { setIsAddModalOpen(false); setIntegrationToEdit(null); }}
            integration={integrationToEdit}
         />

         <APIDocsDrawer
            isOpen={isDocsOpen}
            onClose={() => setIsDocsOpen(false)}
         />

         <ConfirmDialog
            isOpen={!!integrationToDelete}
            title="Delete Integration"
            message={`Are you sure you want to completely remove the ${integrationToDelete?.name} connection profile? All keys and sync rules will be permanently deleted.`}
            confirmText="Confirm Delete"
            onConfirm={() => {
               deleteIntegration(integrationToDelete.id);
               setIntegrationToDelete(null);
            }}
            onCancel={() => setIntegrationToDelete(null)}
         />
      </div>
   );
};

export default Integrations;
