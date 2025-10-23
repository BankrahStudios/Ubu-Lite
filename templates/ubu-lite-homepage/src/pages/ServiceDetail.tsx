import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { api } from '../api';
import { getToken } from '../auth';

type Params = { id: string };

const ServiceDetail: React.FC<RouteComponentProps<Params>> = ({ match }) => {
  const id = match.params.id;
  const [svc, setSvc] = useState<any>(null);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getService(id).then(setSvc).catch(()=>setSvc(null));
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null); setError(null);
    const token = getToken();
    if (!token) { setError('Login required'); return; }
    try {
      const booking = await api.createBooking({ service: Number(id), date, status: 'pending' }, token);
      setStatus(`Booking created (id ${booking.id}).`);
    } catch (err:any) {
      setError(err.message || 'Booking failed');
    }
  };

  if (!svc) return <div style={{ padding: 20 }}>Loading service...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '30px auto' }}>
      <h2>{svc.title}</h2>
      <div>{svc.description}</div>
      <div>Category: {svc.category} — Price: ${svc.price}</div>
      <h3 style={{ marginTop: 20 }}>Request Booking</h3>
      {status && <div style={{ color: 'green' }}>{status}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={submit}>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="input" />
        <button className="btn" style={{ marginLeft: 8 }}>Send Request</button>
      </form>
    </div>
  );
};

export default ServiceDetail;

