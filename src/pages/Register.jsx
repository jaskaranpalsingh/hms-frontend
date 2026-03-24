import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Activity, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-slate-50 to-slate-100 uppercase-label">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary-500/10 border border-slate-100 p-12 space-y-10 relative overflow-hidden">
          
          {/* Logo Section */}
          <div className="text-center space-y-3 relative z-10">
            <div className="w-16 h-16 bg-primary-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <Activity className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 pt-3">Create Saini's Account</h1>
            <p className="text-slate-500 font-medium text-sm">Join our healthcare network today</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {errorMessage && (
              <div className="md:col-span-2 flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl focus:ring-4 focus:ring-primary-600/10 focus:bg-white focus:border-primary-600 outline-none transition-all font-medium placeholder:text-slate-300"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl focus:ring-4 focus:ring-primary-600/10 focus:bg-white focus:border-primary-600 outline-none transition-all font-medium placeholder:text-slate-300"
                  placeholder="name@hospital.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                <input 
                  type="password" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl focus:ring-4 focus:ring-primary-600/10 focus:bg-white focus:border-primary-600 outline-none transition-all font-medium placeholder:text-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Register As</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5 z-20" />
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl focus:ring-4 focus:ring-primary-600/10 focus:bg-white focus:border-primary-600 outline-none transition-all font-medium appearance-none relative z-10"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Hospital Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="md:col-span-2 w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale mt-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-6 h-6" />
                  Create Your Account
                </>
              )}
            </button>
          </form>

          {/* Footer Section */}
          <p className="text-center text-slate-500 text-sm font-medium relative z-10">
            Already have an account? {' '}
            <NavLink to="/login" className="text-primary-600 font-bold hover:text-primary-700 hover:underline">Sign In Now</NavLink>
          </p>

          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary-50 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

export default Register;
