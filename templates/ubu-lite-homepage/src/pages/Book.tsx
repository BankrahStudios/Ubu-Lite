import React, { useEffect, useState } from 'react';
import Toast from '../components/Toast';
import { api } from '../api';

const Book: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time';
  const [ready, setReady] = useState(false);
  const [acceptsFees, setAcceptsFees] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('ubu_auth_token'));
    const params = new URLSearchParams(window.location.search);
    const s = params.get('service');
    if (s) setServiceId(s);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setResult(null);
    if (!token) { setError('Please log in first.'); return; }
    if (!serviceId || !date) { setError('Service and date are required.'); return; }
    if (!ready || !acceptsFees) { setError('Please confirm readiness and the 33% fee / 67% escrow terms.'); return; }
    try {
      const payload = { service: Number(serviceId), date: new Date(date).toISOString(), duration_minutes: duration, notes, ready: true, accepts_fees: true };
      const res = await api.createBooking(payload, token);
      setResult(res);
      setMessage('Booking request sent. We\'ll notify the creative.');
      setTimeout(()=>setMessage(null), 4000);
    } catch (err: any) {
      let msg = err?.message || 'Booking failed';
      try { const j = JSON.parse(msg); msg = j.detail || msg; } catch {}
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/react-app/" className="flex items-center gap-3">
            <div className="pill h-9 w-9 flex items-center justify-center bg-[var(--navy-800)] text-white font-bold">U</div>
            <span className="font-semibold text-lg tracking-tight"><span className="text-[var(--navy-800)]">UBU</span> Lite</span>
          </a>
          <nav className="text-sm flex items-center gap-3">
            <a className="hover:text-[var(--text)]" href="/creatives">Creatives</a>
            <a className="hover:text-[var(--text)]" href="/faq">FAQ</a>
          </nav>
        </div>
      </header>

      {/* Hero with brand gradient */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--orange-500), var(--orange-700))' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 text-white">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Book a Call</h1>
          <p className="mt-2 opacity-90 max-w-2xl">Create a booking request with your chosen creative. We use your brand palette and keep things clear and simple.</p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm">
            <span className="pill px-3 py-1 bg-white/15 border border-white/20 rounded-full">Secure escrow</span>
            <span className="pill px-3 py-1 bg-white/15 border border-white/20 rounded-full">33% platform fee</span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        {!token && (
          <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5">
            <div className="font-medium">Sign in required</div>
            <div className="text-sm text-[var(--muted)]">Please log in to create a booking.</div>
            <div className="mt-3 flex gap-2">
              <a href="/login/" className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Log in</a>
              <a href="/register/" className="btn pill border border-[color:var(--border)] px-4 py-2">Register</a>
            </div>
          </div>
        )}
        {message && <Toast message={message} onClose={()=>setMessage(null)} variant="success" />}
        {error && !message && <Toast message={error} onClose={()=>setError(null)} variant="error" />}
        <form onSubmit={submit} className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Service ID</label>
              <input value={serviceId} onChange={e=>setServiceId(e.target.value)} placeholder="e.g., 1" className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Date & time</label>
              <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2" />
              <div className="mt-1 text-xs text-[var(--muted)]">Time is in {tz}. We store in UTC.</div>
            </div>
            <div>
              <label className="block text-sm mb-1">Duration (minutes)</label>
              <input type="number" min={15} step={15} value={duration} onChange={e=>setDuration(Number(e.target.value))} className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Notes (optional)</label>
              <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Brief project context" className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2" />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[var(--bg-soft)] p-4">
            <div className="font-medium">Confirm before sending</div>
            <div className="mt-2 space-y-2 text-sm">
              <label className="flex gap-2 items-start"><input type="checkbox" checked={ready} onChange={e=>setReady(e.target.checked)} /> We are both ready to proceed and available for the proposed time.</label>
              <label className="flex gap-2 items-start"><input type="checkbox" checked={acceptsFees} onChange={e=>setAcceptsFees(e.target.checked)} /> I acknowledge a <b>33%</b> platform fee is deducted; the remaining <b>67%</b> is escrowed and released to the creative after completion.</label>
            </div>
          </div>

          <button className="mt-4 btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-5 py-2">Create Booking</button>
          {error && <div className="mt-3 text-[var(--muted)]">{error}</div>}
          {result && (
            <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[var(--bg-soft)] p-4">
              <div className="font-medium">Booking created</div>
              <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default Book;
