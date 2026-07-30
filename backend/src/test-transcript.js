import fetch from 'node-fetch';

async function testFetchRawBaseUrl(videoId) {
  try {
    const watchPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageResponse = await fetch(watchPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const pageText = await pageResponse.text();

    const playerResponseMatch = pageText.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (playerResponseMatch && playerResponseMatch[1]) {
      const playerResponse = JSON.parse(playerResponseMatch[1]);
      const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      if (captionTracks.length > 0) {
        const rawUrl = captionTracks[0].baseUrl;
        console.log('Fetching rawUrl:', rawUrl);
        const res = await fetch(rawUrl);
        const text = await res.text();
        console.log('Response Length:', text.length);
        console.log('Raw Output (first 500 chars):\n', text.substring(0, 500));
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testFetchRawBaseUrl('BSVKUk58K6U');
