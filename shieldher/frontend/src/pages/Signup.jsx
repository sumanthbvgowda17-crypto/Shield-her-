import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Signup() {
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await signUpWithEmail(email.trim(), password, { name, role });
      
      if (data?.user && !data.session) {
        setMessage('Registration successful! Please check your email to confirm your account, then log in.');
      } else {
        if (role === 'guardian') {
          navigate('/guardian');
        } else {
          navigate('/user');
        }
      }
    } catch (err) {
      console.error('[Signup Error]', err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle(role);
    } catch (err) {
      console.error('[Google Signup Error]', err);
      setError(err.message || 'Failed to initialize Google signup.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-text flex items-center justify-center p-4 selection:bg-purple-500/30 selection:text-white relative overflow-hidden">
      
      {/* Background ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-950/80 border border-white/20 p-8 rounded-3xl w-full max-w-md shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(168,85,247,0.2)] backdrop-blur-3xl relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(168,85,247,0.6)]">
            <Shield className="text-white w-6 h-6 drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create ShieldHer Account</h2>
          <p className="text-xs text-zinc-400 mt-1">Select your role and get protected instantly</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3 text-xs mb-4 font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl p-3 text-xs mb-4 font-medium">
            {message}
          </div>
        )}

        {/* Role Selector with Glass Glow */}
        <div className="flex bg-zinc-900/90 border border-white/10 rounded-2xl p-1 mb-5">
          <button 
            type="button"
            className={clsx(
              "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
              role === 'user' 
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg" 
                : "text-zinc-400 hover:text-white"
            )}
            onClick={() => setRole('user')}
          >
            👤 Protected User
          </button>
          <button 
            type="button"
            className={clsx(
              "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
              role === 'guardian' 
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg" 
                : "text-zinc-400 hover:text-white"
            )}
            onClick={() => setRole('guardian')}
          >
            🛡️ Guardian
          </button>
        </div>

        {/* Google OAuth Button */}
        <button 
          type="button"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading || isLoading}
          className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-2.5 px-4 rounded-xl border border-white/15 hover:border-purple-500/50 shadow-md transition-all flex items-center justify-center gap-3 text-xs active:scale-[0.99] disabled:opacity-60 mb-4 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-[9px] uppercase font-bold text-zinc-500 tracking-widest">
            <span className="bg-zinc-950 px-2">or with email</span>
          </div>
        </div>

        {/* Email Sign Up Form */}
        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-purple-500 text-xs font-medium text-white placeholder-zinc-500"
                placeholder="Prajwal / Manya"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-purple-500 text-xs font-medium text-white placeholder-zinc-500"
                placeholder="name@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-purple-500 text-xs font-medium text-white placeholder-zinc-500"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 text-xs disabled:opacity-50 mt-3 cursor-pointer"
          >
            {isLoading ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-5 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
