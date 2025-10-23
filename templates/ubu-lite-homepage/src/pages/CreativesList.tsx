import React, { useEffect, useState } from 'react';
import { api } from '../api';

type Creative = {
  id: number;
  user: { id: number; username: string };
  city?: string; region?: string;
  hourly_rate?: number;
  services?: { id: number; title: string; price: number }[];
};

const CreativesList: React.FC = () => {
  const [items, setItems] = useState<Creative[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const data = await api.listCreatives();
      setItems(data.results || data);
    })();
  }, []);

  const filtered = items.filter(c => {
    const s = `${c.user.username} ${c.city||''} ${c.region||''}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

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
        <div className="flex items-center gap-3">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or location" className="flex-1 pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2" />
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => (
            <a key={c.id} href={`/creatives/${c.id}`} className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 block">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{c.user.username}</div>
                  <div className="text-sm text-[var(--muted)]">{c.city || '—'} {c.region ? `• ${c.region}`: ''}</div>
                </div>
                {c.hourly_rate && (
                  <span className="pill px-3 py-1 bg-[var(--orange-500)]/10 border border-[color:var(--border)] text-sm text-[var(--orange-700)]">${c.hourly_rate}/hr</span>
                )}
              </div>
              {c.services && c.services.length>0 && (
                <div className="mt-3 text-sm">
                  <div className="text-[var(--muted)]">Popular services</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {c.services.slice(0,3).map(s => (
                      <span key={s.id} className="pill px-3 py-1 border border-[color:var(--border)] bg-[var(--bg-soft)]">{s.title}</span>
                    ))}
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CreativesList;

