import React, { useEffect, useMemo, useState } from 'react';
import { postJSON, getJSON } from '../api';
import styles from '../styles/checkout.module.css';

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

async function loadPaystackInline(): Promise<void> {
  if (window.PaystackPop) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(s);
  });
}

type Service = { id: number; title: string; price: number };

type Step = 'idle' | 'creating' | 'initializing' | 'paying' | 'verifying' | 'succeeded' | 'failed';

const Checkout: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState<string | null>(null);

  // If Paystack redirected back with ?reference=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference');
    if (ref) setResult(`Payment reference: ${ref}`);
  }, []);

  // Prefetch services for selection and prefill from query params
  useEffect(() => {
    (async () => {
      try {
        const list = await getJSON('/services/');
        setServices(list || []);
        const params = new URLSearchParams(window.location.search);
        const svc = (params.get('service') || '').toLowerCase();
        const cat = (params.get('category') || '').toLowerCase();
        let chosen: number | null = null;
        if ((list || []).length) {
          const bySvc = svc
            ? (list as any[]).find((s: any) => String(s.title || '').toLowerCase().includes(svc))
            : null;
          const byCat = !bySvc && cat
            ? (list as any[]).find((s: any) => String((s.category_name || s.category || '')).toLowerCase().includes(cat))
            : null;
          const first = (list as Service[])[0];
          chosen = (bySvc?.id || byCat?.id || first?.id || null) as any;
        }
        if (chosen != null) setServiceId(chosen);
      } catch (e) {
        // ignore; page can still run demo flow
      }
    })();
  }, []);

  const selected = useMemo(() => services.find(s => s.id === serviceId) || null, [services, serviceId]);

  const start = async () => {
    setLoading(true);
    setError(null);
    setStep('creating');
    try {
      // Ensure demo user and demo order exist
      try { await postJSON('/auth/register/', { username: 'demo_buyer', password: 'DemoPass123!', role: 'client', email: 'demo@local' }); } catch {}
      const tokenResp = await postJSON('/auth/login/', { username: 'demo_buyer', password: 'DemoPass123!' });
      const token = tokenResp && tokenResp.access;
      if (!token) { alert('Login failed'); setLoading(false); return; }

      let svcId = serviceId;
      if (!svcId) {
        const list = await getJSON('/services/');
        if (!list.length) { alert('No services'); setLoading(false); return; }
        svcId = list[0].id;
      }
      // Carry over quick-booking hints into order instructions if present
      const qp = new URLSearchParams(window.location.search);
      const qbService = qp.get('service');
      const qbDate = qp.get('date');
      const qbBudget = qp.get('budget');
      const notes = ['Checkout demo'];
      if (qbService) notes.push(`Service: ${qbService}`);
      if (qbDate) notes.push(`Date: ${qbDate}`);
      if (qbBudget) notes.push(`Budget: ${qbBudget}`);
      const order = await postJSON('/orders/', { service: svcId, instructions: notes.join(' | ') }, token);
      setOrderId(order?.id || null);

      // Initialize Paystack on the server
      setStep('initializing');
      const init = await postJSON('/payments/paystack/init/', { order: order.id }, token);
      const { authorization_url, reference, public_key } = init;

      // Try inline popup first
      try {
        await loadPaystackInline();
        if (window.PaystackPop) {
          setStep('paying');
          const handler = window.PaystackPop.setup({
            key: public_key,
            email: tokenResp?.user?.email || 'demo@local',
            amount: 0, // amount not needed here because transaction was initialized server-side
            ref: reference,
            callback: async () => {
              setStep('verifying');
              const verify = await postJSON('/payments/paystack/verify/', { reference }, token);
              setResult(`Payment ${verify.status}`);
              setStep(verify.status === 'succeeded' ? 'succeeded' : 'failed');
            },
            onClose: () => {
              setError('Payment window closed');
              setStep('failed');
            }
          });
          handler.openIframe();
          setLoading(false);
          return;
        }
      } catch {}

      // Fallback: redirect to Paystack hosted page
      window.location.href = authorization_url;
    } catch (e: any) {
      setError(e?.message || 'Failed to start checkout');
      setStep('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.checkout}>
      <div className={styles.header}>
        <h1>Secure Checkout</h1>
        <span className={styles.badge}>Paystack</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Order Details</h3>
          <div className={styles.row}>
            <label>Service</label>
            <select value={serviceId ?? ''} onChange={e => setServiceId(Number(e.target.value))}>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.title} — ₦{Number(s.price).toFixed(2)}</option>
              ))}
            </select>
          </div>
          {selected && (
            <div className={styles.summary}>
              <div className={styles.line}><span>Subtotal</span><span>₦{Number(selected.price).toFixed(2)}</span></div>
              <div className={styles.line}><span>Fees</span><span>Included</span></div>
              <div className={styles.total}><span>Total</span><span>₦{Number(selected.price).toFixed(2)}</span></div>
            </div>
          )}
          <div className={styles.actions}>
            <button onClick={start} disabled={loading || !serviceId} className={styles.primary}>
              {loading ? 'Starting…' : 'Pay with Paystack'}
            </button>
            {orderId && <span className={styles.muted}>Order #{orderId}</span>}
          </div>
          {!!error && <div className={styles.error}>{error}</div>}
          {result && step === 'succeeded' && <div className={styles.success}>{result}. View your <a href="/escrows">escrows</a>.</div>}
        </div>

        <div className={styles.card}>
          <h3>Status</h3>
          <ul className={styles.status}>
            <li className={step !== 'idle' ? styles.on : ''}>Create order</li>
            <li className={(step === 'initializing' || step === 'paying' || step === 'verifying' || step === 'succeeded') ? styles.on : ''}>Initialize payment</li>
            <li className={(step === 'paying' || step === 'verifying' || step === 'succeeded') ? styles.on : ''}>Pay</li>
            <li className={(step === 'verifying' || step === 'succeeded') ? styles.on : ''}>Verify</li>
            <li className={step === 'succeeded' ? styles.on : ''}>Escrow funded</li>
          </ul>
          {loading && <div className={styles.spinner}>Please wait…</div>}
          <p className={styles.help}>Use your Paystack test credentials to complete payment in the popup. This demo will not create real charges.</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
