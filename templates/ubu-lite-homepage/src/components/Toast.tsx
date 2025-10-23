import React, { useEffect } from 'react';

type Props = { message: string; onClose: () => void; duration?: number; variant?: 'success' | 'error' | 'info' };

const Toast: React.FC<Props> = ({ message, onClose, duration = 3000, variant = 'info' }) => {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);
  const ring = variant === 'error' ? 'ring-1 ring-red-500/30' : variant === 'success' ? 'ring-1 ring-emerald-500/30' : 'ring-1 ring-[color:var(--border)]/30';
  const dot = variant === 'error' ? 'bg-red-500' : variant === 'success' ? 'bg-emerald-600' : 'bg-[var(--navy-800)]';
  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_.2s_ease]">
      <div className={`rounded-full bg-[var(--card)] border border-[color:var(--border)] px-4 py-2 shadow ${ring} flex items-center gap-2`}> 
        <span className={`inline-block h-2 w-2 rounded-full ${dot}`}></span>
        <span>{message}</span>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:.0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </div>
  );
};

export default Toast;
