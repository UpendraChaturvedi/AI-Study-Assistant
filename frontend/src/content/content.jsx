// YouTube Content Script & Transcript Extractor Engine (Manifest V3)
console.log('[AI Study Assistant] YouTube Content Script active.');

let startTime = 0;
let endTime = 180;
let activeModalData = null;
let activeModalTab = 'notes';

/**
 * Utility: Format seconds to MM:SS
 */
function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const remSec = Math.floor(s % 60);
  return `${m}:${remSec < 10 ? '0' : ''}${remSec}`;
}

/**
 * Utility: Shows a floating notification toast on YouTube page
 */
function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.ai-study-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `ai-study-toast ${type === 'error' ? 'border-rose-500 text-rose-300' : 'border-indigo-500 text-indigo-200'}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Gets active HTML5 YouTube video element
 */
function getYouTubeVideoElement() {
  return document.querySelector('video.html5-main-video') || document.querySelector('video');
}

/**
 * Updates timestamp badge UI on floating bar
 */
function updateTimeBadgeUI() {
  const badge = document.querySelector('#ai-study-time-badge');
  if (badge) {
    badge.innerHTML = `<span>${formatTime(startTime)}</span> <span class="arrow">➔</span> <span>${formatTime(endTime)}</span>`;
  }
}

/**
 * Message listener for actions like SEEK_VIDEO
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SEEK_VIDEO') {
    const video = getYouTubeVideoElement();
    if (video && typeof request.time === 'number') {
      video.currentTime = request.time;
      video.play().catch(() => {});
      showToast(`Jumping to revision timestamp ${formatTime(request.time)}`);
      sendResponse({ success: true });
    }
  }
});

/**
 * Utility: Converts raw Markdown string to rich HTML string for YouTube modal
 */
function parseInlineStyles(text) {
  if (!text) return '';
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong style="color:#fde047;"><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c7d2fe;font-weight:700;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color:#cbd5e1;">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.2);border:1px solid rgba(139,92,246,0.3);color:#a78bfa;font-family:monospace;font-size:11px;padding:2px 6px;border-radius:6px;">$1</code>');
}

function renderMarkdownToHTMLString(md) {
  if (!md) return '';
  const lines = md.split('\n');
  let resultHtml = '';
  let inList = false;

  for (let line of lines) {
    let trimmed = line.trim();

    if (!trimmed) {
      if (inList) { resultHtml += '</ul>'; inList = false; }
      resultHtml += '<div style="height:8px;"></div>';
      continue;
    }

    if (trimmed.startsWith('### ')) {
      if (inList) { resultHtml += '</ul>'; inList = false; }
      resultHtml += `<h4 style="font-size:13px;font-weight:700;color:#a78bfa;margin:14px 0 6px 0;">${parseInlineStyles(trimmed.slice(4))}</h4>`;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { resultHtml += '</ul>'; inList = false; }
      resultHtml += `<h3 style="font-size:15px;font-weight:800;color:#ffffff;margin:18px 0 8px 0;border-bottom:1px solid rgba(139,92,246,0.3);padding-bottom:4px;">${parseInlineStyles(trimmed.slice(3))}</h3>`;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (inList) { resultHtml += '</ul>'; inList = false; }
      resultHtml += `<h2 style="font-size:17px;font-weight:900;color:#ffffff;margin:22px 0 10px 0;border-bottom:2px solid rgba(139,92,246,0.5);padding-bottom:6px;">${parseInlineStyles(trimmed.slice(2))}</h2>`;
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { resultHtml += '<ul style="padding-left:14px;margin:8px 0;">'; inList = true; }
      resultHtml += `<li style="color:#e2e8f0;font-size:13px;line-height:1.6;margin-bottom:4px;">${parseInlineStyles(trimmed.slice(2))}</li>`;
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (!inList) { resultHtml += '<ol style="padding-left:14px;margin:8px 0;">'; inList = true; }
      resultHtml += `<li style="color:#e2e8f0;font-size:13px;line-height:1.6;margin-bottom:4px;">${parseInlineStyles(numMatch[2])}</li>`;
      continue;
    }

    if (inList) { resultHtml += '</ul>'; inList = false; }
    resultHtml += `<p style="color:#e2e8f0;font-size:13px;line-height:1.6;margin:6px 0;">${parseInlineStyles(trimmed)}</p>`;
  }

  if (inList) resultHtml += '</ul>';
  return resultHtml;
}

/**
 * Renders the Injected Study Pack Results Modal directly on YouTube page with Close (✕) button!
 */
function showGeneratedMaterialsModal(data) {
  activeModalData = data;
  let modal = document.getElementById('ai-study-modal-root');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ai-study-modal-root';
    document.body.appendChild(modal);
  }

  const { session, quiz } = data || {};
  const notesText = session?.notes || 'No notes generated.';
  const summaryText = session?.summary || '';
  const flashcardsList = session?.flashcards || [];
  const quizQuestions = quiz?.questions || [];
  const mindMapNodes = session?.mindMap?.nodes || [];

  const formattedNotesHtml = renderMarkdownToHTMLString(notesText);

  const renderContentForTab = (tab) => {
    if (tab === 'notes') {
      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${summaryText ? `
            <div style="background:rgba(99,102,241,0.15);border:1px solid rgba(139,92,246,0.3);padding:14px;border-radius:14px;">
              <strong style="color:#c7d2fe;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Executive Summary</strong>
              <p style="margin-top:6px;color:#f1f5f9;font-size:13px;line-height:1.5;">${summaryText}</p>
            </div>
          ` : ''}
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);padding:18px;border-radius:14px;font-family:sans-serif;font-size:13px;line-height:1.6;color:#e2e8f0;">
            ${formattedNotesHtml}
          </div>
        </div>
      `;
    }
    if (tab === 'quiz') {
      if (!quizQuestions.length) return `<p style="color:#94a3b8;text-align:center;padding:20px;">No quiz questions in this study pack.</p>`;
      return quizQuestions.map((q, idx) => `
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);padding:14px;border-radius:14px;margin-bottom:12px;">
          <div style="font-weight:700;color:#f1f5f9;margin-bottom:8px;">Q${idx + 1}. ${q.text}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            ${(q.options || []).map(opt => `
              <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.08);padding:8px 12px;border-radius:10px;font-size:12px;color:#cbd5e1;">
                ${opt}
              </div>
            `).join('')}
          </div>
          <div style="font-size:11px;color:#a78bfa;background:rgba(139,92,246,0.1);padding:8px 12px;border-radius:8px;">
            💡 <strong>Correct:</strong> ${q.correctAnswer} — ${q.explanation || ''}
          </div>
        </div>
      `).join('');
    }
    if (tab === 'flashcards') {
      if (!flashcardsList.length) return `<p style="color:#94a3b8;text-align:center;padding:20px;">No flashcards in this study pack.</p>`;
      return flashcardsList.map((fc, idx) => `
        <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(139,92,246,0.25);padding:14px;border-radius:14px;margin-bottom:10px;">
          <div style="font-weight:700;color:#c7d2fe;font-size:12px;margin-bottom:4px;">Card #${idx + 1}: ${fc.question}</div>
          <div style="color:#f8fafc;font-size:13px;">${fc.answer}</div>
        </div>
      `).join('');
    }
    if (tab === 'mindmap') {
      if (!mindMapNodes.length) return `<p style="color:#94a3b8;text-align:center;padding:20px;">No mind map nodes in this study pack.</p>`;
      return `
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${mindMapNodes.map(n => `
            <div style="background:rgba(16,185,129,0.15);border:1px solid rgba(52,211,153,0.3);padding:10px 14px;border-radius:12px;color:#a7f3d0;font-weight:700;font-size:12px;">
              📌 ${(n.data && n.data.label) || n.id}
            </div>
          `).join('')}
        </div>
      `;
    }
    return '';
  };

  modal.innerHTML = `
    <div class="ai-modal-header">
      <div class="ai-modal-title">
        <span>✨ AI Study Pack</span>
        <span style="font-size:11px;color:#94a3b8;font-weight:500;">(${formatTime(startTime)} ➔ ${formatTime(endTime)})</span>
      </div>
      <div class="ai-modal-controls">
        <button id="ai-modal-maximize-btn" class="ai-modal-btn-icon" title="Maximize Window">🗖</button>
        <button id="ai-modal-close-btn" class="ai-modal-btn-icon" title="Close Results Window" style="font-weight:900;color:#f43f5e;">✕</button>
      </div>
    </div>

    <div class="ai-modal-tabs">
      <button class="ai-modal-tab-btn ${activeModalTab === 'notes' ? 'active' : ''}" data-tab="notes">📖 Notes</button>
      <button class="ai-modal-tab-btn ${activeModalTab === 'quiz' ? 'active' : ''}" data-tab="quiz">❓ Quiz</button>
      <button class="ai-modal-tab-btn ${activeModalTab === 'flashcards' ? 'active' : ''}" data-tab="flashcards">🎴 Cards</button>
      <button class="ai-modal-tab-btn ${activeModalTab === 'mindmap' ? 'active' : ''}" data-tab="mindmap">🌿 Mind Map</button>
    </div>

    <div class="ai-modal-body">
      ${renderContentForTab(activeModalTab)}
    </div>

    <div class="ai-modal-footer">
      <span>Saved to MongoDB Account</span>
      <span style="color:#a78bfa;font-weight:700;">Gemini 3.6 Flash</span>
    </div>
  `;

  // Attach Close Button (✕)
  document.getElementById('ai-modal-close-btn').addEventListener('click', () => {
    modal.remove();
  });

  // Attach Maximize Button (🗖)
  document.getElementById('ai-modal-maximize-btn').addEventListener('click', () => {
    modal.classList.toggle('maximized');
  });

  // Attach Tab Switchers
  const tabBtns = modal.querySelectorAll('.ai-modal-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeModalTab = btn.getAttribute('data-tab');
      showGeneratedMaterialsModal(data);
    });
  });
}

/**
 * Fetches and filters YouTube Video Transcript for selected timestamp range [startTime, endTime]
 */
async function extractTranscriptForRange(videoId, startSec, endSec) {
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          action: 'EXTRACT_TRANSCRIPT',
          videoId,
          startTime: startSec,
          endTime: endSec,
        },
        (res) => resolve(res)
      );
    });

    if (response && response.success && response.transcript) {
      return response.transcript;
    }

    throw new Error(response?.error || 'No automatic closed captions available for this video segment.');
  } catch (err) {
    console.warn('[Transcript Extractor Fallback]:', err.message);
    throw err;
  }
}

/**
 * Injects the Floating Action Bar into YouTube Video Page
 */
function injectFloatingActionBar() {
  if (document.getElementById('ai-study-bar-root')) return;
  if (!window.location.href.includes('youtube.com/watch')) return;

  const video = getYouTubeVideoElement();
  if (video && video.duration && !isNaN(video.duration)) {
    endTime = Math.min(180, Math.floor(video.duration));
  }

  const container = document.createElement('div');
  container.id = 'ai-study-bar-root';
  container.innerHTML = `
    <div class="ai-study-bar-card">
      <div class="ai-study-brand">
        <span class="ai-study-brand-dot"></span>
        <span>AI Study</span>
      </div>

      <div id="ai-study-time-badge" class="ai-study-time-badge">
        <span>${formatTime(startTime)}</span> <span class="arrow">➔</span> <span>${formatTime(endTime)}</span>
      </div>

      <button id="ai-study-mark-start-btn" class="ai-study-btn" title="Set Start Time at current video frame">
        ⏱️ Start
      </button>

      <button id="ai-study-mark-end-btn" class="ai-study-btn" title="Set End Time at current video frame">
        ⏱️ End
      </button>

      <button id="ai-study-extract-btn" class="ai-study-btn-primary" title="Extract transcript & generate AI Study Pack">
        ✨ Extract & Study
      </button>
    </div>
  `;

  document.body.appendChild(container);

  // Attach Mark Start Handler
  const startBtn = document.getElementById('ai-study-mark-start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const v = getYouTubeVideoElement();
      if (v) {
        startTime = Math.floor(v.currentTime);
        if (startTime >= endTime) endTime = startTime + 60;
        updateTimeBadgeUI();
        showToast(`Start time set to ${formatTime(startTime)}`);
      } else {
        showToast('Waiting for YouTube video player...', 'error');
      }
    });
  }

  // Attach Mark End Handler
  const endBtn = document.getElementById('ai-study-mark-end-btn');
  if (endBtn) {
    endBtn.addEventListener('click', () => {
      const v = getYouTubeVideoElement();
      if (v) {
        endTime = Math.floor(v.currentTime);
        if (endTime <= startTime) startTime = Math.max(0, endTime - 60);
        updateTimeBadgeUI();
        showToast(`End time set to ${formatTime(endTime)}`);
      } else {
        showToast('Waiting for YouTube video player...', 'error');
      }
    });
  }

  // Attach Extract & Study Handler
  const extractBtn = document.getElementById('ai-study-extract-btn');
  if (extractBtn) {
    extractBtn.addEventListener('click', async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const videoId = urlParams.get('v');

      if (!videoId) {
        showToast('Could not detect YouTube video ID from URL.', 'error');
        return;
      }

      showToast('Extracting transcript segment...');

      try {
        let transcriptText = '';
        try {
          transcriptText = await extractTranscriptForRange(videoId, startTime, endTime);
        } catch (err) {
          console.warn('Transcript extraction fallback to video title:', err.message);
        }

        const cleanTitle = document.title.replace('- YouTube', '').trim();
        const finalPayloadText = (transcriptText && transcriptText.length > 20)
          ? transcriptText
          : `Video Lecture Title: ${cleanTitle}. Please generate comprehensive study materials based on the core syllabus and concepts taught in ${cleanTitle}.`;

        showToast('Generating AI Study Pack with Gemini...');

        chrome.runtime.sendMessage(
          {
            action: 'GENERATE_MATERIALS',
            payload: {
              videoId,
              videoTitle: cleanTitle,
              startTime,
              endTime,
              transcript: finalPayloadText,
              requestTypes: ['notes', 'quiz', 'flashcards', 'mindmap'],
              difficulty: 'Medium',
            },
          },
          (res) => {
            if (res && res.success && res.data) {
              showToast('✨ Study Pack generated successfully!');
              showGeneratedMaterialsModal(res.data);
            } else {
              showToast(`Backend error: ${res?.error || 'Failed to generate materials.'}`, 'error');
            }
          }
        );
      } catch (err) {
        showToast(`Extraction notice: ${err.message}`, 'error');
      }
    });
  }
}

// Check every 1 second if on YouTube watch page & missing floating bar
setInterval(() => {
  if (window.location.href.includes('youtube.com/watch')) {
    injectFloatingActionBar();
  } else {
    const existing = document.getElementById('ai-study-bar-root');
    if (existing) existing.remove();
    const existingModal = document.getElementById('ai-study-modal-root');
    if (existingModal) existingModal.remove();
  }
}, 1000);

// Listen to YouTube SPA navigation events
window.addEventListener('yt-navigate-finish', () => {
  const existing = document.getElementById('ai-study-bar-root');
  if (existing) existing.remove();
  const existingModal = document.getElementById('ai-study-modal-root');
  if (existingModal) existingModal.remove();
  injectFloatingActionBar();
});

// Initial injection check
if (window.location.href.includes('youtube.com/watch')) {
  injectFloatingActionBar();
}
