import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, Plus, AlertTriangle, TrendingUp, 
  MoreVertical, Calendar, ArrowUpRight, ArrowDownRight,
  Database, ShieldCheck, ShoppingCart, Activity, RefreshCw,
  Edit, Trash2
} from 'lucide-react';
import { inventoryService } from '../services/api';
import Can from '../components/Can';  // ← RBAC
import useRBAC from '../hooks/useRBAC';  // ← RBAC
import toast from 'react-hot-toast';

const Inventory = () => {
  const { can } = useRBAC();  // ← RBAC
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    expiringSoon: 0,
    categories: {}
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [newItem, setNewItem] = useState({
    itemName: '',
    category: 'Pharmaceuticals',
    batchId: '',
    quantityInStock: 0,
    minimumThreshold: 10,
    expirationDate: '',
    unitPrice: 0,
    supplier: { name: '', contact: '' }
  });

  useEffect(() => {
    fetchInventory();

    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getInventory();
      const inventoryData = res.data.data;
      setItems(inventoryData);
      calculateStats(inventoryData);
    } catch (err) {
      toast.error('Failed to sync clinical supply ledger');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const low = data.filter(item => item.quantityInStock <= item.minimumThreshold).length;
    
    // Expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiring = data.filter(item => new Date(item.expirationDate) <= thirtyDaysFromNow).length;

    const categories = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    setStats({ totalItems: total, lowStock: low, expiringSoon: expiring, categories });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await inventoryService.updateInventoryItem(editId, newItem);
        toast.success('Inventory item updated successfully');
      } else {
        await inventoryService.createInventoryItem(newItem);
        toast.success('Inventory item registered successfully');
      }
      setIsModalOpen(false);
      fetchInventory();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Supply protocol failed');
    }
  };

  const resetForm = () => {
    setNewItem({
      itemName: '', category: 'Pharmaceuticals', batchId: '',
      quantityInStock: 0, minimumThreshold: 10, expirationDate: '',
      unitPrice: 0, supplier: { name: '', contact: '' }
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEditClick = (item) => {
    setNewItem({
      ...item,
      expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : ''
    });
    setEditId(item._id);
    setIsEditing(true);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this inventory record?')) {
      try {
        await inventoryService.deleteInventoryItem(id);
        toast.success('Asset record permanently removed from registry');
        fetchInventory();
      } catch (err) {
        toast.error('Deletion protocol failed');
      }
    }
    setOpenDropdownId(null);
  };

  const updateStockLevel = async (id, currentStock, change) => {
    const newStock = Math.max(0, currentStock + change);
    
    // Optimistic UI Update for instant feedback on quantity and total value
    setItems(prevItems => prevItems.map(item => 
      item._id === id ? { ...item, quantityInStock: newStock } : item
    ));

    try {
      await inventoryService.updateStock(id, newStock);
      toast.success(`Stock level adjusted to ${newStock} units`);
      // Refresh in background to ensure sync
      inventoryService.getInventory().then(res => {
        setItems(res.data.data);
        calculateStats(res.data.data);
      });
    } catch (err) {
      // Revert optimism if failed
      setItems(prevItems => prevItems.map(item => 
        item._id === id ? { ...item, quantityInStock: currentStock } : item
      ));
      toast.error('Ledger synchronization failed');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.batchId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Pharmaceuticals', 'Equipment', 'Supplies', 'Critical-Care'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-slate-400">
             <Database className="w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Procurement & Supply Chain</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Clinical <span className="text-slate-300 italic font-thin">Inventory</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={fetchInventory}
             className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-800 shadow-sm active:rotate-180 duration-500"
           >
              <RefreshCw className="w-5 h-5" />
           </button>
           {/* RBAC: Only admin can add new supply items */}
           <Can action="create">
           <button 
             onClick={() => { resetForm(); setIsModalOpen(true); }}
             className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-4 rounded-2xl transition-all uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-900/20 active:scale-95 group"
           >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" /> New Supply Entry
           </button>
           </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <Package className="w-7 h-7" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-8 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Supply Items</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.totalItems}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition-all">
              <AlertTriangle className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-8 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-red-500/80">Low Stock Indicators</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.lowStock}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Calendar className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-8 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-amber-500/80">Expiring (30 Days)</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.expiringSoon}</h3>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-slate-900/20 group overflow-hidden relative">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Sync</span>
            </div>
            <div className="mt-8 space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Warehouse Efficiency</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">98.4%</h3>
            </div>
          </div>
          <Activity className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-slate-800/50" />
        </div>
      </div>

      {/* Filters & Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 min-h-[500px] flex flex-col">
        {/* Table Toolbar */}
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input 
              type="text"
              placeholder="Search by supply name or batch ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-slate-200 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterCategory === cat 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory List */}
        <div className="flex-1 overflow-visible pb-24">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-6">Ledger Entry / Category</th>
                <th className="px-4 py-6 text-center">Batch ID</th>
                <th className="px-4 py-6 text-center">In Stock</th>
                <th className="px-4 py-6 text-center">Status Indicators</th>
                <th className="px-4 py-6 text-right">Total Value</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-32">
                    <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                      <div className="w-8 h-8 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Supply Chain...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-32 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold">No clinical assets match the current filter criteria</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isLow = item.quantityInStock <= item.minimumThreshold;
                  const isExpiring = new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                  return (
                    <tr key={item._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                            isLow ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
                          }`}>
                            <ShoppingCart className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.itemName}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center font-bold text-[11px] text-slate-500 uppercase tracking-tighter">
                        {item.batchId}
                      </td>
                      <td className="px-4 py-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                           <button 
                             onClick={() => updateStockLevel(item._id, item.quantityInStock, -1)}
                             className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 transition-all active:scale-90"
                           >
                             <ArrowDownRight className="w-4 h-4" />
                           </button>
                           <span className={`text-lg font-black tracking-tighter w-12 text-center ${isLow ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                              {item.quantityInStock}
                           </span>
                           <button 
                             onClick={() => updateStockLevel(item._id, item.quantityInStock, 1)}
                             className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 transition-all active:scale-90"
                           >
                             <ArrowUpRight className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                           {isLow && (
                             <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[9px] font-black uppercase tracking-tighter">Critically Low</span>
                           )}
                           {isExpiring && (
                             <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-tighter">Expiring Soon</span>
                           )}
                           {!isLow && !isExpiring && (
                             <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[9px] font-black uppercase tracking-tighter">Inventory Stable</span>
                           )}
                        </div>
                      </td>
                      <td className="px-4 py-6 text-right">
                         <div className="font-black text-slate-900 tracking-tighter text-base">
                            Rs. {(item.unitPrice * item.quantityInStock).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                         </div>
                         <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                            Rs. {item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / unit
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right relative action-dropdown-container">
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === item._id ? null : item._id)}
                          className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-95 z-10 relative"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openDropdownId === item._id && (
                          <div className="absolute right-12 top-10 z-[100] w-40 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden py-1 animate-in zoom-in-95">
                             {/* RBAC: Only show Edit if user can update */}
                             {can('update') && (
                             <button onClick={() => handleEditClick(item)} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Edit className="w-3.5 h-3.5" /> Edit Record
                             </button>
                             )}
                             {/* RBAC: Only show Delete if user can delete (admin only) */}
                             {can('delete') && (
                             <button onClick={() => handleDeleteClick(item._id)} className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 className="w-3.5 h-3.5" /> Remove Asset
                             </button>
                             )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-3xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                    {isEditing ? <Edit className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                       {isEditing ? 'Update Supply' : 'Supply Registration'}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                       {isEditing ? 'Modify Existing Asset Protocol' : 'New Procurement Entry Protocol'}
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400 hover:text-slate-600"
              >
                <RefreshCw className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-10 space-y-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Item Designation</label>
                     <input 
                       required
                       type="text" 
                       placeholder="e.g. Paracetamol 500mg"
                       className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-slate-200 outline-none transition-all text-sm font-bold"
                       value={newItem.itemName}
                       onChange={e => setNewItem({...newItem, itemName: e.target.value})}
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category Identification</label>
                     <select 
                       className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-slate-200 outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                       value={newItem.category}
                       onChange={e => setNewItem({...newItem, category: e.target.value})}
                     >
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Batch ID</label>
                     <input 
                       required
                       type="text" 
                       placeholder="BTC-####"
                       className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-slate-200 outline-none transition-all text-sm font-bold"
                       value={newItem.batchId}
                       onChange={e => setNewItem({...newItem, batchId: e.target.value})}
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Initial Qty</label>
                     <input 
                       required
                       type="number" 
                       className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-slate-200 outline-none transition-all text-sm font-bold"
                       value={newItem.quantityInStock}
                       onChange={e => setNewItem({...newItem, quantityInStock: parseInt(e.target.value)})}
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Threshold Alert</label>
                     <input 
                       required
                       type="number" 
                       className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-slate-200 outline-none transition-all text-sm font-bold"
                       value={newItem.minimumThreshold}
                       onChange={e => setNewItem({...newItem, minimumThreshold: parseInt(e.target.value)})}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Expiration Protocol</label>
                     <input 
                       required
                       type="date" 
                       className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-slate-200 outline-none transition-all text-sm font-bold"
                       value={newItem.expirationDate}
                       onChange={e => setNewItem({...newItem, expirationDate: e.target.value})}
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Unit Valuation (Rs.)</label>
                     <input 
                       required
                       type="number" 
                       step="0.01"
                       className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-slate-200 outline-none transition-all text-sm font-bold"
                       value={newItem.unitPrice}
                       onChange={e => setNewItem({...newItem, unitPrice: parseFloat(e.target.value)})}
                     />
                  </div>
               </div>

               <div className="pt-8 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all uppercase tracking-widest text-[11px]"
                  >
                    Cancel Protocol
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-8 py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-900/20 active:scale-[0.98]"
                  >
                    {isEditing ? 'Commit Modifications' : 'Commit to Clinical Registry'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
