import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Activity, AlertCircle, Info, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotView, setIsForgotView] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const loginPromise = login(email, password);

    toast.promise(loginPromise, {
       loading: 'Verifying credentials...',
       success: (user) => `Welcome back, Dr. ${user.name}!`,
       error: (err) => err.response?.data?.message || 'Invalid email or password',
    });

    try {
      await loginPromise;
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address to reset access.');
    
    setResetLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      toast.success(res.data.message || 'Password successfully reset.', { duration: 5000 });
      setIsForgotView(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Access recovery process failed.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-slate-50 to-slate-100">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white rounded-3xl shadow-2xl shadow-primary-500/10 border border-slate-100 p-10 space-y-8 overflow-hidden relative">
          
          <div className="text-center space-y-3 relative z-10">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
              <Activity className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 pt-2 tracking-tighter">Saini's Hospital</h1>
            <p className="text-slate-500 font-medium text-sm">Professional Healthcare Management v2.0</p>
          </div>

          {isForgotView ? (
            <div className="space-y-6 relative z-10 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl mx-auto flex items-center justify-center text-amber-500 shadow-lg">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Recover Access</h2>
                <p className="text-xs font-bold text-slate-400">Enter your clinical email address to request a temporary access token.</p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Recovery Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors w-5 h-5" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-500 outline-none transition-all font-bold placeholder:text-slate-300 shadow-sm"
                      placeholder="name@hospital.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    type="submit" 
                    disabled={resetLoading || !email}
                    className="w-full bg-slate-900 hover:bg-amber-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale uppercase tracking-widest text-xs"
                  >
                    {resetLoading ? 'Authorizing...' : 'Bypass Security Protocol'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsForgotView(false)}
                    className="w-full bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-500 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" /> Cancel Recovery
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Login Identity</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl focus:ring-4 focus:ring-primary-600/10 focus:bg-white focus:border-primary-600 outline-none transition-all font-bold placeholder:text-slate-300 shadow-sm"
                      placeholder="name@hospital.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between pl-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                    <button type="button" onClick={() => setIsForgotView(true)} className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline">Forgot Access?</button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl focus:ring-4 focus:ring-primary-600/10 focus:bg-white focus:border-primary-600 outline-none transition-all font-bold placeholder:text-slate-300 shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale uppercase tracking-widest text-xs"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Enter Dashboard
                    </>
                  )}
                </button>
              </form>

              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center gap-3 relative z-10">
                 <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                    <Info className="w-4 h-4 text-primary-500" />
                 </div>
                 <p className="text-[10px] text-slate-500 font-bold leading-tight">
                    Secure clinical access. Logging into this system requires authorized medical credentials.
                 </p>
              </div>

              <p className="text-center text-slate-400 text-sm font-semibold relative z-10">
                New Patient? {' '}
                <NavLink to="/register" className="text-primary-600 font-bold hover:text-primary-700 hover:underline">Create Account</NavLink>
              </p>

            </>
          )}

          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary-50 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
