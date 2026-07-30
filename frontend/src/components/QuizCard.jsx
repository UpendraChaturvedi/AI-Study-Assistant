import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Award, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { submitQuizAnswersAPI } from '../services/api';

export function QuizCard({ questions = [], difficulty = 'Medium', quizId, userId = 'anonymous_user' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  const preparedQuestions = useMemo(() => {
    if (!questions?.length) return [];
    return questions.map((q) => ({
      ...q,
      options: [...(q.options || [])].sort(() => 0.5 - Math.random()),
    }));
  }, [questions]);

  if (!preparedQuestions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="p-3.5 rounded-2xl bg-violet-950/60 border border-violet-500/20">
          <HelpCircle className="w-7 h-7 text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-200">No Quiz Available</h3>
          <p className="text-xs text-slate-500 mt-1">Generate a quiz for this video segment to start testing your knowledge.</p>
        </div>
      </div>
    );
  }

  const currentQ = preparedQuestions[currentIndex];

  const handleSelectOption = (opt) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);
    setShowExplanation(true);
    const isCorrect = opt === currentQ.correctAnswer;
    if (isCorrect) setScore((p) => p + 1);
    const updatedAnswers = [...userAnswers, { questionId: currentQ.questionId, selectedOption: opt, correctAnswer: currentQ.correctAnswer, isCorrect }];
    setUserAnswers(updatedAnswers);
    if (currentIndex === preparedQuestions.length - 1 && quizId) {
      submitQuizAnswersAPI(quizId, updatedAnswers, userId).catch(console.error);
    }
  };

  const handleNext = () => {
    if (currentIndex < preparedQuestions.length - 1) {
      setCurrentIndex((p) => p + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0); setSelectedOption(null); setScore(0);
    setShowExplanation(false); setIsCompleted(false); setUserAnswers([]);
  };

  if (isCompleted) {
    const pct = Math.round((score / preparedQuestions.length) * 100);
    const grade = pct >= 90 ? { label: 'Excellent!', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' }
      : pct >= 70 ? { label: 'Good Job!', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' }
      : { label: 'Keep Practicing', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/25' };

    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center animate-slide-up">
        <div className="relative">
          <div className={`absolute -inset-3 rounded-full blur-xl opacity-40 ${grade.bg}`} />
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/30">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-extrabold gradient-text">Quiz Completed!</h3>
          <p className={`text-sm font-bold mt-0.5 ${grade.color}`}>{grade.label}</p>
        </div>

        <div className={`w-full max-w-[220px] px-6 py-5 rounded-2xl border ${grade.bg} space-y-1`}>
          <div className="text-4xl font-black gradient-text-pink">{pct}%</div>
          <div className="text-sm text-slate-400 font-semibold">{score} / {preparedQuestions.length} correct</div>
          <div className="badge-violet mx-auto mt-2 inline-block">{difficulty}</div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-[220px]">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <button onClick={handleRestart}
          className="btn-primary px-6 py-2.5 text-xs flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
        </button>
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Progress header ─────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">
            Question <strong className="text-slate-200">{currentIndex + 1}</strong>
            <span className="text-slate-600"> / {preparedQuestions.length}</span>
          </span>
          <span className="badge-violet">{difficulty}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentIndex) / preparedQuestions.length) * 100}%` }} />
        </div>
      </div>

      {/* ── Question ──────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.025]">
        <p className="text-[13px] font-semibold text-slate-100 leading-relaxed">{currentQ.text}</p>
      </div>

      {/* ── Options ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        {currentQ.options.map((opt, idx) => {
          let cls = 'option-btn';
          let icon = null;
          if (selectedOption !== null) {
            if (opt === currentQ.correctAnswer) { cls += ' option-correct'; icon = <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />; }
            else if (opt === selectedOption) { cls += ' option-wrong'; icon = <XCircle className="w-3.5 h-3.5 shrink-0" />; }
            else cls += ' opacity-40';
          }
          return (
            <button key={idx} disabled={selectedOption !== null} onClick={() => handleSelectOption(opt)}
              className={`w-full p-3 flex items-center gap-3 ${cls}`}>
              <span className="q-badge shrink-0">{optionLabels[idx]}</span>
              <span className="flex-1 text-left">{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* ── Explanation ──────────────────────────────────────────── */}
      {showExplanation && (
        <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-500/25 text-xs text-indigo-200 space-y-1 animate-slide-up">
          <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" /> Explanation
          </div>
          <p className="text-[12px] text-slate-300 leading-relaxed">{currentQ.explanation}</p>
        </div>
      )}

      {/* ── Next ─────────────────────────────────────────────────── */}
      {selectedOption !== null && (
        <button onClick={handleNext}
          className="btn-primary w-full py-2.5 px-4 text-xs flex items-center justify-center gap-2 animate-slide-up">
          {currentIndex < preparedQuestions.length - 1 ? 'Next Question' : 'See Results'}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
