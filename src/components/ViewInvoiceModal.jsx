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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
        {/* Header Section: Professional & Silkier */}
        <div className="relative px-10 py-8 border-b border-slate-50 bg-gradient-to-br from-white to-slate-50/50 flex-shrink-0 no-print select-none">
          <div className="absolute top-0 right-0 p-6 flex items-center gap-3">
            <button 
              onClick={() => window.print()} 
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all duration-200 text-slate-500 hover:text-slate-900 group flex items-center gap-2 text-xs font-bold"
            >
              <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Print</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all duration-200 text-slate-400 hover:text-slate-600 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
          
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner ring-1 ring-emerald-100">
                <Receipt className="w-7 h-7" />
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Verification</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Enterprise Ledger System v3.2</p>
                </div>
             </div>
          </div>
        </div>

        {/* Backdrop Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/60 flex flex-col items-center custom-scrollbar no-print">
          {/* Virtual Paper: Premium Document Style */}
          <div 
            ref={invoiceRef} 
            className="bg-white w-full max-w-[210mm] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 rounded-3xl p-16 flex flex-col space-y-12 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none"
            style={{ backgroundColor: '#ffffff', color: '#1e293b' }}
          >
             {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-40 gap-6">
                   <div className="w-12 h-12 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin shadow-inner"></div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Secure Ledger...</p>
                </div>
             ) : (
                <>
                  {/* Top: Branding & ID */}
                  <div className="flex justify-between items-start">
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: '#0f172a' }}>
                              <Activity className="w-7 h-7" />
                           </div>
                           <div>
                              <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight">MEDICARE CMS</h1>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span> Institutional Healthcare Network
                              </p>
                           </div>
                        </div>
                        <div className="text-[11px] text-slate-500 leading-relaxed font-semibold uppercase tracking-wider pl-1">
                           Saini's Medical Complex, Tower B-1<br />
                           Clinical Square, Sector 12-B - 110001<br />
                           Network ID: MEDICARE-01A | GSTIN: 22AAAAA0000A1Z5
                        </div>
                     </div>
                     <div className="text-right">
                        <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4 opacity-10" style={{ color: '#0f172a' }}>Statement</h2>
                        <div className="space-y-2 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                           <p>Registry No: <span className="text-slate-900 ml-2">#{invoice?.invoiceId}</span></p>
                           <p>Validation Date: <span className="text-slate-900 ml-2">{invoice?.issuedDate ? new Date(invoice.issuedDate).toLocaleDateString() : 'N/A'}</span></p>
                        </div>
                     </div>
                  </div>

                  {/* Mid: Two-Column Info Cards */}
                  <div className="grid grid-cols-2 gap-20 border-t border-slate-50 pt-12" style={{ borderTopColor: '#f8fafc' }}>
                     <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Statement Entity</h3>
                        <div className="space-y-2">
                           <h4 className="text-xl font-black text-slate-900 leading-none tracking-tight underline decoration-primary-500/20 underline-offset-8 decoration-4">{invoice?.patientId?.name || 'Unknown Subject'}</h4>
                           <div className="flex items-center gap-3 pt-2">
                             <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-500 uppercase">RegID: {invoice?.patientId?.patientId || 'N/A'}</div>
                           </div>
                           <p className="text-xs text-slate-500 leading-relaxed font-medium mt-4 max-w-xs">
                              {typeof invoice?.patientId?.address === 'object' 
                                ? Object.values(invoice.patientId.address).filter(v => v).join(', ') 
                                : (invoice?.patientId?.address || 'No registered residential data on secure file')}
                           </p>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Authorization Metrics</h3>
                        <div className="grid grid-cols-2 gap-8 text-xs font-bold uppercase tracking-widest">
                           <div className="space-y-2">
                              <p className="text-[9px] text-slate-400 font-black">Settlement</p>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border tracking-tighter ${
                                 invoice?.paymentStatus === 'Paid' 
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                  : 'bg-rose-50 border-rose-100 text-rose-700'
                              }`} style={{ color: invoice?.paymentStatus === 'Paid' ? '#059669' : '#e11d48' }}>
                                 <span className={`w-1.5 h-1.5 rounded-full mr-2 ${invoice?.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                 {invoice?.paymentStatus}
                              </span>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[9px] text-slate-400 font-black">Methodology</p>
                              <div className="flex items-center gap-2 text-slate-800">
                                <span className="w-1 h-3 bg-slate-900 rounded-full"></span>
                                {invoice?.paymentMethod}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Services: Minimalist Table */}
                  <div className="flex-1">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-y border-slate-50" style={{ borderTopColor: '#f1f5f9', borderBottomColor: '#f1f5f9' }}>
                              <th className="px-6 py-5">Verified Procedural Line Itinerary</th>
                              <th className="px-6 py-5 text-center w-24">QTY</th>
                              <th className="px-6 py-5 text-right w-32">Base RATE</th>
                              <th className="px-6 py-5 text-right w-40">Clinical TOTAL</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50" style={{ borderBottomColor: '#f8fafc' }}>
                           {invoice?.items?.map((item, i) => (
                             <tr key={i} className="text-[13px] text-slate-700 group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-7 font-bold text-slate-900 capitalize tracking-tight">{item.description}</td>
                                <td className="px-6 py-7 text-center font-bold text-slate-500">{item.quantity}</td>
                                <td className="px-6 py-7 text-right font-medium text-slate-500 tracking-tight">₹{item.amount?.toLocaleString()}</td>
                                <td className="px-6 py-7 text-right font-black text-slate-900 text-sm tracking-tight">₹{(item.amount * item.quantity).toLocaleString()}</td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  {/* Summary: Bottom Right Totals */}
                  <div className="flex justify-between items-end pt-16 mt-auto">
                     <div className="w-1/2 flex flex-col justify-end space-y-10">
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-3 relative overflow-hidden group/disco" style={{ backgroundColor: '#f9fafb', borderColor: '#f3f4f6' }}>
                           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/disco:opacity-10 transition-opacity">
                              <ShieldCheck className="w-12 h-12" />
                           </div>
                           <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                              System Authentication & Disclaimer
                           </h5>
                           <p className="text-[10px] text-slate-400 leading-relaxed font-semibold italic">
                              This clinical ledger entry represents digitized medical records from Medicare CMS. Authenticated via encrypted protocols. Institution policy mandates discrepancy reporting within 48-hours of electronic issuance at centralized registrar portal.
                           </p>
                        </div>
                        <div className="flex items-center gap-16 pl-6">
                           <div className="text-center group/sign">
                              <div className="w-40 h-px bg-slate-100 mb-3 mt-10 group-hover/sign:bg-primary-300 transition-colors duration-500"></div>
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover/sign:text-slate-500 transition-colors">Credentialed Registrar</p>
                           </div>
                           <div className="text-center group/sign">
                              <div className="w-40 h-px bg-slate-100 mb-3 mt-10 group-hover/sign:bg-slate-300 transition-colors duration-500"></div>
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover/sign:text-slate-500 transition-colors">Subject Acknowledgment</p>
                           </div>
                        </div>
                     </div>
                     <div className="w-80 space-y-4 font-bold text-xs p-2">
                        <div className="flex justify-between px-3 text-slate-400 uppercase tracking-[0.15em] text-[10px]">
                           <span>Service Accumulation</span>
                           <span className="text-slate-900 font-black">₹{invoice?.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between px-3 text-slate-400 uppercase tracking-[0.15em] text-[10px]">
                           <span>Tax Assessment ({invoice?.tax}%)</span>
                           <span className="text-emerald-600 font-black">+₹{((invoice?.totalAmount * invoice?.tax) / 100).toLocaleString()}</span>
                        </div>
                        {invoice?.discount > 0 && (
                          <div className="flex justify-between px-3 text-rose-500 uppercase tracking-[0.15em] text-[10px]">
                             <span>Adjustment Credit</span>
                             <span className="font-black">-₹{invoice?.discount?.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between px-8 py-6 bg-slate-900 text-white rounded-[2rem] mt-8 shadow-2xl shadow-slate-900/30 group/final" style={{ backgroundColor: '#0f172a' }}>
                           <div className="space-y-1">
                             <span className="uppercase text-[9px] tracking-[0.3em] font-black text-slate-400 group-hover/final:text-primary-400 transition-colors">Clinical Resolution</span>
                             <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-60">Verified & Finalized</p>
                           </div>
                           <span className="text-3xl font-black tracking-tighter">₹{invoice?.finalAmount?.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
                </>
             )}
          </div>
        </div>

        {/* Footer Section: Silkier Action Bar */}
        <div className="px-12 py-8 border-t border-slate-50 flex items-center justify-between shrink-0 bg-white no-print">
           <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] select-none">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
              <span>Protocol Secured • Institution Verified • V3.2 Digital Signature</span>
           </div>
           
           <button 
             onClick={handleDownloadPDF}
             disabled={downloading || loading}
             className="relative flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white font-black px-12 py-4 rounded-3xl transition-all uppercase tracking-[0.15em] text-xs shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
             style={{ backgroundColor: '#0f172a' }}
           >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Download className={`w-5 h-5 relative z-10 ${downloading ? 'animate-bounce' : 'group-hover:-translate-y-1 transition-transform'}`} /> 
              <span className="relative z-10">
                {downloading ? 'Exporting Secure Copy...' : 'Download Statement'}
              </span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoiceModal;
