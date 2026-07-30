// Background Service Worker for AI Study Assistant (Manifest V3)
console.log('[AI Study Assistant] Background Service Worker running.');

const BACKEND_URL = 'http://localhost:5000/api';

/**
 * Message routing dispatcher
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_TRANSCRIPT') {
    handleExtractTranscript(request)
      .then((data) => sendResponse({ success: true, transcript: data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (request.action === 'GENERATE_MATERIALS') {
    handleSendToBackend(request.payload)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

/**
 * Fetches YouTube timedtext caption track & filters text within [startTime, endTime]
 */
async function handleExtractTranscript({ videoId, startTime = 0, endTime = 99999 }) {
  try {
    console.log(`[Background] Extracting transcript for ${videoId} [${startTime}s - ${endTime}s]...`);

    // 1. Fetch YouTube video watch page
    const watchPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageResponse = await fetch(watchPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const pageText = await pageResponse.text();

    // 2. Parse ytInitialPlayerResponse JSON
    const playerResponseMatch = pageText.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    let captionTracks = [];

    if (playerResponseMatch && playerResponseMatch[1]) {
      try {
        const playerResponse = JSON.parse(playerResponseMatch[1]);
        captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      } catch (e) {
        console.warn('Failed to parse ytInitialPlayerResponse JSON');
      }
    }

    let captionUrl = '';
    if (captionTracks.length > 0) {
      const enTrack = captionTracks.find(
        (t) => t.languageCode === 'en' || t.vssId?.includes('.en') || t.vssId?.includes('en')
      );
      captionUrl = enTrack ? enTrack.baseUrl : captionTracks[0].baseUrl;
    } else {
      captionUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`;
    }

    // 3. Fetch caption XML with proper YouTube headers
    const captionResponse = await fetch(captionUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': `https://www.youtube.com/watch?v=${videoId}`,
      },
    });
    const captionXml = await captionResponse.text();

    if (!captionXml || captionXml.trim().length === 0) {
      throw new Error('No closed captions available for this video.');
    }

    // 4. Parse XML text elements <text start="12.34" dur="4.5">Text snippet</text>
    const parserRegex = /<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?>([\s\S]*?)<\/text>/gi;
    let match;
    const segments = [];

    while ((match = parserRegex.exec(captionXml)) !== null) {
      const start = parseFloat(match[1]);
      const rawText = match[3]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\n/g, ' ')
        .trim();

      if (start >= startTime && start <= endTime) {
        segments.push(rawText);
      }
    }

    const filteredTranscript = segments.join(' ').replace(/\s+/g, ' ');

    if (!filteredTranscript || filteredTranscript.trim().length === 0) {
      // Fallback: Return full extracted text if range is out of bounds
      const fullFallback = captionXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 4000);
      if (fullFallback.length > 50) return fullFallback;

      throw new Error(`No transcript lines found in range [${startTime}s - ${endTime}s].`);
    }

    return filteredTranscript;
  } catch (error) {
    console.error('[Background Extractor Error]:', error);
    throw error;
  }
}

/**
 * Sends extracted transcript and user preferences to Node.js backend
 */
async function handleSendToBackend(payload) {
  try {
    const response = await fetch(`${BACKEND_URL}/generate/study-material`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Backend generation failed');
    }

    return data.data;
  } catch (error) {
    console.error('[Background Backend Fetch Error]:', error);
    throw error;
  }
}
