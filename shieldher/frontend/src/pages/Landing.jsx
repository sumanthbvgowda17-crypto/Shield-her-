import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Activity, MapPin, BellRing, ArrowRight, CheckCircle2, Clock, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { loginDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleDirectLogin = () => {
    loginDemoUser();
    navigate('/user');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 border-b border-card-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="text-primary w-8 h-8" />
          <span className="text-2xl font-bold tracking-tight">ShieldHer</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2.5 rounded-full font-medium bg-card text-text border border-card-border hover:bg-card-border transition-colors">
            Login <ArrowRight className="inline w-4 h-4 ml-1" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 lg:py-24 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Typography */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <h1 className="text-6xl md:text-8xl font-serif font-medium leading-tight">
            Your Safety <span className="text-danger">.</span><br/>
            Your Voice <span className="text-danger">.</span><br/>
            Your Freedom <span className="text-danger">.</span>
          </h1>
          <p className="text-xl text-muted max-w-lg leading-relaxed">
            Access real-time active monitoring, intelligent threat detection, and immediate response protocols—powered by ShieldHer technology.
          </p>
          
          <div className="pt-4 flex flex-wrap gap-4">
            <Link to="/login" className="px-8 py-3.5 rounded-full bg-text text-background font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
              Login <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/signup" className="px-8 py-3.5 rounded-full bg-card border border-card-border hover:border-primary font-semibold transition-colors">
              Get Protected
            </Link>
          </div>
        </motion.div>

        {/* Right: Floating Console Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
          
          <div className="relative bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Console Header */}
            <div className="flex items-center justify-between p-4 border-b border-card-border">
              <div className="flex items-center gap-2 font-semibold">
                <Shield className="w-5 h-5 text-danger" />
                ShieldHer Console
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-safe uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-safe animate-pulse"></div>
                Live Platform
              </div>
            </div>

            {/* Console Body */}
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-xl p-4 border border-card-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted font-medium uppercase">System Health</span>
                    <CheckCircle2 className="w-4 h-4 text-safe" />
                  </div>
                  <div className="text-2xl font-bold">98.5%</div>
                </div>
                <div className="bg-background rounded-xl p-4 border border-card-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted font-medium uppercase">Avg Response</span>
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    1.2s <span className="text-xs text-safe">↓ 0.4s</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Active Guardian Nodes</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-text text-background px-4 py-3 rounded-lg font-medium text-sm">
                    <span>Alpha Station (Local Auth)</span>
                    <span className="bg-background/20 px-2 py-0.5 rounded text-xs">Active</span>
                  </div>
                  <div className="flex items-center justify-between bg-background border border-card-border px-4 py-3 rounded-lg font-medium text-sm">
                    <span>Beta Node (Family)</span>
                    <span className="text-muted text-xs border border-card-border px-2 py-0.5 rounded">Standby</span>
                  </div>
                  <div className="flex items-center justify-between bg-background border border-card-border px-4 py-3 rounded-lg font-medium text-sm">
                    <span>Gamma Node (Campus Sec)</span>
                    <span className="text-muted text-xs border border-card-border px-2 py-0.5 rounded">Standby</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </main>

      {/* Intelligence Metrics Bar */}
      <section className="border-y border-card-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h3 className="text-center text-xs font-bold text-muted uppercase tracking-widest mb-8">ShieldHer Protective Intelligence Metrics</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <MetricCard number="24/7" label="Active Monitoring" />
            <MetricCard number="1.2s" label="Avg Emergency Response" />
            <MetricCard number="10k+" label="Protected Users" />
          </div>
        </div>
      </section>

      {/* Configuration Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-medium">Smart Safety Configuration</h2>
          <p className="text-muted text-lg">
            Set your personal parameters below to customize your danger zones, geofences, and alert triggers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-card border border-card-border rounded-2xl p-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="text-sm font-bold text-muted uppercase tracking-wider w-36">Risk Tolerance:</span>
            <div className="flex flex-wrap gap-2">
              <div className="px-4 py-1.5 rounded-full bg-text text-background text-sm font-medium cursor-pointer">Low (Cautious)</div>
              <div className="px-4 py-1.5 rounded-full border border-card-border text-sm font-medium cursor-pointer hover:bg-card-border">Medium</div>
              <div className="px-4 py-1.5 rounded-full border border-card-border text-sm font-medium cursor-pointer hover:bg-card-border">High</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="text-sm font-bold text-muted uppercase tracking-wider w-36">Geofence Size:</span>
            <div className="flex flex-wrap gap-2">
              <div className="px-4 py-1.5 rounded-full border border-card-border text-sm font-medium cursor-pointer hover:bg-card-border">Small (&lt; 1km)</div>
              <div className="px-4 py-1.5 rounded-full bg-text text-background text-sm font-medium cursor-pointer">Medium (City-wide)</div>
              <div className="px-4 py-1.5 rounded-full border border-card-border text-sm font-medium cursor-pointer hover:bg-card-border">Large (State-wide)</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="text-sm font-bold text-muted uppercase tracking-wider w-36">Alert Mode:</span>
            <div className="flex flex-wrap gap-2">
              <div className="px-4 py-1.5 rounded-full border border-card-border text-sm font-medium cursor-pointer hover:bg-card-border">Silent Mode</div>
              <div className="px-4 py-1.5 rounded-full bg-text text-background text-sm font-medium cursor-pointer">Siren + Flash</div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="p-8 border-t border-card-border text-center text-muted text-sm mt-auto bg-card">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-primary" /> <span className="font-semibold text-text">ShieldHer</span>
        </div>
        <p>Empowering women with technology.</p>
      </footer>
    </div>
  );
}

function MetricCard({ number, label }) {
  return (
    <div className="bg-card border border-card-border p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl font-bold text-text mb-2">{number}</div>
      <div className="text-xs font-bold text-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}
