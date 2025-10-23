import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import Toast from '../components/Toast';

const Escrows: React.FC = () => {
  const [username, setUsername] = useState('demo_client');
  const [password, setPassword] = useState('demo12345');
  const [token, setToken] = useState<string | null>(null);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; variant?: 'success'|'error'|'info' } | null>(null);
  const [filter, setFilter] = useState<'all'|'funded'|'released'|'refunded'|'cancelled'>('all');
  const [query, setQuery] = useState('');

  async function login() {
    try {
      setErr(null);
      const res = await api.login({ username, password });
      setToken(res.access);
    } catch (e: any) {
      setErr(e.message || 'login failed');
    }
  }

  async function loadEscrows() {
    if (!token) return;
    try {
      setErr(null); setLoading(true);
      const list = await api.listEscrows(token);
      setEscrows(list);
      setToast({ msg: `Loaded ${list.length} escrows`, variant: 'info' });
    } catch (e: any) {
      setErr(e.message || 'failed to load escrows');
    } finally {
      setLoading(false);
    }
  }

  async function createDemoOrder() {
    if (!token) return;
    setCreating(true);
    try {
      await api.createDemoFundedOrder(token);
      await loadEscrows();
      setToast({ msg: 'Demo funded order created', variant: 'success' });
    } catch (e: any) {
      setErr(e.message || 'failed to create demo order');
      setToast({ msg: 'Failed to create demo order', variant: 'error' });
    } finally {
      setCreating(false);
    }
  }

  async function clientFulfill(id: number) {
    if (!token) return;
    try {
      await api.clientFulfill(id, token);
      await loadEscrows();
      setToast({ msg: 'Client fulfillment recorded', variant: 'success' });
    } catch (e: any) {
      setErr(e.message || 'client fulfill failed');
      setToast({ msg: 'Client fulfill failed', variant: 'error' });
    }
  }

  async function creativeFulfill(id: number) {
    if (!token) return;
    try {
      await api.creativeFulfill(id, token);
      await loadEscrows();
      setToast({ msg: 'Creative fulfillment recorded', variant: 'success' });
    } catch (e: any) {
      setErr(e.message || 'creative fulfill failed');
      setToast({ msg: 'Creative fulfill failed', variant: 'error' });
    }
  }

  useEffect(() => {
    if (token) loadEscrows();
  }, [token]);

  const filteredEscrows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return escrows.filter((e) => {
      const statusOk = filter === 'all' || (e.status || '').toLowerCase() === filter;
      const qOk = !q || String(e.id).includes(q) || String(e.order).includes(q);
      return statusOk && qOk;
    });
  }, [escrows, filter, query]);

  return (
    <div style={{ maxWidth: 980, margin: '40px auto', fontFamily: 'Inter, system-ui, Arial', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Escrows</h1>
          <p style={{ margin: '6px 0', color: '#6b7280' }}>Login as <b>demo_client</b> or <b>demo_creative</b> (password <code>demo12345</code>) to demo funding and release.</p>
        </div>
        <a href="/wallet" style={{ textDecoration: 'none', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, color: '#111827' }}>View Wallet →</a>
      </div>

      <div style={{ display: 'grid', gap: 8, maxWidth: 680, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }} />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="password" type="password" style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }} />
          <button onClick={login} className="btn" style={{ padding: '10px 14px', borderRadius: 8, background: '#FD7702', color: '#fff', border: 'none' }}>Login</button>
        </div>
        {token && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={createDemoOrder} disabled={creating} style={{ padding: '10px 14px', borderRadius: 8, background: creating ? '#f59e0b' : '#FF8E00', color: '#fff', border: 'none' }}>
              {creating ? 'Creating…' : 'Create Demo Funded Order'}
            </button>
            <button onClick={loadEscrows} style={{ padding: '10px 14px', borderRadius: 8, background: '#111827', color: '#fff', border: 'none' }}>
              Refresh List
            </button>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 13, color: '#6b7280' }}>Filter:</label>
              <select value={filter} onChange={e => setFilter(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <option value="all">All</option>
                <option value="funded">Funded</option>
                <option value="released">Released</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by escrow/order id" style={{ flex: 1, minWidth: 220, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }} />
          </div>
        )}
      </div>

      {err && <p style={{ color: 'crimson', marginTop: 12 }}>{err}</p>}

      <div style={{ marginTop: 18 }}>
        {loading && (
          <div style={{ display: 'grid', gap: 10 }}>
            {[0,1,2].map((i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, background: '#fff' }}>
                <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, width: '40%', marginBottom: 10 }} />
                <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, width: '60%', marginBottom: 10 }} />
                <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, width: '30%' }} />
              </div>
            ))}
          </div>
        )}
        {!loading && filteredEscrows.length === 0 && (
          <div style={{ color: '#6b7280' }}>No escrows yet. Log in and create a demo order.</div>
        )}
        {!loading && filteredEscrows.map((e) => {
          const canClient = !e.client_fulfilled && e.status === 'funded';
          const canCreative = !e.creative_fulfilled && e.status === 'funded';
          const progress = e.status === 'released' ? 100 : (e.client_fulfilled || e.creative_fulfilled) ? 50 : 25;
          const badgeColor = e.status === 'released' ? '#059669' : e.status === 'funded' ? '#2563eb' : e.status === 'refunded' ? '#dc2626' : '#6b7280';
          return (
            <div key={e.id} style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, marginBottom: 10, background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Escrow #{'{'}e.id{'}'}</div>
                  <div><b>Order</b>: {e.order}</div>
                  <div><b>Amount</b>: ${'{'}e.amount{'}'}</div>
                  <div><b>Status</b>: <span style={{ color: badgeColor, fontWeight: 600, textTransform: 'capitalize' }}>{e.status}</span></div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Client fulfilled: <b>{String(e.client_fulfilled)}</b></div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Creative fulfilled: <b>{String(e.creative_fulfilled)}</b></div>
                  </div>
                  <div aria-label="progress" style={{ marginTop: 6, height: 6, background: '#f3f4f6', borderRadius: 999 }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#111827', borderRadius: 999 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button disabled={!token || !canClient} onClick={() => clientFulfill(e.id)} style={{ padding: '10px 14px', borderRadius: 8, background: canClient ? '#111827' : '#9ca3af', color: '#fff', border: 'none' }}>Client Fulfill</button>
                  <button disabled={!token || !canCreative} onClick={() => creativeFulfill(e.id)} style={{ padding: '10px 14px', borderRadius: 8, background: canCreative ? '#111827' : '#9ca3af', color: '#fff', border: 'none' }}>Creative Fulfill</button>
                </div>
              </div>
              {e.released_at && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#059669' }}>Released at: {e.released_at}</div>
              )}
            </div>
          );
        })}
      </div>
      {toast && <Toast message={toast.msg} variant={toast.variant as any} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Escrows;
