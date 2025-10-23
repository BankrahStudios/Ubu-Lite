import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../api';
import GigCard from '../components/GigCard';

type Service = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  price?: number;
  creative?: number | string;
  creative_profile?: number | string;
  image_url?: string;
  rating?: number;
};

type Creative = { id: number; user?: { username?: string }; username?: string };

const Marketplace: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const history = useHistory();

  useEffect(() => {
    api.listServices().then(setServices).catch(()=>setServices([]));
    api.listCreatives().then(setCreatives).catch(()=>setCreatives([]));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach(s => s.category && set.add(String(s.category)));
    return Array.from(set).sort();
  }, [services]);

  const creativeById = useMemo(() => {
    const map = new Map<string, string>();
    creatives.forEach(c => map.set(String(c.id), c.user?.username || c.username || 'Creative'));
    return map;
  }, [creatives]);

  const filtered = useMemo(() => {
    const min = minPrice ? parseFloat(minPrice) : -Infinity;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    return services.filter(s => {
      const matchQ = q ? (
        (s.title || '').toLowerCase().includes(q.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(q.toLowerCase())
      ) : true;
      const matchCat = cat ? (String(s.category || '').toLowerCase() === cat.toLowerCase()) : true;
      const price = typeof s.price === 'number' ? s.price : Number(s.price || 0);
      const matchPrice = price >= min && price <= max;
      return matchQ && matchCat && matchPrice;
    });
  }, [services, q, cat, minPrice, maxPrice]);

  return (
    <div className="market">
      <div className="market-toolbar">
        <input className="input" placeholder="What service are you looking for?" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="input" value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input className="input" placeholder="Min price" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
        <input className="input" placeholder="Max price" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
        <button className="btn" onClick={()=>{setQ(''); setCat(''); setMinPrice(''); setMaxPrice('')}}>Reset</button>
      </div>

      <div className="market-grid">
        {filtered.map(s => (
          <GigCard
            key={s.id}
            title={s.title}
            price={typeof s.price === 'number' ? s.price : Number(s.price || 0)}
            category={String(s.category || '')}
            seller={creativeById.get(String(s.creative || s.creative_profile || ''))}
            rating={typeof s.rating === 'number' ? s.rating : undefined}
            imageUrl={s.image_url}
            onClick={() => history.push(`/services/${s.id}`)}
          />
        ))}
        {!filtered.length && (
          <div className="market-empty">No gigs match your filters.</div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;

