import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type Office = {
  name: string;
  address: string[];
  lat?: number;
  lng?: number;
};

const OFFICES: Office[] = [
  { name: 'Global HQ', address: ['12 Spintex Road', 'Accra, Ghana'], lat: 5.629, lng: -0.145 },
  { name: 'Nairobi Studio', address: ['Ngong Road, Kilimani', 'Nairobi, Kenya'], lat: -1.292, lng: 36.8219 },
  { name: 'Cape Town Node', address: ['Loop Street, City Centre', 'Cape Town, South Africa'], lat: -33.9249, lng: 18.4241 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' } }),
};

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('support');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | 'ok' | 'err'>(null);

  // Try common public filenames before falling back to static placeholder.
  const [heroSrc, setHeroSrc] = useState<string>('/CONTACT US SLIDES0236.png');

  const disabled = useMemo(
    () => !name || !email || message.trim().length < 10 || sending,
    [name, email, message, sending]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    try {
      setSending(true);
      await fetch('/api/ping', {
        method: 'POST',
        body: JSON.stringify({ name, email, topic, message }),
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});
      setSent('ok');
      setName('');
      setEmail('');
      setTopic('support');
      setMessage('');
    } catch {
      setSent('err');
    } finally {
      setSending(false);
      setTimeout(() => setSent(null), 4000);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex items-center justify-between">
          <a href="/react-app/" className="font-extrabold tracking-tight text-xl">
            UBU <span className="text-[var(--orange-600)]">Lite</span>
          </a>
          <nav className="flex items-center gap-4 text-sm">
            <a className="hover:text-[var(--navy-800)]" href="/faq">FAQ</a>
            <a className="hover:text-[var(--navy-800)]" href="/privacy">Privacy</a>
            <a className="hover:text-[var(--navy-800)]" href="/terms">Terms</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {/* Brand hero */}
        <section
          className="relative overflow-hidden rounded-3xl mb-8"
          style={{ background: 'linear-gradient(135deg, var(--orange-500), var(--orange-700))', minHeight: '18rem' }}
        >
          <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-14 text-white">
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight"
            >
              Let's talk
            </motion.h1>
            <motion.p
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-2 max-w-2xl opacity-90"
            >
              Whether you're a team exploring enterprise, a creative seeking partnerships, or a client needing
              support — reach out anytime.
            </motion.p>
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-5 flex flex-wrap gap-3"
            >
              <a
                href="mailto:hello@ubulite.com"
                className="inline-block bg-white text-[var(--navy-900)] font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow transition"
              >
                hello@ubulite.com
              </a>
              <a
                href="/creatives"
                className="inline-block bg-[var(--accent-strong)] hover:bg-[var(--accent-deep)] text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
              >
                Hire a creative →
              </a>
            </motion.div>
          </div>
          {/* Decorative brand blob */}
          <svg
            aria-hidden
            className="absolute -top-16 -right-16 h-72 w-72 opacity-30"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fff7" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              fill="url(#g1)"
              d="M49.6,-57.1C62.4,-45.2,70.7,-29.1,73.6,-12.1C76.6,5,74.2,23,65.8,37.4C57.5,51.9,43.2,62.7,27.2,68.8C11.2,74.8,-6.4,76.1,-23.2,71.7C-40,67.2,-55.9,57,-65.3,43.2C-74.6,29.4,-77.4,12.2,-74.2,-3C-71,-18.2,-61.7,-31.5,-50.1,-43.4C-38.5,-55.3,-24.6,-65.8,-9,-72C6.7,-78.2,23.1,-80.1,49.6,-57.1Z"
              transform="translate(100 100)"
            />
          </svg>
          {/* Brand image on the right with fallbacks */}
          <img
            aria-hidden
            src={heroSrc}
            alt="Contact hero"
            onError={() => {
              if (heroSrc === '/CONTACT US SLIDES0236.png') setHeroSrc('/BVBBV0258.png');
              else if (heroSrc === '/BVBBV0258.png') setHeroSrc('/img/featured-creative.svg');
              else setHeroSrc('/img/placeholder-16x9.svg');
            }}
            className="pointer-events-none select-none absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 max-h-[85%] w-auto object-contain"
          />
        </section>
        <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="sr-only">
          Contact us
        </motion.h1>

        {/* Grid: Contact Cards + Form */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cards */}
          <div className="space-y-4 order-2 lg:order-1 lg:col-span-1">
            {[
              { title: 'Customer Support', byline: 'Help center and ticketing', cta: 'Visit Help Center', href: '/faq' },
              { title: 'Enterprise', byline: 'Custom solutions for teams', cta: 'Hire a creative', href: '/creatives' },
              { title: 'Press', byline: 'Media and speaking', cta: 'press@ubulite.com', href: 'mailto:press@ubulite.com' },
            ].map((c, i) => (
              <motion.a
                key={c.title}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                href={c.href}
                className="block rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 hover:shadow-md transition-all relative"
              >
                <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-[var(--accent-strong)]/70" />
                <div className="font-semibold">{c.title}</div>
                <div className="text-[var(--muted)] text-sm">{c.byline}</div>
                <div className="mt-2 inline-flex items-center gap-2 text-[var(--accent-strong)] text-sm">
                  <span>{c.cta}</span>
                  <span aria-hidden>→</span>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Form */}
          <motion.form
            onSubmit={onSubmit}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="order-1 lg:order-2 lg:col-span-2 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:border-[color:var(--accent-strong)]"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:border-[color:var(--accent-strong)]"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:border-[color:var(--accent-strong)]"
                >
                  <option value="support">Support</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="press">Press</option>
                  <option value="partnerships">Partnerships</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-[color:var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:border-[color:var(--accent-strong)]"
                  placeholder="How can we help?"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                disabled={disabled}
                className={`px-4 py-2 rounded-lg text-white shadow-sm ${
                  disabled ? 'bg-[color:var(--muted)] cursor-not-allowed' : 'bg-[var(--accent-strong)] hover:bg-[var(--accent-deep)]'
                }`}
              >
                {sending ? 'Sending…' : 'Send message'}
              </button>
              {sent === 'ok' && (
                <span className="text-green-600 text-sm">Thanks! We'll be in touch shortly.</span>
              )}
              {sent === 'err' && (
                <span className="text-red-600 text-sm">Something went wrong. Try again.</span>
              )}
            </div>
          </motion.form>
        </div>

        {/* Offices */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Our Offices</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
            {OFFICES.map((o, i) => (
              <motion.div
                key={o.name}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] overflow-hidden"
              >
                <div className="h-1 w-full bg-[var(--accent-strong)]/70" />
                <div className="h-40 bg-[var(--bg-soft)] flex items-center justify-center text-[var(--muted)] text-sm">
                  <span>
                    Map preview — {o.lat?.toFixed(3)}, {o.lng?.toFixed(3)}
                  </span>
                </div>
                <div className="p-5">
                  <div className="font-semibold">{o.name}</div>
                  <div className="text-[var(--muted)] text-sm whitespace-pre-line">{o.address.join('\n')}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-8 border-t border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} UBU Lite - Ubuntu Graphix
        </div>
      </footer>
    </div>
  );
};

export default Contact;
