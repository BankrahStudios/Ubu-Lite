import React, { useEffect, useState } from 'react';

const faqs: { q: string; a: string }[] = [
  {
    q: 'What is UBU Lite?',
    a: 'UBU Lite is a lightweight marketplace to discover, contact, and book African creative talent.',
  },
  {
    q: 'How do I book a creative?',
    a: 'Use search and categories to find a profile, then click Hire to start a booking request.',
  },
  {
    q: 'Do you take payments?',
    a: 'This demo integrates a Stripe flow for illustrative purposes only.',
  },
  {
    q: 'Is there a cost to join?',
    a: 'UBU Lite is a demo; pricing is not enforced here.',
  },
];

const FAQ: React.FC = () => {
  const [dark, setDark] = useState(false);

  // Apply the same CSS variable theme used on Home so this page isn't blank
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

  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="pill h-9 w-9 flex items-center justify-center bg-[var(--navy-800)] text-white font-bold">U</div>
            <span className="font-semibold text-lg tracking-tight"><span className="text-[var(--navy-800)]">UBU</span> Lite</span>
          </a>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <a className="hover:text-[var(--text)]" href="/">Home</a>
            <a className="hover:text-[var(--text)]" href="#top">Top</a>
            <a className="hover:text-[var(--text)]" href="/faq">FAQ</a>
            <button onClick={() => setDark((d)=>!d)} className="btn pill border border-[color:var(--border)] px-3 py-2">{dark ? 'Light' : 'Dark'}</button>
            <a className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2" href="#hire">Hire Talent</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
            <p className="mt-2 text-[var(--muted)]">Answers to common questions about using UBU Lite.</p>
            <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5">
              <h3 className="font-semibold">Need more help?</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Reach out via our contact form and we’ll get back to you.</p>
              <a href="#contact" className="btn pill mt-3 inline-block bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Contact</a>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] divide-y">
              {faqs.map((item, idx) => (
                <div key={idx}>
                  <button
                    className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-soft)]"
                    onClick={() => setOpen(open === idx ? null : idx)}
                    aria-expanded={open === idx}
                  >
                    <span className="font-medium">{item.q}</span>
                    <span className="pill h-6 w-6 flex items-center justify-center border border-[color:var(--border)]">
                      {open === idx ? '–' : '+'}
                    </span>
                  </button>
                  {open === idx && (
                    <div className="px-5 pb-5 text-[var(--muted)]">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/" className="btn pill border border-[color:var(--border)] px-4 py-2">Back to Home</a>
              <a href="/" className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Explore Talent</a>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 border-t border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} UBU Lite • Ubuntu Graphix
        </div>
      </footer>
    </div>
  );
};

export default FAQ;
