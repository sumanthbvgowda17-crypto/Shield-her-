import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Activity, Users, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('user');

  const { currentUser, signInWithGoogle, signInWithEmail, loginDemoUser, loginDemoGuardian } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'guardian') {
        navigate('/guardian');
      } else {
        navigate('/user');
      }
    }
  }, [currentUser, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      console.error('[Login Error]', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setError('Network error. Check your Supabase configuration.');
      } else {
        setError(err.message || 'Failed to sign in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');

    try {
      await signInWithGoogle(role);
    } catch (err) {
      console.error('[Google Login Error]', err);
      setError(err.message || 'Failed to initialize Google login.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-text font-sans overflow-x-hidden selection:bg-purple-500/30 selection:text-white relative">
      
      {/* Ambient 3D Aurora Background Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-pink-600/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Left Typography */}
        <div className="flex-1 max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Next-Gen Autonomous Women's Safety
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-serif font-black tracking-tight leading-[1.1] text-white"
          >
            Your Safety <span className="text-purple-400">.</span><br/>
            Your Voice <span className="text-pink-400">.</span><br/>
            Your Freedom <span className="text-purple-400">.</span>
          </motion.h1>

          <p className="text-base md:text-lg text-zinc-400 mt-6 leading-relaxed font-normal">
            Real-time live GPS tracking, instant Twilio SOS SMS alerts, automated safety protocols, and secure Supabase cloud incident logging.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button 
              onClick={() => { loginDemoUser(); navigate('/user'); }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-2xl transition-all shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center gap-2 text-sm cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> Instant User Preview
            </button>
            <Link to="/signup" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-purple-400/50 text-zinc-200 rounded-2xl font-semibold transition-all text-sm backdrop-blur-md">
              Create New Account
            </Link>
          </div>
        </div>

        {/* Right Glassy 3D Console Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[440px] bg-zinc-950/75 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(168,85,247,0.2)] border border-white/20 overflow-hidden backdrop-blur-3xl"
        >
          {/* Glass Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
            <div className="flex items-center gap-2.5 font-bold text-white">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="tracking-wide">ShieldHer Gateway</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 tracking-wider uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SUPABASE ENCRYPTED
            </div>
          </div>

          <div className="p-7">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-white">Sign In</h3>
              <p className="text-xs text-zinc-400 mt-1">Authenticate to unlock your safety dashboard</p>
            </div>
            
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3 text-xs mb-5 font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-4 rounded-2xl border border-white/15 hover:border-purple-500/50 shadow-lg transition-all flex items-center justify-center gap-3 text-sm cursor-pointer active:scale-[0.98] disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-3 text-zinc-500 font-bold tracking-widest text-[10px]">or with email credentials</span>
              </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500 text-sm font-medium text-white placeholder-zinc-500 transition-colors"
                    placeholder="you@domain.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl pl-10 pr-11 py-2.5 focus:outline-none focus:border-purple-500 text-sm font-medium text-white placeholder-zinc-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer active:scale-[0.98] mt-2"
              >
                {isLoading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-xs text-zinc-400 mt-5 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-400 font-bold hover:underline">
                Sign up
              </Link>
            </p>

            {/* Instant Demo Shortcut */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">
                Instant Access Testing
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => { loginDemoUser(); navigate('/user'); }}
                  className="px-3 py-2 border border-white/10 hover:border-purple-500/50 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold rounded-xl transition-all text-xs text-center cursor-pointer active:scale-95"
                >
                  👤 User Demo
                </button>
                <button 
                  type="button"
                  onClick={() => { loginDemoGuardian(); navigate('/guardian'); }}
                  className="px-3 py-2 border border-white/10 hover:border-purple-500/50 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold rounded-xl transition-all text-xs text-center cursor-pointer active:scale-95"
                >
                  🛡️ Guardian Demo
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Metrics Section */}
      <div id="metrics" className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <h3 className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-8">ShieldHer Protective Platform Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-950/70 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-xl text-center flex flex-col items-center justify-center">
            <Activity className="w-8 h-8 text-rose-500 mb-4" />
            <div className="text-4xl font-black text-white mb-1">0.8s</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Avg SOS Response Time</div>
          </div>
          <div className="bg-zinc-950/70 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-xl text-center flex flex-col items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
            <div className="text-4xl font-black text-white mb-1">100%</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">End-to-End Encryption</div>
          </div>
          <div className="bg-zinc-950/70 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-xl text-center flex flex-col items-center justify-center">
            <Users className="w-8 h-8 text-purple-400 mb-4" />
            <div className="text-4xl font-black text-white mb-1">2.4M+</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Protected Users</div>
          </div>
        </div>
      </div>

    </div>
  );
}
