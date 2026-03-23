// Vercel Serverless Function — ping les 4 backends Render toutes les 10 min
export default async function handler(req, res) {
  const backends = [
    'https://eyetech-percemur.onrender.com/health/',
    'https://eyetech-buildingscan.onrender.com/health/',
    'https://eyetech-tradelayer.onrender.com/health/',
    'https://eyetech-constructoptimize.onrender.com/health/',
  ]

  const results = await Promise.allSettled(
    backends.map(url =>
      fetch(url, { signal: AbortSignal.timeout(10000) })
        .then(r => ({ url, status: r.status, ok: r.ok }))
        .catch(err => ({ url, error: err.message }))
    )
  )

  const summary = results.map(r => r.value || r.reason)
  res.json({ pinged: backends.length, results: summary, ts: new Date().toISOString() })
}
