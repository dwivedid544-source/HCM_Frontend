import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { cn } from '../../utils/cn';

const InvoiceDrawer = ({ isOpen, onClose, invoice }) => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const { showToast } = useAdmin();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    setTimeout(() => {
      try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Popup blocked');
        }
        
        const invoiceHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Invoice ${invoice.id}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
import { useCurrency } from '../../../hooks/useCurrency';
              body {
                font-family: 'Plus Jakarta Sans', sans-serif;
                color: #0f172a;
                margin: 0;
                padding: 40px;
                line-height: 1.5;
              }
              .invoice-card {
                max-width: 800px;
                margin: 0 auto;
                background: white;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #f1f5f9;
                padding-bottom: 30px;
                margin-bottom: 40px;
              }
              .logo-area {
                display: flex;
                align-items: center;
                gap: 10px;
              }
              .logo-icon {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #4f46e5, #6366f1);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 800;
                font-size: 18px;
              }
              .brand-name {
                font-size: 20px;
                font-weight: 800;
                letter-spacing: -0.5px;
                background: linear-gradient(135deg, #1e293b, #0f172a);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .invoice-title {
                font-size: 24px;
                font-weight: 800;
                text-align: right;
                color: #1e293b;
              }
              .meta-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 40px;
                margin-bottom: 40px;
              }
              .meta-block h4 {
                margin: 0 0 8px 0;
                text-transform: uppercase;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: 1px;
                color: #94a3b8;
              }
              .meta-block p {
                margin: 0;
                font-size: 14px;
                font-weight: 700;
                color: #334155;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .status-paid {
                background: #ecfdf5;
                color: #059669;
                border: 1px solid #a7f3d0;
              }
              .status-refunded {
                background: #fffbeb;
                color: #d97706;
                border: 1px solid #fde68a;
              }
              .status-failed {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 40px;
              }
              .items-table th {
                text-align: left;
                padding: 12px 16px;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #94a3b8;
                border-bottom: 2px solid #f1f5f9;
              }
              .items-table td {
                padding: 16px;
                font-size: 14px;
                font-weight: 600;
                color: #475569;
                border-bottom: 1px solid #f1f5f9;
              }
              .items-table td.amount {
                text-align: right;
                font-weight: 700;
                color: #1e293b;
              }
              .total-section {
                display: flex;
                justify-content: flex-end;
                margin-top: 20px;
              }
              .total-box {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 20px 30px;
                min-width: 250px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 13px;
                font-weight: 600;
                color: #64748b;
              }
              .total-row.grand-total {
                margin-bottom: 0;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 2px dashed #e2e8f0;
                font-size: 18px;
                font-weight: 800;
                color: #0f172a;
              }
              .footer {
                text-align: center;
                margin-top: 60px;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
                padding-top: 20px;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-card">
              <div class="header">
                <div class="logo-area">
                  <div class="logo-icon">H</div>
                  <div class="brand-name">HCM.ai</div>
                </div>
                <div class="invoice-title">
                  Invoice Details
                  <div style="font-size: 12px; font-weight: 500; color: #64748b; margin-top: 5px;">${invoice.id}</div>
                </div>
              </div>
              
              <div class="meta-grid">
                <div>
                  <div class="meta-block" style="margin-bottom: 20px;">
                    <h4>Status</h4>
                    <span class="status-badge ${
                      invoice.status === 'Paid' ? 'status-paid' :
                      invoice.status === 'Refunded' ? 'status-refunded' :
                      'status-failed'
                    }">${invoice.status}</span>
                  </div>
                  <div class="meta-block">
                    <h4>Billing To</h4>
                    <p>Enterprise Customer</p>
                    <p style="font-weight: 500; color: #64748b; font-size: 13px;">org-setup@hcm.ai</p>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div class="meta-block" style="margin-bottom: 20px;">
                    <h4>Invoice Date</h4>
                    <p>${invoice.date}</p>
                  </div>
                  <div class="meta-block">
                    <h4>Payment Method</h4>
                    <p>${invoice.method}</p>
                  </div>
                </div>
              </div>
              
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Enterprise Plan Subscription</td>
                    <td class="amount">{getSymbol()}4,000.00</td>
                  </tr>
                  <tr>
                    <td>Extra Add-ons</td>
                    <td class="amount">{getSymbol()}280.00</td>
                  </tr>
                  <tr>
                    <td>Tax (0% B2B)</td>
                    <td class="amount">{getSymbol()}0.00</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="total-section">
                <div class="total-box">
                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>{getSymbol()}4,280.00</span>
                  </div>
                  <div class="total-row">
                    <span>Tax (0%)</span>
                    <span>{getSymbol()}0.00</span>
                  </div>
                  <div class="total-row grand-total">
                    <span>Total Amount</span>
                    <span>{getSymbol()}{invoice.amount}</span>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for choosing HCM.ai!</p>
                <p style="font-size: 10px; margin-top: 5px;">If you have any questions regarding this invoice, please reach out to our billing team at support@hcm.ai</p>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
          </html>
        `;
        
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
        showToast(`Invoice ${invoice.id} PDF print dialog opened!`, 'success');
      } catch (err) {
        console.error(err);
        const element = document.createElement("a");
        const file = new Blob([
          `HCM.ai Invoice Details\n` +
          `=====================\n` +
          `Invoice ID: ${invoice.id}\n` +
          `Status: ${invoice.status}\n` +
          `Date: ${invoice.date}\n` +
          `Payment Method: ${invoice.method}\n` +
          `Total Amount: ${getSymbol()}${invoice.amount}\n\n` +
          `Line Items:\n` +
          `- Enterprise Plan Subscription: ${getSymbol()}4,000.00\n` +
          `- Extra Add-ons: ${getSymbol()}280.00\n` +
          `- Tax (0% B2B): ${getSymbol()}0.00\n` +
          `=====================\n` +
          `Thank you for your business!\n`
        ], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `Invoice_${invoice.id}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showToast(`Invoice ${invoice.id} receipt downloaded!`, 'success');
      } finally {
        setIsDownloading(false);
      }
    }, 1200);
  };

  if (!invoice) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invoice Details</h2>
                  <p className="text-xs font-medium text-slate-500 mt-1">{invoice.id}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 mb-1">Status</p>
                    <span className={cn(
                       "px-2.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-widest border block w-max",
                       invoice.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                       invoice.status === 'Refunded' ? "bg-amber-50 text-amber-600 border-amber-100" :
                       "bg-rose-50 text-rose-600 border-rose-100"
                    )}>{invoice.status}</span>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold font-bold text-slate-400 mb-1">Total Amount</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{getSymbol()}{invoice.amount}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 font-bold">Invoice Date</p>
                    <p className="text-sm font-bold text-slate-900">{invoice.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method</p>
                    <p className="text-sm font-bold text-slate-900">{invoice.method}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 dark:text-white">Line Items</h3>
                  <div className="space-y-3 font-bold text-slate-600 text-xs">
                     <div className="flex justify-between p-3 bg-white border border-slate-100 rounded-lg">
                        <span>Enterprise Plan Subscription</span>
                        <span>{getSymbol()}4,000.00</span>
                     </div>
                     <div className="flex justify-between p-3 bg-white border border-slate-100 rounded-lg">
                        <span>Extra Add-ons</span>
                        <span>{getSymbol()}280.00</span>
                     </div>
                     <div className="flex justify-between p-3 bg-white border border-slate-100 rounded-lg">
                        <span>Tax (0% B2B)</span>
                        <span>{getSymbol()}0.00</span>
                     </div>
                  </div>
               </div>
               
               {invoice.status === 'Refunded' && (
                 <div className="p-4 hcm-badge hcm-badge-pending rounded-xl border border-amber-200 flex gap-3 text-sm font-medium">
                    <AlertTriangle size={18} className="shrink-0" />
                    <p>This invoice was refunded on {invoice.date} back to the original payment method.</p>
                 </div>
               )}

            </div>
            <div className="p-8 border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={handleDownload}
                  className="w-full py-4 bg-slate-900 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download PDF
                    </>
                  )}
                </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InvoiceDrawer;
