import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';

/**
 * UBU Lite - React + Tailwind CSS + Framer Motion (CRA)
 */

const NAV_LINKS = [
  { label: 'How it works', href: '#how' },
  { label: 'Categories', href: '#categories' },
  { label: 'Top talent', href: '#talent' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Studio', href: '/studio' },
  { label: 'Wallet', href: '/wallet' },
  { label: 'Escrows', href: '/escrows' },
  { label: 'Log in', href: '/app-login' },
  { label: 'Sign up', href: '/app-register', primary: true },
];

const CATEGORIES = [
  'Graphic Design',
  'Web Development',
  'Photography',
  'Video Editing',
  'Brand Strategy',
  'Illustration',
];

type Creative = {
  id: number;
  name: string;
  title: string;
  city: string;
  rate: number;
  categories: string[];
  profileId?: number;
};

const CREATIVES: Creative[] = [
  { id: 1, name: 'Amina K.', title: 'Brand Designer', city: 'Nairobi', rate: 45, categories: ['Graphic Design', 'Brand Strategy'] },
  { id: 2, name: 'Kwesi B.', title: 'Full-Stack Developer', city: 'Accra', rate: 60, categories: ['Web Development'] },
  { id: 3, name: 'Lebo M.', title: 'Portrait Photographer', city: 'Johannesburg', rate: 40, categories: ['Photography'] },
  { id: 4, name: 'Zuri T.', title: 'Motion & Video Editor', city: 'Lagos', rate: 55, categories: ['Video Editing'] },
  { id: 5, name: 'Maya R.', title: 'Illustrator', city: 'Kigali', rate: 38, categories: ['Illustration', 'Graphic Design'] },
  { id: 6, name: 'Tariq H.', title: 'UI Engineer', city: 'Cairo', rate: 65, categories: ['Web Development', 'Brand Strategy'] },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
};

const Home: React.FC = () => {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [remoteCreatives, setRemoteCreatives] = useState<any[] | null>(null);
  const featuredProfileId = useMemo(() => {
    try {
      return Array.isArray(remoteCreatives) && remoteCreatives.length
        ? (remoteCreatives[0]?.id as number)
        : 1;
    } catch {
      return 1;
    }
  }, [remoteCreatives]);

  useEffect(() => {
    api
      .listCreatives()
      .then((data: any) => setRemoteCreatives(data.results || data))
      .catch(() => setRemoteCreatives(null));
  }, []);

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

  const filteredCreatives = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    const cat = category.trim().toLowerCase();
    const source = remoteCreatives
      ? (remoteCreatives as any[]).map((r: any) => ({
          id: r.id,
          name: r.user?.username || 'Creative',
          title: r.skills || 'Creative',
          city: r.city || '',
          rate: r.hourly_rate || 0,
          categories: [] as string[],
          profileId: r.id,
        }))
      : CREATIVES;
    return (source as any[]).filter((c: any) => {
      const matchesQuery =
        !q || c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
      const matchesLocation = !loc || c.city.toLowerCase().includes(loc);
      const matchesCategory = !cat || (c.categories && c.categories.some((x: string) => x.toLowerCase() === cat));
      return matchesQuery && matchesLocation && matchesCategory;
    });
  }, [query, location, category, remoteCreatives]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-white">
      <style>{`
        * { outline-offset: 2px; }
        .btn { transition: transform .1s ease, background-color .2s ease, color .2s ease, box-shadow .2s ease; }
        .btn:active { transform: translateY(1px) scale(0.99); }
        .card { box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05); }
        .card-dark { box-shadow: 0 1px 2px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.2); }
        .pill { border-radius: 9999px; }
      `}</style>

      {/* Navbar */}
      <motion.header initial="hidden" animate="visible" variants={fadeUp} className="sticky top-0 z-30 bg-[var(--bg)]/80 backdrop-blur border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <a href="#" className="flex items-center gap-3">
              <div className="pill h-9 w-9 flex items-center justify-center bg-[var(--navy-800)] text-white font-bold">U</div>
              <span className="font-semibold text-lg tracking-tight"><span className="text-[var(--navy-800)]">UBU</span> Lite</span>
            </a>
            <nav className="hidden md:flex items-center gap-1 text-[var(--muted)]">
              {NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href} className={l.primary ? 'ml-2 btn pill px-4 py-2 text-sm font-medium bg-[var(--orange-600)] text-white hover:bg-[var(--orange-700)] shadow-sm' : 'px-3 py-2 text-sm hover:text-[var(--navy-800)]'}>
                  {l.label}
                </a>
              ))}
              <button onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode" className="ml-3 btn pill px-3 py-2 text-sm border border-[color:var(--border)] hover:bg-[var(--chip)]">
                {dark ? 'Light' : 'Dark'}
              </button>
            </nav>
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode" className="btn pill px-3 py-2 text-sm border border-[color:var(--border)] hover:bg-[var(--chip)]">{dark ? 'Light' : 'Dark'}</button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-12 sm:pb-16">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <div className="flex flex-col justify-center">
              <motion.h1 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                Book trusted creatives -
                <br /> locally or remotely
              </motion.h1>
              <motion.p custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-4 text-[var(--muted)] text-lg max-w-xl">
                Discover photographers, designers, developers and other makers. Browse portfolios, chat, and book with a simple, secure flow.
              </motion.p>

              <motion.div custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
                <a href="#talent" className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-5 py-3 font-semibold shadow-sm">Open App</a>
              </motion.div>

              <div className={`mt-7 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 card ${dark ? 'card-dark' : ''}`}>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-lg bg-[var(--orange-500)]/10 text-[var(--orange-600)] flex items-center justify-center border border-[color:var(--border)]">✓</span>
                    <div>
                      <div className="font-semibold">Profiles & portfolios</div>
                      <div className="text-sm text-[var(--muted)]">Rich, visual profiles for creatives.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-lg bg-[var(--orange-600)]/10 text-[var(--orange-600)] flex items-center justify-center border border-[color:var(--border)]">⚡</span>
                    <div>
                      <div className="font-semibold">Instant booking</div>
                      <div className="text-sm text-[var(--muted)]">Schedule and confirm in a few clicks.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-lg bg-[var(--navy-700)]/10 text-[var(--navy-700)] flex items-center justify-center border border-[color:var(--border)]">🔒</span>
                    <div>
                      <div className="font-semibold">Secure payments</div>
                      <div className="text-sm text-[var(--muted)]">Stripe integration for safe transactions (demo).</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <motion.aside initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className={`rounded-3xl border border-[color:var(--border)] bg-[var(--card)] p-5 card ${dark ? 'card-dark' : ''}`}>
              <div className="font-semibold">Featured creative</div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[color:var(--border)]">
                <div className="aspect-[16/9] w-full relative bg-[var(--bg-soft)]">
                  <img
                    src="/static/img/featured-creative.png"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      if (!el.dataset.fallback) {
                        el.dataset.fallback = '1';
                        el.src = '/featured-creative.png';
                      } else {
                        el.style.display = 'none';
                        const parent = el.parentElement;
                        if (parent) parent.classList.add('bg-gradient-to-br','from-[var(--orange-500)]/20','to-[var(--orange-600)]/20');
                      }
                    }}
                    alt="Featured creative"
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ background: 'transparent' }}
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="font-semibold">Shay Chenette</div>
                <div className="text-sm text-[var(--muted)]">Painter - Nashville</div>
              </div>
              <div className="mt-3">
                <a href={`/creatives/${featuredProfileId}`} className="btn pill px-5 py-2 bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white font-semibold">View</a>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl font-semibold">Popular Categories</motion.h2>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((c, i) => (
              <motion.button key={c} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -2, scale: 1.02 }} className="btn pill px-4 py-3 text-sm font-medium text-left bg-[var(--chip)] hover:bg-[var(--bg-soft)] border border-[color:var(--border)] text-[var(--navy-800)]" onClick={() => setCategory(c)}>
                {c}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Top Talent */}
      <section id="talent" className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl font-semibold">Top Talent</motion.h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCreatives.map((c, i) => (
              <motion.div key={(c as any).id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4 }} className={`rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 card ${dark ? 'card-dark' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-[var(--navy-700)]/10 border border-[color:var(--border)]" />
                    <div>
                      <h3 className="text-lg font-semibold">{(c as any).name}</h3>
                      <p className="text-[var(--muted)]">{(c as any).title}</p>
                    </div>
                  </div>
                  <span className="pill px-3 py-1 bg-[var(--orange-500)]/10 text-sm border border-[color:var(--border)] text-[var(--orange-700)]">${(c as any).rate}/hr</span>
                </div>
                <div className="mt-3 text-sm text-[var(--muted)]">{(c as any).city || ''}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(((c as any).categories || []) as string[]).map((cat: string) => (
                    <span key={cat} className="pill px-3 py-1 bg-[var(--bg-soft)] text-sm border border-[color:var(--border)]">{cat}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <a className="btn pill px-4 py-2 border border-[color:var(--border)] hover:bg-[var(--chip)]" href={`/creatives/${(c as any).profileId || (c as any).id}`}>View profile</a>
                  <a className="btn pill px-4 py-2 bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white" href="/book">Hire</a>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredCreatives.length === 0 && (
            <div className="mt-6 text-[var(--muted)]">No matches. Try a different search.</div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl font-semibold">How It Works</motion.h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: 1, t: 'Search & discover', d: 'Find creatives by skill, city, or category.' },
              { n: 2, t: 'Review profiles', d: 'Browse portfolios, rates, and past work.' },
              { n: 3, t: 'Book securely', d: 'Send requests and confirm availability.' },
              { n: 4, t: 'Collaborate & deliver', d: 'Chat, share files, and wrap on time.' },
            ].map((s, i) => (
              <motion.div key={s.n} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -2 }} className={`rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 card ${dark ? 'card-dark' : ''}`}>
                <div className="pill h-9 w-9 flex items-center justify-center bg-[var(--navy-800)] text-white font-semibold">{s.n}</div>
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-1 text-[var(--muted)] text-sm">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="rounded-3xl p-8 text-center bg-gradient-to-r from-[var(--orange-600)] via-[var(--orange-500)] to-[var(--orange-700)] text-white">
            <h3 className="text-2xl font-semibold">Ready to book - or get booked?</h3>
            <p className="mt-1 text-white/90">Join UBU Lite and start your next great project today.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a href="#signup" className="btn pill bg-white text-[var(--navy-900)] px-5 py-2 font-semibold">Get Started</a>
              <a href="#talent" className="btn pill border border-white/30 px-5 py-2 font-semibold">Browse Talent</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 flex items-center justify-between gap-4">
            <div className="text-[var(--muted)]">Have questions? Read our Frequently Asked Questions.</div>
            <a href="/faq" className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Open FAQ</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-[var(--muted)]">(c) {new Date().getFullYear()} UBU Lite - Ubuntu Graphix</div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/terms" className="hover:text-[var(--navy-800)]">Terms</a>
            <span className="text-[var(--muted)]">|</span>
            <a href="#privacy" className="hover:text-[var(--navy-800)]">Privacy</a>
            <span className="text-[var(--muted)]">|</span>
            <a href="#contact" className="hover:text-[var(--navy-800)]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
