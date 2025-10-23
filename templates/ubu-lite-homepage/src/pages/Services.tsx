import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const Services: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');

  useEffect(() => { api.listServices().then(setItems).catch(()=>setItems([])); }, []);

  const filtered = useMemo(() => items.filter(s => {
    const matchQ = q ? (s.title?.toLowerCase().includes(q.toLowerCase()) || s.description?.toLowerCase().includes(q.toLowerCase())) : true;
    const matchCat = cat ? (s.category?.toLowerCase().includes(cat.toLowerCase())) : true;
    return matchQ && matchCat;
  }), [items, q, cat]);

  return (
    <div style={{ maxWidth: 900, margin: '30px auto' }}>
      <h2>Services</h2>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="input" />
        <input placeholder="Category" value={cat} onChange={e=>setCat(e.target.value)} className="input" />
      </div>
      <ul>
        {filtered.map((s:any) => (
          <li key={s.id} style={{ padding: 10, borderBottom: '1px solid #ddd' }}>
            <Link to={`/services/${s.id}`}><b>{s.title}</b></Link>
            <div>{s.description}</div>
            <div>Category: {s.category} — Price: ${s.price}</div>
          </li>
        ))}
        {!filtered.length && <div>No services found.</div>}
      </ul>
    </div>
  );
};

export default Services;

