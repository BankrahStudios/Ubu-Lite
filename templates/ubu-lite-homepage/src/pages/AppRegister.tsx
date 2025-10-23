import React, { useState } from 'react';
import { api } from '../api';
import { setUser, setToken } from '../auth';
import GoogleSignIn from '../components/GoogleSignIn';

const AppRegister: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'creative'|'client'>('client');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.register({ username, email, password, role });
      const res: any = await api.login({ username, password });
      if (res?.access) setToken(res.access);
      if (res?.user) setUser(res.user);
      window.location.href = role === 'creative' ? '/studio' : '/creatives';
    } catch (err: any) {
      setError('Registration failed');
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-sm px-4 py-10">
        <a href="/" className="flex items-center gap-3 mb-6">
          <div className="pill h-9 w-9 flex items-center justify-center bg-[var(--navy-800)] text-white font-bold">U</div>
          <span className="font-semibold text-lg tracking-tight">UBU Lite</span>
        </a>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
          <h1 className="text-xl font-semibold">Create account</h1>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2" />
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional)" className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2" />
            <select value={role} onChange={e=>setRole(e.target.value as any)} className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2">
              <option value="client">Client</option>
              <option value="creative">Creative</option>
            </select>
            {error && <div className="text-sm text-[var(--muted)]">{error}</div>}
            <button className="w-full btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Sign up</button>
            <div className="text-sm text-[var(--muted)]">Already have an account? <a href="/app-login" className="underline">Log in</a></div>
          </form>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[color:var(--border)]" />
            <span className="text-xs text-[var(--muted)]">or</span>
            <div className="h-px flex-1 bg-[color:var(--border)]" />
          </div>
          <div className="mt-4 flex justify-center">
            <GoogleSignIn role={role} onSuccessRedirect={role === 'creative' ? '/studio' : '/creatives'} text="signup_with" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppRegister;
