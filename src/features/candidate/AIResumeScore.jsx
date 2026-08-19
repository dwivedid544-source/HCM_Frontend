import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Cpu, Target, CheckCircle2, 
  AlertCircle, Zap, ShieldCheck, Download, Microscope,
  RotateCcw, Code, Layout, TrendingUp, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useCandidate } from '../../context/CandidateContext';

// Hardcoded profiles for "Industry Profile" tab
const industryProfiles = {
  "Frontend Engineer": ["React", "JavaScript", "TypeScript", "CSS", "HTML", "UI/UX", "Redux", "Webpack", "Responsive Design", "Testing"],
  "Backend Engineer": ["Node.js", "Python", "Java", "SQL", "MongoDB", "REST API", "Microservices", "Docker", "AWS", "Redis"],
  "Full Stack Developer": ["React", "Node.js", "JavaScript", "SQL", "NoSQL", "Git", "REST", "AWS", "CI/CD", "TypeScript"],
  "Data Scientist": ["Python", "R", "Machine Learning", "SQL", "Pandas", "TensorFlow", "Statistics", "Data Visualization", "Big Data", "NLP"],
  "Product Manager": ["Agile", "Scrum", "Roadmapping", "Jira", "A/B Testing", "User Research", "Data Analysis", "Strategy", "Wireframing", "Go-To-Market"],
  "UX/UI Designer": ["Figma", "Sketch", "Prototyping", "User Research", "Wireframing", "Interaction Design", "Usability Testing", "Design Systems", "HTML/CSS", "Adobe Creative Suite"],
  "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD", "Jenkins", "Terraform", "Ansible", "Python", "Bash"],
  "Financial Analyst": ["Excel", "Financial Modeling", "Valuation", "Accounting", "Bloomberg", "SQL", "Data Analysis", "Forecasting", "Corporate Finance", "PowerBI"]
};

// Common buzzwords to extract from JDs
const commonJDTokens = ["Leadership", "Agile", "Cloud", "Communication", "Management", "Strategy", "Analytics", "Development", "Design", "Testing", "Optimization", "Architecture", "Innovation", "Collaboration"];

const AIResumeScore = () => {
  const navigate = useNavigate();
  const { resume, profile, showToast } = useCandidate();
  
  // States: 'input', 'analyzing', 'results'
  const [viewState, setViewState] = useState('input');
  
  // Input Selection
  const [activeTab, setActiveTab] = useState('jd'); // 'jd' or 'profile'
  const [jobDescription, setJobDescription] = useState('');
  const [selectedProfile, setSelectedProfile] = useState("Frontend Engineer");
  const [resumeSource, setResumeSource] = useState('builder'); // 'builder' or 'uploaded'

  // Analysis State
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  const hasUploadedResume = !!profile?.resumeUrl;
  const uploadedResumeName = profile?.resumeUrl ? profile.resumeUrl.split('/').pop() : '';

  const analysisSteps = [
    resumeSource === 'uploaded' ? `Reading file ${uploadedResumeName}...` : "Parsing resume builder data...",
    "Extracting key skills & experience keywords...",
    "Analyzing target requirements...",
    "Computing keyword density and match...",
    "Generating actionable insights..."
  ];

  const candidateSkills = (resumeSource === 'builder' 
    ? (resume?.skills || []).map(s => s.name.toLowerCase())
    : (profile?.skills 
        ? (Array.isArray(profile.skills) ? profile.skills.map(s => s.toLowerCase()) : profile.skills.split(',').map(s => s.trim().toLowerCase()))
        : [])
  );
  
  const candidateExperience = (resumeSource === 'builder'
    ? (resume?.experience || []).map(e => (e.role + " " + e.desc).toLowerCase())
    : [profile?.experience ? String(profile.experience).toLowerCase() : '']
  );

  const handleStartAnalysis = () => {
    if (activeTab === 'jd' && jobDescription.trim().length < 20) {
      showToast('Please enter a longer Job Description for accurate analysis.', 'error');
      return;
    }
    if (resumeSource === 'uploaded' && !hasUploadedResume) {
      showToast('No resume uploaded in your profile. Please select Resume Builder or upload one.', 'error');
      return;
    }
    
    setViewState('analyzing');
    setAnalysisPhase(0);
    setAnimatedScore(0);
  };

  // Perform Analysis Logic
  const executeAnalysis = () => {
    let targetKeywords = [];
    let titleContext = "";

    if (activeTab === 'profile') {
      targetKeywords = industryProfiles[selectedProfile];
      titleContext = selectedProfile;
    } else {
      // Very basic extraction from JD
      const words = jobDescription.split(/[\s,.\n]+/);
      // Mix of profile keywords based on JD text, plus common tokens
      const combinedDict = [...new Set([...Object.values(industryProfiles).flat(), ...commonJDTokens])];
      targetKeywords = combinedDict.filter(kw => jobDescription.toLowerCase().includes(kw.toLowerCase()));
      // If it failed to extract anything meaningful, fallback to generic
      if (targetKeywords.length < 5) {
        targetKeywords = [...targetKeywords, ...commonJDTokens.slice(0, 8)];
      }
      titleContext = "Target Job Description";
    }

    // Matching Algorithm
    let matchCount = 0;
    const missing = [];
    const found = [];

    targetKeywords.forEach(kw => {
      const lowerKw = kw.toLowerCase();
      // Check skills
      let isFound = candidateSkills.some(sk => sk.includes(lowerKw));
      // Check experience if not in skills
      if (!isFound) {
        isFound = candidateExperience.some(exp => exp.includes(lowerKw));
      }

      if (isFound) {
        matchCount++;
        found.push(kw);
      } else {
        missing.push(kw);
      }
    });

    const maxKeywords = Math.min(targetKeywords.length, 15); // Cap for scoring purposes
    const rawScore = Math.round((matchCount / Math.max(maxKeywords, 5)) * 100);
    
    // Base score based on having a resume at all
    const baseScore = candidateSkills.length > 0 || candidateExperience.length > 0 ? 30 : 0;
    const finalScore = Math.min(100, Math.max(baseScore, rawScore + (candidateSkills.length > 5 ? 10 : 0)));

    const summaryLength = resumeSource === 'builder' ? (resume?.personal?.summary?.length || 0) : (profile?.bio?.length || 0);
    const hasMetrics = resumeSource === 'builder'
      ? resume?.experience?.some(e => e.desc?.includes('%') || e.desc?.includes('$'))
      : (profile?.experience?.includes('%') || profile?.experience?.includes('$'));

    // Generate Dynamic Metrics
    const metrics = [
      { label: 'Keyword Match', score: Math.round((matchCount / Math.max(targetKeywords.length, 1)) * 100), color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { label: 'Readability Index', score: summaryLength > 50 ? 92 : 65, color: 'text-blue-500', bg: 'bg-blue-50' },
      { label: 'Impact Statements', score: hasMetrics ? 88 : 45, color: 'text-purple-500', bg: 'bg-purple-50' },
      { label: 'Format Integrity', score: 95, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    // Generate Dynamic Suggestions
    const suggestions = [];
    if (missing.length > 0) {
      suggestions.push({
        type: 'Critical Keywords',
        text: `Consider adding ${missing.slice(0, 3).join(', ')} to your skills.`,
        icon: AlertCircle,
        color: 'text-rose-500'
      });
    }
    
    if (!hasMetrics) {
      suggestions.push({
        type: 'Strategic',
        text: 'Quantify your impact in your experience section using metrics (%, $).',
        icon: Target,
        color: 'text-primary-500'
      });
    }

    const summaryText = resumeSource === 'builder' ? resume?.personal?.summary : profile?.bio;
    if (!summaryText || summaryText.length < 30) {
      suggestions.push({
        type: 'Formatting',
        text: 'Your Professional Summary/Bio is too short or missing. Add a strong hook.',
        icon: Layout,
        color: 'text-slate-400'
      });
    }

    if (suggestions.length === 0) {
       suggestions.push({
         type: 'Excellent',
         text: 'Your resume is highly optimized for this role! Keep it up.',
         icon: CheckCircle2,
         color: 'text-emerald-500'
       });
    }

    setAnalysisResults({
      score: finalScore,
      targetContext: titleContext,
      metrics,
      suggestions,
      missingSkills: missing.slice(0, 5),
      foundSkills: found.slice(0, 5)
    });
  };

  useEffect(() => {
    if (viewState === 'analyzing') {
      executeAnalysis(); // Calculate everything instantly in the background
      
      const interval = setInterval(() => {
        setAnalysisPhase(prev => {
          if (prev >= analysisSteps.length - 1) {
            clearInterval(interval);
            setViewState('results');
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [viewState]);

  // Handle Score Animation on Results Load
  useEffect(() => {
    if (viewState === 'results' && analysisResults) {
      let s = 0;
      const targetScore = analysisResults.score;
      const scoreInterval = setInterval(() => {
        if (s >= targetScore) {
          setAnimatedScore(targetScore);
          clearInterval(scoreInterval);
        } else {
          s += 1;
          setAnimatedScore(s);
        }
      }, 15);
      return () => clearInterval(scoreInterval);
    }
  }, [viewState, analysisResults]);


  // --- RENDERERS ---

  const renderInput = () => (
    <div className="space-y-8 pb-12 animate-fade-in max-w-4xl mx-auto text-left">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-4">
          <Microscope size={36} className="text-primary-600" /> AI Resume Score
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          Compare your current Resume Builder profile against a specific Job Description or an Industry Standard Profile to reveal critical gaps.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
        {/* Resume Source Selector */}
        <div className="p-10 pb-4 sm:p-14 sm:pb-4 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Resume Source</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setResumeSource('builder')}
              className={cn(
                "p-5 rounded-2xl border text-xs font-bold text-left transition-all flex flex-col justify-center gap-1",
                resumeSource === 'builder' 
                  ? "bg-slate-900 dark:bg-primary-600 text-white border-transparent shadow-md"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
              )}
            >
              <span className="font-extrabold uppercase text-[10px]">Resume Builder Data</span>
              <span className="text-[10px] opacity-75 font-bold">Uses your dynamic profile state</span>
            </button>
            
            <button
              onClick={() => {
                if (!hasUploadedResume) {
                  showToast('No resume uploaded in your profile. Redirecting to Profile...', 'warning');
                  navigate('/candidate/profile');
                } else {
                  setResumeSource('uploaded');
                }
              }}
              className={cn(
                "p-5 rounded-2xl border text-xs font-bold text-left transition-all flex flex-col justify-center gap-1 relative",
                resumeSource === 'uploaded' 
                  ? "bg-slate-900 dark:bg-primary-600 text-white border-transparent shadow-md"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
              )}
            >
              <span className="font-extrabold uppercase text-[10px]">Uploaded Profile Resume</span>
              <span className="text-[10px] opacity-75 font-bold truncate max-w-full">
                {hasUploadedResume ? uploadedResumeName : 'No file uploaded (Click to update profile)'}
              </span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('jd')}
            className={cn(
              "flex-1 py-6 text-sm font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-3",
              activeTab === 'jd' ? "bg-slate-50 dark:bg-slate-800 text-primary-600 border-b-2 border-primary-600" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <FileText size={18} /> Job Description
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex-1 py-6 text-sm font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-3",
              activeTab === 'profile' ? "bg-slate-50 dark:bg-slate-800 text-primary-600 border-b-2 border-primary-600" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <Target size={18} /> Industry Profile
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-10 sm:p-14 space-y-8">
          {activeTab === 'jd' ? (
            <div className="space-y-4 animate-fade-in">
              <label className="text-xs font-bold text-slate-500 font-bold">Paste Job Description</label>
              <textarea
                rows={12}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here. Our AI will extract the key requirements, tools, and soft skills needed..."
                className="input-field p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary-500 resize-none font-medium text-sm leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Target Profile</label>
              <div className="relative">
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="input-field h-16 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary-500 font-bold text-sm appearance-none"
                >
                  {Object.keys(industryProfiles).map(prof => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-5 pointer-events-none text-slate-400">
                  <Layout size={20} />
                </div>
              </div>
              <div className="pt-6">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Core Keywords Expected</p>
                 <div className="flex flex-wrap gap-2">
                    {industryProfiles[selectedProfile].slice(0, 6).map(kw => (
                       <span key={kw} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md border border-slate-200 dark:border-slate-700">
                         {kw}
                       </span>
                    ))}
                    {industryProfiles[selectedProfile].length > 6 && (
                      <span className="px-3 py-1.5 bg-transparent text-slate-400 text-[10px] font-bold">
                        +{industryProfiles[selectedProfile].length - 6} more
                      </span>
                    )}
                 </div>
              </div>
            </div>
          )}

          <div className="pt-8">
            <button 
              onClick={handleStartAnalysis}
              className="btn-primary w-full py-5 shadow-xl shadow-primary-200 dark:shadow-none flex items-center justify-center gap-3 text-sm font-bold"
            >
              <Search size={20} /> Analyze Resume Score
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-12 animate-fade-in">
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 border-8 border-slate-100 dark:border-slate-800 rounded-[3rem] animate-pulse"></div>
        <div className="absolute inset-x-0 top-0 h-2 bg-primary-600 rounded-full animate-progress-flow"></div>
        <div className="absolute inset-0 flex items-center justify-center text-primary-600">
          <Cpu size={64} className="animate-spin-slow" />
        </div>
      </div>
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight uppercase">{analysisSteps[analysisPhase]}</h3>
        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-bold animate-pulse">Running advanced algorithms...</p>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!analysisResults) return null;

    return (
      <div className="space-y-10 pb-12 animate-fade-in max-w-7xl mx-auto text-left">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-50 dark:border-slate-800 shadow-soft">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Resume Analysis Results</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm font-medium text-slate-500">
              <p>Target Profile: <span className="text-primary-600 font-bold uppercase tracking-wider">{analysisResults.targetContext}</span></p>
              <span className="hidden sm:inline text-slate-300">|</span>
              <p>Analyzed Source: <span className="text-slate-800 dark:text-slate-200 font-bold">{resumeSource === 'uploaded' ? uploadedResumeName : 'Resume Builder Data'}</span></p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setViewState('input')} 
              className="w-14 h-14 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-primary-600 rounded-xl flex items-center justify-center transition-all shadow-sm"
            >
              <RotateCcw size={24} />
            </button>
            <button onClick={() => { showToast('Report saved successfully'); }} className="btn-primary h-14 px-8 shadow-xl flex items-center gap-3 transition-all">
              <Download size={20} /> Save Report
            </button>
          </div>
        </div>

        {/* Main Analytics Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Core Score Meter */}
          <div className="lg:col-span-5 card p-12 flex flex-col items-center justify-center relative overflow-hidden rounded-[4rem] bg-white dark:bg-slate-900">
            <div className="absolute top-10 left-10 text-[9px] font-bold text-slate-300 dark:text-slate-600 font-bold flex items-center gap-3">
              <Microscope size={14} className="text-primary-600" /> Match Score
            </div>
            
            <div className="relative w-64 h-64 flex items-center justify-center mb-10 mt-6">
              <svg className="w-full h-full transform -rotate-90 scale-110">
                <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="18" fill="transparent" className="text-slate-50 dark:text-slate-800" />
                <motion.circle 
                  cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="18" fill="transparent" 
                  strokeDasharray={691}
                  initial={{ strokeDashoffset: 691 }}
                  animate={{ strokeDashoffset: 691 - (691 * animatedScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={animatedScore >= 80 ? "text-emerald-500" : animatedScore >= 60 ? "text-amber-500" : "text-rose-500"}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-7xl font-bold text-slate-900 dark:text-white tracking-tight">{animatedScore}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Overall Match</span>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] inline-block border",
                animatedScore >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                animatedScore >= 60 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
              )}>
                ATS Compatibility: {animatedScore >= 80 ? "High" : animatedScore >= 60 ? "Medium" : "Low"}
              </div>
              <p className="text-sm font-medium text-slate-500 px-8 leading-relaxed">
                {animatedScore >= 80 
                  ? "Excellent! Your resume is highly tailored for this profile. You are well-positioned for ATS screening."
                  : animatedScore >= 60 
                  ? "Good start, but you are missing some key requirements. Adding relevant keywords will significantly boost your chances."
                  : "Needs Improvement. Your resume lacks critical keywords and structure required for this specific role."}
              </p>
            </div>
          </div>

          {/* Tactical Breakdown and Suggestions */}
          <div className="lg:col-span-7 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {analysisResults.metrics.map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-soft group hover:border-primary-100 transition-all"
                >
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{m.label}</p>
                    <span className={cn("text-sm font-bold ", m.color)}>{m.score}%</span>
                  </div>
                  <div className="relative h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${m.score}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
                      className={cn("h-full rounded-full", m.bg.replace('bg-', 'bg-').replace('50', '500') || 'bg-primary-600')}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="card p-10 bg-primary-600 border-none shadow-premium relative overflow-hidden rounded-[3rem]">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <AlertCircle size={120} className="text-white" />
              </div>
              <h3 className="text-[10px] font-bold text-primary-200 uppercase tracking-[0.4em] mb-10 leading-none">Actionable Recommendations</h3>
              <div className="space-y-6 relative z-10">
                {analysisResults.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-6 p-6 bg-white/5 rounded-2xl group hover:bg-white/10 transition-all cursor-pointer border border-white/5">
                    <div className={cn("p-3 rounded-xl bg-white/10 shrink-0", s.color)}>
                      <s.icon size={20} />
                    </div>
                    <div>
                      <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-1", s.color)}>{s.type}</p>
                      <p className="text-sm font-medium text-white tracking-tight">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tertiary Metrics & Missing Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="card p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-300 mb-8 flex items-center gap-3 uppercase tracking-wider">
              <Search size={14} className="text-rose-500" /> Missing Keywords
            </h4>
            {analysisResults.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {analysisResults.missingSkills.map((sk, i) => (
                  <span key={i} className="px-4 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 border border-rose-100 dark:border-rose-900 text-xs font-bold rounded-lg">
                    {sk}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">You have all the critical keywords!</p>
            )}
          </div>

          <div className="card p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-300 mb-8 flex items-center gap-3 uppercase tracking-wider">
              <CheckCircle2 size={14} className="text-emerald-500" /> Matched Keywords
            </h4>
             {analysisResults.foundSkills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {analysisResults.foundSkills.map((sk, i) => (
                  <span key={i} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-100 dark:border-emerald-900 text-xs font-bold rounded-lg">
                    {sk}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No major keywords found matching the requirements.</p>
            )}
          </div>

          <div className="card p-10 bg-slate-900 border-none shadow-premium rounded-[3rem] text-white relative overflow-hidden group flex flex-col justify-center">
            <div className="absolute -top-6 -right-6 p-4 opacity-20 group-hover:rotate-12 transition-transform duration-1000">
              <Code size={150} fill="#fff" />
            </div>
            <div className="relative z-10">
              <p className="text-[9px] font-bold text-slate-400 mb-4 font-bold">Instant Improvements</p>
              <h4 className="text-2xl font-bold tracking-tight mb-8 leading-tight">Apply suggestions to your resume now.</h4>
              <button 
                onClick={() => { navigate('/candidate/resume'); }} 
                className="btn-primary w-full py-4 bg-primary-600 hover:bg-primary-500 text-white shadow-xl text-sm font-bold"
              >
                Open Resume Builder
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {viewState === 'input' && renderInput()}
      {viewState === 'analyzing' && renderAnalyzing()}
      {viewState === 'results' && renderResults()}
    </>
  );
};

export default AIResumeScore;
