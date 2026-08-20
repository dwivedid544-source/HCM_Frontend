import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import ImportPreview from './ImportPreview';

const ImportModal = ({ isOpen, onClose, entity = 'users', onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Processing/Summary
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const getAPIUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  };
  const API_URL = getAPIUrl();

  const resetState = () => {
    setFile(null);
    setStep(1);
    setPreviewData(null);
    setLoading(false);
    setError(null);
    setSummary(null);
  };

  const handleClose = () => {
    const wasSuccess = step === 3;
    resetState();
    onClose();
    if (wasSuccess) {
      if (onImportSuccess) {
        try { onImportSuccess(); } catch (e) {}
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('hcm_token');
      const response = await axios.get(`${API_URL}/import/template/${entity}`, {
        responseType: 'blob',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${entity}_template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download template', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
      const validExtensions = /\.(xlsx|xls|csv)$/i;
      if (!validTypes.includes(selectedFile.type) && !validExtensions.test(selectedFile.name)) {
        setError('Invalid file type. Please upload .xlsx, .xls, or .csv');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File is too large. Maximum size is 10MB.');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('hcm_token');
      const response = await axios.post(`${API_URL}/import/preview/${entity}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setPreviewData(response.data.data);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate preview. Please check the file.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('hcm_token');
      const response = await axios.post(`${API_URL}/import/execute/${entity}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSummary({
          success: true,
          count: response.data.count,
          message: response.data.message
        });
        setStep(3);
        if (onImportSuccess) onImportSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute import.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                Import {entity}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Upload an Excel or CSV file to bulk import data
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Download Template
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {file ? file.name : 'Click or drag file to this area to upload'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Support for a single or bulk upload. Strictly prohibited from uploading company data or other band files.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Maximum file size: 10 MB. Supported formats: .xlsx, .xls, .csv</p>
                </div>
              </div>
            )}

            {step === 2 && previewData && (
              <ImportPreview data={previewData} />
            )}

            {step === 3 && summary && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Import Successful!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {summary.message}
                </p>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 max-w-sm mx-auto">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Records Imported</span>
                    <span className="font-bold text-gray-900 dark:text-white">{summary.count}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              {step === 3 ? 'Close' : 'Cancel'}
            </button>
            
            {step === 1 && (
              <button
                onClick={handlePreview}
                disabled={!file || loading}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? 'Processing...' : 'Next: Preview'}
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleExecuteImport}
                disabled={loading || (previewData && previewData.validRows === 0)}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? 'Importing...' : 'Start Import'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImportModal;
