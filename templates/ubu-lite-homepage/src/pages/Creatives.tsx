import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const Creatives: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    api.listCreatives().then(setItems).catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => items.filter(c => {
    const matchQ = q ? (c.user?.username?.toLowerCase().includes(q.toLowerCase()) || c.bio?.toLowerCase().includes(q.toLowerCase())) : true;
    const matchCity = city ? (c.city?.toLowerCase().includes(city.toLowerCase())) : true;
    return matchQ && matchCity;
  }), [items, q, city]);

  return (
    <div style={{ maxWidth: 900, margin: '30px auto' }}>
      <h2>Creatives</h2>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input placeholder="Search name/bio" value={q} onChange={e=>setQ(e.target.value)} className="input" />
        <input placeholder="City" value={city} onChange={e=>setCity(e.target.value)} className="input" />
      </div>
      <ul>
        {filtered.map((c:any) => (
          <li key={c.id} style={{ padding: 10, borderBottom: '1px solid #ddd' }}>
            <Link to={`/creatives/${c.id}`}><b>{c.user?.username || 'Creative'}</b></Link>
            <div>{c.bio}</div>
            <div>Skills: {c.skills}</div>
            <div>Rate: {c.hourly_rate ? `$${c.hourly_rate}/hr` : '—'}</div>
          </li>
        ))}
        {!filtered.length && <div>No creatives found.</div>}
      </ul>
    </div>
  );
};

export default Creatives;

