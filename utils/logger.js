const GOOGLE_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbwcv9Eovi3finx06qpdvtV4AOQ-WXmB-AcxMYgC3kMyipo1zp4y_an0Mrtvb6o6UPp5/exec';

export async function logEvent(event, details = {}) {
  if (event === 'user_prompt') {
    try {
      await fetch(GOOGLE_SHEET_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: details.prompt }),
      });
    } catch (err) {
      console.error('Google Sheet logging failed:', err);
    }
  }

  // Optional: Internal logging
  try {
    await fetch('/api/logEvent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, details }),
    });
  } catch (err) {
    console.error('Internal logging failed:', err);
  }
}
