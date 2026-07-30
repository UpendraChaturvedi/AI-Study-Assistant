import React, { useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, CheckCircle, Layers } from 'lucide-react';

export function FlashcardDeck({ flashcards = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState(new Set());

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl">
        <Layers className="w-10 h-10 text-purple-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-200">No Flashcards Generated</h3>
        <p className="text-xs text-slate-400 mt-1">Select "Flashcards" when generating to practice active recall.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const isMastered = masteredCards.has(currentIndex);

  const toggleFlip = () => setIsFlipped((prev) => !prev);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const toggleMastered = (e) => {
    e.stopPropagation();
    setMasteredCards((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-slate-300">
          Card <strong className="text-purple-400">{currentIndex + 1}</strong> of {flashcards.length}
        </span>
        <button
          onClick={toggleMastered}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
            isMastered
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle className={`w-3.5 h-3.5 ${isMastered ? 'text-emerald-400' : 'text-slate-500'}`} />
          {isMastered ? 'Mastered' : 'Mark Mastered'}
        </button>
      </div>

      {/* 3D Flip Flashcard */}
      <div
        onClick={toggleFlip}
        className="w-full h-56 cursor-pointer relative group perspective-1000"
      >
        <div
          className={`w-full h-full rounded-2xl p-6 glass-card border border-purple-500/20 flex flex-col justify-between items-center text-center shadow-xl transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180 bg-purple-950/40 border-purple-500/40' : 'hover:border-purple-500/40'
          }`}
        >
          {/* Card Badge */}
          <div className="w-full flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            <span>{isFlipped ? 'Answer' : 'Question'}</span>
            <span className="flex items-center gap-1 text-purple-400 group-hover:text-purple-300">
              <RotateCw className="w-3 h-3" /> Flip
            </span>
          </div>

          {/* Card Content */}
          <div className="my-auto px-2">
            <p className={`text-sm font-medium leading-relaxed ${isFlipped ? 'text-purple-200' : 'text-slate-100'}`}>
              {isFlipped ? currentCard.answer : currentCard.question}
            </p>
          </div>

          {/* Helper hint */}
          <div className="text-[10px] text-slate-500">
            Click anywhere on card to flip
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrev}
          className="flex-1 py-2 px-3 rounded-xl glass-card hover:bg-slate-800/80 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
