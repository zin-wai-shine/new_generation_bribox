import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useToast } from '../components/ui/Toast';
import Modal, { formStyles as fo } from '../components/ui/Modal';
import {
  Building2, Users, Clock, CheckCircle, TrendingUp, ArrowRight,
  Image, AlertCircle, Activity, ExternalLink, Save, Loader,
  Send, Copy, Globe, Plus
} from 'lucide-react';

const mockStats = {
  properties: { total: 156, active: 89, pending: 34, sold: 33 },
  pending_permissions: 12,
};

const mockActivities = [
  { id: 1, action_type: 'permission_approved', title: 'Owner approved listing - Luxury Condo BTS Thonglor', created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 2, action_type: 'image_processed', title: '12 images processed - Villa Pattaya Beachfront', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 3, action_type: 'created', title: 'New property added - Townhouse Rama 9', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 4, action_type: 'permission_sent', title: 'Permission link sent - House Sukhumvit 71', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 5, action_type: 'status_changed', title: 'Property sold - Condo Sathorn', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 6, action_type: 'scraped', title: 'Facebook post scraped - Land Chiang Mai', created_at: new Date(Date.now() - 28800000).toISOString() },
];

const actionIcons = {
  permission_approved: { icon: CheckCircle, color: '#064E3B', bg: 'rgba(6,78,59,0.1)' },
  image_processed: { icon: Image, color: 'var(--text-secondary)', bg: 'var(--bg-secondary)' },
  created: { icon: Building2, color: 'var(--text-primary)', bg: 'var(--bg-tertiary)' },
  permission_sent: { icon: Clock, color: 'var(--text-secondary)', bg: 'var(--bg-secondary)' },
  status_changed: { icon: Activity, color: 'var(--text-muted)', bg: 'var(--bg-secondary)' },
  scraped: { icon: TrendingUp, color: 'var(--text-primary)', bg: 'var(--bg-tertiary)' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState(mockStats);
  const [activities, setActivities] = useState(mockActivities);
  const { lastMessage } = useWebSocket();

  // Modals
  const [showScrape, setShowScrape] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [permPhone, setPermPhone] = useState('');
  const [permSending, setPermSending] = useState(false);
  const [permSent, setPermSent] = useState(false);

  useEffect(() => {
    if (lastMessage?.type === 'permission_approved') {
      setActivities(prev => [{ id: Date.now(), action_type: 'permission_approved', title: `Owner approved - ${lastMessage.data.owner_name}`, created_at: new Date().toISOString() }, ...prev]);
      toast('Owner approved a listing!', 'success');
    }
  }, [lastMessage, toast]);

  useEffect(() => {
    fetch('/api/v1/dashboard/stats')
      .then(r => r.json())
      .then(data => { if (data.properties) setStats(data); })
      .catch(() => {});
  }, []);

  const handleScrape = () => {
    if (!scrapeUrl.includes('facebook.com') && !scrapeUrl.includes('fb.com')) {
      toast('Please enter a valid Facebook URL', 'error'); return;
    }
    setScraping(true);
    setTimeout(() => {
      setScraping(false); setShowScrape(false); setScrapeUrl('');
      setActivities(prev => [{ id: Date.now(), action_type: 'scraped', title: `Facebook post scraped - ${scrapeUrl.split('/').pop()}`, created_at: new Date().toISOString() }, ...prev]);
      setStats(prev => ({ ...prev, properties: { ...prev.properties, total: prev.properties.total + 1 } }));
      toast('Post scraped! New property added as Draft.', 'success');
    }, 2500);
  };

  const handleSendPermission = () => {
    if (!permPhone) { toast('Enter a phone number', 'error'); return; }
    setPermSending(true);
    setTimeout(() => {
      setPermSending(false); setPermSent(true);
      setActivities(prev => [{ id: Date.now(), action_type: 'permission_sent', title: `Permission link sent to ${permPhone}`, created_at: new Date().toISOString() }, ...prev]);
      toast(`Permission link sent to ${permPhone}!`, 'success');
    }, 1500);
  };

  const quickActions = [
    { label: 'Scrape from Facebook', icon: '🔗', desc: 'Paste a FB post URL', action: () => { setScrapeUrl(''); setShowScrape(true); } },
    { label: 'Process Images', icon: '🖼️', desc: 'Bulk AI upscale', action: () => navigate('/image-lab') },
    { label: 'Send Permission Link', icon: '✉️', desc: 'Request owner approval', action: () => { setPermPhone(''); setPermSent(false); setShowPermission(true); } },
    { label: 'Add New Property', icon: '🏠', desc: 'Manual entry', action: () => navigate('/properties') },
  ];

  const kpiCards = [
    { title: 'Total Properties', value: stats.properties.total, icon: Building2, color: '#050505', change: '+12%', route: '/properties' },
    { title: 'Active Listings', value: stats.properties.active, icon: CheckCircle, color: '#064E3B', change: '+8%', route: '/properties' },
    { title: 'Pending Approvals', value: stats.pending_permissions, icon: Clock, color: 'var(--text-secondary)', change: '-3', route: '/owners' },
    { title: 'Sold This Month', value: stats.properties.sold, icon: TrendingUp, color: 'var(--text-primary)', change: '+5', route: '/properties' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Welcome back! Here's your property management overview.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {kpiCards.map((card, i) => (
          <div key={i} className="animate-fade-in" onClick={() => navigate(card.route)}
            style={{
              background: 'var(--bg-card)', borderRadius: '4px', padding: '22px', border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease', cursor: 'pointer',
              animationDelay: `${i * 80}ms`, animationFillMode: 'backwards',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '6px', background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={22} style={{ color: card.color }} />
              </div>
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: card.change.startsWith('+') ? '#10b981' : '#ef4444',
                background: card.change.startsWith('+') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                padding: '3px 8px', borderRadius: '6px',
              }}>{card.change}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{card.value.toLocaleString()}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{card.title}</div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
        {/* Activity Feed */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Activity</h2>
            <button onClick={() => navigate('/map')} style={{ fontSize: '13px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {activities.map((activity, i) => {
              const actionStyle = actionIcons[activity.action_type] || actionIcons.created;
              const IconComp = actionStyle.icon;
              return (
                <div key={activity.id} className="animate-slide-in"
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 22px', transition: 'background 0.2s', cursor: 'pointer', animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: actionStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconComp size={18} style={{ color: actionStyle.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{timeAgo(activity.created_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)', padding: '22px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {quickActions.map((action, i) => (
                <button key={i} onClick={action.action} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '6px',
                  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <span style={{ fontSize: '22px' }}>{action.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{action.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{action.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          <div style={{ background: 'var(--accent-green)', borderRadius: '4px', padding: '22px', color: 'white' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', opacity: 0.9 }}>Listing Pipeline</h3>
            {[
              { label: 'Draft', value: stats.properties.total - stats.properties.active - stats.properties.pending - stats.properties.sold, color: '#94a3b8' },
              { label: 'Pending', value: stats.properties.pending, color: '#fbbf24' },
              { label: 'Active', value: stats.properties.active, color: '#34d399' },
              { label: 'Sold', value: stats.properties.sold, color: '#a78bfa' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: '13px', opacity: 0.85 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
            <div style={{ marginTop: '16px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.15)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(stats.properties.active / stats.properties.total * 100)}%`, background: '#34d399', transition: 'width 0.6s' }} />
              <div style={{ width: `${(stats.properties.pending / stats.properties.total * 100)}%`, background: '#fbbf24' }} />
              <div style={{ width: `${(stats.properties.sold / stats.properties.total * 100)}%`, background: '#a78bfa' }} />
            </div>
          </div>
        </div>
      </div>

      {/* === MODALS === */}

      {/* Scrape FB */}
      <Modal open={showScrape} onClose={() => setShowScrape(false)} title="Scrape from Facebook" subtitle="Extract property data from a Facebook post">
        <div style={fo.field}>
          <label style={fo.label}>Facebook Post URL</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...fo.input, flex: 1 }} value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="https://www.facebook.com/..." />
            <button onClick={() => navigator.clipboard.readText().then(t => setScrapeUrl(t)).catch(() => {})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <Copy size={14} />
            </button>
          </div>
        </div>
        {scrapeUrl && (
          <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Globe size={14} /> {scrapeUrl.substring(0, 50)}...
          </div>
        )}
        <button style={fo.btnPrimary} onClick={handleScrape} disabled={scraping || !scrapeUrl}>
          {scraping ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Scraping...</> : <><ExternalLink size={16} /> Start Scraping</>}
        </button>
      </Modal>

      {/* Permission */}
      <Modal open={showPermission} onClose={() => { setShowPermission(false); setPermSent(false); }} title="Send Permission Link" subtitle="Generate and send an approval link to property owner" width={460}>
        <div style={fo.field}>
          <label style={fo.label}>Owner Phone Number</label>
          <input style={fo.input} value={permPhone} onChange={e => setPermPhone(e.target.value)} placeholder="081-234-5678" />
        </div>
        <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Permission Link</div>
          <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500 }}>https://brebox.app/verify/{Math.random().toString(36).substring(2, 10)}</div>
        </div>
        {permSent ? (
          <div style={{ padding: '14px', background: 'rgba(6,78,59,0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={18} style={{ color: '#064E3B' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#064E3B' }}>Sent!</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Waiting for owner to click YES...</div>
            </div>
          </div>
        ) : (
          <button style={fo.btnPrimary} onClick={handleSendPermission} disabled={permSending || !permPhone}>
            {permSending ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><Send size={16} /> Send via WhatsApp/SMS</>}
          </button>
        )}
      </Modal>
    </div>
  );
}
