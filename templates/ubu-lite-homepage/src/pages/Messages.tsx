import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { getToken, getUser } from '../auth';

const Messages: React.FC = () => {
  const [bookingId, setBookingId] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const token = getToken();
    if (!token) { setError('Login required'); return; }
    try {
      const data = await api.listMessages(bookingId, token);
      setItems(Array.isArray(data) ? data : []);
    } catch (e:any) { setError(e.message); }
  };

  const send = async () => {
    setError(null);
    const token = getToken();
    if (!token) { setError('Login required'); return; }
    try {
      await api.sendMessage(bookingId, { text }, token);
      setText('');
      await load();
    } catch (e:any) { setError(e.message); }
  };

  useEffect(() => { if (bookingId) load(); }, [bookingId]);

  return (
    <div style={{ maxWidth: 800, margin: '30px auto' }}>
      <h2>Messages</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Booking ID" value={bookingId} onChange={e=>setBookingId(e.target.value)} className="input" />
        <button className="btn" onClick={load}>Load</button>
      </div>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      <div style={{ marginTop: 12, minHeight: 120, border: '1px solid #eee', padding: 8 }}>
        {items.map((m:any) => (
          <div key={m.id} style={{ padding: 6, borderBottom: '1px solid #f3f3f3' }}>
            <b>{m.sender_name || m.sender || 'User'}</b>: {m.text}
          </div>
        ))}
        {!items.length && <div>No messages yet.</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input placeholder={`Message as ${getUser()?.username || 'guest'}`} value={text} onChange={e=>setText(e.target.value)} className="input" />
        <button className="btn" onClick={send}>Send</button>
      </div>
    </div>
  );
};

export default Messages;

