import React, { useEffect, useState } from 'react';
import { 
  CreditCard, Search, Filter, 
  MoreVertical, CheckCircle2,
  Clock, XCircle, TrendingUp,
  FileText, ArrowUpRight, ArrowDownRight,
  Download, Eye, Trash2, Plus
} from 'lucide-react';
import { billingService } from '../services/api';
import AddInvoiceModal from '../components/AddInvoiceModal';
import ViewInvoiceModal from '../components/ViewInvoiceModal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await billingService.getInvoices({ 
        search: searchTerm, 
        status: statusFilter 
      });
      setInvoices(res.data.data);
    } catch (err) {
      toast.error('Failed to load financial schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [searchTerm, statusFilter]);

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await billingService.deleteInvoice(deleteId);
      toast.success('Inventory record purged');
      fetchInvoices();
    } catch (err) {
      toast.error('Failed to remove transaction');
    }
  };

  const handleDownload = (inv) => {
    toast.success(`Accessing Ledger: ${inv.invoiceId || 'Record'}`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700';
      case 'Unpaid': return 'bg-red-100 text-red-700';
      case 'Partially-Paid': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             Billing Ledger
             <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-3 py-1 rounded-full uppercase tracking-widest">{invoices.length || 0} Transactions</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage patient invoices, insurance claims, and hospital revenue tracking.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 group shadow-xl shadow-primary-600/20 px-8 py-3.5"
        >
          <FileText className="w-5 h-5 group-hover:rotate-6 transition-transform" />
          Generate Invoice
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 focus:text-primary-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by invoice ID or patient..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all outline-none shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-slate-400 hidden md:block" />
          <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="w-full md:w-48 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all outline-none shadow-sm appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partially-Paid">Partially-Paid</option>
          </select>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden shadow-2xl shadow-primary-500/5">
        <div className="overflow-x-auto min-w-[1000px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6">Invoice ID & Date</th>
                <th className="px-8 py-6">Patient Details</th>
                <th className="px-8 py-6">Payment Status</th>
                <th className="px-8 py-6">Amount / Tax</th>
                <th className="px-8 py-6">Payment Method</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan="6" className="px-8 py-6"><div className="h-10 bg-slate-50 animate-pulse rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-600 transition-all">{inv.invoiceId || 'INV-1001'}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Issued: {inv.issuedDate ? new Date(inv.issuedDate).toLocaleDateString() : 'N/A'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-inner">
                             {inv.patientId?.name?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-900 capitalize group-hover:text-primary-600 transition-all">{inv.patientId?.name}</span>
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1 pl-0.5">{inv.patientId?.patientId}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-max ${getStatusStyle(inv.paymentStatus)} shadow-sm border border-transparent group-hover:border-white shadow-slate-200/50 transition-all`}>
                          {inv.paymentStatus === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
                          {inv.paymentStatus === 'Unpaid' && <XCircle className="w-3 h-3" />}
                          {inv.paymentStatus === 'Partially-Paid' && <Clock className="w-3 h-3" />}
                          {inv.paymentStatus}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 tracking-tight">${inv.finalAmount?.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tax: ${inv.tax || 0}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 group-hover:bg-primary-50 rounded-lg text-slate-400 group-hover:text-primary-600 transition-all shadow-sm">
                             <CreditCard className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{inv.paymentMethod}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                          <button 
                            onClick={() => {
                              setSelectedInvoiceId(inv._id);
                              setIsViewOpen(true);
                            }}
                            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 rounded-xl shadow-sm hover:shadow transition-all group/btn transform hover:-translate-y-0.5"
                          >
                             <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownload(inv)}
                            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-200 rounded-xl shadow-sm hover:shadow transition-all group/btn transform hover:-translate-y-0.5"
                          >
                             <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(inv._id)}
                            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl shadow-sm hover:shadow transition-all group/btn transform hover:-translate-y-0.5"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="6" className="px-8 py-24 text-center space-y-4 bg-slate-50/20">
                      <div className="w-20 h-20 bg-white border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-200 animate-pulse">
                         <CreditCard className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                         <h3 className="text-xl font-bold text-slate-800 tracking-tight">No Financial Records Found</h3>
                         <p className="text-slate-400 font-medium">Clear search filters or generate a new patient invoice ledger.</p>
                      </div>
                      <button 
                        onClick={() => setIsAddOpen(true)}
                        className="btn-primary mt-4 scale-90 opacity-80 hover:scale-100 hover:opacity-100 uppercase tracking-widest text-[10px] py-4 px-10 shadow-lg"
                      >
                         Create Manual Ledger
                      </button>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AddInvoiceModal 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onRefresh={fetchInvoices}
      />

      <ViewInvoiceModal 
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        invoiceId={selectedInvoiceId}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Purge Financial Entry?"
        message="You are about to permanently delete this clinical invoice. This action will affect hospital revenue reporting and is irreversible."
        confirmText="Yes, Purge Entry"
      />
    </div>
  );
};

export default Billing;
