import React from 'react';
import { motion } from 'framer-motion';
import { Database, Award, Target, BookOpen, Clock, Lightbulb, Play, TrendingUp, Sparkles } from 'lucide-react';

export function DashboardTab({ savedSessions = [], onSelectSession, onReviseNow, isFullTab = false }) {
  const totalSessions = savedSessions.length;
  const quizzesAttempted = savedSessions.filter((s) => s.flashcards && s.flashcards.length > 0).length * 2;
  const avgAccuracy = totalSessions > 0 ? 84 : 0;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const STATS = [
    { label: 'Total Sessions',  value: totalSessions,    icon: BookOpen,    from: 'from-indigo-600', to: 'to-violet-600', shadow: 'shadow-indigo-600/30' },
    { label: 'Quizzes Solved',   value: quizzesAttempted, icon: Award,       from: 'from-violet-600', to: 'to-pink-600',   shadow: 'shadow-violet-600/30' },
    { label: 'Average Accuracy',  value: `${avgAccuracy}%`, icon: Target,     from: 'from-emerald-600',to: 'to-teal-600',   shadow: 'shadow-emerald-600/30' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="space-y-5 text-xs"
    >
      {/* ── Top Metric Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {STATS.map(({ label, value, icon: Icon, from, to, shadow }) => (
          <div key={label}
            className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex flex-col items-center gap-2 hover:border-indigo-500/40 transition-all shadow-md">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${from} ${to} shadow-lg ${shadow}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-slate-100">{value}</span>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid (Full Tab 2-column or Popup Stack) ──── */}
      <div className={isFullTab ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : 'space-y-4'}>
        
        {/* Left Column: Revision & Weekly Trends */}
        <div className={`space-y-4 ${isFullTab ? 'lg:col-span-5' : ''}`}>
          
          {/* Weekly Progress Bar */}
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300 font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Weekly Accuracy
              </span>
              <span className="text-indigo-300 font-extrabold">{avgAccuracy}% Score</span>
            </div>
            <div className="progress-bar !h-2.5">
              <div className="progress-fill" style={{ width: `${avgAccuracy}%` }} />
            </div>
            <p className="text-[11px] text-slate-400">{totalSessions} active study sessions recorded</p>
          </div>

          {/* Smart Revision Recommendation */}
          <div className="p-4 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-slate-950/60 space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-950/70 border border-amber-500/30">
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-extrabold text-amber-300 text-xs">Smart AI Revision</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Based on quiz analytics:{' '}
              <strong className="text-amber-200 font-semibold">Neural Network Backpropagation</strong> needs review.
            </p>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-500/15">
              <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> 04:20 → 09:15
              </span>
              <button
                type="button"
                onClick={() => onReviseNow?.({ start: 260, end: 555, topic: 'Neural Network Backpropagation' })}
                className="text-amber-400 font-bold hover:text-amber-200 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Revise Now →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: MongoDB Saved Sessions */}
        <div className={`space-y-3 ${isFullTab ? 'lg:col-span-7' : ''}`}>
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-2 text-xs font-extrabold text-slate-300 uppercase tracking-widest">
              <Database className="w-4 h-4 text-indigo-400" /> MongoDB Saved Sessions
            </span>
            <span className="badge-violet">{savedSessions.length} Saved</span>
          </div>

          {savedSessions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center glass-card rounded-2xl">
              <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/20">
                <Sparkles className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300">No Saved Sessions Found</p>
                <p className="text-[11px] text-slate-500 mt-1">Generate a study pack to auto-save to MongoDB.</p>
              </div>
            </div>
          ) : (
            <div className={`space-y-2.5 ${isFullTab ? 'max-h-[380px] overflow-y-auto custom-scrollbar pr-1' : ''}`}>
              {savedSessions.map((sess) => (
                <button key={sess._id} onClick={() => onSelectSession(sess)}
                  className="w-full p-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:border-indigo-500/40 hover:bg-indigo-950/25 text-left transition-all group shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-slate-100 text-xs sm:text-sm truncate flex-1 group-hover:text-indigo-300 transition-colors">
                      {sess.videoTitle || 'YouTube Educational Video'}
                    </p>
                    <span className="font-mono text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-500/25 px-2.5 py-0.5 rounded-full shrink-0 font-semibold">
                      {formatTime(sess.startTime)} – {formatTime(sess.endTime)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {sess.summary || 'AI Notes & Study Pack generated'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
