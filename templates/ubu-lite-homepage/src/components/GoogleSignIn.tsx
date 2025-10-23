import React, { useEffect, useRef, useState } from 'react';
import { setToken, setUser } from '../auth';

declare global {
  interface Window {
    google?: any;
  }
}

type Props = {
  role?: 'creative' | 'client';
  onSuccessRedirect?: string;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'sign_in_with';
};

export const GoogleSignIn: React.FC<Props> = ({ role, onSuccessRedirect = '/studio', text = 'continue_with' }) => {
  const btnRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function ensureScript() {
      // fetch client id from backend
      try {
        const r = await fetch('/api/auth/google/client-id/');
        const j = await r.json();
        if (!j.client_id) {
          setError('Google client ID not configured');
          return;
        }
        setClientId(j.client_id);
      } catch {
        setError('Failed to load Google config');
        return;
      }

      if (document.getElementById('gsi-script')) return;
      const s = document.createElement('script');
      s.id = 'gsi-script';
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
    ensureScript();
  }, []);

  useEffect(() => {
    if (!clientId) return;
    function init() {
      if (!window.google || !btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp: any) => {
          if (!resp?.credential) return;
          try {
            const r2 = await fetch('/api/auth/google/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: resp.credential, role }),
            });
            const j2 = await r2.json();
            if (!r2.ok || !j2.access) throw new Error(j2.detail || 'Google login failed');
            setToken(j2.access);
            if (j2.user) setUser(j2.user);
            window.location.href = onSuccessRedirect;
          } catch (e: any) {
            setError(e.message || 'Google login failed');
          }
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
        text,
        shape: 'pill',
      });
    }
    const t = setInterval(() => {
      if (window.google) {
        clearInterval(t);
        init();
      }
    }, 100);
    return () => clearInterval(t);
  }, [clientId, role, onSuccessRedirect, text]);

  return (
    <div>
      <div ref={btnRef} />
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  );
};

export default GoogleSignIn;

