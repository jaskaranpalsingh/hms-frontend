import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, User, Calendar, CreditCard, Receipt, Download, Printer, ShieldCheck, Activity } from 'lucide-react';
import { billingService } from '../services/api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ViewInvoiceModal = ({ isOpen, onClose, invoiceId }) => {
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoice();
    }
  }, [isOpen, invoiceId]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await billingService.getInvoice(invoiceId);
      setInvoice(res.data.data);
    } catch (err) {
      toast.error('Failed to retrieve financial record');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
     if (!invoiceRef.current) return;

     setDownloading(true);
     const toastId = toast.loading('Synchronizing Digital Assets...');

     // oklch() regex — matches across newlines / spaces inside the function
     const oklchRe = /oklch\([^)]*\)/g;
     const oklabRe = /oklab\([^)]*\)/g;

     try {
        const element = invoiceRef.current;

        const canvas = await html2canvas(element, {
           scale: 2,
           useCORS: true,
           allowTaint: true,
           backgroundColor: '#ffffff',
           logging: false,

           // Skip SVG elements entirely — Lucide icons carry oklch computed styles
           // that html2canvas's CSS parser cannot handle.
           ignoreElements: (el) => el.tagName === 'svg' || el.tagName === 'SVG',

           onclone: (_clonedDoc, clonedEl) => {
              // 1. Sanitize every <style> tag in the cloned document
              _clonedDoc.querySelectorAll('style').forEach(style => {
                 try {
                    style.textContent = (style.textContent || '')
                      .replace(oklchRe, '#1f2937')
                      .replace(oklabRe, '#1f2937')
                      .replace(/box-shadow\s*:[^;]+;/g, 'box-shadow:none;')
                      .replace(/backdrop-filter\s*:[^;]+;/g, 'backdrop-filter:none;')
                      .replace(/filter\s*:[^;]+;/g, 'filter:none;');
                 } catch (_) { /* non-critical */ }
              });

              // 2. Per-element forced hex overrides — applied BEFORE html2canvas reads styles
              _clonedDoc.querySelectorAll('*').forEach(el => {
                 // Strip oklch from any inline style attribute (fastest path)
                 if (el.getAttribute('style')) {
                    el.setAttribute(
                      'style',
                      el.getAttribute('style')
                        .replace(oklchRe, '#1f2937')
                        .replace(oklabRe, '#1f2937')
                    );
                 }

                 // Force explicit safe CSS properties so html2canvas never needs to parse oklch
                 const s = el.style;
                 s.boxShadow      = 'none';
                 s.textShadow     = 'none';
                 s.animation      = 'none';
                 s.transition     = 'none';
                 s.backdropFilter = 'none';
                 s.filter         = 'none';

                 // For elements that have NO inline color set, read computed value
                 // and only patch if it still contains an unsupported function
                 const computed = window.getComputedStyle(el);
                 if (!s.backgroundColor) {
                    const bg = computed.backgroundColor;
                    s.backgroundColor = (bg.includes('oklch') || bg.includes('oklab')) ? '#ffffff' : bg;
                 }
                 if (!s.color) {
                    const c = computed.color;
                    s.color = (c.includes('oklch') || c.includes('oklab')) ? '#111827' : c;
                 }
                 if (!s.borderColor) {
                    const bc = computed.borderColor;
                    s.borderColor = (bc.includes('oklch') || bc.includes('oklab')) ? '#e5e7eb' : bc;
                 }
              });
           },
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        const marginX = (pdfWidth - finalWidth) / 2;
        const marginY = 10; 
        
        pdf.addImage(imgData, 'JPEG', marginX, marginY, finalWidth, finalHeight);
        pdf.save(`MEDICARE_INV_${invoice?.invoiceId || 'EXPORT'}.pdf`);
        
        toast.success('Document Exported Successfully', { id: toastId });
     } catch (err) {
        console.error('EXPORT_FAILURE:', err);
        toast.error('Clinical Export Protocol Failed', { id: toastId });
     } finally {
        setDownloading(false);
     }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700';
      case 'Unpaid': return 'bg-red-100 text-red-700';
      case 'Partially-Paid': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-none animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
        {/* Header: Clean & Functional */}
        <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-200 shrink-0 no-print select-none">
          <div className="flex items-center gap-3">
             <Receipt className="w-5 h-5 text-slate-400" />
             <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Invoice Preview</h2>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-all font-bold text-[10px] uppercase shadow-sm">
                <Printer className="w-3.5 h-3.5" /> Print
             </button>
             <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-all text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Backdrop Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-slate-100/50 flex flex-col items-center custom-scrollbar no-print">
          {/* Virtual Paper: Minimalist Document Style */}
          <div 
            ref={invoiceRef} 
            className="bg-white w-full max-w-[210mm] shadow-sm border border-slate-200 p-16 flex flex-col space-y-12 print:shadow-none print:border-none print:p-0 print:m-0"
            style={{ backgroundColor: '#ffffff', color: '#334155' }}
          >
             {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-40 gap-4">
                   <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Clinical Ledger...</p>
                </div>
             ) : (
                <>
                  {/* Top: Branding & ID */}
                  <div className="flex justify-between items-start">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#1e293b' }}>
                              <Activity className="w-6 h-6" />
                           </div>
                           <div>
                              <h1 className="text-xl font-bold text-slate-900 leading-none">MEDICARE HEALTH</h1>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Hospital Management System</p>
                           </div>
                        </div>
                        <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
                           Saini's Hospital Complex, Sector 12-B<br />
                           Medical Square, City West - 110001<br />
                           Tel: +91 000 000 0000 | gstin: 22AAAAA0000A1Z5
                        </div>
                     </div>
                     <div className="text-right">
                        <h2 className="text-4xl font-light text-slate-900 uppercase tracking-tight mb-4" style={{ color: '#0f172a' }}>Invoice</h2>
                        <div className="space-y-1 text-[11px] font-medium uppercase text-slate-400">
                           <p>Invoice No: <span className="text-slate-900 font-bold ml-1">{invoice?.invoiceId}</span></p>
                           <p>Issue Date: <span className="text-slate-900 ml-1">{invoice?.issuedDate ? new Date(invoice.issuedDate).toLocaleDateString() : 'N/A'}</span></p>
                        </div>
                     </div>
                  </div>

                  {/* Mid: Two-Column Info Cards */}
                  <div className="grid grid-cols-2 gap-16 border-t border-slate-100 pt-10" style={{ borderTopColor: '#f1f5f9' }}>
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Bill Recipient</h3>
                        <div className="space-y-1">
                           <h4 className="text-lg font-bold text-slate-900 leading-none">{invoice?.patientId?.name || 'Unknown Patient'}</h4>
                           <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Reg ID: {invoice?.patientId?.patientId || 'N/A'}</p>
                           <p className="text-xs text-slate-500 leading-relaxed mt-2 max-w-xs">
                              {typeof invoice?.patientId?.address === 'object' 
                                ? Object.values(invoice.patientId.address).filter(v => v).join(', ') 
                                : (invoice?.patientId?.address || 'No registered address on file')}
                           </p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Financial Status</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs font-medium uppercase tracking-tight">
                           <div className="space-y-1">
                              <p className="text-[9px] text-slate-400 font-bold">Ledger Status</p>
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                 invoice?.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                              }`} style={{ color: invoice?.paymentStatus === 'Paid' ? '#15803d' : '#b91c1c' }}>
                                 {invoice?.paymentStatus}
                              </span>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] text-slate-400 font-bold">Protocol</p>
                              <p className="text-slate-800 font-bold">{invoice?.paymentMethod}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Services: Minimalist Table */}
                  <div className="flex-1">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[10px] font-bold text-slate-900 uppercase border-y border-slate-200" style={{ borderTopColor: '#e2e8f0', borderBottomColor: '#e2e8f0' }}>
                              <th className="px-4 py-4">Service Description</th>
                              <th className="px-4 py-4 text-center w-24">Qty</th>
                              <th className="px-4 py-4 text-right w-32">Rate</th>
                              <th className="px-4 py-4 text-right w-32">Total</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100" style={{ borderBottomColor: '#f1f5f9' }}>
                           {invoice?.items?.map((item, i) => (
                             <tr key={i} className="text-[12px] text-slate-700">
                                <td className="px-4 py-6 font-medium capitalize">{item.description}</td>
                                <td className="px-4 py-6 text-center text-slate-500">{item.quantity}</td>
                                <td className="px-4 py-6 text-right">₹{item.amount?.toLocaleString()}</td>
                                <td className="px-4 py-6 text-right font-bold text-slate-900">₹{(item.amount * item.quantity).toLocaleString()}</td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  {/* Summary: Bottom Right Totals */}
                  <div className="flex justify-between items-end pt-12 mt-auto">
                     <div className="w-1/2 flex flex-col justify-end space-y-8">
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg space-y-2" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                           <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <ShieldCheck className="w-3 h-3" /> Security Disclaimer
                           </h5>
                           <p className="text-[9px] text-slate-500 leading-relaxed italic">
                              This clinical ledger entry represents services rendered at Saini's Health Facilities. Authenticated electronically. Discrepancies must be reported within 48 hours of issuance.
                           </p>
                        </div>
                        <div className="flex items-center gap-12 pl-4">
                           <div className="text-center">
                              <div className="w-32 h-px bg-slate-200 mb-2 mt-8"></div>
                              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Authorized Registrar</p>
                           </div>
                           <div className="text-center">
                              <div className="w-32 h-px bg-slate-200 mb-2 mt-8"></div>
                              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Recipient Sign</p>
                           </div>
                        </div>
                     </div>
                     <div className="w-72 space-y-3 font-medium text-xs">
                        <div className="flex justify-between px-2 text-slate-500 uppercase tracking-tight">
                           <span>Base Subtotal</span>
                           <span className="text-slate-900 font-bold">₹{invoice?.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between px-2 text-slate-500 uppercase tracking-tight">
                           <span>Tax Assessment ({invoice?.tax}%)</span>
                           <span className="text-slate-900 font-bold">+₹{((invoice?.totalAmount * invoice?.tax) / 100).toLocaleString()}</span>
                        </div>
                        {invoice?.discount > 0 && (
                          <div className="flex justify-between px-2 text-red-600 uppercase tracking-tight">
                             <span>Discount</span>
                             <span className="font-bold">-₹{invoice?.discount?.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between px-6 py-4 bg-slate-800 text-white rounded-lg mt-6 shadow-sm shadow-slate-900/10" style={{ backgroundColor: '#1e293b' }}>
                           <span className="uppercase text-[10px] tracking-widest font-black">Final Total</span>
                           <span className="text-xl font-bold">₹{invoice?.finalAmount?.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
                </>
             )}
          </div>
        </div>

        {/* Footer: Action Bar */}
        <div className="px-8 py-5 border-t border-slate-200 flex items-center justify-between shrink-0 bg-white no-print">
           <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] select-none">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
              <span>Digital Ledger Secured • Clinical Registry Verified</span>
           </div>
           <button 
             onClick={handleDownloadPDF}
             disabled={downloading || loading}
             className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold px-10 py-3 rounded-xl transition-all uppercase tracking-widest text-[11px] shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
             style={{ backgroundColor: '#0f172a' }}
           >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : 'group-hover:-translate-y-0.5 transition-transform'}`} /> 
              {downloading ? 'Exporting...' : 'Download Statement'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoiceModal;
