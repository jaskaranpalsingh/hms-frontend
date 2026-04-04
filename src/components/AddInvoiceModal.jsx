import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText, User, CreditCard, IndianRupee, Calculator, RefreshCw, CheckCircle2 } from 'lucide-react';
import { billingService, patientService } from '../services/api';
import toast from 'react-hot-toast';

const AddInvoiceModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    items: [{ description: '', amount: 0, quantity: 1 }],
    tax: 0,
    discount: 0,
    paymentStatus: 'Unpaid',
    paymentMethod: 'Cash'
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      const res = await patientService.getPatients();
      setPatients(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load patient registry');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', amount: 0, quantity: 1 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((acc, item) => acc + (item.amount * item.quantity), 0);
    const taxAmount = (subtotal * formData.tax) / 100;
    return subtotal + taxAmount - formData.discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) return toast.error('Please select a patient');
    if (formData.items.some(item => !item.description || item.amount <= 0)) {
       return toast.error('Please complete all item details');
    }

    setLoading(true);
    try {
      const finalAmount = calculateTotal();
      const submitData = {
        ...formData,
        totalAmount: formData.items.reduce((acc, item) => acc + (item.amount * item.quantity), 0),
        finalAmount
      };

      await billingService.createInvoice(submitData);
      toast.success('Invoice generated successfully');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
        {/* Header Section: Professional & Silkier */}
        <div className="relative px-10 py-8 border-b border-slate-50 bg-gradient-to-br from-white to-slate-50/50 flex-shrink-0">
          <div className="absolute top-0 right-0 p-6">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200 text-slate-400 hover:text-slate-600 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
          
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner ring-1 ring-emerald-100">
                <FileText className="w-7 h-7" />
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Billing Protocol</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 font-medium">Institutional Ledger System v3.2</p>
                </div>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-10 space-y-10 flex-1">
          {/* Patient Selection */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-slate-800 ml-1 tracking-tight">Subject Identification</h3>
             <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10 pointer-events-none" />
                <select 
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">Select individual from verified registry...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (#{p.patientId})</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
          </div>

          {/* Line Items */}
          <div className="space-y-5">
              <div className="flex items-center justify-between px-1">
                 <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Transactional Ledger</h3>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Itemized assessment entries</p>
                 </div>
                 <button 
                   type="button"
                   onClick={addItem}
                   className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm uppercase tracking-widest ring-1 ring-emerald-100"
                 >
                   <Plus className="w-3.5 h-3.5" />
                   Append Entry
                 </button>
              </div>
              
              <div className="space-y-4">
                 {formData.items.map((item, index) => (
                   <div key={index} className="grid grid-cols-12 gap-5 group animate-in slide-in-from-right-2 duration-300 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 relative">
                      <div className="col-span-12 md:col-span-6 space-y-1.5">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Description</p>
                         <input 
                           placeholder="e.g. Clinical Consultation, Radiology"
                           value={item.description}
                           onChange={(e) => updateItem(index, 'description', e.target.value)}
                           className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 transition-all font-semibold text-slate-700 text-sm shadow-sm outline-none"
                         />
                      </div>
                      <div className="col-span-4 md:col-span-2 space-y-1.5">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center">Qty</p>
                         <input 
                           type="number"
                           placeholder="0"
                           value={item.quantity}
                           onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                           className="w-full px-2 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 transition-all font-bold text-slate-700 text-sm text-center shadow-sm outline-none"
                         />
                      </div>
                      <div className="col-span-5 md:col-span-3 space-y-1.5">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assessment</p>
                         <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                            <input 
                              type="number"
                              placeholder="0.00"
                              value={item.amount}
                              onChange={(e) => updateItem(index, 'amount', e.target.value)}
                              className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 transition-all font-bold text-slate-700 text-sm shadow-sm outline-none"
                            />
                         </div>
                      </div>
                      <div className="col-span-3 md:col-span-1 flex items-end justify-center pb-1">
                        {formData.items.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50/50 rounded-2xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                   </div>
                 ))}
              </div>
          </div>

          {/* Summary & Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
             <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 ml-1 tracking-tight">Authorization Protocol</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="relative">
                        <select 
                          value={formData.paymentMethod}
                          onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                          className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-[10px] text-slate-600 outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-sm appearance-none pr-10 uppercase tracking-widest"
                        >
                           <option value="Cash">Cash Liquidity</option>
                           <option value="Card">Terminal Payment</option>
                           <option value="UPI">Digital Gateway</option>
                           <option value="Insurance">Insurance Auth</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                     </div>
                     <div className="relative">
                        <select 
                          value={formData.paymentStatus}
                          onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                          className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-[10px] text-slate-600 outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-sm appearance-none pr-10 uppercase tracking-widest"
                        >
                           <option value="Unpaid">Pending Clearance</option>
                           <option value="Partially-Paid">Partial Flow</option>
                           <option value="Paid">Secured / Paid</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Govt Levy (%)</h3>
                      <input 
                        type="number"
                        value={formData.tax}
                        onChange={(e) => setFormData({...formData, tax: parseFloat(e.target.value) || 0})}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 transition-all font-bold text-slate-800 text-sm shadow-sm outline-none"
                      />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adj. Credit (₹)</h3>
                      <input 
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 transition-all font-bold text-slate-800 text-sm shadow-sm outline-none"
                      />
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-center relative overflow-hidden group shadow-2xl shadow-slate-200">
                <div className="absolute -top-4 -right-4 bg-white/5 w-32 h-32 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
                <div className="absolute -bottom-8 -left-8 bg-emerald-500/10 w-48 h-48 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
                
                <div className="relative z-10">
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Assessment Statement</p>
                   <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xl font-bold text-emerald-500/50">₹</span>
                      <span className="text-6xl font-black tracking-tighter leading-none">{calculateTotal().toLocaleString()}</span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Clinical Assessment</p>
                   
                   <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase opacity-40 tracking-widest">
                         <span>Aggregated Flow</span>
                         <span>₹{formData.items.reduce((acc, item) => acc + (item.amount * item.quantity), 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                         <span className="text-emerald-500/60">Institutional Levy</span>
                         <span className="text-emerald-500">+{formData.tax}%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-3xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {loading ? <RefreshCw className="w-5 h-5 animate-spin relative z-10" /> : <Calculator className="w-5 h-5 relative z-10" />}
              <span className="relative z-10 tracking-tight uppercase tracking-widest text-xs">
                {loading ? 'Processing Transaction...' : 'Authorize Clinical Invoice'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInvoiceModal;
