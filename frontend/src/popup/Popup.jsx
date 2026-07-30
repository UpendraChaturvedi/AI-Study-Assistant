import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import {
  Sparkles, Maximize2, Minimize2, ExternalLink,
  AlertCircle, Zap, BookOpen, BarChart2, LogOut
} from 'lucide-react';
import { generateStudyMaterialAPI, fetchSavedSessionsAPI } from '../services/api';
import { GenerateTab } from '../pages/GenerateTab';
import { ResultsTab } from '../pages/ResultsTab';
import { DashboardTab } from '../pages/DashboardTab';
import { AuthModal } from '../components/AuthModal';

export function PopupApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');
  const [activeSubTab, setActiveSubTab] = useState('notes');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullTab, setIsFullTab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [videoId, setVideoId] = useState('');
  const [videoTitle, setVideoTitle] = useState('Educational Video Lecture');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(180);
  const [transcript, setTranscript] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [requestTypes, setRequestTypes] = useState(['notes', 'quiz', 'flashcards', 'mindmap']);

  const [generatedData, setGeneratedData] = useState(null);
  const [savedSessions, setSavedSessions] = useState([]);

  useEffect(() => {
    const isFullscreenParam = window.location.search.includes('fullscreen=true');
    const isStandaloneTab = window.location.protocol === 'chrome-extension:' &&
                            window.location.pathname.endsWith('/index.html') &&
                            window.innerWidth > 750;
    if (isFullscreenParam || isStandaloneTab) {
      setIsFullTab(true);
    }
  }, []);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['userAccount', 'lastStudySession'], (result) => {
        if (result?.userAccount) {
          setCurrentUser(result.userAccount);
        }
        if (result?.lastStudySession) {
          setGeneratedData(result.lastStudySession);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.url?.includes('youtube.com/watch')) {
          try {
            const urlObj = new URL(tab.url);
            const vId = urlObj.searchParams.get('v');
            const cleanTitle = tab.title?.replace('- YouTube', '').trim() || 'Educational Video';
            if (vId) setVideoId(vId);
            if (cleanTitle) setVideoTitle(cleanTitle);
            setTranscript(`Video Lecture Topic: ${cleanTitle}. Please generate comprehensive study materials based on the core syllabus and concepts taught in ${cleanTitle}.`);
            if (vId) {
              chrome.runtime.sendMessage(
                { action: 'EXTRACT_TRANSCRIPT', videoId: vId, startTime: 0, endTime: 180 },
                (res) => {
                  if (res?.success && res?.transcript?.length > 30) setTranscript(res.transcript);
                }
              );
            }
          } catch (e) { console.error(e); }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') loadSavedSessions();
  }, [activeTab]);

  const loadSavedSessions = async () => {
    try {
      const res = await fetchSavedSessionsAPI();
      if (res?.data) setSavedSessions(res.data);
    } catch (err) { console.error(err); }
  };

  const toggleRequestType = (type) =>
    setRequestTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);

  const openInFullBrowserTab = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/index.html?fullscreen=true') });
    }
  };

  const handleGenerate = async () => {
    let finalTranscript = transcript.trim();
    if (!finalTranscript || finalTranscript.length < 10) {
      finalTranscript = `Video Title: ${videoTitle}. Generate comprehensive study notes, key takeaways, flashcards, mind map, and quiz questions for this lecture topic.`;
    }
    setError(null);
    setLoading(true);
    try {
      const payload = { transcript: finalTranscript, videoId: videoId || 'unknown_video', videoTitle: videoTitle || 'Educational Lecture', startTime: Number(startTime), endTime: Number(endTime), requestTypes, difficulty, targetLanguage, userId: currentUser?.id || 'anonymous_user' };
      const response = await generateStudyMaterialAPI(payload);
      if (response?.data) {
        setGeneratedData(response.data);
        setActiveTab('results');
        setActiveSubTab('notes');
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          chrome.storage.local.set({ lastStudySession: response.data });
        }
      }
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to connect to backend server.');
    } finally { setLoading(false); }
  };

  const handleSelectSavedSession = (sess) => {
    const dataObj = { session: sess, quiz: null };
    setGeneratedData(dataObj);
    setActiveTab('results');
    setActiveSubTab('notes');
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ lastStudySession: dataObj });
    }
  };

  const handleReviseNow = ({ start = 260, end = 555, topic = 'Neural Network Backpropagation' } = {}) => {
    setStartTime(start);
    setEndTime(end);
    if (topic) {
      setTranscript(`Topic for Revision: ${topic}. Please generate focused revision notes, key concepts, flashcards, and practice quiz for this segment.`);
    }
    setActiveTab('generate');

    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.id && tab.url?.includes('youtube.com/watch')) {
          chrome.tabs.sendMessage(tab.id, { action: 'SEEK_VIDEO', time: start }).catch(() => {});
        }
      });
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.remove(['userAccount']);
    }
  };

  const TABS = [
    { id: 'generate', label: 'Generate', icon: Zap, iconColor: 'text-indigo-400' },
    { id: 'results',  label: 'Results',  icon: BookOpen, iconColor: 'text-violet-400' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2, iconColor: 'text-pink-400' },
  ];

  // Render Inner Application Content
  const renderAppContent = () => (
    <div className="flex flex-col h-full overflow-hidden w-full">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="relative flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#070C1B]/90 backdrop-blur-xl shrink-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-pink-500 shadow-lg shadow-indigo-500/30 shrink-0">
            <Sparkles className="w-4 h-4 text-white animate-pulse-glow" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-xs sm:text-sm gradient-text truncate tracking-tight flex items-center gap-1.5">
              AI Study Assistant
              {isFullTab && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">Desktop</span>}
            </h1>
            <p className="text-[9px] text-slate-400 font-medium tracking-wide truncate">YouTube Learning Copilot</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {currentUser && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/70 border border-indigo-500/30 shrink-0 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] text-indigo-200 font-semibold truncate max-w-[80px] sm:max-w-[110px]">{currentUser.name}</span>
              <button onClick={handleSignOut} title="Sign Out" className="text-slate-400 hover:text-rose-400 transition-colors ml-0.5">
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}

          {!isFullTab && (
            <button onClick={openInFullBrowserTab} title="Open in Dedicated Full Screen Tab"
              className="btn-ghost p-1.5 flex items-center gap-1 text-[10px] font-bold shrink-0 px-2.5 py-1">
              <ExternalLink className="w-3 h-3 text-indigo-400" />
              <span className="text-indigo-300">Full Tab</span>
            </button>
          )}

          {!isFullTab && (
            <button onClick={() => setIsMaximized(p => !p)} title={isMaximized ? 'Restore' : 'Maximize'}
              className="btn-ghost p-1.5 shrink-0">
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </header>

      {/* ── AUTH OR MAIN TABS ───────────────────────────────────── */}
      {!currentUser ? (
        <AuthModal onLoginSuccess={(user) => { setCurrentUser(user); setIsMaximized(false); }} />
      ) : (
        <>
          {/* ── NAV TABS ──────────────────────────────────────────── */}
          <nav className="flex items-center gap-1.5 px-3 py-2 bg-[#070C1B]/95 border-b border-white/[0.06] shrink-0">
            {TABS.map(({ id, label, icon: Icon, iconColor }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                  activeTab === id ? 'tab-active' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}>
                <Icon className={`w-3.5 h-3.5 ${activeTab === id ? 'text-white' : iconColor}`} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* ── CONTENT BODY ──────────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5">
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-slide-up shadow-md">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {activeTab === 'generate' && (
              <GenerateTab
                videoId={videoId} videoTitle={videoTitle}
                startTime={startTime} endTime={endTime}
                setStartTime={setStartTime} setEndTime={setEndTime}
                transcript={transcript} setTranscript={setTranscript}
                requestTypes={requestTypes} toggleRequestType={toggleRequestType}
                difficulty={difficulty} setDifficulty={setDifficulty}
                targetLanguage={targetLanguage} setTargetLanguage={setTargetLanguage}
                handleGenerate={handleGenerate} loading={loading} isFullTab={isFullTab}
              />
            )}
            {activeTab === 'results' && (
              <ResultsTab
                generatedData={generatedData}
                activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab}
                isFullTab={isFullTab}
              />
            )}
            {activeTab === 'dashboard' && (
              <DashboardTab
                savedSessions={savedSessions}
                onSelectSession={handleSelectSavedSession}
                onReviseNow={handleReviseNow}
                isFullTab={isFullTab}
              />
            )}
          </main>
        </>
      )}

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="px-4 py-2 border-t border-white/[0.06] bg-[#070C1B]/90 text-[10px] text-slate-500 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {currentUser ? <span>Signed in as <strong className="text-slate-300 font-semibold">{currentUser.name}</strong></span> : 'Guest Mode'}
        </span>
        <span className="font-bold text-indigo-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-pink-400" /> Gemini 3.6 Flash
        </span>
      </footer>
    </div>
  );

  // If in Full Tab Desktop mode, wrap in a centered desktop container with side margins and rich background!
  if (isFullTab) {
    return (
      <div className="desktop-bg min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 custom-scrollbar">
        <div className="w-full max-w-6xl h-[90vh] glass-panel rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/[0.12] transition-all duration-300">
          {renderAppContent()}
        </div>
      </div>
    );
  }

  // Extension Popup Window (Strictly 420px width for standard popup)
  return (
    <div className={`glass-panel flex flex-col transition-all duration-300 overflow-hidden relative ${
      isMaximized ? 'w-[750px] h-[600px] rounded-2xl' : 'w-[420px] h-[600px] rounded-2xl'
    }`}>
      {renderAppContent()}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PopupApp />
    </React.StrictMode>
  );
}
