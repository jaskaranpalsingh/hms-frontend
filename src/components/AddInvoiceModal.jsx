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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl border-2 border-slate-50 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <FileText className="w-6 h-6" />
             </div>
             <div className="space-y-0.5">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Generate Service Invoice</h2>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.2em]">Financial Ledger Entry v2.0</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Patient Selection */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Medical Profile (Patient)</label>
             <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <select 
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Enrolled Patient...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (#{p.patientId})</option>
                  ))}
                </select>
             </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest line-clamp-1">Service / Procedural Items</label>
                <button 
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-600 hover:text-white transition-all scale-95 hover:scale-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Service
                </button>
             </div>
             
             <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-3 group animate-in slide-in-from-right-4 duration-300">
                     <div className="flex-1">
                        <input 
                          placeholder="Description (e.g. Lab Test, Consultation)"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 text-sm transition-all"
                        />
                     </div>
                     <div className="w-24">
                        <input 
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 text-sm transition-all text-center"
                        />
                     </div>
                     <div className="w-32 relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input 
                          type="number"
                          placeholder="Amt"
                          value={item.amount}
                          onChange={(e) => updateItem(index, 'amount', e.target.value)}
                          className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 text-sm transition-all"
                        />
                     </div>
                     {formData.items.length > 1 && (
                       <button 
                         type="button"
                         onClick={() => removeItem(index)}
                         className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                     )}
                  </div>
                ))}
             </div>
          </div>

          {/* Summary & Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Payment Protocol</label>
                  <div className="grid grid-cols-2 gap-3">
                     <select 
                       value={formData.paymentMethod}
                       onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                       className="px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-primary-600 transition-all cursor-pointer"
                     >
                        <option value="Cash">Cash</option>
                        <option value="Card">Credit Card</option>
                        <option value="UPI">Digital (UPI)</option>
                        <option value="Insurance">Insurance Claim</option>
                     </select>
                     <select 
                       value={formData.paymentStatus}
                       onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                       className="px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-primary-600 transition-all cursor-pointer"
                     >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partially-Paid">Partial</option>
                        <option value="Paid">Fully Paid</option>
                     </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tax (%)</label>
                      <input 
                        type="number"
                        value={formData.tax}
                        onChange={(e) => setFormData({...formData, tax: parseFloat(e.target.value) || 0})}
                        className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 text-sm transition-all"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Discount (₹)</label>
                      <input 
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                        className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary-600 outline-none font-bold text-slate-800 text-sm transition-all"
                      />
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                   <Calculator className="w-16 h-16" />
                </div>
                <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-2">Final Summary</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-sm font-bold opacity-60">₹</span>
                   <span className="text-4xl font-black tracking-tight">{calculateTotal().toLocaleString()}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase opacity-60">
                      <span>Base Total</span>
                      <span>₹{formData.items.reduce((acc, item) => acc + (item.amount * item.quantity), 0).toLocaleString()}</span>
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase opacity-60">
                      <span>Tax Multiplier</span>
                      <span>+{formData.tax}%</span>
                   </div>
                </div>
             </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-primary-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs mt-4 group"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            {loading ? 'Committing Transaction...' : 'Generate Clinical Invoice'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddInvoiceModal;
