import React, { useState } from 'react';
import { 
  User, Lock, Shield, 
  Bell, Eye, EyeOff, 
  Save, RefreshCw, LogOut,
  Camera, Mail, Phone, MapPin,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || null,
  });

  // Security State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updatePromise = authService.updateProfile(profileData);
    
    toast.promise(updatePromise, {
       loading: 'Saving clinical profile...',
       success: 'Profile updated successfully!',
       error: (err) => err.response?.data?.message || 'Failed to update profile',
    });

    try {
      const res = await updatePromise;
      updateUser(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    const uploadPromise = authService.updateProfile(formData);

    toast.promise(uploadPromise, {
       loading: 'Uploading clinical avatar...',
       success: 'Profile image updated!',
       error: 'Failed to upload image',
    });

    try {
      const res = await uploadPromise;
      setProfileData({ ...profileData, profileImage: res.data.data.profileImage });
      updateUser(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
       return toast.error('Passwords do not match');
    }

    setLoading(true);
    const updatePromise = authService.updatePassword({
       currentPassword: passwords.currentPassword,
       newPassword: passwords.newPassword
    });

    toast.promise(updatePromise, {
       loading: 'Securing account...',
       success: 'Password updated! Please login again.',
       error: (err) => err.response?.data?.message || 'Update failed',
    });

    try {
      await updatePromise;
      setTimeout(() => logout(), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Control Panel</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.25em]">Manage your clinical identity and account security v2.0</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
           <button 
             onClick={() => setActiveTab('profile')}
             className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Profile
           </button>
           <button 
             onClick={() => setActiveTab('security')}
             className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Security
           </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <div className="card !p-10 space-y-10 border-2 border-slate-50 shadow-2xl shadow-primary-500/5">
          <div className="flex flex-col md:flex-row items-center gap-10 pb-10 border-b border-slate-100/60">
             <div className="relative group">
                <input 
                  type="file" 
                  id="profile-upload" 
                  hidden 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                <label htmlFor="profile-upload" className="cursor-pointer block transition-transform hover:scale-105 active:scale-95">
                  <div className="w-32 h-32 bg-primary-100 border-4 border-white rounded-[2.5rem] flex items-center justify-center text-primary-700 text-4xl font-black rotate-3 group-hover:rotate-0 overflow-hidden shadow-xl">
                    {profileData.profileImage ? (
                       <img 
                         src={profileData.profileImage.startsWith('http') ? profileData.profileImage : `http://localhost:9090${profileData.profileImage}`} 
                         alt="Profile" 
                         className="w-full h-full object-cover"
                         onError={(e) => {
                           e.target.onerror = null;
                           e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name);
                         }}
                       />
                    ) : (
                       user?.name?.charAt(0)
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-3 rounded-2xl shadow-lg hover:bg-primary-600 transition-colors border-4 border-white">
                    {uploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  </div>
                </label>
             </div>
             <div className="text-center md:text-left space-y-2">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{user?.name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                   <span className="text-[10px] font-black bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm border border-primary-200">
                      ID: {user?.id?.slice(-6).toUpperCase()}
                   </span>
                   <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-slate-900/10">
                      ROLE: {user?.role}
                   </span>
                </div>
             </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Full Clinical Name</label>
                <div className="relative group">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
                   <input 
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 transition-all outline-none font-bold text-slate-800 shadow-sm"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Medical Email Gateway</label>
                <div className="relative group grayscale opacity-60">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input 
                      type="email"
                      disabled
                      value={profileData.email}
                      className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed"
                   />
                   <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Personnel Phone</label>
                <div className="relative group">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
                   <input 
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => {
                         const val = e.target.value.replace(/\D/g, ''); // Numbers only
                         if (val.length <= 10) {
                            setProfileData({...profileData, phone: val});
                         }
                      }}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 transition-all outline-none font-bold text-slate-800 shadow-sm"
                      placeholder="Enter 10-digit number"
                   />
                </div>
             </div>

             <div className="flex items-end">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                  <Save className="w-5 h-5" />
                  Commit Changes
                </button>
             </div>
          </form>

          <div className="bg-amber-50 rounded-3xl p-6 border-2 border-dashed border-amber-100 flex items-start gap-4">
             <div className="p-3 bg-white rounded-xl shadow-sm">
                <Shield className="w-6 h-6 text-amber-500" />
             </div>
             <div className="space-y-1">
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Identity Verification</h4>
                <p className="text-xs text-amber-700/80 font-bold leading-relaxed">Email verification is handled by your hospital administrator. To change your primary email, please file a support ticket with the IT department.</p>
             </div>
          </div>
        </div>
      ) : (
        <div className="card !p-10 space-y-10 border-2 border-slate-50 shadow-2xl shadow-primary-500/5">
           <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Access Control</h2>
              <p className="text-slate-400 font-bold text-sm tracking-tight">Rotate your secret access key regularly to maintain HIPAA compliance.</p>
           </div>

           <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 gap-8 max-w-lg">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Current Secret Key</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
                    <input 
                       type={showPass ? "text" : "password"}
                       required
                       value={passwords.currentPassword}
                       onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                       className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 transition-all outline-none font-bold text-slate-800 shadow-sm"
                       placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                       {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">New Secret Key</label>
                    <input 
                       type="password"
                       required
                       value={passwords.newPassword}
                       onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                       className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 transition-all outline-none font-bold text-slate-800 shadow-sm"
                       placeholder="New Secret"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Rotate Confirmation</label>
                    <input 
                       type="password"
                       required
                       value={passwords.confirmPassword}
                       onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                       className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary-600 transition-all outline-none font-bold text-slate-800 shadow-sm"
                       placeholder="Confirm New"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="bg-slate-900 hover:bg-red-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                Confirm Key Rotation
              </button>
           </form>

           <div className="pt-10 border-t border-slate-100/60 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                 <h4 className="text-sm font-black text-slate-900 uppercase">System Termination</h4>
                 <p className="text-xs text-slate-400 font-bold">End your current session across all medical terminals.</p>
              </div>
              <button 
                onClick={logout}
                className="px-8 py-3 bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-2"
              >
                 <LogOut className="w-4 h-4" />
                 Full System Logout
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
