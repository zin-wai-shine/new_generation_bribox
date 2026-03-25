import { MapPin, Clock, Building2, History } from 'lucide-react';

const mockPins = [
  { id: 1, title: 'Luxury Condo BTS Thonglor', lat: 13.7326, lng: 100.5777, status: 'active' },
  { id: 2, title: 'Townhouse Rama 9', lat: 13.7584, lng: 100.5654, status: 'pending' },
  { id: 3, title: 'Beach Villa Pattaya', lat: 12.9236, lng: 100.8825, status: 'active' },
  { id: 4, title: 'Studio Sathorn', lat: 13.7170, lng: 100.5256, status: 'sold' },
];

const mockTimeline = [
  { id: 1, type: 'permission_approved', title: 'Owner approved listing', time: '2 hours ago', property: 'Luxury Condo BTS Thonglor' },
  { id: 2, type: 'call', title: 'Called owner for viewing', time: '5 hours ago', property: 'Townhouse Rama 9' },
  { id: 3, type: 'created', title: 'Property post scraped', time: '1 day ago', property: 'Beach Villa Pattaya' },
  { id: 4, type: 'status_changed', title: 'Marked as sold', time: '2 days ago', property: 'Studio Sathorn' },
];

const statusDot = { active: '#10b981', pending: '#f59e0b', sold: '#8b5cf6', draft: '#94a3b8' };

export default function MapHistory() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin size={24} style={{ color: '#10b981' }} /> Map History
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Property locations and interaction timeline</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', height: 'calc(100vh - 180px)' }}>
        {/* Map Placeholder */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #064E3B08, #10b98108)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <MapPin size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Interactive Map</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Connect Leaflet or Mapbox to display property pins</div>
            </div>
            {/* Property Pins Legend */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              {mockPins.map(pin => (
                <div key={pin.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusDot[pin.status] }} />
                  {pin.title.substring(0, 20)}...
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'auto' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: '#10b981' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Timeline</h2>
          </div>
          <div style={{ padding: '8px 0' }}>
            {mockTimeline.map((item, i) => (
              <div key={item.id} className="animate-slide-in" style={{ display: 'flex', gap: '14px', padding: '14px 20px', cursor: 'pointer', transition: 'background 0.2s', animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '2px solid rgba(16,185,129,0.2)' }} />
                  {i < mockTimeline.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--border-color)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.property}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
