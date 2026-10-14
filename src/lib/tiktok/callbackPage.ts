const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

export function callbackPage(ok: boolean, message: string): string {
  const payload = JSON.stringify({ ok, message, at: Date.now() })
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TikTok</title></head>
<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#0b0b12;color:#fff;text-align:center">
<div><p style="font-size:18px;font-weight:600">${escapeHtml(message)}</p><p style="opacity:.7">You can close this window and return to Jariyah Now.</p>
<p><a href="/app" style="color:#fbbf24">Back to Jariyah Now</a></p></div>
<script>try{localStorage.setItem('tiktok-auth',${JSON.stringify(payload)})}catch(e){}setTimeout(function(){window.close()},600)</script>
</body></html>`
}
