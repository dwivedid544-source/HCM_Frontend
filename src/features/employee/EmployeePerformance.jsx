import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Target, Award, TrendingUp, Star, ChevronRight, Calendar, ExternalLink, Download, 
  Clock, CheckCircle2, AlertCircle, Zap, User, LayoutGrid, X, Edit, Info, ShieldCheck, Trash2, Plus
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEmployee } from '../../context/EmployeeContext';
import CenterModal from '../../shared/components/layout/CenterModal';

const EmployeePerformance = () => {
  const { performance, updateGoalProgress, addGoal, deleteGoal, upsertSkill, deleteSkill, showToast } = useEmployee();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showReviewHistory, setShowReviewHistory] = useState(false);
  const [showSkillVault, setShowSkillVault] = useState(false);
  const [showVisualTrends, setShowVisualTrends] = useState(false);
  const [showAcademy, setShowAcademy] = useState(false);
  const [showStrategyRoadmap, setShowStrategyRoadmap] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(50);

  const stats = [
    { label: 'Platform Rating', value: '4.95', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Milestones Hit', value: '18', icon: Target, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Core Skills', value: performance.skills.length, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Career Growth', value: 'Exceed Expectations', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const handleUpdateProgress = (e) => {
    e.preventDefault();
    const progress = parseInt(e.target.progress.value);
    updateGoalProgress(selectedGoal.id, progress);
    setSelectedGoal(null);
    showToast(`Goal progress updated to ${progress}%`);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative max-w-7xl mx-auto text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Strategy & Performance</h1>
          <p className="text-slate-500 font-bold tracking-tight">Monitor your career KPIs, professional goals, and internal reviews</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button onClick={() => {
            const content = `HCM Performance Report\n\nPlatform Rating: 4.95\nMilestones Hit: 18\nCore Skills: ${performance.skills.length}\nCareer Growth: Exceed Expectations\n\nActive Goals:\n${performance.goals.map(g => `- ${g.title} (${g.progress}% completed)`).join('\n')}\n`;
            const blob = new Blob([content], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'Performance_Report.txt';
            link.click();
            showToast('Performance report downloaded');
          }} className="btn-secondary px-6 py-2.5 font-bold flex justify-center items-center gap-2">
             <Download size={18} />
             <span>Export PDF</span>
          </button>
          <button onClick={() => setShowReviewHistory(true)} className="btn-primary px-8 py-2.5 font-bold flex justify-center items-center gap-2 shadow-xl shadow-primary-200">
             <LayoutGrid size={18} />
             <span>Review Vault</span>
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
                  <h3 className={cn("font-black text-slate-900 tracking-tight leading-tight dark:text-white break-words whitespace-normal", stat.value.toString().length > 15 ? "text-base sm:text-lg lg:text-sm xl:text-lg" : "text-2xl sm:text-3xl")}>{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* Main Goals Section */}
         <div className="lg:col-span-8 space-y-8">
            <div className="card p-0 border-none bg-white shadow-soft overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-4 italic tracking-tight dark:text-white">
                     <Target className="text-primary-600" size={26} />
                     Active Strategic Goals
                  </h3>
                  <div className="flex items-center gap-3">
                      <button onClick={() => setShowAddGoalModal(true)} className="btn-primary px-4 py-2 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                         <Plus size={14} />
                         <span>Add Goal</span>
                      </button>
                      <button onClick={() => setShowStrategyRoadmap(true)} className="text-[10px] font-bold text-primary-600 font-bold hover:underline cursor-pointer">Full Strategy</button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/30">
                           <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Objective / Milestone</th>
                           <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Due Cycle</th>
                           <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Completion</th>
                           <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-right">Registry</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {performance.goals.map((goal, i) => (
                           <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-7">
                                 <p className="font-black text-slate-800 text-sm italic">{goal.title}</p>
                                 <p className="text-[10px] font-bold text-slate-400 font-bold mt-1.5 flex items-center gap-2">
                                    <ShieldCheck size={10} className="text-emerald-500" /> Priority: {goal.priority}
                                 </p>
                              </td>
                              <td className="px-8 py-7 text-center">
                                 <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-[11px] tabular-nums">
                                    <Clock size={14} className="text-slate-300" />
                                    {goal.deadline}
                                 </div>
                              </td>
                              <td className="px-8 py-7">
                                 <div className="flex flex-col gap-2 min-w-[150px]">
                                    <div className="flex justify-between items-center px-1">
                                       <span className="text-[10px] font-black text-slate-900">{goal.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-[1px]">
                                       <motion.div 
                                         initial={{ width: 0 }}
                                         animate={{ width: `${goal.progress}%` }}
                                         className={cn(
                                            "h-full rounded-full transition-all",
                                            goal.progress === 100 ? "bg-emerald-500" : goal.priority === 'High' ? "bg-rose-500" : "bg-primary-600"
                                         )} 
                                       />
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-7 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                     <button onClick={() => setSelectedGoal(goal)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary-600 border border-slate-100 rounded-2xl shadow-sm transition-all hover:scale-110" title="Edit Progress">
                                        <Edit size={16} />
                                     </button>
                                     <button onClick={() => deleteGoal(goal.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 border border-slate-100 rounded-2xl shadow-sm transition-all hover:scale-110" title="Delete Goal">
                                        <Trash2 size={16} />
                                     </button>
                                  </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="card p-10 bg-slate-900 border-none shadow-premium relative overflow-hidden group min-h-[300px] flex flex-col justify-end text-left">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                  <BarChart3 size={300} />
               </div>
               <div className="relative z-10 space-y-6">
                  <div>
                     <h3 className="text-3xl font-bold text-white italic tracking-tighter leading-none mb-4">Quarterly Insight</h3>
                     <p className="text-primary-400 font-bold text-[10px] leading-none mb-8">Metric Analysis Cycle 2026</p>
                  </div>
                  <div className="grid grid-cols-3 gap-8 border-t border-white/5 pt-8">
                     <div>
                        <p className="text-[10px] font-black text-slate-500 font-bold mb-2">Internal Score</p>
                        <p className="text-2xl font-black text-white tracking-tighter italic">9.8/10</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 font-bold mb-2">Efficiency Mark</p>
                        <p className="text-2xl font-black text-emerald-400 tracking-tighter italic">Top 1%</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Collaboration</p>
                        <p className="text-2xl font-black text-primary-400 tracking-tighter italic">Elite</p>
                     </div>
                  </div>
                  <button onClick={() => setShowVisualTrends(true)} className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold transition-all flex items-center justify-center gap-3">
                     Explore Visual Trends <ExternalLink size={14} />
                  </button>
               </div>
            </div>
         </div>

         {/* Sidebar: Skills & Development */}
         <div className="lg:col-span-4 space-y-8">
            <div className="card p-8  text-left">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold text-slate-900 italic tracking-tight leading-none dark:text-white">Skills Matrix</h3>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                     <Award size={20} />
                  </div>
               </div>
               <div className="space-y-8">
                  {performance.skills.map((skill, i) => (
                     <div key={i} className="space-y-3 group cursor-default">
                        <div className="flex justify-between items-center text-[10px] font-black font-bold group-hover:text-primary-600 transition-colors">
                           <span className="text-slate-400">{skill.name}</span>
                           <span className="text-slate-900">{skill.level}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden p-[1px] border border-slate-100">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${skill.level}%` }}
                             className="h-full bg-slate-900 rounded-full group-hover:bg-primary-600 transition-colors" 
                           />
                        </div>
                     </div>
                  ))}
               </div>
               <button onClick={() => setShowSkillVault(true)} className="w-full mt-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">Update Skill Vault</button>
            </div>

            <div className="card p-10 bg-indigo-600 text-white border-none shadow-premium relative overflow-hidden group text-left">
               <div className="absolute -left-5 -top-5 opacity-10 rotate-12 transition-transform duration-700 group-hover:rotate-45">
                  <Zap size={150} />
               </div>
               <h3 className="text-[10px] font-bold font-bold text-indigo-200 mb-8 leading-none">Academy Portal</h3>
               <p className="text-base font-black italic tracking-tight text-white mb-10 leading-relaxed">Fuel your professional growth with curated internal courses.</p>
               <button onClick={() => setShowAcademy(true)} className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-bold text-[10px] shadow-2xl hover:bg-slate-50 transition-all relative z-10">
                  Launch Academy
               </button>
            </div>
         </div>
      </div>

      {/* Goal Update Modal */}
      <CenterModal isOpen={!!selectedGoal} onClose={() => setSelectedGoal(null)} title="Update Progress Registry">
         {selectedGoal && (
            <form onSubmit={handleUpdateProgress} className="p-8 space-y-8 text-left">
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                  <p className="text-[10px] font-bold text-slate-400 font-bold mb-2 leading-none">Target Objective</p>
                  <p className="text-lg font-black text-slate-800 leading-tight">"{selectedGoal.title}"</p>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[10px] font-black text-slate-400 font-bold">Completion Mark (%)</label>
                     <span className="text-lg font-black text-primary-600" id="progressVal">0%</span>
                  </div>
                  <input 
                    name="progress" 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue={selectedGoal.progress}
                    onChange={(e) => document.getElementById('progressVal').innerText = `${e.target.value}%`}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600" 
                  />
                  <div className="flex justify-between px-1 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                     <span>Not Started</span>
                     <span>In Progress</span>
                     <span>Completed</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Evidence / Notes</label>
                  <textarea rows="3" className="input-field py-4 bg-slate-50 border-transparent font-black resize-none" placeholder="Provide context for the progress adjustment..."></textarea>
               </div>
               <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setSelectedGoal(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Discard</button>
                  <button type="submit" className="flex-2 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200">Commit Update</button>
               </div>
            </form>
         )}
      </CenterModal>

      {/* Review Vault Modal */}
      <CenterModal isOpen={showReviewHistory} onClose={() => setShowReviewHistory(false)} title="Historical Performance Vault">
         <div className="p-8 space-y-6 text-left max-h-[80vh] overflow-y-auto">
            {performance.reviews?.length > 0 ? performance.reviews.map((rev, i) => (
               <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm transition-transform group-hover:rotate-12">
                           <Award size={28} />
                        </div>
                        <div>
                           <p className="text-lg font-bold text-slate-900 leading-none">{rev.period}</p>
                           <p className="text-[9px] font-black text-primary-500 font-bold mt-2">{rev.reviewer} • Review Lead</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-black text-slate-900 leading-none italic">{rev.rating}</p>
                        <div className="flex gap-0.5 mt-2">
                           {[1,2,3,4,5].map(s => <Star key={s} size={10} className="text-amber-400 fill-amber-400" />)}
                        </div>
                     </div>
                  </div>
                  <p className="text-sm font-bold text-slate-500 italic leading-relaxed">"{rev.text}"</p>
               </div>
            )) : (
              <p className="text-slate-400 text-center font-bold">No performance reviews available yet.</p>
            )}
            <button onClick={() => setShowReviewHistory(false)} className="w-full mt-4 py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200">Seal Vault</button>
         </div>
      </CenterModal>

      {/* Skill Vault Modal */}
      <CenterModal isOpen={showSkillVault} onClose={() => setShowSkillVault(false)} title="Update Skill Vault">
         <div className="p-8 space-y-6 text-left max-h-[80vh] overflow-y-auto">
            {/* List existing skills */}
            <div className="space-y-4">
               <h4 className="text-xs font-bold text-slate-400 font-bold">Active Skills Matrix</h4>
               {performance.skills?.length > 0 ? performance.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                     <div>
                        <p className="font-black text-slate-800">{skill.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">Level: {skill.level}%</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={async () => {
                            const newLvl = prompt(`Enter new level for ${skill.name} (0-100):`, skill.level);
                            if (newLvl !== null) {
                              const parsed = parseInt(newLvl);
                              if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                                await upsertSkill({ name: skill.name, level: parsed });
                              } else {
                                showToast('Invalid skill level', 'error');
                              }
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-bold rounded-lg hover:bg-primary-600 transition-all"
                        >
                           Edit
                        </button>
                        <button 
                          type="button"
                          onClick={() => deleteSkill(skill.id)} 
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                        >
                           <Trash2 size={14} />
                        </button>
                     </div>
                  </div>
               )) : (
                  <p className="text-slate-400 text-sm">No skills added yet.</p>
               )}
            </div>

            {/* Add new skill form */}
            <form onSubmit={async (e) => {
               e.preventDefault();
               if (!newSkillName.trim()) {
                  showToast('Skill name is required', 'error');
                  return;
               }
               await upsertSkill({ name: newSkillName, level: newSkillLevel });
               setNewSkillName('');
               setNewSkillLevel(50);
            }} className="pt-6 border-t border-slate-100 space-y-4">
               <h4 className="text-xs font-bold text-slate-400 font-bold">Register New Skill</h4>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 font-bold">Skill Name</label>
                  <input 
                     type="text" 
                     value={newSkillName}
                     onChange={(e) => setNewSkillName(e.target.value)}
                     placeholder="e.g. Next.js, Kubernetes"
                     className="input-field h-12 bg-slate-50 border-transparent font-black"
                  />
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Level (%)</label>
                     <span className="text-sm font-black text-primary-600">{newSkillLevel}%</span>
                  </div>
                  <input 
                     type="range" 
                     min="0" 
                     max="100" 
                     value={newSkillLevel}
                     onChange={(e) => setNewSkillLevel(parseInt(e.target.value))}
                     className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
               </div>
               <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-slate-200">
                  Add to Matrix
               </button>
            </form>

            <button type="button" onClick={() => setShowSkillVault(false)} className="w-full mt-4 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-bold">
               Close
            </button>
         </div>
      </CenterModal>

      {/* Visual Trends Modal */}
      <CenterModal isOpen={showVisualTrends} onClose={() => setShowVisualTrends(false)} title="Quarterly Visual Trends">
         <div className="p-8 space-y-8 text-left max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 font-bold">Overall Productivity Index</h4>
                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="50" className="stroke-slate-200 fill-none stroke-[10]" />
                        <circle cx="64" cy="64" r="50" className="stroke-emerald-500 fill-none stroke-[10]" strokeDasharray="314" strokeDashoffset="47" />
                     </svg>
                     <div className="absolute text-center">
                        <span className="text-2xl font-black text-slate-800">85%</span>
                        <p className="text-[8px] font-bold text-slate-400 font-bold">Optimal</p>
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">Trending up 4.2% since last month</p>
               </div>

               <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collaboration Index</h4>
                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="50" className="stroke-slate-200 fill-none stroke-[10]" />
                        <circle cx="64" cy="64" r="50" className="stroke-indigo-500 fill-none stroke-[10]" strokeDasharray="314" strokeDashoffset="25" />
                     </svg>
                     <div className="absolute text-center">
                        <span className="text-2xl font-black text-slate-800">92%</span>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Elite Class</p>
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">Consistently leading departmental projects</p>
               </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl space-y-6">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency Score History</h4>
               <div className="flex justify-between items-end h-32 pt-4 px-4 border-b border-slate-200">
                  {[
                     { q: 'Q1', val: 78, color: 'bg-slate-300' },
                     { q: 'Q2', val: 82, color: 'bg-indigo-400' },
                     { q: 'Q3', val: 89, color: 'bg-indigo-600' },
                     { q: 'Q4', val: 95, color: 'bg-emerald-500' }
                  ].map((bar, i) => (
                     <div key={i} className="flex flex-col items-center gap-2 w-12">
                        <span className="text-[9px] font-black text-slate-700">{bar.val}%</span>
                        <div className={cn("w-6 rounded-t-lg transition-all duration-1000", bar.color)} style={{ height: `${bar.val}%` }}></div>
                        <span className="text-[10px] font-black text-slate-400 mt-1">{bar.q}</span>
                     </div>
                  ))}
               </div>
            </div>

            <button type="button" onClick={() => setShowVisualTrends(false)} className="w-full py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-bold">
               Close Analytics
            </button>
         </div>
      </CenterModal>

      {/* Academy Portal Modal */}
      <CenterModal isOpen={showAcademy} onClose={() => setShowAcademy(false)} title="HCM Academy Portal">
         <div className="p-8 space-y-6 text-left max-h-[80vh] overflow-y-auto">
            <p className="text-xs text-slate-500 font-bold leading-relaxed mb-4">
               Enroll in official courses to level up your career skills. Completing a course automatically registers or boosts that skill in your Skill Matrix!
            </p>
            {[
               { id: 'c1', title: 'Advanced React & Design Patterns', rewardSkill: 'React', bonus: 10, description: 'Learn advanced state management, component composition, and hooks optimization.', duration: '6 hours' },
               { id: 'c2', title: 'Enterprise Node.js Scaling & Microservices', rewardSkill: 'Node.js', bonus: 15, description: 'Build ultra-scalable backends, handle background queuing, and master database pooling.', duration: '10 hours' },
               { id: 'c3', title: 'TypeScript Type-safety Mastery', rewardSkill: 'TypeScript', bonus: 12, description: 'Master utility types, conditional types, and build bullet-proof type definitions.', duration: '4 hours' }
            ].map((course) => (
               <div key={course.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] hover:bg-white hover:shadow-lg transition-all space-y-4">
                  <div>
                     <h4 className="font-bold text-slate-900 text-base">{course.title}</h4>
                     <p className="text-[10px] font-bold text-slate-400 mt-1 font-bold">Duration: {course.duration} • Reward: +{course.bonus}% {course.rewardSkill}</p>
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">{course.description}</p>
                  <button 
                     type="button"
                     onClick={async () => {
                        const currentSkill = performance.skills?.find(s => s.name === course.rewardSkill);
                        const currentLevel = currentSkill ? currentSkill.level : 0;
                        const newLevel = Math.min(100, currentLevel + course.bonus);
                        
                        await upsertSkill({ name: course.rewardSkill, level: newLevel });
                        showToast(`Congratulations! You completed '${course.title}' and gained +${course.bonus}% in ${course.rewardSkill}!`);
                     }}
                     className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl transition-all shadow-md"
                  >
                     Complete & Gain Skill
                  </button>
               </div>
            ))}
            <button type="button" onClick={() => setShowAcademy(false)} className="w-full mt-4 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-bold">
               Exit Portal
            </button>
         </div>
      </CenterModal>

      {/* Strategy Roadmap Modal */}
      <CenterModal 
        isOpen={showStrategyRoadmap} 
        onClose={() => setShowStrategyRoadmap(false)} 
        title="Full Strategy Roadmap 2026"
        maxWidth="max-w-4xl"
      >
         <div className="p-8 space-y-8 text-left max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900">
            {/* Executive Overview */}
            <div className="p-6 bg-gradient-to-r from-primary-600 to-indigo-700 text-white rounded-3xl space-y-3 shadow-xl">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full">Strategic Vision</span>
                  <span className="text-xs font-bold opacity-80">Q1 - Q4 2026</span>
               </div>
               <h3 className="text-2xl font-bold italic tracking-tight">Executive Strategy & OKR Roadmap</h3>
               <p className="text-xs text-primary-100 font-medium leading-relaxed">
                  Aligning personal growth, engineering excellence, and departmental KPIs with organizational OKRs.
               </p>
            </div>

            {/* Strategic Goals Breakdown */}
            <div className="space-y-6">
               <h4 className="text-xs font-black text-slate-400 font-bold">Active Strategic Objectives</h4>
               <div className="space-y-4">
                  {performance.goals?.map((goal, idx) => (
                     <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                           <div>
                              <span className="text-[9px] font-black text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-950/30 px-2.5 py-1 rounded-md">
                                 Pillar #{idx + 1}
                              </span>
                              <h4 className="text-base font-black text-slate-900 dark:text-white mt-2">{goal.title}</h4>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className={cn(
                                 "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md",
                                 goal.priority === 'High' ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
                              )}>
                                 {goal.priority} Priority
                              </span>
                              <span className="text-xs font-bold text-slate-400">Target: {goal.deadline}</span>
                           </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                           <div className="flex justify-between items-center text-xs font-black">
                              <span className="text-slate-400 uppercase tracking-widest text-[9px]">Execution Progress</span>
                              <span className="text-slate-900 dark:text-white">{goal.progress}%</span>
                           </div>
                           <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-[1px]">
                              <div 
                                className={cn("h-full rounded-full transition-all duration-500", goal.progress === 100 ? "bg-emerald-500" : "bg-primary-600")}
                                style={{ width: `${goal.progress}%` }}
                              />
                           </div>
                        </div>

                        {/* Key Deliverables */}
                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-600 dark:text-slate-350">
                           <div className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                              <span>Milestone Audit & Architectural Review</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                              <span>KPI Validation & Performance Benchmark</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Strategic Milestone Timeline */}
            <div className="space-y-4">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Quarterly Strategy Milestones</h4>
               <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                     { q: 'Q1 2026', title: 'Architecture Planning', status: 'Completed', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' },
                     { q: 'Q2 2026', title: 'Core Feature Rollout', status: 'Completed', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' },
                     { q: 'Q3 2026', title: 'Security & Scaling Audit', status: 'In Progress', color: 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600' },
                     { q: 'Q4 2026', title: 'Global Scale & Review', status: 'Upcoming', color: 'border-slate-200 bg-slate-50 dark:bg-slate-800 text-slate-400' },
                  ].map((m, i) => (
                     <div key={i} className={cn("p-4 rounded-2xl border-2 space-y-2 text-left", m.color)}>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{m.q}</span>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{m.title}</h5>
                        <span className="inline-block text-[8px] font-black uppercase tracking-widest">{m.status}</span>
                     </div>
                  ))}
               </div>
            </div>

            <button 
              type="button" 
              onClick={() => setShowStrategyRoadmap(false)} 
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl"
            >
               Seal Strategy Roadmap
            </button>
         </div>
      </CenterModal>

      {/* Add Strategic Goal Modal */}
      <CenterModal 
        isOpen={showAddGoalModal} 
        onClose={() => setShowAddGoalModal(false)} 
        title="Register New Strategic Goal"
      >
         <form 
           onSubmit={async (e) => {
             e.preventDefault();
             const formData = new FormData(e.target);
             const title = formData.get('title');
             if (!title || !title.trim()) {
               showToast('Goal title is required', 'error');
               return;
             }
             await addGoal({
               title,
               priority: formData.get('priority'),
               deadline: formData.get('deadline'),
               progress: formData.get('progress') || 0,
               category: formData.get('category'),
               description: formData.get('description')
             });
             setShowAddGoalModal(false);
           }}
           className="p-8 space-y-6 text-left bg-white dark:bg-slate-900"
         >
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 font-bold px-1">Goal / Objective Title</label>
               <input 
                 type="text" 
                 name="title" 
                 required 
                 placeholder="e.g. Implement Automated Microservice Testing"
                 className="input-field h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
               />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 font-bold px-1">Priority Level</label>
                  <select name="priority" className="input-field h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
                     <option value="High">High Priority</option>
                     <option value="Medium">Medium Priority</option>
                     <option value="Low">Low Priority</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Cycle / Deadline</label>
                  <input 
                    type="text" 
                    name="deadline" 
                    defaultValue="Q4 2026"
                    placeholder="e.g. Q3 2026 or Dec 31"
                    className="input-field h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <select name="category" className="input-field h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
                     <option value="Strategic">Strategic Engineering</option>
                     <option value="Productivity">Productivity & Quality</option>
                     <option value="Leadership">Leadership & Collaboration</option>
                     <option value="Skill">Skill Development</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Completion (%)</label>
                  <input 
                    type="number" 
                    name="progress" 
                    min="0" 
                    max="100" 
                    defaultValue="0"
                    className="input-field h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description / Key Deliverables (Optional)</label>
               <textarea 
                 name="description" 
                 rows="3" 
                 placeholder="Outline key results or milestones for this goal..."
                 className="input-field py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold resize-none"
               />
            </div>

            <div className="pt-4 flex gap-4">
               <button type="button" onClick={() => setShowAddGoalModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold">
                  Cancel
               </button>
               <button type="submit" className="flex-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl">
                  Save Goal
               </button>
            </div>
         </form>
      </CenterModal>
   </div>
  );
};

export default EmployeePerformance;
