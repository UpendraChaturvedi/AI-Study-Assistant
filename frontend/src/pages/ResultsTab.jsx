import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GitFork, Layers, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { NotesViewer } from '../components/NotesViewer';
import { QuizCard } from '../components/QuizCard';
import { FlashcardDeck } from '../components/FlashcardDeck';
import { MindMap } from '../components/MindMap';

const TABS = [
  { id: 'notes',      label: 'Study Notes',  icon: BookOpen  },
  { id: 'mindmap',   label: 'Mind Map',    icon: GitFork   },
  { id: 'flashcards',label: 'Flashcards',  icon: Layers    },
  { id: 'quiz',      label: 'Practice Quiz',icon: HelpCircle},
];

export function ResultsTab({ generatedData, activeSubTab = 'notes', setActiveSubTab, isFullTab = false }) {
  if (!generatedData || (!generatedData.session && !generatedData.quiz)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-full py-16 text-center gap-4"
      >
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20 shadow-xl">
          <AlertCircle className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-200">No Generated Materials Yet</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-[280px] mx-auto">
            Switch to the <strong className="text-indigo-300">Generate</strong> tab to process your YouTube video and create AI study materials.
          </p>
        </div>
      </motion.div>
    );
  }

  const { session, quiz } = generatedData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="space-y-5"
    >
      {/* ── Sub-tab switcher ────────────────────────────────────────── */}
      <div className="flex gap-2 p-1.5 bg-[#090E1F]/90 border border-white/[0.08] rounded-2xl shadow-lg">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeSubTab === id;
          return (
            <button key={id} onClick={() => setActiveSubTab(id)}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                active ? 'tab-active' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}>
              <Icon className={`w-4 h-4 ${active ? 'text-white' : ''}`} />
              <span className={`text-xs font-bold ${active ? 'text-white' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Active Renderer ────────────────────────────────────────── */}
      <div className={isFullTab ? 'min-h-[450px]' : ''}>
        {activeSubTab === 'notes'      && <NotesViewer notes={session?.notes} summary={session?.summary} isFullTab={isFullTab} />}
        {activeSubTab === 'mindmap'    && <MindMap mindMapData={session?.mindMap || { nodes: [], edges: [] }} isFullTab={isFullTab} />}
        {activeSubTab === 'flashcards' && <FlashcardDeck flashcards={session?.flashcards || []} isFullTab={isFullTab} />}
        {activeSubTab === 'quiz'       && (
          <QuizCard
            questions={quiz?.questions || []}
            difficulty={quiz?.difficulty || 'Medium'}
            isFullTab={isFullTab}
          />
        )}
      </div>
    </motion.div>
  );
}
