import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { postJSON, getJSON } from '../api';

const CheckoutForm: React.FC<{ clientSecret: string }> = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const card = elements.getElement(CardElement)!;
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    });
    setLoading(false);
    if (error) {
      alert('Payment error: ' + error.message);
    } else {
      alert('Payment succeeded: ' + paymentIntent?.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={!stripe || loading} style={{ marginTop: 12 }} className="btn">Pay</button>
    </form>
  );
};

const Checkout: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);

  const start = async () => {
    // Ensure demo user and demo order exist (call existing demo endpoints)
    try {
      await postJSON('/auth/register/', { username: 'demo_buyer', password: 'DemoPass123!', role: 'client', email: 'demo@local' });
    } catch (e) {}
    const tokenResp = await postJSON('/auth/login/', { username: 'demo_buyer', password: 'DemoPass123!' });
    const token = tokenResp && tokenResp.access;
    if (!token) { alert('Login failed'); return; }

    // create demo order by fetching services
    const services = await getJSON('/services/');
    if (!services.length) { alert('No services'); return; }
    const svc = services[0];
    const order = await postJSON('/orders/', { service: svc.id, instructions: 'Checkout demo' }, token);

    // create payment intent
    const pi = await postJSON('/payments/create-intent/', { order: order.id }, token);
    setClientSecret(pi.client_secret);

    // fetch publishable key
    const key = await getJSON('/payments/publishable-key/');
    setPublishableKey(key.publishableKey || '');
  };

  if (!clientSecret || !publishableKey) return (
    <div style={{ padding: 20 }}>
      <h2>Checkout demo</h2>
      <p>Click start to create a demo order and payment intent.</p>
      <button onClick={start} className="btn">Start demo checkout</button>
    </div>
  );

  const stripePromise = loadStripe(publishableKey || '');
  return (
    <div style={{ padding: 20 }}>
      <h2>Complete payment</h2>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm clientSecret={clientSecret} />
      </Elements>
    </div>
  );
};

export default Checkout;
