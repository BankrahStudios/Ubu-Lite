import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { getToken } from '../auth';

// Minimal viewer allowing status update by client (approve/decline would normally be admin/creative)
const Booking: React.FC = () => {
  const [id, setId] = useState<string>('');
  const [details, setDetails] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const fetchOne = async () => {
    setError(null); setOk(null);
    const token = getToken();
    if (!token) { setError('Login required'); return; }
    try {
      const d = await api.getBooking(id, token);
      setDetails(d);
    } catch (e:any) {
      setError(e.message);
    }
  };

  const updateStatus = async (status: string) => {
    setError(null); setOk(null);
    const token = getToken();
    if (!token) { setError('Login required'); return; }
    try {
      await api.updateBooking(id, { status }, token);
      setOk('Status updated');
      await fetchOne();
    } catch (e:any) { setError(e.message); }
  };

  return (
    <div style={{ maxWidth: 700, margin: '30px auto' }}>
      <h2>Booking</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Booking ID" value={id} onChange={e=>setId(e.target.value)} className="input" />
        <button className="btn" onClick={fetchOne}>Load</button>
      </div>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      {ok && <div style={{ color: 'green', marginTop: 10 }}>{ok}</div>}
      {details && (
        <div style={{ marginTop: 16, padding: 10, border: '1px solid #ddd' }}>
          <div><b>ID:</b> {details.id}</div>
          <div><b>Service:</b> {details.service}</div>
          <div><b>Date:</b> {details.date}</div>
          <div><b>Status:</b> {details.status}</div>
          <div style={{ marginTop: 8 }}>
            <button className="btn" onClick={()=>updateStatus('approved')}>Approve</button>
            <button className="btn" style={{ marginLeft: 6 }} onClick={()=>updateStatus('declined')}>Decline</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;

