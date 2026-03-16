const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function fetchFloodAlert(payload) {
  const res = await fetch(`${API}/predict/alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return res.json()
}
