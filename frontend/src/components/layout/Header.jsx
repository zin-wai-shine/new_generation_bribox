import { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useToast } from '../ui/Toast';
import Modal, { formStyles as f } from '../ui/Modal';
import { Sun, Moon, Bell, Wifi, WifiOff, Search, CheckCircle, X, Check } from 'lucide-react';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { connected } = useWebSocket();
  const toast = useToast();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New property added: Luxury Condo Sukhumvit', time: '10m ago', unread: true },
    { id: 2, text: 'Owner approved permission link', time: '1h ago', unread: true },
    { id: 3, text: 'Batch image processing completed', time: '2h ago', unread: false }
  ]);

  const hasUnread = notifications.some(n => n.unread);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast('All notifications marked as read', 'info');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast(`Searching for "${searchQuery}"...`, 'info');
      setTimeout(() => {
        setShowSearch(false);
        setSearchQuery('');
      }, 500);
    }
  };

  return (
    <header style={{
      height: '64px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(12px)',
    }}>
      {/* Search */}
      <button onClick={() => setShowSearch(true)} style={{
        display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)',
        borderRadius: '10px', padding: '8px 16px', width: '360px',
        border: '1px solid var(--border-light)', cursor: 'text',
      }}>
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '14px', flex: 1, textAlign: 'left' }}>Search properties, owners...</span>
        <kbd style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>⌘K</kbd>
      </button>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px',
          background: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: connected ? '#10b981' : '#ef4444', fontSize: '12px', fontWeight: 500,
        }}>
          {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {connected ? 'Live' : 'Offline'}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotifications(prev => !prev)} style={{
            width: '38px', height: '38px', borderRadius: '10px', border: '1px solid var(--border-color)',
            background: showNotifications ? 'var(--bg-secondary)' : 'var(--bg-card)', color: 'var(--text-secondary)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
          }}>
            <Bell size={18} />
            {hasUnread && <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', border: '2px solid var(--bg-card)' }} />}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', top: '48px', right: '0', width: '320px',
              background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</h3>
                {hasUnread && (
                  <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border-light)',
                    background: n.unread ? 'rgba(16,185,129,0.05)' : 'transparent',
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.unread ? '#10b981' : 'transparent', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{n.text}</p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{n.time}</span>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} style={{
          width: '38px', height: '38px', borderRadius: '10px', border: '1px solid var(--border-color)',
          background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
        }} title="Toggle Theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Avatar */}
        <div onClick={() => toast('Profile settings open', 'info')} style={{
          width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #064E3B, #10b981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginLeft: '4px',
        }}>AG</div>
      </div>

      {/* Global Search Modal */}
      <Modal open={showSearch} onClose={() => setShowSearch(false)} title="Global Search" subtitle="Find properties, owners, and settings" width={500}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              autoFocus
              style={{ ...f.input, paddingLeft: '40px' }}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Type to search anything..."
            />
          </div>
          <button type="submit" style={{ ...f.btnPrimary, width: 'auto', padding: '0 20px' }}>Search</button>
        </form>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: '8px', fontWeight: 600 }}>Quick Links</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Sukhumvit Properties', 'Pending Owners', 'Needs Watermark'].map(tag => (
              <span key={tag} onClick={() => { setSearchQuery(tag); setTimeout(() => document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 100); }} style={{
                background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '14px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Modal>
    </header>
  );
}
