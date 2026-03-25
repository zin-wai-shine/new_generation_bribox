import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import Modal, { formStyles as f } from '../components/ui/Modal';
import {
  Plus, Search, Building2, MapPin, Bed, Bath,
  MoreVertical, Eye, Edit, Trash2, Link2, ExternalLink,
  X, Save, Loader, Copy, CheckCircle, Globe,
  Download, Wand2, FileText
} from 'lucide-react';

const initialProperties = [
  { id: '1', title: 'Luxury Condo BTS Thonglor', property_type: 'condo', status: 'active', price: 12500000, price_unit: 'THB', district: 'Watthana', province: 'Bangkok', bedrooms: 2, bathrooms: 2, area_sqm: 78, description: 'Beautiful luxury condo near BTS Thonglor station with stunning city views.', fb_url: 'https://facebook.com/post/123', created_at: '2024-01-15' },
  { id: '2', title: 'Modern Townhouse Rama 9', property_type: 'townhouse', status: 'pending', price: 8900000, price_unit: 'THB', district: 'Huai Khwang', province: 'Bangkok', bedrooms: 3, bathrooms: 3, area_sqm: 180, description: 'Modern 3-story townhouse in the heart of Rama 9 business district.', fb_url: '', created_at: '2024-01-14' },
  { id: '3', title: 'Beach Villa Pattaya', property_type: 'house', status: 'active', price: 25000000, price_unit: 'THB', district: 'Bang Lamung', province: 'Chonburi', bedrooms: 5, bathrooms: 4, area_sqm: 450, description: 'Luxury beachfront villa with private pool and ocean views.', fb_url: '', created_at: '2024-01-13' },
  { id: '4', title: 'Studio Condo Sathorn', property_type: 'condo', status: 'sold', price: 4500000, price_unit: 'THB', district: 'Sathorn', province: 'Bangkok', bedrooms: 1, bathrooms: 1, area_sqm: 35, description: 'Compact studio ideal for young professionals.', fb_url: '', created_at: '2024-01-12' },
  { id: '5', title: 'Land Plot Chiang Mai', property_type: 'land', status: 'draft', price: 3200000, price_unit: 'THB', district: 'Mueang', province: 'Chiang Mai', bedrooms: 0, bathrooms: 0, area_sqm: 800, description: 'Prime land plot with mountain view, ideal for resort development.', fb_url: '', created_at: '2024-01-11' },
  { id: '6', title: 'Penthouse Riverside', property_type: 'condo', status: 'active', price: 35000000, price_unit: 'THB', district: 'Khlong San', province: 'Bangkok', bedrooms: 3, bathrooms: 3, area_sqm: 200, description: 'Premium riverside penthouse with panoramic views.', fb_url: '', created_at: '2024-01-10' },
];

const statusColors = {
  draft: { bg: 'var(--bg-secondary)', text: 'var(--text-muted)', label: 'Draft' },
  pending: { bg: 'var(--bg-secondary)', text: 'var(--text-secondary)', label: 'Pending' },
  active: { bg: 'rgba(6,78,59,0.1)', text: '#064E3B', label: 'Active' },
  sold: { bg: 'var(--bg-secondary)', text: 'var(--text-primary)', label: 'Sold' },
  rented: { bg: 'var(--bg-secondary)', text: 'var(--text-primary)', label: 'Rented' },
};

const typeColors = { condo: 'var(--text-secondary)', house: '#064E3B', townhouse: 'var(--text-muted)', land: 'var(--text-secondary)', commercial: 'var(--text-muted)', apartment: 'var(--text-muted)' };

function formatPrice(price) {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
  return price.toString();
}

const emptyProperty = { title: '', property_type: 'condo', status: 'draft', price: '', price_unit: 'THB', district: '', province: '', bedrooms: '', bathrooms: '', area_sqm: '', description: '' };

export default function Properties() {
  const toast = useToast();
  const [properties, setProperties] = useState(initialProperties);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showScrape, setShowScrape] = useState(false);
  const [showDetail, setShowDetail] = useState(null); // property object
  const [showEdit, setShowEdit] = useState(null); // property object
  const [showDelete, setShowDelete] = useState(null); // property id
  const [showMenu, setShowMenu] = useState(null); // property id for dropdown

  // Form state
  const [form, setForm] = useState(emptyProperty);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeStep, setScrapeStep] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = properties.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.district?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Handlers
  const handleAdd = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      const newProp = { ...form, id: `${Date.now()}`, price: Number(form.price), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), area_sqm: Number(form.area_sqm), created_at: new Date().toISOString().split('T')[0] };
      setProperties(prev => [newProp, ...prev]);
      setShowAdd(false);
      setForm(emptyProperty);
      setSaving(false);
      toast('Property added successfully!', 'success');
    }, 800);
  }, [form, toast]);

  const handleScrape = useCallback(() => {
    if (!scrapeUrl.includes('facebook.com') && !scrapeUrl.includes('fb.com')) {
      toast('Please enter a valid Facebook URL', 'error');
      return;
    }
    setScraping(true);
    setScrapeStep(0);

    const timings = [1200, 1500, 2000, 2500, 1000];
    let acc = 0;
    timings.forEach((duration) => {
      acc += duration;
      setTimeout(() => {
        setScrapeStep(prev => prev + 1);
      }, acc);
    });

    setTimeout(() => {
      const scraped = {
        id: `${Date.now()}`, title: 'Scraped Listing - ' + scrapeUrl.split('/').slice(-2)[0],
        property_type: 'condo', status: 'draft', price: 12500000, price_unit: 'THB',
        district: 'Watthana', province: 'Bangkok', bedrooms: 2, bathrooms: 1, area_sqm: 65,
        description: 'Auto-scraped from Facebook post. Prime location in Watthana.', fb_url: scrapeUrl,
        created_at: new Date().toISOString().split('T')[0],
      };
      setProperties(prev => [scraped, ...prev]);
      setScraping(false);
      setShowScrape(false);
      setScrapeUrl('');
      setScrapeStep(null);
      toast('Facebook post content successfully extracted and upscaled!', 'success');
    }, acc + 800);
  }, [scrapeUrl, toast]);

  const handleEdit = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setProperties(prev => prev.map(p => p.id === showEdit.id ? { ...showEdit, price: Number(showEdit.price), bedrooms: Number(showEdit.bedrooms), bathrooms: Number(showEdit.bathrooms), area_sqm: Number(showEdit.area_sqm) } : p));
      setShowEdit(null);
      setSaving(false);
      toast('Property updated!', 'success');
    }, 600);
  }, [showEdit, toast]);

  const handleDelete = useCallback(() => {
    setProperties(prev => prev.filter(p => p.id !== showDelete));
    setShowDelete(null);
    toast('Property deleted', 'info');
  }, [showDelete, toast]);

  const handleStatusChange = useCallback((id, newStatus) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    setShowMenu(null);
    toast(`Status changed to ${statusColors[newStatus]?.label}`, 'success');
  }, [toast]);

  // Property form (reused for add & edit)
  const renderForm = (data, setData, onSubmit, submitLabel) => (
    <>
      <div style={f.field}>
        <label style={f.label}>Property Title *</label>
        <input style={f.input} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} placeholder="e.g. Luxury Condo Sukhumvit" />
      </div>
      <div style={f.row}>
        <div style={f.field}>
          <label style={f.label}>Type</label>
          <select style={f.select} value={data.property_type} onChange={e => setData({ ...data, property_type: e.target.value })}>
            <option value="condo">Condo</option><option value="house">House</option>
            <option value="townhouse">Townhouse</option><option value="land">Land</option>
            <option value="commercial">Commercial</option><option value="apartment">Apartment</option>
          </select>
        </div>
        <div style={f.field}>
          <label style={f.label}>Status</label>
          <select style={f.select} value={data.status} onChange={e => setData({ ...data, status: e.target.value })}>
            <option value="draft">Draft</option><option value="pending">Pending</option>
            <option value="active">Active</option><option value="sold">Sold</option>
          </select>
        </div>
      </div>
      <div style={f.row}>
        <div style={f.field}>
          <label style={f.label}>Price (THB)</label>
          <input style={f.input} type="number" value={data.price} onChange={e => setData({ ...data, price: e.target.value })} placeholder="12500000" />
        </div>
        <div style={f.field}>
          <label style={f.label}>Area (sqm)</label>
          <input style={f.input} type="number" value={data.area_sqm} onChange={e => setData({ ...data, area_sqm: e.target.value })} placeholder="78" />
        </div>
      </div>
      <div style={f.row3}>
        <div style={f.field}>
          <label style={f.label}>Bedrooms</label>
          <input style={f.input} type="number" value={data.bedrooms} onChange={e => setData({ ...data, bedrooms: e.target.value })} placeholder="2" />
        </div>
        <div style={f.field}>
          <label style={f.label}>Bathrooms</label>
          <input style={f.input} type="number" value={data.bathrooms} onChange={e => setData({ ...data, bathrooms: e.target.value })} placeholder="2" />
        </div>
        <div style={f.field}>
          <label style={f.label}>Province</label>
          <input style={f.input} value={data.province} onChange={e => setData({ ...data, province: e.target.value })} placeholder="Bangkok" />
        </div>
      </div>
      <div style={f.field}>
        <label style={f.label}>District</label>
        <input style={f.input} value={data.district} onChange={e => setData({ ...data, district: e.target.value })} placeholder="Watthana" />
      </div>
      <div style={f.field}>
        <label style={f.label}>Description</label>
        <textarea style={f.textarea} value={data.description || ''} onChange={e => setData({ ...data, description: e.target.value })} placeholder="Describe the property..." />
      </div>
      <div style={f.footer}>
        <button style={f.btnPrimary} onClick={onSubmit} disabled={saving || !data.title}>
          {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={16} /> {submitLabel}</>}
        </button>
      </div>
    </>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Properties</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{filtered.length} properties found</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setScrapeUrl(''); setShowScrape(true); }} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '6px',
            border: '1px solid var(--border-color)', background: 'var(--bg-card)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <ExternalLink size={16} /> Scrape FB
          </button>
          <button onClick={() => { setForm(emptyProperty); setShowAdd(true); }} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '6px', border: 'none',
            background: 'var(--accent-green)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            boxShadow: 'none', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={16} /> Add Property
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center',
        background: 'var(--bg-card)', padding: '14px 18px', borderRadius: '6px', border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, background: 'var(--bg-secondary)', borderRadius: '4px', padding: '0 12px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', padding: '8px 0', width: '100%' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'active', 'pending', 'draft', 'sold'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)} style={{
              padding: '6px 14px', borderRadius: '4px', border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              background: filterStatus === status ? '#064E3B' : 'var(--bg-secondary)',
              color: filterStatus === status ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s',
            }}>
              {status === 'all' ? 'All' : statusColors[status]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
        {filtered.map((property, i) => {
          const status = statusColors[property.status] || statusColors.draft;
          return (
            <div key={property.id} className="animate-fade-in"
              style={{
                background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)',
                overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer',
                animationDelay: `${i * 60}ms`, animationFillMode: 'backwards', position: 'relative',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              onClick={() => setShowDetail(property)}
            >
              {/* Image */}
              <div style={{
                height: '180px', background: 'var(--bg-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '1px solid var(--border-color)'
              }}>
                <Building2 size={40} style={{ color: 'var(--text-muted)' }} />
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: status.bg, color: status.text }}>{status.label}</span>
                  <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-card)', color: 'var(--text-secondary)', textTransform: 'capitalize', border: '1px solid var(--border-color)' }}>{property.property_type}</span>
                </div>
                {/* Menu Button */}
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === property.id ? null : property.id); }} style={{
                  position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '4px',
                  background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MoreVertical size={14} />
                </button>
                {/* Dropdown Menu */}
                {showMenu === property.id && (
                  <div onClick={e => e.stopPropagation()} style={{
                    position: 'absolute', top: '48px', right: '12px', background: 'var(--bg-card)',
                    borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden', zIndex: 10, minWidth: '160px',
                  }}>
                    {[
                      { icon: Eye, label: 'View Detail', action: () => { setShowMenu(null); setShowDetail(property); } },
                      { icon: Edit, label: 'Edit', action: () => { setShowMenu(null); setShowEdit({ ...property }); } },
                      { icon: Link2, label: 'Permission Link', action: () => { setShowMenu(null); toast('Permission link generated!', 'success'); } },
                    ].map((item, idx) => (
                      <button key={idx} onClick={item.action} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px',
                        border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500,
                        transition: 'background 0.2s', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <item.icon size={14} /> {item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border-color)' }}>
                      {['draft', 'pending', 'active', 'sold'].filter(s => s !== property.status).map(s => (
                        <button key={s} onClick={() => handleStatusChange(property.id, s)} style={{
                          display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 14px',
                          border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                          color: statusColors[s]?.text, textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          → Set {statusColors[s]?.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)' }}>
                      <button onClick={() => { setShowMenu(null); setShowDelete(property.id); }} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px',
                        border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: '13px', fontWeight: 500, textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '16px 18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
                  <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{property.district}, {property.province}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#064E3B' }}>฿{formatPrice(property.price)}</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {property.bedrooms > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}><Bed size={14} /> {property.bedrooms}</div>}
                    {property.bathrooms > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}><Bath size={14} /> {property.bathrooms}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>📐 {property.area_sqm}m²</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* === MODALS === */}

      {/* Add Property Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Property" subtitle="Create a new property listing">
        {renderForm(form, setForm, handleAdd, 'Add Property')}
      </Modal>

      {/* Scrape FB Modal */}
      <Modal open={showScrape} onClose={() => { if (!scraping) setShowScrape(false); }} title="Scrape from Facebook" subtitle="Paste a Facebook post URL to auto-extract property data">
        <div style={f.field}>
          <label style={f.label}>Facebook Post URL *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...f.input, flex: 1 }} value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="https://www.facebook.com/..." />
            <button onClick={() => navigator.clipboard.readText().then(t => setScrapeUrl(t)).catch(() => {})} style={{
              padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
              cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
            }}>
              <Copy size={14} /> Paste
            </button>
          </div>
        </div>
        {scrapeUrl && (
          <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <Globe size={14} /> {scrapeUrl.substring(0, 60)}...
            </div>
          </div>
        )}
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          The bot will extract title, description, and download ALL images. It will then pass them to the Image Lab to automatically upscale them.
        </p>
        {scraping && scrapeStep !== null && (
          <div style={{ padding: '18px 16px', background: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Connecting to Facebook...', icon: Globe },
              { label: 'Extracting details & pricing...', icon: FileText },
              { label: 'Downloading property images...', icon: Download },
              { label: 'AI Process: Upscaling & watermarking...', icon: Wand2 },
              { label: 'Finalizing draft listing...', icon: CheckCircle }
            ].map((step, i) => {
              const isPast = scrapeStep > i;
              const isCurrent = scrapeStep === i;
              const isFuture = scrapeStep < i;
              
              const IconToUse = isPast ? CheckCircle : isCurrent ? Loader : step.icon;
              const iconColor = isPast ? '#064E3B' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)';
              const textColor = isPast ? 'var(--text-secondary)' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)';

              return (
                <div key={i} className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: isFuture ? 0.4 : 1, transition: 'all 0.3s' }}>
                  <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                    <IconToUse size={18} style={{ color: iconColor, animation: isCurrent ? 'spin 1s linear infinite' : 'none' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: textColor, fontWeight: isCurrent ? 600 : 500 }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <button style={f.btnPrimary} onClick={handleScrape} disabled={scraping || !scrapeUrl}>
          {scraping ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing Task...</> : <><ExternalLink size={16} /> Start Scraping & Upscaling</>}
        </button>
      </Modal>

      {/* View Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || ''} subtitle={`${showDetail?.district}, ${showDetail?.province}`} width={640}>
        {showDetail && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: statusColors[showDetail.status]?.bg, color: statusColors[showDetail.status]?.text }}>{statusColors[showDetail.status]?.label}</span>
              <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: `${typeColors[showDetail.property_type]}15`, color: typeColors[showDetail.property_type], textTransform: 'capitalize' }}>{showDetail.property_type}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#064E3B', marginBottom: '20px' }}>฿{showDetail.price?.toLocaleString()}</div>
            <div style={f.row3}>
              {[
                { label: 'Bedrooms', value: showDetail.bedrooms, icon: Bed },
                { label: 'Bathrooms', value: showDetail.bathrooms, icon: Bath },
                { label: 'Area', value: `${showDetail.area_sqm}m²`, icon: Building2 },
              ].map((item, i) => (
                <div key={i} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '6px', textAlign: 'center' }}>
                  <item.icon size={18} style={{ color: 'var(--text-muted)', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              ))}
            </div>
            {showDetail.description && (
              <div style={{ marginTop: '20px' }}>
                <label style={f.label}>Description</label>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{showDetail.description}</p>
              </div>
            )}
            <div style={{ ...f.footer, marginTop: '24px' }}>
              <button style={f.btnPrimary} onClick={() => { setShowDetail(null); setShowEdit({ ...showDetail }); }}><Edit size={16} /> Edit Property</button>
              <button style={f.btnSecondary} onClick={() => setShowDetail(null)}>Close</button>
            </div>
          </>
        )}
      </Modal>

      {/* Edit Property Modal */}
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Property" subtitle={showEdit?.title}>
        {showEdit && renderForm(showEdit, setShowEdit, handleEdit, 'Save Changes')}
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Property" width={400}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Are you sure you want to delete this property? This action cannot be undone.</p>
        <div style={f.footer}>
          <button style={{ ...f.btnDanger, flex: 1, padding: '12px', borderRadius: '6px' }} onClick={handleDelete}><Trash2 size={14} /> Delete</button>
          <button style={{ ...f.btnSecondary, flex: 1 }} onClick={() => setShowDelete(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
