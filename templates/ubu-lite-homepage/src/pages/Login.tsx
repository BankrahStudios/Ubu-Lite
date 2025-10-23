import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../api';
import { setToken, setUser } from '../auth';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const resp = await api.login({ username, password });
      setToken(resp.access);
      if (resp.user) setUser(resp.user);
      else setUser({ username });
      history.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} className="input" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" />
        </div>
        <button className="btn">Login</button>
      </form>
    </div>
  );
};

export default Login;

