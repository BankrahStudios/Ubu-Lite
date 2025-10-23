import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Toast from '../components/Toast';

type Params = { id: string };

const CreativeProfile: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [svcId, setSvcId] = useState<string>('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [booked, setBooked] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time';

  useEffect(() => {
    const id = window.location.pathname.split('/').filter(Boolean).pop();
    if (!id) return;
    api.getCreative(id).then(setData).catch((e)=>setError(e.message));
    setToken(localStorage.getItem('ubu_auth_token'));
  }, []);

  async function createBooking(e: React.FormEvent) {
    e.preventDefault();
    setBooked(null); setError(null);
    if (!token) { setError('Please log in first.'); return; }
    if (!svcId || !date) { setError('Choose a service and date/time.'); return; }
    try {
      const payload = { service: Number(svcId), date: new Date(date).toISOString(), duration_minutes: duration, notes };
      const res = await api.createBooking(payload, token);
      setBooked(res);
      setMessage('Booking request sent. Pending approval.');
      setTimeout(()=>setMessage(null), 4000);
    } catch (err:any) {
      setError(err?.message || 'Booking failed');
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="pill h-9 w-9 flex items-center justify-center bg-[var(--navy-800)] text-white font-bold">U</div>
            <span className="font-semibold text-lg tracking-tight">UBU Lite</span>
          </a>
          <nav className="text-sm flex items-center gap-3">
            <a href="/book" className="hover:text-[var(--text)]">Book</a>
            <a href="/studio" className="hover:text-[var(--text)]">Studio</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {error && <div className="text-[var(--muted)]">{error}</div>}
        {!data && !error && <div className="text-[var(--muted)]">Loading…</div>}
        {data && (
          <>
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                {data.avatar && /\.(png|jpe?g|gif|webp)$/i.test(data.avatar) ? (
                  <img src={data.avatar} alt="avatar" className="h-16 w-16 rounded-full border border-[color:var(--border)] object-cover" />
                ) : <div className="h-16 w-16 rounded-full border border-[color:var(--border)] bg-[var(--bg-soft)]" />}
                <div>
                  <h1 className="text-2xl font-semibold">{data.user?.username}</h1>
                  <div className="text-[var(--muted)]">{data.city || '—'} {data.region ? `• ${data.region}`: ''}</div>
                  {data.hourly_rate && <div className="mt-2 pill inline-block px-3 py-1 bg-[var(--orange-500)]/10 border border-[color:var(--border)] text-[var(--orange-700)]">${data.hourly_rate}/hr</div>}
                </div>
              </div>
              <a href="#book" className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-5 py-2">Book a call</a>
            </div>

            {data.bio && (
              <p className="mt-3 text-[var(--muted)] max-w-3xl">{data.bio}</p>
            )}
            {data.skills && (
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {String(data.skills).split(',').map((s:string,i:number)=> (
                  <span key={i} className="pill px-3 py-1 border border-[color:var(--border)] bg-[var(--bg-soft)]">{s.trim()}</span>
                ))}
              </div>
            )}

            <section className="mt-8">
              <h2 className="font-semibold">Portfolio</h2>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {(data.portfolio_items||[]).map((it: any) => (
                  <div key={it.id} className="rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-3">
                    <div className="font-medium text-sm">{it.title}</div>
                    <div className="text-xs text-[var(--muted)]">{it.media_type}</div>
                    {it.file && /\.(png|jpe?g|gif|webp)$/i.test(it.file) ? (
                      <img src={it.file} alt={it.title} className="mt-2 w-full h-28 object-cover rounded-lg border border-[color:var(--border)]" />
                    ) : it.external_url && /(youtube\.com|youtu\.be|vimeo\.com)/i.test(it.external_url) ? (
                      <div className="mt-2 aspect-video w-full rounded-lg overflow-hidden border border-[color:var(--border)]">
                        <iframe src={it.external_url} title={it.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    ) : it.file ? (
                      <a href={it.file} target="_blank" className="text-xs text-[var(--navy-800)] underline">Open</a>
                    ) : null}
                    {it.external_url && <a href={it.external_url} target="_blank" className="ml-2 text-xs text-[var(--navy-800)] underline">Link</a>}
                  </div>
                ))}
                {(!data.portfolio_items || data.portfolio_items.length===0) && (
                  <div className="text-[var(--muted)]">No portfolio items yet.</div>
                )}
              </div>
            </section>

            {data.services && data.services.length>0 && (
              <section className="mt-8">
                <h2 className="font-semibold">Services</h2>
                <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {data.services.map((s: any)=> (
                        <div key={s.id} className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-4">
                          <div className="font-medium">{s.title}</div>
                          <div className="text-sm text-[var(--muted)]">${s.price}{s.category_name ? ` • ${s.category_name}` : ''}</div>
                          <div className="mt-3 flex gap-2">
                            <a href={`/book?service=${s.id}`} className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-3 py-1 text-sm">Hire</a>
                            <a href="#book" onClick={()=>setSvcId(String(s.id))} className="btn pill border border-[color:var(--border)] px-3 py-1 text-sm">Prefill below</a>
                          </div>
                        </div>
                      ))}
                </div>
              </section>
            )}

            {/* Inline booking form */}
            {data.services && data.services.length>0 && (
              <section id="book" className="mt-8">
                <h2 className="font-semibold">Book a call with {data.user?.username}</h2>
                {message && <Toast message={message} onClose={()=>setMessage(null)} variant="success" />}
                {error && !message && <Toast message={error} onClose={()=>setError(null)} variant="error" />}
                <form onSubmit={createBooking} className="mt-3 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <select value={svcId} onChange={e=>setSvcId(e.target.value)} className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2">
                      <option value="">Select a service…</option>
                      {data.services.map((s:any)=> <option key={s.id} value={s.id}>{s.title} — ${s.price}</option>)}
                    </select>
                    <div>
                      <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                      <div className="mt-1 text-xs text-[var(--muted)]">Time is in {tz}. We store in UTC.</div>
                    </div>
                    <input type="number" min={15} step={15} value={duration} onChange={e=>setDuration(Number(e.target.value))} className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                    <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optional)" className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                  </div>
                  <button className="mt-4 btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-5 py-2">Request booking</button>
                  {error && <div className="mt-3 text-[var(--muted)]">{error}</div>}
                  {booked && <div className="mt-3 text-sm">Booking requested. Status: <b>{booked.status}</b></div>}
                </form>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CreativeProfile;
