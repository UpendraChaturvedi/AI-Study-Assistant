import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Sparkles, BookOpen, HelpCircle, Layers,
  GitFork, Loader2, CheckSquare, Square, Video, Languages, Sliders
} from 'lucide-react';

export function GenerateTab({
  videoTitle, startTime, endTime, setStartTime, setEndTime,
  transcript, setTranscript, requestTypes, toggleRequestType,
  difficulty, setDifficulty, targetLanguage = 'English', setTargetLanguage,
  handleGenerate, loading, isFullTab = false
}) {
  const startMin = Math.floor(startTime / 60);
  const startSec = Math.floor(startTime % 60);
  const endMin   = Math.floor(endTime / 60);
  const endSec   = Math.floor(endTime % 60);

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const MATERIALS = [
    { id: 'notes',      label: 'Detailed Notes',   icon: BookOpen,   color: 'text-indigo-400', desc: 'Markdown study notes & executive summary' },
    { id: 'quiz',       label: 'Interactive Quiz',  icon: HelpCircle, color: 'text-violet-400', desc: 'Multiple choice assessment questions' },
    { id: 'flashcards', label: '3D Flashcards',     icon: Layers,     color: 'text-pink-400',   desc: 'Active recall Q&A study cards' },
    { id: 'mindmap',    label: 'Concept Mind Map',  icon: GitFork,    color: 'text-emerald-400',desc: 'Visual React Flow concept graph' },
  ];

  const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Interview'];
  const DIFF_COLORS  = { Easy: 'text-emerald-400', Medium: 'text-amber-400', Hard: 'text-orange-400', Interview: 'text-rose-400' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`text-xs ${isFullTab ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : 'space-y-4'}`}
    >
      {/* ── LEFT COLUMN (or Top in Popup) ────────────────────── */}
      <div className={`space-y-4 ${isFullTab ? 'lg:col-span-5' : ''}`}>
        
        {/* Active Video Badge */}
        <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">Target YouTube Video</p>
              <p className="text-slate-100 font-bold text-xs truncate mt-0.5">{videoTitle || 'Detecting YouTube video…'}</p>
            </div>
          </div>
        </div>

        {/* Output Language Selector */}
        <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
            <Languages className="w-4 h-4 text-indigo-400" />
            <span>Output Language</span>
          </div>
          <div className="flex gap-1.5">
            {['English','Hindi'].map((lang) => (
              <button key={lang} type="button"
                onClick={() => setTargetLanguage?.(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  targetLanguage === lang
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400/60 shadow-md shadow-indigo-600/30'
                    : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200'
                }`}>
                {lang === 'Hindi' ? 'हिंदी' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Pickers */}
        <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <Clock className="w-4 h-4 text-indigo-400" /> Video Segment
            </span>
            <span className="font-mono text-xs text-indigo-300 font-bold bg-indigo-950/70 border border-indigo-500/30 px-3 py-1 rounded-full">
              {formatTime(startTime)} → {formatTime(endTime)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Start Time */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Start Time</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block mb-0.5">Min</span>
                  <input type="number" min="0" value={startMin}
                    onChange={(e) => setStartTime(Math.max(0,+e.target.value)*60+startSec)}
                    className="input-field w-full px-2 py-1.5 text-center text-xs font-mono font-bold" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block mb-0.5">Sec</span>
                  <input type="number" min="0" max="59" value={startSec}
                    onChange={(e) => setStartTime(startMin*60+Math.min(59,Math.max(0,+e.target.value)))}
                    className="input-field w-full px-2 py-1.5 text-center text-xs font-mono font-bold" />
                </div>
              </div>
            </div>

            {/* End Time */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">End Time</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block mb-0.5">Min</span>
                  <input type="number" min="0" value={endMin}
                    onChange={(e) => setEndTime(Math.max(0,+e.target.value)*60+endSec)}
                    className="input-field w-full px-2 py-1.5 text-center text-xs font-mono font-bold" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block mb-0.5">Sec</span>
                  <input type="number" min="0" max="59" value={endSec}
                    onChange={(e) => setEndTime(endMin*60+Math.min(59,Math.max(0,+e.target.value)))}
                    className="input-field w-full px-2 py-1.5 text-center text-xs font-mono font-bold" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Difficulty Level */}
        {requestTypes.includes('quiz') && (
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] space-y-2.5">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>Quiz Difficulty Level</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map((lvl) => (
                <button key={lvl} type="button" onClick={() => setDifficulty(lvl)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    difficulty === lvl
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400/60 shadow-md shadow-indigo-600/30'
                      : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200'
                  }`}>
                  <span className={difficulty === lvl ? 'text-white' : DIFF_COLORS[lvl]}>{lvl}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN (or Bottom in Popup) ──────────────────── */}
      <div className={`space-y-4 ${isFullTab ? 'lg:col-span-7' : ''}`}>
        
        {/* Study Materials Checkboxes */}
        <div className="space-y-2">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Select Study Output</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MATERIALS.map(({ id, label, icon: Icon, color, desc }) => {
              const checked = requestTypes.includes(id);
              return (
                <button key={id} type="button" onClick={() => toggleRequestType(id)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    checked
                      ? 'bg-indigo-950/60 border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                      : 'bg-white/[0.025] border-white/[0.07] hover:border-white/[0.15]'
                  }`}>
                  <div className="mt-0.5">
                    {checked
                      ? <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                      : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 shrink-0 ${checked ? color : 'text-slate-500'}`} />
                      <span className={`text-xs font-bold ${checked ? 'text-slate-100' : 'text-slate-400'}`}>{label}</span>
                    </div>
                    {isFullTab && <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{desc}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transcript Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Video Transcript Segment</p>
            <span className="text-[10px] text-slate-500 font-mono">{transcript.length} chars</span>
          </div>
          <textarea rows={isFullTab ? 7 : 4} value={transcript} onChange={(e) => setTranscript(e.target.value)}
            placeholder="Auto-extracted spoken transcript from YouTube video…"
            className="input-field w-full px-4 py-3 text-xs leading-relaxed custom-scrollbar resize-none font-mono" />
        </div>

        {/* Action Button */}
        <button disabled={loading} onClick={handleGenerate}
          className="btn-primary w-full py-4 px-6 text-sm font-extrabold flex items-center justify-center gap-2.5 shadow-xl disabled:opacity-50 mt-2">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin text-white" /> Generating Study Pack with Gemini AI…</>
          ) : (
            <><Sparkles className="w-5 h-5 text-amber-300 animate-pulse-glow" /> Generate Study Material</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
