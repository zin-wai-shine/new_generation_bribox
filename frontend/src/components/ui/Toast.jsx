import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const icons = {
  success: { Icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  error: { Icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  info: { Icon: Info, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 200,
        display: 'flex', flexDirection: 'column', gap: '10px',
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => {
          const { Icon, color, bg } = icons[toast.type] || icons.info;
          return (
            <div key={toast.id} style={{
              background: 'var(--bg-card)', borderRadius: '12px',
              border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
              padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
              minWidth: '300px', maxWidth: '420px', pointerEvents: 'auto',
              animation: 'slideIn 0.3s ease-out',
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
