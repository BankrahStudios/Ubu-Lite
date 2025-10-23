import React, { useState } from 'react';
import { api } from '../api';

const Wallet: React.FC = () => {
  const [username, setUsername] = useState('demo_creative');
  const [password, setPassword] = useState('demo12345');
  const [token, setToken] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function login() {
    try {
      setErr(null);
      const res = await api.login({ username, password });
      setToken(res.access);
    } catch (e: any) {
      setErr(e.message || 'login failed');
    }
  }

  async function loadWallet() {
    if (!token) return;
    try {
      setErr(null);
      const w = await api.getWallet(token);
      setWallet(w);
    } catch (e: any) {
      setErr(e.message || 'failed to load wallet');
    }
  }

  async function withdraw(all: boolean) {
    if (!token) return;
    try {
      setBusy(true); setErr(null);
      const amt = all ? null : Number(amount || '0');
      await api.demoWithdraw(amt && amt > 0 ? amt : null, token);
      await loadWallet();
    } catch (e: any) {
      setErr(e.message || 'withdraw failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1>Wallet</h1>
      <p>Login as a creative to view your wallet balance.</p>
      <div style={{ display: 'grid', gap: 8 }}>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="password" type="password" />
        <button onClick={login}>Login</button>
      </div>
      {token && (
        <div style={{ marginTop: 16 }}>
          <button onClick={loadWallet}>Load Wallet</button>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="amount (optional)" />
            <button disabled={busy} onClick={() => withdraw(false)}>Request Withdrawal</button>
            <button disabled={busy} onClick={() => withdraw(true)}>Withdraw All</button>
          </div>
        </div>
      )}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      {wallet && (
        <div style={{ marginTop: 16, border: '1px solid #e5e7eb', padding: 12, borderRadius: 8 }}>
          <div>Available: <b>${'{'}wallet.available_balance{'}'}</b></div>
          <div>Pending: <b>${'{'}wallet.pending_balance{'}'}</b></div>
          <div style={{ color: '#6b7280' }}>Updated: {wallet.updated_at}</div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
