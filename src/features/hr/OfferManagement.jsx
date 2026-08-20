import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Plus, Search, DollarSign, FileText, Calendar, 
  Send, CheckCircle2, X, Eye, Download, 
  RotateCcw, FileSearch, MoreVertical, Trash2, Loader2, Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useDateFormat } from '../../hooks/useDateFormat';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import DatePicker from '../../shared/components/common/DatePicker';
import api, { employeeAPI, uploadAPI } from '../../utils/apiService';

const OfferLetterDocument = ({ data, mode = 'preview' }) => {
  if (!data) return null;
  
  let parsedData = data;
  if (data.letterContent) {
    try {
      parsedData = typeof data.letterContent === 'string' ? JSON.parse(data.letterContent) : data.letterContent;
    } catch (e) {
      console.error("Failed to parse saved letter content:", e);
    }
  }
  
  const isRawOffer = !parsedData.company && parsedData.candidate;
  
  const company = isRawOffer ? { name: 'GlobalTech.ai', address: '100 AI Blvd, Suite 400, Tech City, TC 10101' } : (parsedData.company || {});
  const candidate = isRawOffer ? { name: parsedData.candidate, email: '' } : (parsedData.candidate || {});
  const pos = isRawOffer ? { jobTitle: parsedData.role, salary: parsedData.salary, joiningDate: parsedData.joiningDate } : (parsedData.positionDetails || {});
  const sig = isRawOffer ? { name: 'HR Operations Division', designation: '' } : (parsedData.signatory || {});
  
  const paragraphs = isRawOffer ? [
    `Dear ${parsedData.candidate.split(' ')[0]},`,
    `On behalf of GlobalTech.ai, I am thrilled to formally offer you the position of ${parsedData.role}. Following our recent interviews, we are confident that your expertise and vision will be a tremendous asset to our team.`,
    `We are excited about the possibility of you joining us as we continue to revolutionize the HCM landscape with artificial intelligence.`
  ] : (parsedData.bodyParagraphs || []);
  
  const terms = isRawOffer ? [
    "Compensation: Base annual salary as specified in details.",
    "Anticipated Commencement: Joining date as listed below."
  ] : (parsedData.terms || []);

  return (
    <div 
      id="offer-letter-print-area"
      className={cn(
        "bg-white text-slate-900 font-serif leading-relaxed text-[11px] p-[20mm] box-border text-left relative",
        mode === 'preview' && "w-[210mm] min-h-[297mm] shadow-2xl mx-auto border border-slate-200 rounded-sm",
        (mode === 'print' || mode === 'pdf') && "w-[210mm] min-h-[297mm] shadow-none border-none p-[20mm]"
      )}
      style={{
        width: '210mm',
        minHeight: '297mm',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-6">
        <div>
          <h4 className="text-sm font-extrabold text-indigo-650 tracking-tighter uppercase">{company.name || 'Company Name'}</h4>
          <p className="text-[9px] text-slate-400 mt-0.5">{company.address || 'Company Address'}</p>
        </div>
        <div className="text-right text-[8px] text-slate-400 uppercase tracking-widest">
          <p className="font-bold text-slate-800">Offer Reference</p>
          <p>{data.reference || `REF-${Math.floor(Math.random()*10000)}-2026`}</p>
          <p className="mt-1">{data.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Candidate section */}
      <div className="space-y-1 mb-6 text-[10px]">
        <p className="font-bold text-slate-900">{candidate.name || 'Candidate Name'}</p>
        {candidate.email && <p className="text-slate-500">{candidate.email}</p>}
        {candidate.address && <p className="text-slate-500">{candidate.address}</p>}
        {candidate.applicantId && <p className="text-slate-400 text-[9px] uppercase tracking-wider">Applicant ID: {candidate.applicantId}</p>}
      </div>

      {/* Subject */}
      <p className="font-bold text-slate-950 border-l-2 border-indigo-600 pl-3 py-1 my-5 text-[11px] uppercase tracking-wider">
        {data.subject || `Subject: Offer of Employment - ${pos.jobTitle || 'Position'}`}
      </p>

      {/* Salutation */}
      <p className="my-3 text-slate-900">{data.salutation || `Dear ${candidate.name || 'Candidate'},`}</p>

      {/* Paragraphs */}
      {paragraphs.map((para, idx) => (
        <p key={idx} className="my-4 text-slate-750 text-[10px] leading-relaxed text-justify whitespace-pre-wrap">{para}</p>
      ))}

      {/* Compensation & Offer Details Grid */}
      <div className="border border-slate-200 rounded-xl p-4 my-6 bg-slate-50/50">
        <p className="font-bold text-[9px] text-indigo-650 uppercase tracking-wider mb-3">Position & Compensation Details</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[9px] text-slate-650">
          <p><span className="font-bold">Job Title:</span> {pos.jobTitle || 'N/A'}</p>
          <p><span className="font-bold">Proposed Salary:</span> {pos.salary || 'N/A'}</p>
          <p><span className="font-bold">Joining Date:</span> {pos.joiningDate || 'N/A'}</p>
          <p><span className="font-bold">Employment Type:</span> {pos.employmentType || 'Full-Time'}</p>
          {pos.department && <p><span className="font-bold">Department:</span> {pos.department}</p>}
          {pos.reportingManager && <p><span className="font-bold">Reporting Manager:</span> {pos.reportingManager}</p>}
        </div>
      </div>

      {/* Terms & Conditions */}
      {terms.length > 0 && (
        <div className="my-5 text-[9px] text-slate-600 space-y-1">
          <p className="font-bold text-[9px] text-indigo-650 uppercase tracking-wider mb-2">Terms & Conditions</p>
          {terms.map((term, idx) => (
            <p key={idx}>- {term}</p>
          ))}
        </div>
      )}

      {/* Closing & Signature */}
      <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-end avoid-page-break">
        <div>
          <p className="my-2">{data.closing?.text || 'We look forward to welcoming you to the team.'}</p>
          <div className="mt-6">
            <p>Sincerely,</p>
            <p className="font-bold mt-4 text-slate-900">{sig.name || 'Authorized Signatory'}</p>
            <p className="text-[9px] text-slate-400">{sig.designation || ''}</p>
          </div>
        </div>
        <div className="text-right font-serif italic text-xs text-slate-400 border border-dashed border-slate-200 p-2 rounded bg-slate-50">
          Digital Seal Applied
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[10mm] left-[20mm] right-[20mm] flex justify-between text-[8px] text-slate-400 border-t pt-2">
        <p>{company.name || 'GlobalTech.ai'} • Confidential HR Document</p>
        <p>Offer Ref: {data.reference || ''}</p>
      </div>
    </div>
  );
};

const OfferManagement = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  const { offers, addOffer, updateOffer, deleteOffer, candidates, showToast, refetch } = useHR();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [offerToDelete, setOfferToDelete] = useState(null);

  const fileInputRef = useRef(null);

  // AI Letter Generator States
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [letterData, setLetterData] = useState(null);
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [activeOfferForLetter, setActiveOfferForLetter] = useState(null);

  const [formData, setFormData] = useState({
    candidate: '', role: '', salary: '', joiningDate: '', status: 'Sent'
  });

  // Dynamic real-time synchronization
  useEffect(() => {
    if (typeof refetch === 'function') {
      refetch();
    }
    const interval = setInterval(() => {
      if (typeof refetch === 'function') {
        refetch();
      }
    }, 4000);

    const handleFocus = () => {
      if (typeof refetch === 'function') {
        refetch();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch]);

  const candidatesReadyForOffer = useMemo(() => {
    return (candidates || []).filter(c => {
      const isOfferStage = c.stage === 'Offer' || c.stage === 'OFFERED';
      const hasOffer = (offers || []).some(o => o.applicationId === c.id || o.candidate?.toLowerCase() === c.name?.toLowerCase());
      return isOfferStage && !hasOffer;
    });
  }, [candidates, offers]);

  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const stats = [
    { label: 'Draft Offers', value: offers.filter(o=>o.status==='Draft').length, icon: FileText, bg: 'bg-blue-50 dark:bg-blue-950/20', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Sent Offers', value: offers.filter(o=>o.status==='Sent').length, icon: Send, bg: 'bg-amber-50 dark:bg-amber-950/20', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Accepted', value: offers.filter(o=>o.status==='Accepted').length, icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/20', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Declined', value: offers.filter(o=>o.status==='Declined').length, icon: X, bg: 'bg-rose-50 dark:bg-rose-950/20', color: 'text-rose-500 dark:text-rose-400' },
  ];

  const [previewingOffer, setPreviewingOffer] = useState(null);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30';
      case 'Sent': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30';
      case 'Viewed': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900/30';
      case 'Declined': return 'bg-rose-50 text-rose-550 border-rose-100 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-900/30';
      case 'Draft': return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const handleOpenCreate = () => {
    setEditingOffer(null);
    setSelectedFile(null);
    setFormData({ candidate: '', role: '', salary: '', joiningDate: '', status: 'Sent' });
    setIsModalOpen(true);
  };

  const handleOpenCreateForCandidate = (cand) => {
    setEditingOffer(null);
    setSelectedFile(null);
    setFormData({ 
      candidate: cand.name || '', 
      role: cand.role || '', 
      salary: cand.expectedSalary || '', 
      joiningDate: '', 
      status: 'Sent' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingOffer(offer.id);
    setSelectedFile(offer.fileName ? { name: offer.fileName } : null);
    setFormData({ ...offer });
    setIsModalOpen(true);
  };

  const handleOpenPreview = (offer) => {
    setPreviewingOffer(offer);
  };

  const handleSubmit = async (e, forceDraft = false) => {
    if (e) e.preventDefault();
    if(!formData.candidate) return showToast('Please select a candidate', 'error');

    const status = forceDraft ? 'Draft' : 'Sent';
    const activeCand = candidates.find(c => c.name === formData.candidate) || {};
    
    let uploadedOfferUrl = selectedFile?.url || null;
    if (selectedFile && !uploadedOfferUrl && selectedFile instanceof File) {
      try {
        const res = await uploadAPI.uploadDocument(selectedFile, 'hcm/offers');
        uploadedOfferUrl = res.data?.data?.url || null;
      } catch (uploadErr) {
        console.warn('Offer letter upload failed, proceeding:', uploadErr.message);
      }
    }

    const payload = {
      ...formData,
      status,
      applicationId: activeCand.id,
      role: formData.role || activeCand.role || 'Role',
      fileName: selectedFile ? selectedFile.name : null,
      offerLetterUrl: uploadedOfferUrl,
      sentDate: formatDate(new Date())
    };

    if (editingOffer) {
      await updateOffer(editingOffer, payload);
    } else {
      await addOffer(payload);
    }
    
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleDeleteOffer = (offer) => {
    setOfferToDelete(offer);
  };

  const handleConfirmDelete = async () => {
    if (offerToDelete) {
      await deleteOffer(offerToDelete.id);
      setOfferToDelete(null);
    }
  };

  const handleRefresh = async () => {
    showToast('Refreshing offer and candidate tracking...', 'info');
    if (refetch && refetch.fetchOffers) {
      await refetch.fetchOffers();
    }
    if (refetch && refetch.fetchApplications) {
      await refetch.fetchApplications();
    }
    showToast('Recruitment tracking updated successfully', 'success');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      try {
        const res = await uploadAPI.uploadDocument(file, 'hcm/offers');
        const cloudUrl = res.data?.data?.url;
        if (cloudUrl) {
          file.url = cloudUrl;
          showToast(`Offer letter uploaded to ImageKit: ${file.name}`, 'success');
          return;
        }
      } catch (uploadErr) {
        console.warn('Direct ImageKit offer upload failed, will upload on submit:', uploadErr.message);
      }
      showToast(`Offer letter selected: ${file.name}`);
    }
  };

  const handleFileDivClick = () => {
    fileInputRef.current?.click();
  };

  const assembleLetterText = (data) => {
    if (!data) return '';
    const company = data.company || {};
    const candidate = data.candidate || {};
    const pos = data.positionDetails || {};
    const sig = data.signatory || {};
    const paragraphs = data.bodyParagraphs || [];
    const terms = data.terms || [];

    return `${company.name || 'Company Name'}
${company.address || 'Company Address'}

Date: ${data.date || new Date().toLocaleDateString()}

To:
${candidate.name || 'Candidate Name'}
${candidate.address || ''}
${candidate.email || ''}

Subject: ${data.subject || 'Offer of Employment'}

${data.salutation || 'Dear Candidate,'}

${paragraphs.join('\n\n')}

Position Details:
- Job Title: ${pos.jobTitle || 'N/A'}
- Department: ${pos.department || 'N/A'}
- Salary: ${pos.salary || 'N/A'}
- Joining Date: ${pos.joiningDate || 'N/A'}
- Employment Type: ${pos.employmentType || 'N/A'}
- Work Location: ${pos.workLocation || 'N/A'}

Terms & Conditions:
${terms.map(t => `- ${t}`).join('\n')}

${data.closing || ''}

Sincerely,

${sig.name || ''}
${sig.designation || ''}`;
  };

  const handleGenerateAiLetter = async (offerObj) => {
    if (!offerObj) {
      showToast('No offer selected to generate the letter.', 'error');
      return;
    }
    
    setActiveOfferForLetter(offerObj);

    if (offerObj.letterContent) {
      try {
        const parsed = JSON.parse(offerObj.letterContent);
        setLetterData(parsed);
        setGeneratedLetter(assembleLetterText(parsed));
        setIsEditingLetter(false);
        setShowLetterPreview(true);
        showToast('Loaded saved letter draft!', 'success');
        return;
      } catch (err) {
        setGeneratedLetter(offerObj.letterContent);
        setLetterData({
          company: { name: 'GlobalTech.ai' },
          candidate: { name: offerObj.candidate },
          positionDetails: { jobTitle: offerObj.role, salary: offerObj.salary, joiningDate: offerObj.joiningDate },
          bodyParagraphs: [offerObj.letterContent]
        });
        setIsEditingLetter(false);
        setShowLetterPreview(true);
        showToast('Loaded saved letter draft!', 'success');
        return;
      }
    }

    setIsGeneratingLetter(true);
    showToast('Generating Letter with AI...', 'info');
    try {
      const cand = candidates.find(c => c.name === offerObj.candidate) || {};
      const contextData = {
        type: 'Offer Letter',
        candidateName: offerObj.candidate,
        candidateEmail: cand.email || '',
        jobTitle: offerObj.role,
        salary: offerObj.salary,
        joiningDate: offerObj.joiningDate
      };
      
      const res = await employeeAPI.aiGenerateLetter("Offer Letter", contextData);
      
      if (res && res.data && res.data.success) {
        const contentObj = res.data.data;
        if (!contentObj) {
          throw new Error('AI returned an empty letter response.');
        }
        
        // Save the structured JSON object
        setLetterData(contentObj);
        
        // Assemble structured JSON into formatted plain text
        const formattedText = assembleLetterText(contentObj);
        setGeneratedLetter(formattedText);
        setIsEditingLetter(false);
        setShowLetterPreview(true);
        showToast('AI Letter Generated!', 'success');
      } else {
        throw new Error(res.data?.error || 'AI Server responded with a failure.');
      }
    } catch (e) {
      console.error('AI Letter generation failed:', e);
      showToast(e.message || 'AI Letter Generation failed', 'error');
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const displaySalary = (val) => {
    if (!val) return 'N/A';
    const cleaned = String(val).replace(/[$,₹,€,£,\s]/g, '');
    if (!isNaN(cleaned) && cleaned.trim() !== '') {
      return formatCurrency(Number(cleaned));
    }
    return val;
  };

  const handlePrintOffer = () => {
    window.print();
  };

  const getActiveLetterData = () => {
    if (showLetterPreview) {
      return letterData;
    }
    if (previewingOffer) {
      if (previewingOffer.letterContent) {
        try {
          return typeof previewingOffer.letterContent === 'string' 
            ? JSON.parse(previewingOffer.letterContent) 
            : previewingOffer.letterContent;
        } catch (e) {
          console.error(e);
        }
      }
      return {
        company: { name: 'GlobalTech.ai', address: '100 AI Blvd, Suite 400, Tech City, TC 10101' },
        candidate: { name: previewingOffer.candidate },
        positionDetails: { jobTitle: previewingOffer.role, salary: previewingOffer.salary, joiningDate: previewingOffer.joiningDate },
        signatory: { name: 'HR Operations Division' },
        reference: `REF-${previewingOffer.id.substring(0, 4)}-2026`,
        date: previewingOffer.sentDate || new Date().toLocaleDateString()
      };
    }
    return null;
  };

  const handleDownloadOffer = () => {
    const activeData = getActiveLetterData();
    if (!activeData) {
      showToast('Error: No offer letter data found.', 'error');
      return;
    }
    showToast('Preparing PDF...', 'info');

    const company = activeData.company || {};
    const candidate = activeData.candidate || {};
    const pos = activeData.positionDetails || {};
    const sig = activeData.signatory || {};
    const paragraphs = activeData.bodyParagraphs || [];
    const terms = activeData.terms || [];

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let y = 25; 
    const margin = 20;
    const contentWidth = 210 - (margin * 2); 

    const printText = (text, size, isBold = false, color = '#000000', align = 'left') => {
      doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(size);
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      doc.setTextColor(r, g, b);

      if (align === 'right') {
        doc.text(text, 210 - margin, y, { align: 'right' });
      } else {
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += (lines.length * (size * 0.4)) + 4; 
      }
    };

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229); 
    doc.text((company.name || 'GlobalTech.ai').toUpperCase(), margin, y);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('OFFER REFERENCE', 210 - margin, y, { align: 'right' });
    y += 4;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(company.address || 'Company Address', margin, y);
    doc.text(activeData.reference || 'REF-XXXX-2026', 210 - margin, y, { align: 'right' });
    y += 4;

    const dateStr = activeData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    doc.text(dateStr, 210 - margin, y, { align: 'right' });
    y += 12;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, 210 - margin, y);
    y += 10;

    printText(candidate.name || 'Candidate Name', 10, true, '#0f172a');
    if (candidate.email) printText(candidate.email, 9, false, '#64748b');
    if (candidate.applicantId) printText(`Applicant ID: ${candidate.applicantId}`, 8, false, '#94a3b8');
    y += 4;

    const subjectLine = activeData.subject || `Offer of Employment - ${pos.jobTitle || 'Position'}`;
    printText(subjectLine.toUpperCase(), 10, true, '#0f172a');
    y += 2;

    printText(activeData.salutation || `Dear ${candidate.name || 'Candidate'},`, 10, false, '#0f172a');
    y += 2;

    paragraphs.forEach(para => {
      printText(para, 10, false, '#334155');
      y += 2;
    });

    y += 4;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 32, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 32, 'D');
    
    let gridY = y + 6;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text('POSITION & COMPENSATION DETAILS', margin + 5, gridY);
    gridY += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    
    doc.text(`Job Title: ${pos.jobTitle || 'N/A'}`, margin + 5, gridY);
    doc.text(`Joining Date: ${pos.joiningDate || 'N/A'}`, margin + 5, gridY + 6);
    doc.text(`Proposed Salary: ${pos.salary || 'N/A'}`, margin + 85, gridY);
    doc.text(`Employment Type: ${pos.employmentType || 'Full-Time'}`, margin + 85, gridY + 6);
    y += 38;

    if (terms.length > 0) {
      printText('TERMS & CONDITIONS', 9, true, '#4f46e5');
      terms.forEach(term => {
        printText(`- ${term}`, 8, false, '#475569');
      });
      y += 4;
    }

    y += 6;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Sincerely,', margin, y);
    y += 12;

    doc.setFont('Helvetica', 'bold');
    doc.text(sig.name || 'Authorized Signatory', margin, y);
    y += 4;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(sig.designation || 'HR Operations Division', margin, y);

    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Digital Seal Applied', 210 - margin, y, { align: 'right' });

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, 282, 210 - margin, 282);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`${company.name || 'GlobalTech.ai'} • Confidential HR Document`, margin, 286);
    doc.text(`Offer Ref: ${activeData.reference || 'REF-XXXX'}`, 210 - margin, 286, { align: 'right' });

    const candName = candidate.name || 'Candidate';
    const refStr = activeData.reference || 'Offer';
    const sanitizedName = candName.replace(/[\/\\:\*\?"<>\|]/g, '').replace(/\s+/g, '_');
    const sanitizedRef = String(refStr).replace(/[\/\\:\*\?"<>\|]/g, '').replace(/\s+/g, '_');

    doc.save(`Offer_Letter_${sanitizedName}_${sanitizedRef}.pdf`);
    showToast('PDF downloaded successfully!', 'success');
  };

  const handleSaveDraft = async () => {
    if (!activeOfferForLetter) return;
    try {
      await updateOffer(activeOfferForLetter.id, {
        ...activeOfferForLetter,
        letterContent: JSON.stringify(letterData)
      });
      showToast('AI offer letter draft saved successfully.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to save draft.', 'error');
    }
  };

  const filteredOffers = offers.filter(o => {
    const matchSearch = (o.candidate || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (o.role || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus ? o.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const CurrencyIconComponent = getIcon();
  const currentCurrencySymbol = getSymbol();

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Offer Management</h1>
          <p className="hcm-page-subtitle">Send and track offers for your top-selected candidates</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2">
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={handleOpenCreate} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20">
             <Plus size={16} />
             <span>Create New Offer</span>
          </button>
          {/* Phase 10: Letter Generator */}
          <button 
            onClick={() => {
              if (offers.length > 0) {
                handleGenerateAiLetter(offers[0]);
              } else {
                showToast('No offers found to generate letters. Please create an offer first.', 'warning');
              }
            }}
            disabled={isGeneratingLetter}
            className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
          >
             {isGeneratingLetter ? (
               <>
                 <Loader2 size={16} className="animate-spin" />
                 <span>Generating...</span>
               </>
             ) : (
               <>
                 <Sparkles size={16} />
                 <span>AI Letter Generator</span>
               </>
             )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -2 }} className="card p-5">
            <div className="flex items-center gap-4">
               <div className={cn("p-3 rounded-2xl transition-colors shrink-0", stat.bg, stat.color)}>
                  <stat.icon size={22} />
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 font-bold leading-none mb-1.5 truncate">{stat.label}</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-white leading-none">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ready for Offer Section */}
      {candidatesReadyForOffer.length > 0 && (
        <div className="card p-6 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-emerald-50/40 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-emerald-950/20 border border-indigo-100 dark:border-indigo-900/40 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Candidates Ready for Offer
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  These candidates have successfully completed interview rounds and are ready for formal job offers.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full text-xs font-black self-start sm:self-center">
              {candidatesReadyForOffer.length} Awaiting Offer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {candidatesReadyForOffer.map((cand) => (
              <div 
                key={cand.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-100/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={cand.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&background=random&bold=true`}
                        alt={cand.name} 
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-50 dark:ring-slate-800 shadow-xs"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{cand.name}</h4>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{cand.role}</p>
                      </div>
                    </div>
                    {cand.match && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        {cand.match}% Match
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 size={13} /> Interview Passed
                    </span>
                    {cand.experience && <span>• {cand.experience} Exp</span>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 5: Offer</span>
                  <button 
                    onClick={() => handleOpenCreateForCandidate(cand)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus size={13} />
                    <span>Create Offer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="card p-0 border-none bg-white dark:bg-slate-900 shadow-soft overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
           <div className="relative flex-1 max-w-sm text-slate-400 dark:text-slate-550">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
              <input type="text" placeholder="Search by name or job role..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-10 h-11" />
           </div>
           <div className="flex items-center gap-2">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field h-11 pr-10 w-40 font-bold dark:bg-slate-900">
                <option value="">All Statuses</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
                <option value="Draft">Draft</option>
              </select>
           </div>
        </div>
        
        {filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <FileText size={48} className="mb-4 opacity-30" />
            <h3 className="text-lg font-bold">No offers found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 font-bold">Candidate</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Salary</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Joining Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="group hover:bg-slate-55/10 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-5 cursor-pointer" onClick={() => handleOpenEdit(offer)}>
                       <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{offer.candidate}</p>
                       <p className="text-[9px] font-bold text-slate-400 dark:text-slate-550 mt-1 uppercase tracking-widest italic">{offer.status === 'Draft' ? 'Drafted' : 'Sent'}: {offer.sentDate || offer.date}</p>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-700 dark:text-slate-300">
                       {offer.role}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                         <span className="text-xs font-extrabold">{displaySalary(offer.salary)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                         <Calendar size={13} className="opacity-55" />
                         <span className="text-xs font-bold">{offer.joiningDate || 'TBD'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span 
                        className={cn("px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border cursor-pointer hover:opacity-85 transition-opacity select-none", getStatusStyle(offer.status))} 
                        onClick={() => {
                          const nextStatus = offer.status === 'Draft' ? 'Sent' : offer.status === 'Sent' ? 'Accepted' : offer.status === 'Accepted' ? 'Declined' : 'Draft';
                          updateOffer(offer.id, { status: nextStatus, applicationId: offer.applicationId });
                        }}
                        title="Click to cycle status: Draft -> Sent -> Accepted -> Declined"
                      >
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {offer.status !== 'Accepted' && (
                          <button 
                            onClick={() => updateOffer(offer.id, { status: 'Accepted', applicationId: offer.applicationId })} 
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all" 
                            title="Accept Offer & Hire Candidate"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button onClick={() => handleGenerateAiLetter(offer)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Generate AI Letter"><Sparkles size={16} /></button>
                        <button onClick={() => handleOpenPreview(offer)} className="p-1.5 text-slate-400 hover:text-primary-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="View Preview"><FileSearch size={16} /></button>
                        <button onClick={() => updateOffer(offer.id, { status: 'Sent', applicationId: offer.applicationId })} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Resend Offer"><Send size={16} /></button>
                        <button onClick={() => handleDeleteOffer(offer)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

       <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
                   <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{editingOffer ? 'Edit Offer Details' : 'Create Candidate Offer'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                      <X size={20} />
                   </button>
                </div>
                <form onSubmit={(e) => handleSubmit(e, false)} className="flex-1 overflow-y-auto">
                  <div className="p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                           <label className="text-xs font-bold text-slate-500 font-bold ml-1">Candidate Name <span className="text-rose-500">*</span></label>
                           <select required value={formData.candidate} onChange={e => {
                             const sel = e.target.value;
                             const cand = candidates.find(c => c.name === sel);
                             setFormData({...formData, candidate: sel, role: cand?.role || ''});
                           }} className="input-field h-12 appearance-none dark:bg-slate-900">
                              <option value="">Select Candidate in Pipeline</option>
                              {candidates.filter(c => c.stage === 'Offer' || c.stage === 'Interview' || c.stage === 'Hired').map(c => (
                                <option key={c.id} value={c.name}>{c.name} ({c.role})</option>
                              ))}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 font-bold ml-1">Proposed Salary (Annual)</label>
                           <div className="relative">
                              <CurrencyIconComponent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input type="text" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder={`e.g. ${currentCurrencySymbol}140,000`} className="input-field h-12 pl-10" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Joining Date</label>
                           <DatePicker value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} className="input-field h-12" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Offer Status</label>
                           <select 
                              value={formData.status || 'Sent'} 
                              onChange={e => setFormData({...formData, status: e.target.value})} 
                              className="input-field h-12 font-bold dark:bg-slate-900"
                           >
                              <option value="Draft">Draft</option>
                              <option value="Sent">Sent</option>
                              <option value="Accepted">Accepted (Hire Candidate)</option>
                              <option value="Declined">Declined</option>
                           </select>
                        </div>
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Offer Letter Template</label>
                        <input 
                           type="file" 
                           ref={fileInputRef} 
                           onChange={handleFileChange} 
                           accept=".pdf,.doc,.docx" 
                           className="hidden" 
                        />
                        <div 
                           onClick={handleFileDivClick} 
                           className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-primary-350 hover:text-primary-500 transition-all cursor-pointer group"
                        >
                           <FileText size={32} className="text-slate-300 dark:text-slate-600 group-hover:text-primary-400 mx-auto mb-2" />
                           {selectedFile ? (
                             <div>
                               <p className="text-xs font-bold text-primary-600 dark:text-primary-400">{selectedFile.name}</p>
                               <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Click to change file</p>
                             </div>
                           ) : (
                             <p className="text-[10px] font-extrabold text-slate-500 group-hover:text-primary-500 uppercase tracking-widest">Select PDF Offer Letter</p>
                           )}
                        </div>
                     </div>
 
                     <div className="grid grid-cols-2 gap-4 pt-4">
                        {['Sign-on Bonus', 'Medical Insurance', 'Stock Options', 'Relocation'].map((ben, i) => (
                           <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 rounded-xl cursor-pointer hover:border-primary-300 transition-all">
                              <input type="checkbox" className="w-4 h-4 rounded accent-primary-600" />
                              <span className="text-[10px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-widest">{ben}</span>
                           </label>
                        ))}
                     </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-end gap-3 shrink-0">
                     <button type="button" onClick={(e) => handleSubmit(e, true)} className="px-5 py-2.5 font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700">Save as Draft</button>
                     <button type="submit" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/10 active:scale-95 flex items-center gap-2">
                        <Send size={16} />
                        <span>{editingOffer ? 'Update Offer' : 'Send Offer'}</span>
                     </button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
 
        {previewingOffer && (
           <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewingOffer(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600">
                          <FileText size={22} />
                       </div>
                       <div>
                          <h2 className="text-sm font-extrabold text-slate-900 dark:white">Offer_Letter_{previewingOffer.candidate.replace(' ', '_')}.pdf</h2>
                          <p className="text-[9px] font-bold text-slate-400 font-bold">Document Preview • {previewingOffer.sentDate || 'Preview'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button onClick={handleDownloadOffer} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Download">
                          <Download size={18} />
                       </button>
                       <button onClick={() => setPreviewingOffer(null)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                          <X size={20} />
                       </button>
                    </div>
                 </div>
                 <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-y-auto p-4 sm:p-10 flex justify-center">
                    <OfferLetterDocument data={previewingOffer} mode="preview" />
                 </div>
                 <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                     <button onClick={() => setPreviewingOffer(null)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">Close</button>
                     <button onClick={handlePrintOffer} className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/10">Print / Sign</button>
                  </div>
               </motion.div>
            </div>
         )}

         {showLetterPreview && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLetterPreview(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-650">
                           <Sparkles size={22} className="text-indigo-600 animate-pulse" />
                        </div>
                        <div>
                           <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">AI Generated Offer Letter</h2>
                           <p className="text-[9px] font-bold text-slate-400">Review, edit, and copy the draft</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => {
                           navigator.clipboard.writeText(generatedLetter);
                           showToast('Copied to clipboard!', 'success');
                        }} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Copy Content">
                           <CheckCircle2 size={18} />
                        </button>
                        <button onClick={() => handleGenerateAiLetter(activeOfferForLetter)} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Regenerate Letter">
                           <RotateCcw size={18} />
                        </button>
                        <button onClick={handleDownloadOffer} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Download">
                           <Download size={18} />
                        </button>
                        <button onClick={() => setShowLetterPreview(false)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                           <X size={20} />
                        </button>
                     </div>
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-y-auto">
                     {isEditingLetter ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 text-left">
                           {/* LEFT Column: Letter Field Form Configuration */}
                           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Edit Document Metadata</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Company Name</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1" value={letterData?.company?.name || ''} onChange={e => {
                                       const updated = { ...letterData, company: { ...letterData.company, name: e.target.value } };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Company Address</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1" value={letterData?.company?.address || ''} onChange={e => {
                                       const updated = { ...letterData, company: { ...letterData.company, address: e.target.value } };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Candidate Name</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1" value={letterData?.candidate?.name || ''} onChange={e => {
                                       const updated = { ...letterData, candidate: { ...letterData.candidate, name: e.target.value } };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Candidate Email</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1" value={letterData?.candidate?.email || ''} onChange={e => {
                                       const updated = { ...letterData, candidate: { ...letterData.candidate, email: e.target.value } };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                                 <div className="sm:col-span-2">
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Subject</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1 w-full" value={letterData?.subject || ''} onChange={e => {
                                       const updated = { ...letterData, subject: e.target.value };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Salutation</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1" value={letterData?.salutation || ''} onChange={e => {
                                       const updated = { ...letterData, salutation: e.target.value };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Job Title</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1" value={letterData?.positionDetails?.jobTitle || ''} onChange={e => {
                                       const updated = { ...letterData, positionDetails: { ...letterData.positionDetails, jobTitle: e.target.value } };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Salary</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1" value={letterData?.positionDetails?.salary || ''} onChange={e => {
                                       const updated = { ...letterData, positionDetails: { ...letterData.positionDetails, salary: e.target.value } };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Joining Date</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1" value={letterData?.positionDetails?.joiningDate || ''} onChange={e => {
                                       const updated = { ...letterData, positionDetails: { ...letterData.positionDetails, joiningDate: e.target.value } };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Signatory Name</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1" value={letterData?.signatory?.name || ''} onChange={e => {
                                       const updated = { ...letterData, signatory: { ...letterData.signatory, name: e.target.value } };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Signatory Title</label>
                                    <input type="text" className="input-field h-10 text-xs mt-1" value={letterData?.signatory?.designation || ''} onChange={e => {
                                       const updated = { ...letterData, signatory: { ...letterData.signatory, designation: e.target.value } };
                                       setLetterData(updated);
                                       setGeneratedLetter(assembleLetterText(updated));
                                    }} />
                                 </div>
                              </div>
                              <div>
                                 <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Letter Body Paragraphs</label>
                                 <textarea className="input-field min-h-[140px] text-xs font-mono p-3 mt-1 w-full" value={letterData?.bodyParagraphs?.[0] || ''} onChange={e => {
                                    const paras = [...(letterData?.bodyParagraphs || [])];
                                    paras[0] = e.target.value;
                                    const updated = { ...letterData, bodyParagraphs: paras };
                                    setLetterData(updated);
                                    setGeneratedLetter(assembleLetterText(updated));
                                 }} />
                              </div>
                           </div>

                           {/* RIGHT Column: Live Document Preview */}
                           <div className="bg-slate-100 dark:bg-slate-950 p-6 flex justify-center rounded-2xl">
                              <OfferLetterDocument data={letterData} mode="preview" />
                           </div>
                        </div>
                     ) : (
                        /* Single Column Full Preview Sheet Mode */
                        <div className="p-10 flex justify-center bg-slate-100 dark:bg-slate-950">
                           <OfferLetterDocument data={letterData} mode="preview" />
                        </div>
                     )}
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                     <div className="flex gap-2">
                        <button
                           onClick={() => setIsEditingLetter(!isEditingLetter)}
                           className="px-5 py-2.5 font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all border border-slate-250 dark:border-slate-700"
                        >
                           {isEditingLetter ? 'View Preview' : 'Edit Letter'}
                        </button>
                        <button
                           onClick={handleSaveDraft}
                           className="px-5 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all border border-indigo-200 dark:border-indigo-800"
                        >
                           Save Draft
                        </button>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => setShowLetterPreview(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-all">Close</button>
                        <button onClick={() => {
                           const candName = activeOfferForLetter?.candidate || 'candidate';
                           const fileName = `${candName.replace(/\s+/g, '_')}_AI_Offer_Letter.txt`;
                           const mockFile = new File([generatedLetter], fileName, { type: 'text/plain' });
                           setSelectedFile(mockFile);
                           
                           setFormData({
                             candidate: activeOfferForLetter.candidate,
                             role: activeOfferForLetter.role,
                             salary: activeOfferForLetter.salary,
                             joiningDate: activeOfferForLetter.joiningDate || '',
                             status: activeOfferForLetter.status || 'Sent'
                           });
                           
                           setShowLetterPreview(false);
                           setIsModalOpen(true);
                           showToast('AI Letter successfully attached to offer form!', 'success');
                        }} className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/10">Accept & Use</button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
       </AnimatePresence>

       <ConfirmDialog
          isOpen={!!offerToDelete}
          onClose={() => setOfferToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Offer Letter"
          message={`Are you sure you want to delete this offer letter for ${offerToDelete?.candidate}? This action cannot be undone.`}
        />
     </div>
   );
 };
 
 export default OfferManagement;
