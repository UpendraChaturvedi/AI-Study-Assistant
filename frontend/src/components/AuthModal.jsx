import React, { useState } from 'react';
import { Sparkles, User, Mail, Lock, Loader2, LogIn, UserPlus, AlertCircle, GraduationCap } from 'lucide-react';
import { registerAPI, loginAPI } from '../services/api';

export function AuthModal({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = isRegister ? await registerAPI(name, email, password) : await loginAPI(email, password);
      if (res?.data) {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          chrome.storage.local.set({ userAccount: res.data });
        }
        onLoginSuccess(res.data);
      }
    } catch (err) {
      setError(err?.error || err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 animate-fade-in">
      {/* Brand mark */}
      <div className="mb-5 flex flex-col items-center gap-3">
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-indigo-600/40 to-pink-600/20 blur-xl" />
          <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-pink-500 shadow-xl shadow-indigo-600/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-base font-extrabold gradient-text">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
            {isRegister
              ? 'Track study sessions, notes & quiz history'
              : 'Sign in to access your study materials'}
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[320px] rounded-2xl border border-white/[0.08] bg-[#0D1221]/90 backdrop-blur-xl p-5 shadow-2xl space-y-4">

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          {['Register', 'Sign In'].map((label) => {
            const active = label === 'Register' ? isRegister : !isRegister;
            return (
              <button key={label} type="button"
                onClick={() => { setIsRegister(label === 'Register'); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  active ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                }`}>
                {label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="input-field w-full pl-9 pr-3 py-2.5 text-xs" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field w-full pl-9 pr-3 py-2.5 text-xs" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full pl-9 pr-3 py-2.5 text-xs" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-2.5 px-4 text-xs flex items-center justify-center gap-2 mt-1 disabled:opacity-50">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              <><UserPlus className="w-3.5 h-3.5" /> Create Account</>
            ) : (
              <><LogIn className="w-3.5 h-3.5" /> Sign In</>
            )}
          </button>
        </form>
      </div>

      <p className="mt-4 text-[10px] text-slate-600">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button type="button"
          onClick={() => { setIsRegister(!isRegister); setError(null); }}
          className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
          {isRegister ? 'Sign In' : 'Register'}
        </button>
      </p>
    </div>
  );
}
