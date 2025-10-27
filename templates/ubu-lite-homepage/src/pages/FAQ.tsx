import React, { useEffect, useMemo, useState } from 'react';

type FAQItem = {
  id: string;
  q: string;
  a: string;
  cat: 'Getting started' | 'Booking' | 'Payments' | 'Accounts' | 'Platform';
};

const FAQS: FAQItem[] = [
  { id: 'what-is-ubu', cat: 'Getting started', q: 'What is UBU Lite?', a: 'UBU Lite is a lightweight marketplace to discover, contact, and book creative talent. This demo focuses on the booking flow and profile browsing.' },
  { id: 'how-to-book', cat: 'Booking', q: 'How do I book a creative?', a: 'Browse or search, open a profile, and click Hire to send a booking request. You can propose times, describe your project, and confirm together in the app.' },
  { id: 'pricing', cat: 'Getting started', q: 'Is there a cost to join?', a: 'No. This is a demo environment used for showcasing UX flows only.' },
  { id: 'payments', cat: 'Payments', q: 'Do you take payments?', a: 'The demo integrates a Stripe test flow for illustration. Use Stripe test cards only; no real charges are created.' },
  { id: 'escrow', cat: 'Payments', q: 'How does escrow work?', a: 'When you confirm a booking, funds move into a simulated escrow. Upon completion, the creator can request release. In this demo, it is a simplified representation.' },
  { id: 'accounts', cat: 'Accounts', q: 'Can I sign in with Google?', a: 'Yes. If GOOGLE_CLIENT_ID is set in the backend, the login and register views show Google Sign-In (demo only).' },
  { id: 'support', cat: 'Platform', q: 'How do I contact support?', a: 'Use the Contact page from the navigation or email the demo address listed there. In this sandbox, messages are not actively monitored.' },
];

const FAQ: React.FC = () => {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [open, setOpen] = useState<Set<string>>(new Set());

  // Apply the same CSS variable theme used on Home
  useEffect(() => {
    const root = document.documentElement;
    const light: Record<string, string> = {
      '--bg': '#ffffff',
      '--bg-soft': '#f8fafc',
      '--text': '#0b1220',
      '--muted': '#4b5563',
      '--card': '#ffffff',
      '--border': 'rgba(0,0,0,0.08)',
      '--chip': '#eef2f7',
      '--navy-900': '#002347',
      '--navy-800': '#003366',
      '--navy-700': '#003F7D',
      '--orange-500': '#FF8E00',
      '--orange-600': '#FD7702',
      '--orange-700': '#FF5003',
      '--accent': '#FF8E00',
      '--accent-strong': '#FD7702',
      '--accent-deep': '#FF5003',
    };
    const darkTheme: Record<string, string> = {
      '--bg': '#0b1220',
      '--bg-soft': '#101827',
      '--text': '#e6edf6',
      '--muted': '#a7b1c2',
      '--card': '#0f172a',
      '--border': 'rgba(255,255,255,0.12)',
      '--chip': '#172036',
      '--navy-900': '#002347',
      '--navy-800': '#003366',
      '--navy-700': '#003F7D',
      '--orange-500': '#FF8E00',
      '--orange-600': '#FD7702',
      '--orange-700': '#FF5003',
      '--accent': '#FF8E00',
      '--accent-strong': '#FD7702',
      '--accent-deep': '#FF5003',
    };
    const theme = dark ? darkTheme : light;
    Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [dark]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(FAQS.map(f => f.cat)))], []);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter(f => (category === 'All' || f.cat === category) && (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)));
  }, [query, category]);

  function toggle(id: string) {
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function expandAll() { setOpen(new Set(results.map(r => r.id))); }
  function collapseAll() { setOpen(new Set()); }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/react-app/" className="flex items-center gap-3">
            <div className="pill h-9 w-9 flex items-center justify-center bg-[var(--navy-800)] text-white font-bold">U</div>
            <span className="font-semibold text-lg tracking-tight"><span className="text-[var(--navy-800)]">UBU</span> Lite</span>
          </a>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <a className="hover:text-[var(--text)]" href="/react-app/">Home</a>
            <a className="hover:text-[var(--text)]" href="#top">Top</a>
            <a className="hover:text-[var(--text)]" href="/faq">FAQ</a>
            <button onClick={() => setDark((d)=>!d)} className="btn pill border border-[color:var(--border)] px-3 py-2">{dark ? 'Light' : 'Dark'}</button>
            <a className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2" href="/creatives">Hire Talent</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
            <p className="mt-2 text-[var(--muted)]">Answers to common questions about using UBU Lite.</p>

            <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5">
              <label className="block text-sm font-medium" htmlFor="faq-search">Search</label>
              <input id="faq-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search FAQs" className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[var(--bg)] px-3 py-2" />
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c} onClick={()=>setCategory(c)} className={`btn pill px-3 py-1 border border-[color:var(--border)] ${category===c? 'bg-[var(--orange-600)] text-white' : 'bg-[var(--card)]'}`}>{c}</button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={expandAll} className="btn pill px-3 py-1 border border-[color:var(--border)]">Expand all</button>
                <button onClick={collapseAll} className="btn pill px-3 py-1 border border-[color:var(--border)]">Collapse all</button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5">
              <h3 className="font-semibold">Need more help?</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Reach out via our contact form and we will get back to you.</p>
              <a href="/contact" className="btn pill mt-3 inline-block bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Contact</a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] divide-y">
              {results.map((item) => (
                <div key={item.id} id={`q-${item.id}`}>
                  <div className="flex items-stretch">
                    <button
                      className="flex-1 text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-soft)]"
                      onClick={() => toggle(item.id)}
                      aria-expanded={open.has(item.id)}
                    >
                      <span className="font-medium">{item.q}</span>
                      <span className="pill h-6 w-6 flex items-center justify-center border border-[color:var(--border)]">{open.has(item.id) ? '-' : '+'}</span>
                    </button>
                    <button
                      className="px-3 text-sm text-[var(--muted)] hover:text-[var(--text)]"
                      title="Copy link"
                      onClick={() => {
                        const url = `${window.location.origin}/faq#q-${item.id}`;
                        if (navigator.clipboard) { navigator.clipboard.writeText(url).catch(()=>{}); }
                        window.location.hash = `q-${item.id}`;
                      }}
                    >#</button>
                  </div>
                  {open.has(item.id) && (
                    <div className="px-5 pb-5 text-[var(--muted)]">
                      <div className="text-xs uppercase tracking-wide mb-2">{item.cat}</div>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/react-app/" className="btn pill border border-[color:var(--border)] px-4 py-2">Back to Home</a>
              <a href="/creatives" className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Explore Talent</a>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 border-t border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} UBU Lite — Ubuntu Graphix
        </div>
      </footer>
    </div>
  );
};

export default FAQ;
