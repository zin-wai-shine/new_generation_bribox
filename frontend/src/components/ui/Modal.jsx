import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, subtitle, width = 560, children, hideHeader, noPadding }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'fadeIn 0.2s ease-out',
      }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: '12px',
        border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
        width: '100%', maxWidth: `${width}px`, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', position: 'relative',
        animation: 'fadeIn 0.25s ease-out',
      }}>
        {/* Header */}
        {!hideHeader && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
          }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h2>
              {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} style={{
              width: '32px', height: '32px', borderRadius: '6px',
              border: '1px solid transparent', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {hideHeader && (
           <button onClick={onClose} style={{
              position: 'absolute', top: '16px', right: '16px', zIndex: 10,
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
           }}
           onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
           onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
           >
              <X size={16} />
           </button>
        )}

        {/* Body */}
        <div style={{ padding: noPadding ? '0' : '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* Shared form field styles */
export const formStyles = {
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    cursor: 'pointer', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', boxSizing: 'border-box',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  btnPrimary: {
    width: '100%', padding: '12px', borderRadius: '6px', border: 'none',
    background: 'var(--accent-green)',
    color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    transition: 'background 0.2s',
  },
  btnSecondary: {
    width: '100%', padding: '12px', borderRadius: '6px',
    border: '1px solid var(--border-color)', background: 'var(--bg-card)',
    color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnDanger: {
    padding: '8px 16px', borderRadius: '6px', border: '1px solid #ef4444',
    background: 'transparent', color: '#ef4444',
    fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
  },
  footer: { display: 'flex', gap: '10px', marginTop: '24px' },
};
