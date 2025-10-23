import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../api';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'creative' | 'client'>('client');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const history = useHistory();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setOk(null);
    try {
      await api.register({ username, email, password, role });
      setOk('Registration successful. Please login.');
      setTimeout(()=> history.push('/login'), 800);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '40px auto' }}>
      <h2>Create an account</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {ok && <div style={{ color: 'green' }}>{ok}</div>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} className="input" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="input" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Role</label>
          <select value={role} onChange={e=>setRole(e.target.value as any)} className="input">
            <option value="client">Client</option>
            <option value="creative">Creative</option>
          </select>
        </div>
        <button className="btn">Register</button>
      </form>
    </div>
  );
};

export default Register;

