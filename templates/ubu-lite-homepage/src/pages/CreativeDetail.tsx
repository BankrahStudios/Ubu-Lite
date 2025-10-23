import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { api } from '../api';

type Params = { id: string };

const CreativeDetail: React.FC<RouteComponentProps<Params>> = ({ match }) => {
  const id = match.params.id;
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    api.getCreative(id).then(setProfile).catch(()=>setProfile(null));
    // naive: list all services and filter by creative id if shape differs
    api.listServices().then((svcs:any[]) => setServices(svcs.filter(s => `${s.creative}` === `${id}` || `${s.creative_profile}` === `${id}`)));
  }, [id]);

  if (!profile) return <div style={{ padding: 20 }}>Loading creative...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '30px auto' }}>
      <h2>{profile.user?.username || 'Creative'}</h2>
      <p>{profile.bio}</p>
      <p>Skills: {profile.skills}</p>
      <p>Hourly rate: {profile.hourly_rate ? `$${profile.hourly_rate}/hr` : '—'}</p>
      <h3>Services</h3>
      <ul>
        {services.map((s:any) => (
          <li key={s.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <Link to={`/services/${s.id}`}><b>{s.title}</b></Link>
            <div>{s.description}</div>
            <div>Category: {s.category} — Price: ${s.price}</div>
          </li>
        ))}
        {!services.length && <div>No services listed.</div>}
      </ul>
    </div>
  );
};

export default CreativeDetail;

