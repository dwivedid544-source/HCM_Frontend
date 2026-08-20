import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { employeeAPI as api, uploadAPI } from '../../utils/apiService';
import { 
  FileText, Search, Download, CheckCircle2, AlertCircle, 
  Upload, X, Trash2, Calendar, CloudUpload, Info, Copy, Check, FileCheck, RefreshCw, Eye, Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEmployee } from '../../context/EmployeeContext';
import CenterModal from '../../shared/components/layout/CenterModal';
import PermissionGate from '../../shared/components/common/PermissionGate';
import { usePersistedTab } from '../../hooks/usePersistedTab';

const EmployeeDocuments = () => {
  const { documents, uploadDoc, deleteDoc, showToast, loading, error, refetchAll } = useEmployee();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = usePersistedTab('emp_docs_cat', 'All', 'category');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [fileSize, setFileSize] = useState('0 KB');

  // ── AI Document Analyzer states ─────────────────────────────
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [aiFile, setAiFile] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [stage, setStage] = useState('idle'); // 'idle' | 'uploading' | 'reading' | 'ocr' | 'extracting' | 'analyzing' | 'done' | 'error'
  const [stageProgress, setStageProgress] = useState(0);
  const [aiError, setAiError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  const stats = [
    { label: 'Total Vault Files', value: documents.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Cloud Space Used', value: '1.2 GB', icon: CloudUpload, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Verified Vault Docs', value: documents.filter(doc => doc.verified !== false).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Instant Retrieval', value: 'Ready', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const categories = ['All', 'ID Proof', 'Contracts', 'Education', 'Benefits', 'Medical', 'Other'];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'All' || doc.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const [isUploading, setIsUploading] = useState(false);

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setDocName(file.name);
      const kb = file.size / 1024;
      const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
      setFileSize(sizeStr);

      try {
        const base64 = await readFileAsBase64(file);
        setFileBase64(base64);
      } catch (err) {
        console.error('Base64 read failed:', err);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !docName) {
      showToast('Please select a file to upload', 'error');
      return;
    }
    try {
      setIsUploading(true);
      let fileDataUrl = null;
      if (selectedFile) {
        try {
          const res = await uploadAPI.uploadDocument(selectedFile, 'hcm/documents');
          if (res.data?.data?.url) {
            fileDataUrl = res.data.data.url;
          }
        } catch (uploadErr) {
          console.warn('Direct ImageKit upload error, using base64:', uploadErr.message);
        }
      }

      if (!fileDataUrl) {
        fileDataUrl = fileBase64 || (selectedFile ? await readFileAsBase64(selectedFile) : null);
      }

      const formData = new FormData(e.target);
      const newDoc = {
        name: docName || selectedFile?.name || 'Document.pdf',
        category: formData.get('category') || 'Other',
        size: fileSize || '1.0 KB',
        fileBase64: fileDataUrl || null,
        content: fileDataUrl || null
      };
      await uploadDoc(newDoc);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setDocName('');
      setFileBase64('');
      setFileSize('0 KB');
      showToast('Document added to Vault successfully!', 'success');
    } catch (err) {
      console.error('Error committing document to vault:', err);
      showToast('Failed to upload document', 'error');
    } finally {
      setIsUploading(false);
    }
  };


  const handleDownloadZip = () => {
    if (documents.length === 0) {
      showToast('No documents in vault to export', 'error');
      return;
    }
    let content = "HCM Secure Vault Index\n======================\n\n";
    documents.forEach(doc => {
      content += `[${doc.category}] ${doc.name} (${doc.size}) - Created: ${doc.date}\nURL: ${doc.url}\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Vault_Zip_Index.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Vault index downloaded successfully');
  };

  // ── Drag & Drop handlers ────────────────────────────────────
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateSelectedFile = (file) => {
    if (!file) return false;
    const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.txt'];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExts.some(ext => fileName.endsWith(ext));
    
    if (!isAllowed) {
      const msg = `Unsupported file type '${file.name.split('.').pop()}'. Please select a PDF, PNG, JPG, JPEG, or TXT document.`;
      setAiError(msg);
      setStage('failure');
      showToast(msg, 'error');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      const msg = `File size exceeds the 10MB limit (selected: ${(file.size / (1024 * 1024)).toFixed(1)}MB). Please select a smaller file.`;
      setAiError(msg);
      setStage('failure');
      showToast(msg, 'error');
      return false;
    }

    setAiError(null);
    setAiFile(file);
    setStage('selected');
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleAiFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateSelectedFile(e.target.files[0]);
    }
  };

  const runAiAnalysis = async () => {
    if (!aiFile) {
      showToast('Please select a document first', 'error');
      return;
    }

    setAiError(null);
    setAiResult(null);
    setStage('uploading');
    setStageProgress(25);

    const formData = new FormData();
    formData.append('file', aiFile);

    const timeouts = [];
    timeouts.push(setTimeout(() => {
      setStage('ocr');
      setStageProgress(60);
    }, 1000));

    timeouts.push(setTimeout(() => {
      setStage('analyzing');
      setStageProgress(85);
    }, 2200));

    try {
      const res = await api.aiDocumentAnalyze(formData);
      timeouts.forEach(clearTimeout);

      if (res && res.data && res.data.success) {
        setStage('success');
        setStageProgress(100);
        setAiResult(res.data.data);
        showToast('Document OCR analysis completed successfully!', 'success');
      } else {
        const errMsg = res?.data?.error?.message || res?.data?.error || 'AI document processing failed.';
        throw new Error(errMsg);
      }
    } catch (err) {
      timeouts.forEach(clearTimeout);
      setStage('failure');
      const userSafeMsg = err.response?.data?.error?.message || err.response?.data?.error || err.message || 'AI document analysis failed.';
      setAiError(userSafeMsg);
      showToast(userSafeMsg, 'error');
    }
  };

  const [savingToVault, setSavingToVault] = useState(false);

  const handleSaveToVault = async () => {
    if (!aiFile) return;
    setSavingToVault(true);
    try {
      const kb = aiFile.size / 1024;
      const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
      
      // Try cloud upload first
      let fileData;
      try {
        const cloudResponse = await uploadAPI.uploadDocument(aiFile, 'hcm/documents');
        fileData = cloudResponse.data?.data?.url;
      } catch (cloudErr) {
        console.error('Cloud doc upload failed, using base64 fallback:', cloudErr);
        fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(aiFile);
        });
      }

      await uploadDoc({
        name: aiFile.name,
        category: aiResult?.document?.documentType || 'Other',
        size: sizeStr,
        fileBase64: fileData
      });
      showToast('Document saved to Vault!', 'success');
      setSavingToVault(false);
    } catch (err) {
      showToast('Failed to save document to Vault', 'error');
      setSavingToVault(false);
    }
  };

  const handleCopyResult = () => {
    if (!aiResult) return;
    const cleanData = JSON.stringify(aiResult.extractedData || {}, null, 2);
    navigator.clipboard.writeText(cleanData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Extracted JSON data copied to clipboard!');
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-0 min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 text-left">
        <AlertCircle className="text-rose-500 w-12 h-12" />
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">Failed to Load Vault Documents</h3>
        <p className="text-sm text-slate-500 max-w-md">{error}</p>
        <button onClick={refetchAll} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2">
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (loading || !documents) {
    return (
      <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto px-4 sm:px-0 text-left">
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-t-indigo-600 border-indigo-100 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Loading Documents vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="hcm-page-title">Records & Vault</h1>
          <p className="text-slate-500 font-bold tracking-tight">Enterprise-grade secure storage for your career documents</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button onClick={handleDownloadZip} className="btn-secondary px-6 py-2.5 font-bold flex justify-center items-center gap-2">
            <Download size={18} />
            <span>Vault Index</span>
          </button>
          
          <PermissionGate module="documents" action="create">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary px-8 py-2.5 font-bold flex justify-center items-center gap-2 shadow-xl shadow-primary-200"
          >
             <CloudUpload size={18} />
             <span>Upload File</span>
          </button>
          </PermissionGate>

          {/* AI Document Analyzer Button */}
          <button 
            onClick={() => {
              setIsAiModalOpen(true);
              setStage('idle');
              setAiFile(null);
              setAiResult(null);
              setAiError(null);
            }}
            className="btn-primary px-6 py-2.5 font-bold flex justify-center items-center gap-2 shadow-xl bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white"
          >
             <span>✨ AI Document Analyzer</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
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

      {/* Filtering & Listing */}
      <div className="space-y-8">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full">
            <div className="flex flex-wrap items-center gap-2 w-full max-w-full min-w-0">
               {categories.map((cat, i) => (
                  <button 
                     key={i} 
                     onClick={() => setActiveCategory(cat)}
                     className={cn(
                        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                        activeCategory === cat ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-y-[-2px]" : "bg-white text-slate-400 border border-slate-105 hover:border-primary-200"
                     )}
                  >
                     {cat}
                  </button>
               ))}
            </div>
            <div className="relative w-full lg:w-96">
               <Search className="absolute left-4 top-3 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search by file name..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-white border border-slate-100 rounded-xl pl-12 pr-4 h-12 text-xs font-bold w-full focus:ring-2 focus:ring-primary-50 outline-none transition-all shadow-sm" 
               />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
               <motion.div
                 layout
                 key={doc.id}
                 className="card p-6 bg-white border border-slate-50 shadow-soft group hover:shadow-xl transition-all relative overflow-hidden"
               >
                  <div className="flex items-start justify-between relative z-10 text-left">
                     <div className={cn(
                        "w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform",
                        doc.name.endsWith('.pdf') ? "bg-rose-500" : "bg-primary-600"
                     )}>
                        <FileText size={24} />
                     </div>
                      <div className="flex items-center gap-1 transition-opacity">
                        <button onClick={() => window.open(doc.url, '_blank')} className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary-600 rounded-xl transition-all"><Eye size={16} /></button>
                        <PermissionGate module="documents" action="delete">
                        <button onClick={() => deleteDoc(doc.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </PermissionGate>
                      </div>
                  </div>
                  <div className="text-left relative z-10">
                     <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-2 dark:text-white">{doc.name}</h4>
                     <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-black text-slate-400 font-bold">{doc.category} • {doc.size}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                           <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-100">Verified</span>
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic sm:ml-auto">Added: {doc.date}</span>
                        </div>
                     </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                     <FileText size={120} />
                  </div>
               </motion.div>
            )) : (
               <div className="col-span-full py-32 text-center card bg-slate-50/30 border-dashed border-2 border-slate-100">
                  <div className="flex flex-col items-center gap-4 text-slate-300">
                     <CloudUpload size={64} className="animate-pulse" />
                     <p className="text-[10px] font-bold">No documents found in vault</p>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* ── Normal Upload Vault Entry Modal ────────────────────────────── */}
      <CenterModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Vault Entry">
          <form onSubmit={handleUploadSubmit} className="p-8 space-y-8 text-left">
            <input type="file" id="vault-file-input" onChange={handleFileChange} style={{ display: 'none' }} />
            <div 
               onClick={() => document.getElementById('vault-file-input').click()} 
               className="div-drop p-6 sm:p-12 border-4 border-dashed border-slate-50 rounded-[2.5rem] bg-slate-50/50 text-center space-y-4 group hover:border-primary-100 hover:bg-primary-50/5 transition-all cursor-pointer"
            >
               <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-200 group-hover:text-primary-500 transform group-hover:rotate-12 transition-all duration-700">
                  <CloudUpload size={40} />
               </div>
               <div>
                  <p className="text-sm font-black text-slate-900">{selectedFile ? `Selected: ${selectedFile.name}` : 'Drag files or click to upload'}</p>
                  <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest leading-none">{selectedFile ? `Size: ${fileSize}` : 'Max file size: 50MB'}</p>
               </div>
               <button type="button" className="px-8 py-3 bg-white text-slate-900 text-[10px] font-bold rounded-xl shadow-premium border border-slate-50 hover:scale-105 active:scale-95 transition-all">Browse Securely</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 font-bold px-1">Document Name</label>
                  <input name="name" type="text" value={docName} onChange={(e) => setDocName(e.target.value)} required placeholder="Tax_Report_2024.pdf" className="input-field h-14 bg-slate-50 border-transparent font-black" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 font-bold px-1">Classification</label>
                  <select name="category" className="input-field h-14 bg-slate-50 border-transparent font-black">
                     {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
               </div>
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
               <button type="button" onClick={() => setIsUploadModalOpen(false)} className="w-full sm:flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
               <button type="submit" className="w-full sm:flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200">Commit to Vault</button>
            </div>
          </form>
      </CenterModal>

      {/* ── AI Document Analyzer Modal ─────────────────────────────────── */}
      <CenterModal 
        isOpen={isAiModalOpen} 
        onClose={() => {
          if (stage !== 'uploading' && stage !== 'ocr' && stage !== 'analyzing') {
            setIsAiModalOpen(false);
          }
        }} 
        title="✨ AI Document Analyzer & OCR"
      >
        <div className="p-6 text-left max-h-[85vh] overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {/* 1. IDLE / SELECTED / FAILURE STAGES */}
            {(stage === 'idle' || stage === 'selected' || stage === 'failure') && (
              <motion.div
                key="upload-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5 text-left"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Drag & Drop Document</h4>
                  <p className="text-[10px] text-slate-450 mt-1">Upload PDF or image files to extract text (OCR), detect entities, and run compliance checks</p>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-8 border-4 border-dashed rounded-[2rem] text-center space-y-4 cursor-pointer transition-all",
                    dragActive 
                      ? "border-indigo-500 bg-indigo-50/20" 
                      : "border-slate-150 bg-slate-50/50 hover:bg-slate-100/40 hover:border-slate-200"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAiFileSelect} 
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    className="hidden" 
                  />
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xs text-slate-350">
                    <CloudUpload size={32} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {aiFile ? `Selected: ${aiFile.name}` : 'Drag files here or click to browse'}
                    </p>
                    <p className="text-[9px] text-slate-450 uppercase tracking-widest mt-1.5">
                      PDF, PNG, JPG, JPEG or TXT • Max 10MB
                    </p>
                  </div>
                </div>

                {stage === 'failure' && aiError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-xs text-rose-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
                    <div>
                      <span className="font-bold block text-rose-900 mb-0.5">Validation / Processing Error</span>
                      <p className="leading-relaxed">{aiError}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-150 text-slate-650 font-bold rounded-2xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={runAiAnalysis}
                    disabled={!aiFile}
                    className="flex-[2] py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-2xl text-xs shadow-lg transition-colors flex justify-center items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>Analyze with AI</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. UPLOADING / OCR / ANALYZING PROGRESS STAGES */}
            {(stage === 'uploading' || stage === 'ocr' || stage === 'analyzing') && (
              <motion.div
                key="progress-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-10 text-center space-y-6"
              >
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                  />
                  <Sparkles size={22} className="text-indigo-600 absolute animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                    {stage === 'uploading' && 'Uploading document to secure server...'}
                    {stage === 'ocr' && 'Running OCR text extraction & vision recognition...'}
                    {stage === 'analyzing' && 'Analyzing HR entities, compliance & risk profiles...'}
                  </h4>
                  <p className="text-[10px] text-slate-450 uppercase tracking-widest font-semibold">
                    State: {stage.toUpperCase()} ({stageProgress}%)
                  </p>
                </div>

                <div className="w-full max-w-xs mx-auto bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                  <motion.div
                    className="bg-indigo-600 h-full rounded-full"
                    animate={{ width: `${stageProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </motion.div>
            )}

            {/* 3. SUCCESS / RESULT STAGE */}
            {stage === 'success' && aiResult && (
              <motion.div
                key="result-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-left"
              >
                {/* Status pill & Type */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Document Type</h4>
                    <span className="text-sm font-black text-slate-800">{aiResult.document?.documentType || 'General HR Document'}</span>
                  </div>

                  <div className="text-right">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Compliance Status</h4>
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider uppercase border",
                      aiResult.analysis?.complianceStatus === 'PASS' 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : aiResult.analysis?.complianceStatus === 'FAIL'
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      {aiResult.analysis?.complianceStatus || 'Review Required'}
                    </span>
                  </div>
                </div>

                {/* OCR Confidence & Details */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <span>OCR Extraction Confidence</span>
                      <span className="text-indigo-650 font-black">
                        {Math.round((aiResult.ocr?.confidence || 0.95) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.round((aiResult.ocr?.confidence || 0.95) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold leading-relaxed border-l border-slate-200 pl-4 w-28 text-left shrink-0">
                    Model: {aiResult.metadata?.model || 'gpt-4o-mini'}<br/>
                    Pages: {aiResult.document?.pages || 1}
                  </div>
                </div>

                {/* Summary block */}
                <div className="space-y-1.5">
                  <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Document Summary</h5>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 border border-slate-100 p-3 rounded-2xl">
                    {aiResult.analysis?.summary || 'No summary generated.'}
                  </p>
                </div>

                {/* Extracted Text (OCR output) */}
                {aiResult.ocr?.text && (
                  <div className="space-y-1.5">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Extracted Raw Text (OCR)</h5>
                    <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl text-[11px] font-mono max-h-32 overflow-y-auto whitespace-pre-wrap border border-slate-800 scrollbar-thin">
                      {aiResult.ocr.text}
                    </div>
                  </div>
                )}

                {/* Key extracted data table */}
                {aiResult.extractedData && Object.keys(aiResult.extractedData).length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Detected HR Entities & Values</h5>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                      <table className="min-w-full divide-y divide-slate-100 text-[11px]">
                        <thead className="bg-slate-50/60">
                          <tr>
                            <th className="px-4 py-2 text-left font-bold text-slate-500 uppercase tracking-wider">Entity Field</th>
                            <th className="px-4 py-2 text-left font-bold text-slate-500 uppercase tracking-wider">Extracted Value</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                          {Object.entries(aiResult.extractedData)
                            .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '' && !Array.isArray(v))
                            .map(([key, val]) => (
                              <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-2.5 font-bold text-slate-600 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </td>
                                <td className="px-4 py-2.5 font-medium text-slate-800">
                                  {typeof val === 'number' 
                                    ? val.toLocaleString('en-US', { style: 'currency', currency: aiResult.extractedData.currency || 'USD' }) 
                                    : String(val)
                                  }
                                </td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Key clauses / information */}
                {aiResult.analysis?.keyInformation && aiResult.analysis.keyInformation.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Key Clauses & Insights</h5>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                      {aiResult.analysis.keyInformation.map((info, i) => (
                        <li key={i}>{info}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings Alert */}
                {aiResult.analysis?.warnings && aiResult.analysis.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Compliance Alerts & Warnings</h5>
                    <div className="space-y-1.5">
                      {aiResult.analysis.warnings.map((warn, i) => (
                        <div key={i} className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-800">
                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                          <div className="font-semibold">{warn}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSaveToVault}
                    disabled={savingToVault}
                    className="flex-1 min-w-[120px] py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-2xl text-xs shadow-md transition-colors flex justify-center items-center gap-1.5"
                  >
                    <CloudUpload size={13} />
                    <span>{savingToVault ? 'Saving...' : 'Save to Vault'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyResult}
                    className="flex-1 min-w-[120px] py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md transition-colors flex justify-center items-center gap-1.5"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>Copy JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStage('idle');
                      setAiFile(null);
                      setAiResult(null);
                      setAiError(null);
                    }}
                    className="flex-1 min-w-[120px] py-3 bg-slate-150 hover:bg-slate-200 text-slate-750 font-bold rounded-2xl text-xs transition-colors flex justify-center items-center gap-1.5"
                  >
                    <RefreshCw size={13} />
                    <span>Analyze Another</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(false)}
                    className="flex-1 min-w-[100px] py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CenterModal>
    </div>
  );
};

export default EmployeeDocuments;
