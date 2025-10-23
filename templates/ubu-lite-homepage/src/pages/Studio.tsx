import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Toast from '../components/Toast';

type Item = { id: number; title: string; media_type: 'image'|'video'; file?: string; external_url?: string };
type Booking = { id: number; service: number; client: number; date: string; status: string; meet_url?: string };
type Service = { id: number; title: string; description: string; category: string; price: number };

const Studio: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<'image'|'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [scheduleUrl, setScheduleUrl] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string>('');

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<{id:number; name:string; slug:string}[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [pBio, setPBio] = useState('');
  const [pSkills, setPSkills] = useState('');
  const [pRate, setPRate] = useState('');
  const [pCity, setPCity] = useState('');
  const [pRegion, setPRegion] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [svcTitle, setSvcTitle] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcCat, setSvcCat] = useState('');
  const [svcPrice, setSvcPrice] = useState('50');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edit, setEdit] = useState<{title:string;category:string;price:string;description:string}>({title:'',category:'',price:'',description:''});
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'approved'|'declined'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('ubu_auth_token');
    setToken(stored);
  }, []);

  async function loadPortfolio() {
    if (!token) return;
    const data = await api.listPortfolio(token);
    setItems(data.results || data);
  }
  async function loadBookings() {
    if (!token) return;
    const data = await api.listBookings(token);
    setBookings(data.results || data);
  }

  async function loadServices() {
    if (!token) return;
    const data = await api.listOwnServices(token);
    setServices(data.results || data);
  }

  async function loadCategories() {
    try {
      const data = await api.listCategories();
      setCategories(data.results || data);
      if ((data.results || data).length && !svcCat) setSvcCat((data.results||data)[0].name);
    } catch {}
  }

  async function loadProfile() {
    if (!token) return;
    try {
      const data = await api.getMyProfile(token);
      setProfile(data);
      setPBio(data.bio||'');
      setPSkills(data.skills||'');
      setPRate(data.hourly_rate!=null? String(data.hourly_rate): '');
      setPCity(data.city||'');
      setPRegion(data.region||'');
    } catch {}
  }

  useEffect(() => {
    if (token) {
      loadPortfolio();
      loadBookings();
      loadServices();
      loadProfile();
    }
    loadCategories();
  }, [token]);

  async function uploadItem(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return alert('Please log in');
    const form = new FormData();
    form.append('title', title);
    form.append('media_type', mediaType);
    if (file) form.append('file', file);
    if (url) form.append('external_url', url);
    setBusy(true);
    try {
      await api.createPortfolioItem(form, token);
      setTitle(''); setFile(null); setUrl('');
      loadPortfolio();
    } catch (err: any) {
      alert(err?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(id: number) {
    if (!token) return;
    if (!confirm('Delete this portfolio item?')) return;
    try { await api.deletePortfolioItem(id, token); loadPortfolio(); } catch (e) { alert('Delete failed'); }
  }

  const [toast, setToast] = useState<string | null>(null);
  function ping(msg: string) { setToast(msg); setTimeout(()=>setToast(null), 3000); }
  async function approve(id: number) { if (!token) return; await api.approveBooking(id, token); loadBookings(); ping('Booking approved'); }
  async function decline(id: number) { if (!token) return; await api.declineBooking(id, token); loadBookings(); ping('Booking declined'); }
  async function schedule(id: number) { if (!token) return; await api.scheduleBooking(id, { meet_url: scheduleUrl }, token); setScheduleUrl(''); loadBookings(); ping('Meet link attached'); }

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return alert('Please log in');
    try {
      await api.createService({ title: svcTitle, description: svcDesc, category: svcCat ? Number(svcCat) : null, price: Number(svcPrice) }, token);
      setSvcTitle(''); setSvcDesc(''); setSvcCat('Design'); setSvcPrice('50');
      loadServices();
    } catch (e:any) { alert(e?.message || 'Create failed'); }
  }

  async function removeService(id: number) {
    if (!token) return;
    if (!confirm('Delete this service?')) return;
    try { await api.deleteService(id, token); loadServices(); } catch (e) { alert('Delete failed'); }
  }

  function startEdit(s: Service) {
    setEditingId(s.id);
    setEdit({ title: s.title, category: String((s as any).category || ''), price: String(s.price), description: s.description });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || editingId==null) return;
    try {
      await api.updateService(editingId, { title: edit.title, category: edit.category ? Number(edit.category) : null, price: Number(edit.price), description: edit.description }, token);
      setEditingId(null);
      loadServices();
    } catch (e:any) { alert(e?.message || 'Update failed'); }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      if (avatarFile) {
        const f = new FormData();
        f.append('bio', pBio);
        f.append('skills', pSkills);
        if (pRate) f.append('hourly_rate', String(Number(pRate)));
        f.append('city', pCity);
        f.append('region', pRegion);
        f.append('avatar', avatarFile);
        await api.updateMyProfileMultipart(f, token);
        setAvatarFile(null);
      } else {
        await api.updateMyProfile({ bio: pBio, skills: pSkills, hourly_rate: pRate? Number(pRate): null, city: pCity, region: pRegion }, token);
      }
      ping('Profile updated');
      loadProfile();
    } catch (e:any) { alert(e?.message || 'Update failed'); }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="pill h-9 w-9 flex items-center justify-center bg-[var(--navy-800)] text-white font-bold">U</div>
            <span className="font-semibold text-lg tracking-tight"><span className="text-[var(--navy-800)]">UBU</span> Lite Studio</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {!token && (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <div className="text-lg font-semibold">Sign in required</div>
            <p className="mt-1 text-[var(--muted)]">Please log in as a creative to access your Studio.</p>
            <div className="mt-3 flex gap-2">
              <a href="/login/" className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Log in</a>
              <a href="/register/" className="btn pill border border-[color:var(--border)] px-4 py-2">Register</a>
            </div>
          </div>
        )}
        {token && (
        <>
        <h1 className="text-2xl font-semibold">Your Studio</h1>
        <p className="text-[var(--muted)]">Manage your portfolio and bookings.</p>

        {toast && <Toast message={toast} onClose={()=>setToast(null)} />}
        <div className="mt-2 grid lg:grid-cols-2 gap-8">
          <section>
            <h2 className="font-semibold">Your profile</h2>
            <form onSubmit={saveProfile} className="mt-3 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5">
              <div className="grid sm:grid-cols-2 gap-3">
                {profile?.avatar && /\.(png|jpe?g|gif|webp)$/i.test(profile.avatar) ? (
                  <img src={profile.avatar} alt="avatar" className="h-16 w-16 rounded-full border border-[color:var(--border)] object-cover" />
                ) : <div className="h-16 w-16 rounded-full border border-[color:var(--border)] bg-[var(--bg-soft)]" />}
                <input type="file" onChange={e=>setAvatarFile(e.target.files?.[0]||null)} className="" />
                <input value={pCity} onChange={e=>setPCity(e.target.value)} placeholder="City" className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                <input value={pRegion} onChange={e=>setPRegion(e.target.value)} placeholder="Region" className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                <input value={pRate} onChange={e=>setPRate(e.target.value)} type="number" step="1" min="0" placeholder="Hourly rate" className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                <input value={pSkills} onChange={e=>setPSkills(e.target.value)} placeholder="Skills (comma separated)" className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                <textarea value={pBio} onChange={e=>setPBio(e.target.value)} placeholder="Short bio" className="col-span-2 w-full rounded-xl border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
              </div>
              <button className="mt-3 btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Save profile</button>
            </form>

            <h2 className="font-semibold">Add portfolio item</h2>
            <form onSubmit={uploadItem} className="mt-3 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5">
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2" />
                <select value={mediaType} onChange={e=>setMediaType(e.target.value as any)} className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} className="col-span-2" />
                <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="External URL (optional)" className="col-span-2 pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-4 py-2" />
              </div>
              <button disabled={busy} className="mt-4 btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-5 py-2">{busy? 'Uploading...' : 'Upload'}</button>
            </form>

            <h3 className="mt-6 font-semibold">Your portfolio</h3>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map(it => (
                <div key={it.id} className="rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-3">
                  <div className="text-sm font-medium">{it.title}</div>
                  <div className="text-xs text-[var(--muted)]">{it.media_type}</div>
                  {it.file && /\.(png|jpe?g|gif|webp)$/i.test(it.file) ? (
                    <img src={it.file} alt={it.title} className="mt-2 w-full h-28 object-cover rounded-lg border border-[color:var(--border)]" />
                  ) : it.file ? (
                    <a className="text-xs text-[var(--navy-800)] underline" href={it.file} target="_blank">Open file</a>
                  ) : null}
                  {it.external_url && (<a className="text-xs text-[var(--navy-800)] underline ml-2" href={it.external_url} target="_blank">Link</a>)}
                  <div className="mt-2">
                    <button onClick={()=>removeItem(it.id)} className="btn pill border border-[color:var(--border)] px-3 py-1 text-xs">Delete</button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="text-[var(--muted)]">No items yet.</div>}
            </div>
          </section>

          <section>
            <h2 className="font-semibold">Bookings</h2>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-[var(--muted)]">Filter:</span>
              <button onClick={()=>setStatusFilter('all')} className={`pill px-3 py-1 border border-[color:var(--border)] ${statusFilter==='all'?'bg-[var(--bg-soft)]':''}`}>all</button>
              <button onClick={()=>setStatusFilter('pending')} className={`pill px-3 py-1 border border-[color:var(--border)] ${statusFilter==='pending'?'bg-[var(--bg-soft)]':''}`}>pending</button>
              <button onClick={()=>setStatusFilter('approved')} className={`pill px-3 py-1 border border-[color:var(--border)] ${statusFilter==='approved'?'bg-[var(--bg-soft)]':''}`}>approved</button>
              <button onClick={()=>setStatusFilter('declined')} className={`pill px-3 py-1 border border-[color:var(--border)] ${statusFilter==='declined'?'bg-[var(--bg-soft)]':''}`}>declined</button>
            </div>
            <div className="mt-3 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] divide-y">
              {(bookings.filter(b => statusFilter==='all' ? true : b.status===statusFilter)).map(b => (
                <div key={b.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">Booking #{b.id}</div>
                    <div className="text-sm text-[var(--muted)]">{new Date(b.date).toLocaleString()} • {b.status}</div>
                    {b.meet_url && <a href={b.meet_url} className="text-sm text-[var(--navy-800)] underline" target="_blank">Join link</a>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>approve(b.id)} className="btn pill border border-[color:var(--border)] px-3 py-1">Approve</button>
                    <button onClick={()=>decline(b.id)} className="btn pill border border-[color:var(--border)] px-3 py-1">Decline</button>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && <div className="p-4 text-[var(--muted)]">No bookings yet.</div>}
            </div>
            <div className="mt-3 grid sm:grid-cols-3 gap-2 items-center">
              <select value={selectedBooking} onChange={e=>setSelectedBooking(e.target.value)} className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2">
                <option value="">Choose booking…</option>
                {bookings.map(b => (
                  <option key={b.id} value={String(b.id)}>#{b.id} • {new Date(b.date).toLocaleString()}</option>
                ))}
              </select>
              <input value={scheduleUrl} onChange={e=>setScheduleUrl(e.target.value)} placeholder="https://meet.google.com/..." className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
              <button disabled={!selectedBooking || !scheduleUrl} onClick={()=>schedule(Number(selectedBooking))} className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Attach link</button>
            </div>
          </section>

          <section className="lg:col-span-2">
            <h2 className="font-semibold">Your services</h2>
            <form onSubmit={addService} className="mt-3 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5">
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={svcTitle} onChange={e=>setSvcTitle(e.target.value)} placeholder="Title e.g., Brand Design" className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                <select value={svcCat} onChange={e=>setSvcCat(e.target.value)} className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <input value={svcPrice} onChange={e=>setSvcPrice(e.target.value)} type="number" min="0" step="1" placeholder="Price" className="pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                <input value={svcDesc} onChange={e=>setSvcDesc(e.target.value)} placeholder="Short description" className="col-span-2 pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
              </div>
              <button className="mt-3 btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-4 py-2">Add service</button>
            </form>

            <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.map(s => (
                <div key={s.id} className="rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-4">
                  {editingId===s.id ? (
                    <form onSubmit={saveEdit} className="space-y-2">
                      <input value={edit.title} onChange={e=>setEdit({...edit,title:e.target.value})} className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                      <select value={edit.category} onChange={e=>setEdit({...edit,category:e.target.value})} className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2">
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                      </select>
                      <input type="number" value={edit.price} onChange={e=>setEdit({...edit,price:e.target.value})} className="w-full pill border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                      <textarea value={edit.description} onChange={e=>setEdit({...edit,description:e.target.value})} className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--bg-soft)] px-3 py-2" />
                      <div className="flex gap-2">
                        <button className="btn pill bg-[var(--orange-600)] hover:bg-[var(--orange-700)] text-white px-3 py-1 text-xs">Save</button>
                        <button type="button" onClick={()=>setEditingId(null)} className="btn pill border border-[color:var(--border)] px-3 py-1 text-xs">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-sm text-[var(--muted)]">{s.category} • ${s.price}</div>
                      <div className="mt-2 text-sm line-clamp-3">{s.description}</div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={()=>startEdit(s)} className="btn pill border border-[color:var(--border)] px-3 py-1 text-xs">Edit</button>
                        <button onClick={()=>removeService(s.id)} className="btn pill border border-[color:var(--border)] px-3 py-1 text-xs">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {services.length===0 && <div className="text-[var(--muted)]">No services yet.</div>}
            </div>
          </section>
        </div>
        </>
        )}
      </main>
    </div>
  );
};

export default Studio;
