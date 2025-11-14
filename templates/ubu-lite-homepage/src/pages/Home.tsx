import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useTransform, useViewportScroll, AnimatePresence, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';
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

const WORK_IMAGES = [
  'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop',
];

const TESTIMONIALS = [
  {
    name: 'Ama D.',
    role: 'Startup Founder',
    quote:
      'We booked a designer and a photographer in one afternoon. Escrow gave us and the creatives peace of mind.',
  },
  {
    name: 'Kofi M.',
    role: 'Event Producer',
    quote:
      'Smooth experience. Messaging on the booking kept everyone aligned and delivery was on time.',
  },
  {
    name: 'Zainab T.',
    role: 'Brand Manager',
    quote:
      'Loved the profiles and top talent section. Found exactly the style we needed.',
  },
];

const FAQS = [
  {
    q: 'How do payments work?',
    a: 'Payments are held in escrow until both client and creative mark the booking as fulfilled. In this demo we use Paystack test mode.',
  },
  {
    q: 'Can I book outside my city?',
    a: 'Yes. Many creatives accept remote work. Use the location and category filters to find a match.',
  },
  {
    q: 'Do creatives pay fees?',
    a: 'We keep fees modest and transparent. Exact fees may vary by region; check Terms for details.',
  },
];

// Simple inline icon set for categories (no external deps)
const CategoryIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const cls = className || 'h-4 w-4';
  switch ((name || '').toLowerCase()) {
    case 'graphic design':
    case 'design':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="currentColor" d="M3 17l6-6 4 4 6-6 2 2-8 8-4-4-4 4z"/>
        </svg>
      );
    case 'web development':
    case 'ui/ux':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="currentColor" d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm0 3h16v10H4V8zm3 3l3 3-3 3-1.4-1.4L7.2 14l-1.6-1.6L7 11zm7 0l1.4 1.4-1.6 1.6 1.6 1.6L14 17l-3-3 3-3z"/>
        </svg>
      );
    case 'photography':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="currentColor" d="M4 7h3l2-2h6l2 2h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2zm8 3a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z"/>
        </svg>
      );
    case 'video editing':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="currentColor" d="M4 6h10a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm16 3l-4 2v2l4 2V9z"/>
        </svg>
      );
    case 'brand strategy':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="currentColor" d="M12 3a7 7 0 00-4 12.9V21l4-2 4 2v-5.1A7 7 0 0012 3z"/>
        </svg>
      );
    case 'illustration':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="currentColor" d="M3 17l9-9 4 4-9 9H3v-4zm12-8l2-2 2 2-2 2-2-2z"/>
        </svg>
      );
    case 'animation':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="currentColor" d="M12 2l3 7h7l-5.5 4 2.5 7-7-4-7 4 2.5-7L2 9h7z"/>
        </svg>
      );
    default:
      return <svg viewBox="0 0 24 24" className={cls} aria-hidden><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>;
  }
};

// Assign a distinct color per category for icon accents
function catColor(name: string): string {
  const key = (name || '').toLowerCase();
  switch (key) {
    case 'graphic design':
    case 'design':
      return '#7c3aed'; // purple
    case 'web development':
    case 'ui/ux':
      return '#2563eb'; // blue
    case 'photography':
      return '#059669'; // emerald
    case 'video editing':
      return '#e11d48'; // rose
    case 'brand strategy':
      return '#f59e0b'; // amber
    case 'illustration':
      return '#0ea5e9'; // sky
    case 'animation':
      return '#10b981'; // green
    default:
      return '#111827'; // neutral ink
  }
}

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

const EASE_OUT_SOFT: any = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: EASE_OUT_SOFT } }),
};

const Home: React.FC = () => {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [remoteCreatives, setRemoteCreatives] = useState<any[] | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [navSolid, setNavSolid] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [skew, setSkew] = useState(0);
  const [scene, setScene] = useState<string>('hero');
  // Quick booking widget state
  const [bkCategory, setBkCategory] = useState<string>('');
  const [bkDate, setBkDate] = useState<string>('');
  const [bkBudget, setBkBudget] = useState<number>(250);
  const [categories, setCategories] = useState<string[] | null>(null);
  const [subEmail, setSubEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const workRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const showcaseTrackRef = useRef<HTMLDivElement | null>(null);
  const [showcaseX, setShowcaseX] = useState(0);
  const talentRef = useRef<HTMLDivElement | null>(null);
  const talentTrackRef = useRef<HTMLDivElement | null>(null);
  const [talentX, setTalentX] = useState(0);
  const [talentHeight, setTalentHeight] = useState<number>(0);
  const [panels] = useState(
    ['Discover', 'Book', 'Collaborate', 'Deliver', 'Review'].map((t, i) => ({
      key: `p-${i}`,
      title: t,
      color: i % 2 === 0 ? 'from-[var(--orange-600)] to-[var(--orange-700)]' : 'from-[var(--navy-800)] to-[var(--navy-700)]',
    }))
  );
  const { scrollYProgress, scrollY } = useViewportScroll();
  const heroParallaxY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -120]);
  const heroBlobY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -220]);
  const heroBlobScale = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 1.15]);
  // Magnetic CTA motion values
  const ctaX = useMotionValue(0);
  const ctaY = useMotionValue(0);
  const ctaXS = useSpring(ctaX, { stiffness: 300, damping: 20, mass: 0.3 });
  const ctaYS = useSpring(ctaY, { stiffness: 300, damping: 20, mass: 0.3 });
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
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

  // Load categories for quick booking select
  useEffect(() => {
    api
      .listCategories()
      .then((data: any) => {
        try {
          const names = (Array.isArray(data) ? data : data.results || [])
            .map((c: any) => c.name || c.title || c)
            .filter(Boolean);
          if (names && names.length) {
            setCategories(names);
            setBkCategory(String(names[0]));
          }
        } catch {
          setCategories(null);
        }
      })
      .catch(() => setCategories(null));
  }, []);

  // Initialize theme from localStorage on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ubu.theme');
      if (saved === 'dark') setDark(true);
    } catch {}
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
    try { localStorage.setItem('ubu.theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  // Navbar solid background after slight scroll
  useEffect(() => {
    const unsub = scrollY.onChange((v) => {
      setNavSolid(v > 12);
      setShowTop(v > 400);
      // velocity-based skew effect (clamped)
      const vel = (scrollY as any).getVelocity ? (scrollY as any).getVelocity() : 0;
      const s = prefersReducedMotion ? 0 : Math.max(-6, Math.min(6, vel / 1500));
      setSkew(Number.isFinite(s) ? s : 0);
    });
    return () => unsub();
  }, [scrollY, prefersReducedMotion]);

  // Close mobile menu with ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Horizontal wheel scrolling for the work gallery
  useEffect(() => {
    const el = workRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel as any);
  }, []);

  // Pinned showcase: map vertical scroll to horizontal translate
  useEffect(() => {
    const container = showcaseRef.current;
    const track = showcaseTrackRef.current;
    if (!container || !track) return;

    const calc = () => {
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const containerHeight = container.offsetHeight;
      const trackWidth = track.scrollWidth;
      const maxScroll = Math.max(1, containerHeight - viewportH);
      const inside = Math.min(Math.max(-rect.top, 0), maxScroll);
      const progress = inside / maxScroll; // 0..1
      const maxX = Math.max(0, trackWidth - window.innerWidth);
      const x = prefersReducedMotion ? 0 : -(progress * maxX);
      setShowcaseX(x);
    };

    calc();
    const onScroll = () => requestAnimationFrame(calc);
    const onResize = () => requestAnimationFrame(calc);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [prefersReducedMotion]);

  

  // Scrollspy for sections
  useEffect(() => {
    const ids = ['hero', 'showcase', 'work', 'categories', 'talent', 'how', 'story', 'stats', 'faq'];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target?.id;
        if (id) setActiveSection(id);
      },
      { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0.1, 0.25, 0.5, 0.75] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Scene background transitions
  useEffect(() => {
    const ids = ['hero', 'showcase', 'work', 'categories', 'talent', 'how', 'story', 'stats', 'faq'];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target?.id;
        if (id) setScene(id);
      },
      { root: null, rootMargin: '0px 0px -40% 0px', threshold: [0.15, 0.35, 0.55, 0.75] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Scene-based accent color swaps
  useEffect(() => {
    const root = document.documentElement;
    const orange: Record<string, string> = {
      '--accent': '#FF8E00',
      '--accent-strong': '#FD7702',
      '--accent-deep': '#FF5003',
    };
    const navy: Record<string, string> = {
      '--accent': '#003F7D',
      '--accent-strong': '#003366',
      '--accent-deep': '#002347',
    };
    const map: Record<string, Record<string, string>> = {
      hero: orange,
      showcase: navy,
      work: navy,
      categories: orange,
      talent: navy,
      how: orange,
      story: navy,
      stats: orange,
      faq: navy,
    };
    const colors = map[scene] || orange;
    Object.entries(colors).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [scene]);

  const onQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a fuller flow we would persist selections to query params or state.
      const params = new URLSearchParams({
        category: bkCategory || '',
        date: bkDate || '',
        budget: String(bkBudget || ''),
      });
      const base = '/checkout';
      const href = bkDate || bkBudget ? `${base}?${params.toString()}` : base;
      window.location.href = href;
    } catch {
      window.location.href = '/checkout';
    }
  };

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /.+@.+\..+/.test(subEmail);
    if (!ok) {
      alert('Enter a valid email');
      return;
    }
    setSubscribed(true);
  };

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

  // Pinned Top Talent: map vertical to horizontal and compute container height
  useEffect(() => {
    const container = talentRef.current;
    const track = talentTrackRef.current;
    if (!container || !track) return;

    const calc = () => {
      const viewportH = window.innerHeight;
      const trackWidth = track.scrollWidth;
      const maxX = Math.max(0, trackWidth - window.innerWidth);
      const height = viewportH + maxX; // enough scroll to traverse horizontal width
      setTalentHeight(height);

      const rect = container.getBoundingClientRect();
      const maxScroll = Math.max(1, height - viewportH);
      const inside = Math.min(Math.max(-rect.top, 0), maxScroll);
      const progress = inside / maxScroll;
      const x = prefersReducedMotion ? 0 : -(progress * maxX);
      setTalentX(x);
    };

    calc();
    const onScroll = () => requestAnimationFrame(calc);
    const onResize = () => requestAnimationFrame(calc);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [filteredCreatives, prefersReducedMotion]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-white">
      <style>{`
        html { scroll-behavior: smooth; }
        * { outline-offset: 2px; }
        .btn { transition: transform .1s ease, background-color .2s ease, color .2s ease, box-shadow .2s ease; }
        .btn:active { transform: translateY(1px) scale(0.99); }
        .card { box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05); }
        .card-dark { box-shadow: 0 1px 2px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.2); }
        .pill { border-radius: 9999px; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { display: flex; gap: 2.5rem; width: max-content; animation: marquee 24s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } html { scroll-behavior: auto; } }
        .skip-link { position: absolute; left: 12px; top: -40px; transition: top .15s ease; background: var(--navy-800); color: #fff; padding: 8px 12px; border-radius: 8px; z-index: 50; }
        .skip-link:focus { top: 12px; }
        .snap-x { overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
        .snap-start { scroll-snap-align: start; }
      `}</style>

      {/* Scene background overlay */}
      <AnimatePresence exitBeforeEnter>
        {(() => {
          const sceneClass: Record<string, string> = {
            hero: 'from-[var(--orange-600)]/10 to-transparent',
            showcase: 'from-[var(--navy-800)]/10 to-transparent',
            work: 'from-[var(--navy-800)]/8 to-transparent',
            categories: 'from-[var(--orange-600)]/8 to-transparent',
            talent: 'from-[var(--navy-800)]/8 to-transparent',
            how: 'from-[var(--orange-600)]/10 to-transparent',
            story: 'from-[var(--navy-800)]/10 to-transparent',
            stats: 'from-[var(--orange-600)]/10 to-transparent',
            faq: 'from-[var(--navy-800)]/8 to-transparent',
          };
          const cls = sceneClass[scene] || sceneClass.hero;
          return (
            <motion.div
              key={scene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_SOFT }}
              aria-hidden
              className={`fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b ${cls}`}
            />
          );
        })()}
      </AnimatePresence>

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 h-0.5 bg-[var(--accent-strong)] z-40 origin-left"
        style={{ scaleX: scrollYProgress }}
        aria-hidden
      />

      {/* Skip to content for keyboard users */}
      <a className="skip-link" href="#hero">Skip to content</a>

      {/* Navbar */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className={`sticky top-0 z-30 backdrop-blur border-b border-[color:var(--border)] transition-colors ${navSolid ? 'bg-[var(--bg)]/90 shadow-sm' : 'bg-[var(--bg)]/60'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <a href="#" className="flex items-center gap-3">
              <div className="pill h-9 w-9 flex items-center justify-center bg-[var(--navy-800)] text-white font-bold">U</div>
              <span className="font-semibold text-lg tracking-tight"><span className="text-[var(--navy-800)]">UBU</span> Lite</span>
            </a>
            <nav className="hidden md:flex items-center gap-1 text-[var(--muted)]">
              {NAV_LINKS.map((l) => {
                const isHash = l.href.startsWith('#');
                const isActive = isHash && activeSection === l.href.replace('#', '');
                const base = 'px-3 py-2 text-sm hover:text-[var(--navy-800)]';
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    className={
                      l.primary
                        ? 'ml-2 btn pill px-4 py-2 text-sm font-medium bg-[var(--accent-strong)] text-white hover:bg-[var(--accent-deep)] shadow-sm'
                        : `${base} ${isActive ? 'text-[var(--navy-800)] font-medium' : ''}`
                    }
                  >
                    {l.label}
                  </a>
                );
              })}
              <button onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode" className="ml-3 btn pill px-3 py-2 text-sm border border-[color:var(--border)] hover:bg-[var(--chip)]">
                {dark ? 'Light' : 'Dark'}
              </button>
            </nav>
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode" className="btn pill px-3 py-2 text-sm border border-[color:var(--border)] hover:bg-[var(--chip)]">{dark ? 'Light' : 'Dark'}</button>
              <button
                aria-label="Open menu"
                aria-controls="mobile-menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="btn pill px-3 py-2 text-sm border border-[color:var(--border)] hover:bg-[var(--chip)]"
              >
                {mobileOpen ? 'Close' : 'Menu'}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-menu-overlay"
              className="fixed inset-0 bg-black/30 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              id="mobile-menu"
              key="mobile-menu-panel"
              className={`fixed right-4 top-20 z-40 w-[85vw] max-w-sm rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-4 ${dark ? 'card-dark' : 'card'}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <ul className="flex flex-col gap-2">
                {NAV_LINKS.map((l) => (
                  <li key={`m-${l.label}`}>
                    <a
                      href={l.href}
                      className={`block w-full ${l.primary ? 'btn pill bg-[var(--accent-strong)] text-white px-4 py-2' : 'px-3 py-2 hover:text-[var(--navy-800)]'}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative scroll-mt-24" id="hero">
        {/* Parallax background blob */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-16 w-64 h-64 rounded-full bg-[var(--orange-500)]/20 blur-3xl"
          style={{ y: heroBlobY, scale: heroBlobScale }}
        />
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
                <motion.a
                  href="#talent"
                  ref={ctaRef}
                  onMouseMove={(e) => {
                    if (prefersReducedMotion) return;
                    const el = ctaRef.current; if (!el) return;
                    const r = el.getBoundingClientRect();
                    const mx = e.clientX - (r.left + r.width / 2);
                    const my = e.clientY - (r.top + r.height / 2);
                    const limit = 12;
                    ctaX.set(Math.max(-limit, Math.min(limit, mx * 0.2)));
                    ctaY.set(Math.max(-limit, Math.min(limit, my * 0.2)));
                  }}
                  onMouseLeave={() => { ctaX.set(0); ctaY.set(0); }}
                  style={{ x: ctaXS, y: ctaYS }}
                  className="btn pill bg-[var(--accent-strong)] hover:bg-[var(--accent-deep)] text-white px-5 py-3 font-semibold shadow-sm"
                  >
                  Open App
                  </motion.a>
              </motion.div>

              <div className={`mt-7 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 card ${dark ? 'card-dark' : ''}`}>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent-strong)] flex items-center justify-center border border-[color:var(--border)]">✓</span>
                    <div>
                      <div className="font-semibold">Profiles & portfolios</div>
                      <div className="text-sm text-[var(--muted)]">Rich, visual profiles for creatives.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent-strong)] flex items-center justify-center border border-[color:var(--border)]">⚡</span>
                    <div>
                      <div className="font-semibold">Instant booking</div>
                      <div className="text-sm text-[var(--muted)]">Schedule and confirm in a few clicks.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent-strong)] flex items-center justify-center border border-[color:var(--border)]">🔒</span>
                    <div>
                      <div className="font-semibold">Secure payments</div>
                      <div className="text-sm text-[var(--muted)]">Paystack integration for safe transactions (demo).</div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Quick Booking widget (uses API categories when available) */}
              <form onSubmit={onQuickBook} aria-label="Quick booking" className={`mt-6 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 grid sm:grid-cols-4 gap-3 items-end card ${dark ? 'card-dark' : ''}`}>
                <label className="block">
                  <span className="text-sm text-[var(--muted)]">Category</span>
                  <select value={bkCategory} onChange={(e) => setBkCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-transparent px-3 py-2">
                    {(categories && categories.length ? categories : CATEGORIES).map((c) => (
                      <option key={`bk-${c}`} value={String(c)}>{String(c)}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-[var(--muted)]">Date</span>
                  <input type="date" value={bkDate} onChange={(e) => setBkDate(e.target.value)} className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-transparent px-3 py-2" />
                </label>
                <label className="block">
                  <span className="text-sm text-[var(--muted)]">Budget (USD)</span>
                  <input type="number" min={50} step={10} value={bkBudget} onChange={(e) => setBkBudget(Number(e.target.value || 0))} className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-transparent px-3 py-2" />
                </label>
                <button type="submit" className="btn pill w-full sm:w-auto px-5 py-3 bg-[var(--accent-strong)] hover:bg-[var(--accent-deep)] text-white font-semibold">Book Now</button>
              </form>
            </div>

            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              style={{ y: heroParallaxY }}
              className={`rounded-3xl border border-[color:var(--border)] bg-[var(--card)] p-5 card ${dark ? 'card-dark' : ''}`}
            >
              <div className="font-semibold">Featured creative</div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[color:var(--border)]">
                <div className="aspect-[16/9] w-full relative bg-[var(--bg-soft)]">
                  <img
                    src="/img/featured-creative.svg"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      if (el.src.endsWith('/img/featured-creative.svg')) {
                        el.src = '/img/placeholder-16x9.svg';
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
                <a href={`/creatives/${featuredProfileId}`} className="btn pill px-5 py-2 bg-[var(--accent-strong)] hover:bg-[var(--accent-deep)] text-white font-semibold">View</a>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Featured Categories – horizontal */}
      <section id="featured-categories" className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl font-semibold">Featured Categories</motion.h2>
          <div className={`mt-4 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-3 ${dark ? 'card-dark' : 'card'}`}>
            <div className="snap-x flex gap-3 pr-3" role="listbox" aria-label="Featured categories">
              {CATEGORIES.concat(['UI/UX', 'Animation']).map((c) => (
                <button
                  key={`fc-${c}`}
                  role="option"
                  aria-selected={category === c}
                  onClick={() => setCategory(c)}
                  className={`snap-start btn pill shrink-0 px-4 py-3 text-sm font-medium border border-[color:var(--border)] flex items-center gap-2 ${category === c ? 'bg-[var(--accent-strong)] text-white' : 'bg-[var(--chip)] hover:bg-[var(--bg-soft)]'}`}
                >
                  <span className="text-[var(--navy-800)]/90 text-sm" style={{ color: catColor(c) }}><CategoryIcon name={c} /></span>
                  <span>{c}</span>
                </button>
              ))}
              <button onClick={() => setCategory('')} className="snap-start btn pill shrink-0 px-4 py-3 text-sm font-medium bg-transparent border border-[color:var(--border)] hover:bg-[var(--chip)]">All</button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics strip */}
      <section id="stats" className="py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-[color:var(--border)] p-5 bg-[var(--card)] ${dark ? 'card-dark' : 'card'}`}>
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight">2,400+</div>
              <div className="text-sm text-[var(--muted)]">Verified creatives</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight">8,900+</div>
              <div className="text-sm text-[var(--muted)]">Bookings completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight">$1.2M</div>
              <div className="text-sm text-[var(--muted)]">Escrowed safely</div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Gallery (horizontal scrollable) */}
      <section id="work" className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl font-semibold">Recent Work</motion.h2>
          <div ref={workRef} className="mt-4 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 min-w-full pr-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.03 }} className={`w-[280px] sm:w-[320px] shrink-0 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] card p-4 ${dark ? 'card-dark' : ''}`}>
                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-[var(--bg-soft)] border border-[color:var(--border)]">
                    <img loading="lazy" src={WORK_IMAGES[i % WORK_IMAGES.length]} alt={`Recent work sample ${i + 1}`} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/img/placeholder-4x3.svg'; }} />
                  </div>
                  <div className="mt-3 font-semibold">Project {i + 1}</div>
                  <div className="text-sm text-[var(--muted)]">Branding, Illustration</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Brands Marquee */}
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-3">
            <div className="relative w-full">
              <div className="marquee-track text-[var(--muted)]">
                {['Adobe', 'Figma', 'Canva', 'Notion', 'Paystack', 'Stripe', 'AWS', 'Vercel', 'GitHub', 'Google']
                  .concat(['Adobe', 'Figma', 'Canva', 'Notion', 'Paystack', 'Stripe', 'AWS', 'Vercel', 'GitHub', 'Google'])
                  .map((b, i) => (
                    <span key={i} className="whitespace-nowrap text-sm">{b}</span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pinned Horizontal Showcase */}
      <section id="showcase" className="relative" ref={showcaseRef} style={{ height: `${panels.length * 100}vh` }}>
        <div className="sticky top-24 h-[calc(100vh-6rem)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-full flex items-center">
            <div className="w-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--card)]">
              <motion.div
                ref={showcaseTrackRef}
                className="flex h-full"
                style={{ x: showcaseX, width: `${panels.length * 100}vw` }}
              >
                {panels.map((p, i) => (
                  <div key={p.key} className="w-screen h-full p-6">
                    <div className={`relative h-full w-full rounded-xl border border-[color:var(--border)] overflow-hidden bg-gradient-to-br ${p.color}`}>
                      <motion.div
                        initial={{ scaleX: 1 }}
                        whileInView={{ scaleX: 0 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="absolute inset-0 origin-left bg-[var(--card)]"
                      />
                      <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white">
                        <div className="pill bg-white/15 border border-white/20 w-max px-3 py-1 text-xs">Scene {i + 1}</div>
                        <h3 className="mt-3 text-2xl sm:text-3xl font-semibold drop-shadow">{p.title}</h3>
                        <p className="mt-1 text-white/85 max-w-md drop-shadow">A horizontally pinned panel with parallax-like flow as you scroll down.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-10 sm:py-12 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl font-semibold">Popular Categories</motion.h2>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((c, i) => (
              <motion.button key={c} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -2, scale: 1.02 }} className="btn pill px-4 py-3 text-sm font-medium text-left bg-[var(--chip)] hover:bg-[var(--bg-soft)] border border-[color:var(--border)] text-[var(--navy-800)] flex items-center gap-2" onClick={() => setCategory(c)}>
                <span className="text-[var(--navy-800)]/90 text-sm" style={{ color: catColor(c) }}><CategoryIcon name={c} /></span>
                <span>{c}</span>
              </motion.button>
            ))}
            <button onClick={() => setCategory('')} className="btn pill px-4 py-3 text-sm font-medium bg-transparent border border-[color:var(--border)] hover:bg-[var(--chip)]">Clear</button>
          </div>
        </div>
      </section>

      {/* Top Talent */}
      {prefersReducedMotion ? (
        <section id="talent" className="py-10 sm:py-12 scroll-mt-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl font-semibold">Top Talent</motion.h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCreatives.map((c, i) => (
                <motion.div key={(c as any).id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4 }} className={`rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 card ${dark ? 'card-dark' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-[var(--navy-700)]/10 border border-[color:var(--border)] flex items-center justify-center font-semibold text-[var(--navy-800)]" aria-hidden>
                        {initials((c as any).name)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{(c as any).name}</h3>
                        <p className="text-[var(--muted)]">{(c as any).title}</p>
                      </div>
                    </div>
                  <span className="pill px-3 py-1 bg-[var(--accent)]/10 text-sm border border-[color:var(--border)] text-[var(--accent-deep)]">${(c as any).rate}/hr</span>
                  </div>
                  <div className="mt-3 text-sm text-[var(--muted)]">{(c as any).city || ''}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(((c as any).categories || []) as string[]).map((cat: string) => (
                      <span key={cat} className="pill px-3 py-1 bg-[var(--bg-soft)] text-sm border border-[color:var(--border)] flex items-center gap-2">
                        <span className="text-[var(--navy-800)]/90 text-xs" style={{ color: catColor(cat) }}><CategoryIcon name={cat} /></span>
                        <span>{cat}</span>
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <a className="btn pill px-4 py-2 border border-[color:var(--border)] hover:bg-[var(--chip)]" href={`/creatives/${(c as any).profileId || (c as any).id}`}>View profile</a>
                    <a className="btn pill px-4 py-2 bg-[var(--accent-strong)] hover:bg-[var(--accent-deep)] text-white" href="/book">Hire</a>
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredCreatives.length === 0 && (
              <div className="mt-6 text-[var(--muted)]">No matches. Try a different search.</div>
            )}
          </div>
        </section>
      ) : (
        <section id="talent" className="relative scroll-mt-24" ref={talentRef} style={{ height: talentHeight ? `${talentHeight}px` : undefined }}>
          <div className="sticky top-24 h-[calc(100vh-6rem)]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 h-full">
              <motion.h2 initial="hidden" animate="visible" variants={fadeUp} className="text-2xl font-semibold">Top Talent</motion.h2>
              <div className="mt-4 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--card)] h-[calc(100%-3rem)]">
                <motion.div ref={talentTrackRef} className="flex h-full items-stretch" style={{ x: talentX, width: `${Math.max(filteredCreatives.length, 1) * 60}vw` }}>
                  {filteredCreatives.map((c, i) => (
                    <div key={(c as any).id} className="w-[60vw] sm:w-[50vw] lg:w-[40vw] p-4">
                      <div className={`h-full rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 card ${dark ? 'card-dark' : ''}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-[var(--navy-700)]/10 border border-[color:var(--border)] flex items-center justify-center font-semibold text-[var(--navy-800)]" aria-hidden>
                              {initials((c as any).name)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{(c as any).name}</h3>
                              <p className="text-[var(--muted)]">{(c as any).title}</p>
                            </div>
                          </div>
                          <span className="pill px-3 py-1 bg-[var(--accent)]/10 text-sm border border-[color:var(--border)] text-[var(--accent-deep)]">${(c as any).rate}/hr</span>
                        </div>
                        <div className="mt-3 text-sm text-[var(--muted)]">{(c as any).city || ''}</div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(((c as any).categories || []) as string[]).map((cat: string) => (
                            <span key={cat} className="pill px-3 py-1 bg-[var(--bg-soft)] text-sm border border-[color:var(--border)] flex items-center gap-2">
                              <span className="text-[var(--navy-800)]/90 text-xs" style={{ color: catColor(cat) }}><CategoryIcon name={cat} /></span>
                              <span>{cat}</span>
                            </span>
                          ))}
                        </div>
                        <div className="mt-5 flex items-center gap-3">
                          <a className="btn pill px-4 py-2 border border-[color:var(--border)] hover:bg-[var(--chip)]" href={`/creatives/${(c as any).profileId || (c as any).id}`}>View profile</a>
                          <a className="btn pill px-4 py-2 bg-[var(--accent-strong)] hover:bg-[var(--accent-deep)] text-white" href="/book">Hire</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section id="how" className="py-10 sm:py-12 scroll-mt-24">
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

      {/* Testimonials */}
      <section id="testimonials" className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl font-semibold">What clients say</motion.h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.figure key={t.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className={`rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 card ${dark ? 'card-dark' : ''}`}>
                <blockquote className="text-[var(--text)]">“{t.quote}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--navy-700)]/10 border border-[color:var(--border)] flex items-center justify-center font-semibold text-[var(--navy-800)]" aria-hidden>
                    {initials(t.name)}
                  </div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-[var(--muted)]">{t.role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${dark ? 'card-dark' : 'card'}`}>
            <div>
              <h3 className="text-xl font-semibold">Stay in the loop</h3>
              <p className="text-sm text-[var(--muted)]">Product updates and new talent — no spam.</p>
            </div>
            <form onSubmit={onSubscribe} className="flex w-full md:w-auto items-center gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                className="w-full md:w-64 rounded-lg border border-[color:var(--border)] bg-transparent px-3 py-2"
                aria-label="Email address"
                required
              />
              <button type="submit" className="btn pill px-4 py-2 bg-[var(--accent-strong)] hover:bg-[var(--accent-deep)] text-white">Subscribe</button>
              {subscribed && <span className="text-sm text-[var(--muted)]">Thanks! You’re subscribed.</span>}
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 card ${dark ? 'card-dark' : ''}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: 'Creatives', value: 1200 },
                { label: 'Projects', value: 5400 },
                { label: 'Cities', value: 38 },
                { label: 'Satisfaction', value: 98, suffix: '%' },
              ].map((s) => (
                <Stat key={s.label} target={s.value} label={s.label} suffix={s.suffix} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pinned Story */}
      <section id="story" className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-8 items-start">
          <div className="sticky top-24">
            <h2 className="text-2xl font-semibold">Why teams choose UBU Lite</h2>
            <p className="mt-2 text-[var(--muted)] max-w-md">Pinned copy stays visible while you scroll examples on the right.</p>
          </div>
          <div className="space-y-8">
            {[
              { t: 'Trusted pros', d: 'Verified creatives with ratings and complete profiles.' },
              { t: 'Clear scope', d: 'Simple briefs, milestones, and timeboxed engagement.' },
              { t: 'On-time delivery', d: 'Shared timelines, reminders, and crisp handoffs.' },
            ].map((s, i) => (
              <motion.div
                key={s.t}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 card ${dark ? 'card-dark' : ''}`}
              >
                <div className="pill h-8 w-8 flex items-center justify-center bg-[var(--navy-800)] text-white text-sm font-semibold">{i + 1}</div>
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-1 text-[var(--muted)] text-sm">{s.d}</p>
                <div className="mt-4 aspect-[16/9] w-full rounded-xl bg-[var(--bg-soft)] border border-[color:var(--border)]" />
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
      <section id="faq" className="py-10 sm:py-12 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl font-semibold">FAQ</motion.h2>
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-4 sm:p-6 ${dark ? 'card-dark' : 'card'}`}>
              {FAQS.map((f, i) => (
                <details key={`f-${i}`} className="border-b last:border-none border-[color:var(--border)] py-3 group">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                    <span className="font-medium">{f.q}</span>
                    <span aria-hidden className="pill h-6 w-6 flex items-center justify-center border border-[color:var(--border)] text-xs bg-[var(--chip)] group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-[var(--muted)]">{f.a}</p>
                </details>
              ))}
            </div>
            <div className={`rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 flex flex-col justify-between gap-4 ${dark ? 'card-dark' : 'card'}`}>
              <div>
                <div className="font-semibold">Still have questions?</div>
                <p className="text-sm text-[var(--muted)] mt-1">Open the full FAQ to learn more about accounts, bookings, and payments.</p>
              </div>
              <a href="/faq" className="btn pill bg-[var(--accent-strong)] hover:bg-[var(--accent-deep)] text-white px-4 py-2 w-max">Open FAQ</a>
            </div>
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

      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="toTop"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 pill px-4 py-2 bg-[var(--navy-800)] text-white shadow-sm hover:opacity-90"
            aria-label="Back to top"
          >
            Top
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

// Inline stat counter component
const Stat: React.FC<{ target: number; label: string; suffix?: string }> = ({ target, label, suffix }) => {
  const [val, setVal] = React.useState(0);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const started = React.useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const dur = 900;
          const from = 0;
          const to = target;
          const tick = (t: number) => {
            const k = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(1 - k, 3);
            setVal(Math.round(from + (to - from) * eased));
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl font-extrabold text-[var(--navy-800)]">{val}{suffix || ''}</div>
      <div className="text-sm text-[var(--muted)]">{label}</div>
    </div>
  );
};
function initials(name: string): string {
  try {
    const parts = name.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || '';
    const b = parts[1]?.[0] || '';
    return (a + b).toUpperCase() || 'U';
  } catch { return 'U'; }
}
