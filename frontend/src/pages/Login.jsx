import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const { login } = useContext(AuthContext);
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError('');
 setLoading(true);

 try {
  await login(email, password);
  navigate('/');
 } catch (err) {
  setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
 } finally {
  setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] relative overflow-hidden px-4">
  {/* Dynamic background gradients */}
  <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none"></div>
  <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

  <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10">
  <div className="flex flex-col items-center mb-8">
   <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600 text-white mb-4 shadow-lg shadow-violet-500/20">
   <ShieldAlert size={26} />
   </div>
   <h2 className="font-outfit font-bold text-2xl tracking-tight text-white mb-1">Welcome Back</h2>
   <p className="text-sm text-slate-400">MedTrial Portal</p>
  </div>

  {error && (
   <div className="mb-6 flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-200 text-sm">
   <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
   <p>{error}</p>
   </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-5">
   <div>
   <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
   <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 focus:border-violet-500 text-slate-100 placeholder-slate-500 outline-none transition-colors"
    placeholder="investigator@clinical.org"
    required
   />
   </div>

   <div>
   <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
   <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 focus:border-violet-500 text-slate-100 placeholder-slate-500 outline-none transition-colors"
    placeholder="••••••••"
    required
   />
   </div>

   <button
   type="submit"
   disabled={loading}
   className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 disabled:opacity-50"
   >
   {loading ? (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
   ) : (
    <>
    <LogIn size={18} />
    Access Console
    </>
   )}
   </button>
  </form>

  <p className="mt-8 text-center text-sm text-slate-400">
   New clinical investigator?{' '}
   <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
   Register Here
   </Link>
  </p>
  </div>
 </div>
 );
};

export default Login;
