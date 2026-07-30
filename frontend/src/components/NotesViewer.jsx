import React, { useState, useEffect, useRef } from 'react';
import {
  Copy, Check, Download, FileText, Printer,
  Volume2, VolumeX, Languages, BookOpen, Sparkles, Pause
} from 'lucide-react';

/**
 * Utility: Converts raw Markdown string into structured, styled HTML
 */
function parseInlineStyles(text) {
  if (!text) return '';
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold text-amber-300"><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-200">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] px-1.5 py-0.5 rounded-md">$1</code>');
}

export function renderMarkdownToHTML(md) {
  if (!md) return '';
  const lines = md.split('\n');
  let resultHtml = '';
  let inList = false;

  for (let line of lines) {
    let trimmed = line.trim();

    if (!trimmed) {
      if (inList) { resultHtml += '</ul>'; inList = false; }
      resultHtml += '<div class="h-2"></div>';
      continue;
    }

    if (trimmed.startsWith('### ')) {
      if (inList) { resultHtml += '</ul>'; inList = false; }
      resultHtml += `<h4 class="text-xs sm:text-sm font-bold text-indigo-300 mt-4 mb-2 tracking-wide">${parseInlineStyles(trimmed.slice(4))}</h4>`;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { resultHtml += '</ul>'; inList = false; }
      resultHtml += `<h3 class="text-sm sm:text-base font-extrabold text-white mt-5 mb-2.5 border-b border-indigo-500/25 pb-1 flex items-center gap-2">${parseInlineStyles(trimmed.slice(3))}</h3>`;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (inList) { resultHtml += '</ul>'; inList = false; }
      resultHtml += `<h2 class="text-base sm:text-lg font-black text-white mt-6 mb-3 border-b border-indigo-500/40 pb-1.5">${parseInlineStyles(trimmed.slice(2))}</h2>`;
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { resultHtml += '<ul class="space-y-1.5 my-2 pl-1">'; inList = true; }
      resultHtml += `<li class="flex items-start gap-2 text-slate-200 text-xs sm:text-sm leading-relaxed"><span class="text-indigo-400 font-bold mt-0.5 shrink-0">•</span><span>${parseInlineStyles(trimmed.slice(2))}</span></li>`;
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (!inList) { resultHtml += '<ol class="space-y-1.5 my-2 pl-1">'; inList = true; }
      resultHtml += `<li class="flex items-start gap-2 text-slate-200 text-xs sm:text-sm leading-relaxed"><span class="text-indigo-400 font-bold font-mono mt-0.5 shrink-0">${numMatch[1]}.</span><span>${parseInlineStyles(numMatch[2])}</span></li>`;
      continue;
    }

    if (inList) { resultHtml += '</ul>'; inList = false; }
    resultHtml += `<p class="text-xs sm:text-sm text-slate-200 leading-relaxed my-1">${parseInlineStyles(trimmed)}</p>`;
  }

  if (inList) resultHtml += '</ul>';
  return resultHtml;
}

export function NotesViewer({ notes = '', summary = '', isFullTab = false }) {
  const [copied, setCopied] = useState(false);

  // Audio
  const [readingTarget, setReadingTarget] = useState(null);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const audioChunksRef = useRef([]);
  const currentChunkIndexRef = useRef(0);

  // Hindi
  const [hindiSummary, setHindiSummary] = useState('');
  const [isHindiSummary, setIsHindiSummary] = useState(false);
  const [translatingHindi, setTranslatingHindi] = useState(false);

  useEffect(() => () => stopAudio(), []);

  const handleCopy = () => {
    const text = `${summary ? `SUMMARY:\n${isHindiSummary ? hindiSummary : summary}\n\n` : ''}${notes}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const c = `# AI Study Notes\n\n## Summary\n${isHindiSummary ? hindiSummary : summary}\n\n## Notes\n${notes}`;
    triggerDownload(c, 'text/markdown', `Study_Notes_${Date.now()}.md`);
  };

  const handleDownloadText = () => {
    const c = `AI STUDY SUMMARY\n================\n${isHindiSummary ? hindiSummary : summary}\n\nDETAILED NOTES\n==============\n${notes}`;
    triggerDownload(c, 'text/plain', `Study_Summary_${Date.now()}.txt`);
  };

  const triggerDownload = (content, type, filename) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportPDF = () => {
    const activeSummary = isHindiSummary ? hindiSummary : summary;
    const formattedNotesHtml = renderMarkdownToHTML(notes);
    const html = `<!DOCTYPE html><html><head><title>AI Study Notes Report</title>
      <style>@media print{body{padding:0}}body{font-family:system-ui,sans-serif;padding:40px;color:#0f172a;line-height:1.6;max-width:800px;margin:0 auto}h1{color:#4f46e5;border-bottom:2px solid #e2e8f0;padding-bottom:10px}h2{color:#1e293b;margin-top:24px}.summary-box{background:#f8fafc;border-left:4px solid #6366f1;padding:16px;border-radius:8px;margin-bottom:24px}.content{white-space:pre-wrap;font-size:14px}footer{margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8}</style>
      </head><body>
      <h1>AI Study Assistant — Course Notes Report</h1>
      ${activeSummary ? `<div class="summary-box"><strong>Executive Summary:</strong><p>${activeSummary}</p></div>` : ''}
      <div class="content">${formattedNotesHtml}</div>
      <footer>Generated via AI Study Assistant • Chrome Extension</footer>
      <script>setTimeout(()=>window.print(),500)</script>
      </body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) chrome.tabs.create({ url: blobUrl });
    else window.open(blobUrl, '_blank');
  };

  const cleanMarkdown = (text) => text
    ?.replace(/#{1,6}\s+/g, '')
    .replace(/[*_~`#$[\]()]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim() || '';

  const splitChunks = (text) => {
    const clean = cleanMarkdown(text);
    if (!clean) return [];
    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
    const chunks = [];
    let temp = '';
    for (const s of sentences) {
      if ((temp + s).length > 180) { if (temp.trim()) chunks.push(temp.trim()); temp = s; }
      else temp += ' ' + s;
    }
    if (temp.trim()) chunks.push(temp.trim());
    return chunks;
  };

  const playNextChunk = (target) => {
    if (!window.speechSynthesis) return;
    if (currentChunkIndexRef.current >= audioChunksRef.current.length) {
      setReadingTarget(null); setIsPausedAudio(false); return;
    }
    const chunk = audioChunksRef.current[currentChunkIndexRef.current];
    const u = new SpeechSynthesisUtterance(chunk);
    u.rate = 1.0; u.pitch = 1.0;
    u.lang = /[\u0900-\u097F]/.test(chunk) ? 'hi-IN' : 'en-US';
    u.onend = () => { currentChunkIndexRef.current++; playNextChunk(target); };
    u.onerror = () => { currentChunkIndexRef.current++; playNextChunk(target); };
    window.speechSynthesis.speak(u);
  };

  const playAudioFor = (target, raw) => {
    if (!window.speechSynthesis || !raw) return;
    if (readingTarget === target) {
      if (isPausedAudio) { window.speechSynthesis.resume(); setIsPausedAudio(false); }
      else { window.speechSynthesis.pause(); setIsPausedAudio(true); }
      return;
    }
    window.speechSynthesis.cancel();
    const chunks = splitChunks(raw);
    if (!chunks.length) return;
    audioChunksRef.current = chunks;
    currentChunkIndexRef.current = 0;
    setReadingTarget(target); setIsPausedAudio(false);
    playNextChunk(target);
  };

  const stopAudio = () => {
    window.speechSynthesis?.cancel();
    audioChunksRef.current = []; currentChunkIndexRef.current = 0;
    setReadingTarget(null); setIsPausedAudio(false);
  };

  const toggleHindiSummary = async () => {
    if (isHindiSummary) { setIsHindiSummary(false); return; }
    if (hindiSummary) { setIsHindiSummary(true); return; }
    setTranslatingHindi(true);
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(summary.slice(0, 500))}&langpair=en|hi`);
      const data = await res.json();
      setHindiSummary(data?.responseData?.translatedText || summary);
      setIsHindiSummary(true);
    } catch { setHindiSummary(summary); } finally { setTranslatingHindi(false); }
  };

  if (!notes && !summary) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-3">
        <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/20 shadow-lg">
          <BookOpen className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-200">No Notes Available</h3>
          <p className="text-xs text-slate-400 mt-1">Generate study materials to see your notes here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-extrabold text-slate-200">
          <Sparkles className="w-4 h-4 text-indigo-400" /> Study Materials Report
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={handleCopy} title="Copy Notes"
            className="btn-ghost px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleExportPDF} title="Export PDF"
            className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/35 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm">
            <Printer className="w-3.5 h-3.5 text-indigo-400" /> PDF
          </button>
          <button onClick={handleDownloadMarkdown} title="Export Markdown"
            className="btn-ghost px-2.5 py-1.5 text-xs font-bold flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> .MD
          </button>
          <button onClick={handleDownloadText} title="Export Text"
            className="btn-ghost px-2.5 py-1.5 text-xs font-bold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> .TXT
          </button>
        </div>
      </div>

      {/* ── Summary Card ────────────────────────────────────────── */}
      {summary && (
        <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/50 via-violet-950/30 to-slate-950/50 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-500/20 bg-indigo-950/30">
            <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Executive Summary
            </span>
            <div className="flex items-center gap-2">
              <button onClick={toggleHindiSummary} disabled={translatingHindi}
                className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isHindiSummary ? 'bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-md' : 'btn-ghost'}`}>
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                {translatingHindi ? '…' : isHindiSummary ? 'English' : 'हिंदी Summary'}
              </button>
              <button onClick={() => playAudioFor('summary', isHindiSummary ? hindiSummary : summary)}
                className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  readingTarget === 'summary' ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' : 'btn-ghost'}`}>
                {readingTarget === 'summary'
                  ? (isPausedAudio ? <><Volume2 className="w-3.5 h-3.5" /> Resume</> : <><Pause className="w-3.5 h-3.5" /> Pause</>)
                  : <><Volume2 className="w-3.5 h-3.5" /> Listen Audio</>}
              </button>
              {readingTarget === 'summary' && (
                <button onClick={stopAudio} className="p-1 rounded-lg hover:bg-rose-950/60 text-rose-400 transition-all">
                  <VolumeX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <p className="px-5 py-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            {isHindiSummary ? hindiSummary : summary}
          </p>
        </div>
      )}

      {/* ── Detailed Notes Card with Rich Markdown HTML Renderer ────── */}
      {notes && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#090E1F]/80 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <span className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">Detailed Study Notes</span>
            <div className="flex items-center gap-2">
              <button onClick={() => playAudioFor('notes', notes)}
                className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  readingTarget === 'notes' ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' : 'btn-ghost'}`}>
                {readingTarget === 'notes'
                  ? (isPausedAudio ? <><Volume2 className="w-3.5 h-3.5" /> Resume</> : <><Pause className="w-3.5 h-3.5" /> Pause</>)
                  : <><Volume2 className="w-3.5 h-3.5" /> Listen Notes</>}
              </button>
              {readingTarget === 'notes' && (
                <button onClick={stopAudio} className="p-1 rounded-lg hover:bg-rose-950/60 text-rose-400 transition-all">
                  <VolumeX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Formatted HTML Notes Output Container */}
          <div
            dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(notes) }}
            className={`px-6 py-5 custom-scrollbar overflow-y-auto ${
              isFullTab ? 'max-h-[460px]' : 'max-h-[320px]'
            }`}
          />
        </div>
      )}
    </div>
  );
}
