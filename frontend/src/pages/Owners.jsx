import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import Modal, { formStyles as f } from '../components/ui/Modal';
import {
  Plus, Search, Phone, Mail, MessageCircle, MoreVertical,
  CheckCircle, AlertCircle, Clock, XCircle, Save, Loader,
  Edit, Trash2, Link2, Send, X, User
} from 'lucide-react';

const initialOwners = [
  { id: '1', name: 'Somchai Rattanakul', phone: '081-234-5678', email: 'somchai@email.com', line_id: 'somchai99', availability_status: 'available', notes: 'Prefers morning calls.', properties: [{}, {}] },
  { id: '2', name: 'Nattaya Sriprasert', phone: '089-876-5432', email: 'nattaya@email.com', line_id: '', availability_status: 'busy', notes: '', properties: [{}] },
  { id: '3', name: 'Prasit Wongsawat', phone: '062-111-2222', email: '', line_id: 'prasit_w', availability_status: 'available', notes: 'Weekend viewings only.', properties: [{}, {}, {}] },
  { id: '4', name: 'Malee Thongchai', phone: '095-333-4444', email: 'malee.t@email.com', line_id: 'malee_t', availability_status: 'unavailable', notes: '', properties: [{}] },
  { id: '5', name: 'Kittisak Phromma', phone: '088-555-6666', email: 'kittisak@email.com', line_id: '', availability_status: 'unknown', notes: 'New contact — not yet verified.', properties: [] },
];

const statusConfig = {
  available: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Available' },
  busy: { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Busy' },
  unavailable: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Unavailable' },
  unknown: { icon: AlertCircle, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: 'Unknown' },
};

const emptyOwner = { name: '', phone: '', email: '', line_id: '', availability_status: 'unknown', notes: '' };

export default function Owners() {
  const toast = useToast();
  const [owners, setOwners] = useState(initialOwners);
  const [search, setSearch] = useState('');

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [showPermission, setShowPermission] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

  // Form
  const [form, setForm] = useState(emptyOwner);
  const [saving, setSaving] = useState(false);
  const [permSending, setPermSending] = useState(false);
  const [permSent, setPermSent] = useState(false);

  const filtered = owners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) || o.phone.includes(search)
  );

  const handleAdd = useCallback(() => {
    if (!form.name || !form.phone) { toast('Name and Phone are required', 'error'); return; }
    setSaving(true);
    setTimeout(() => {
      setOwners(prev => [{ ...form, id: `${Date.now()}`, properties: [] }, ...prev]);
      setShowAdd(false);
      setForm(emptyOwner);
      setSaving(false);
      toast('Owner added successfully!', 'success');
    }, 600);
  }, [form, toast]);

  const handleEdit = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setOwners(prev => prev.map(o => o.id === showEdit.id ? { ...showEdit } : o));
      setShowEdit(null);
      setSaving(false);
      toast('Owner updated!', 'success');
    }, 600);
  }, [showEdit, toast]);

  const handleDelete = useCallback(() => {
    setOwners(prev => prev.filter(o => o.id !== showDelete));
    setShowDelete(null);
    toast('Owner removed', 'info');
  }, [showDelete, toast]);

  const handleSendPermission = useCallback(() => {
    setPermSending(true);
    setTimeout(() => {
      setPermSending(false);
      setPermSent(true);
      toast(`Permission link sent to ${showPermission.name}!`, 'success');
    }, 1500);
  }, [showPermission, toast]);

  const handleStatusChange = useCallback((id, newStatus) => {
    setOwners(prev => prev.map(o => o.id === id ? { ...o, availability_status: newStatus } : o));
    setShowMenu(null);
    toast(`Status changed to ${statusConfig[newStatus]?.label}`, 'success');
  }, [toast]);

  const renderOwnerForm = (data, setData, onSubmit, submitLabel) => (
    <>
      <div style={f.field}>
        <label style={f.label}>Full Name *</label>
        <input style={f.input} value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="e.g. Somchai Rattanakul" />
      </div>
      <div style={f.row}>
        <div style={f.field}>
          <label style={f.label}>Phone Number *</label>
          <input style={f.input} value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} placeholder="081-234-5678" />
        </div>
        <div style={f.field}>
          <label style={f.label}>Email</label>
          <input style={f.input} type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} placeholder="email@example.com" />
        </div>
      </div>
      <div style={f.row}>
        <div style={f.field}>
          <label style={f.label}>LINE ID</label>
          <input style={f.input} value={data.line_id} onChange={e => setData({ ...data, line_id: e.target.value })} placeholder="line_id" />
        </div>
        <div style={f.field}>
          <label style={f.label}>Availability</label>
          <select style={f.select} value={data.availability_status} onChange={e => setData({ ...data, availability_status: e.target.value })}>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>
      <div style={f.field}>
        <label style={f.label}>Notes</label>
        <textarea style={f.textarea} value={data.notes || ''} onChange={e => setData({ ...data, notes: e.target.value })} placeholder="Any notes about this owner..." />
      </div>
      <div style={f.footer}>
        <button style={f.btnPrimary} onClick={onSubmit} disabled={saving || !data.name}>
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
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Owners</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{filtered.length} contacts</p>
        </div>
        <button onClick={() => { setForm(emptyOwner); setShowAdd(true); }} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg, #064E3B, #065f46)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 8px rgba(6,78,59,0.3)',
        }}>
          <Plus size={16} /> Add Owner
        </button>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)', borderRadius: '12px', padding: '10px 18px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search owners by name or phone..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>}
      </div>

      {/* Owner Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {filtered.map((owner, i) => {
          const status = statusConfig[owner.availability_status] || statusConfig.unknown;
          const StatusIcon = status.icon;
          return (
            <div key={owner.id} className="animate-fade-in"
              onClick={() => setShowDetail(owner)}
              style={{
                background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '20px',
                transition: 'all 0.3s', cursor: 'pointer', animationDelay: `${i * 60}ms`, animationFillMode: 'backwards', position: 'relative',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #064E3B, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: 700 }}>{owner.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{owner.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <StatusIcon size={13} style={{ color: status.color }} />
                      <span style={{ fontSize: '12px', color: status.color, fontWeight: 500 }}>{status.label}</span>
                    </div>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); setShowMenu(showMenu === owner.id ? null : owner.id); }} style={{
                  width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
                }}>
                  <MoreVertical size={14} />
                </button>
                {showMenu === owner.id && (
                  <div onClick={e => e.stopPropagation()} style={{
                    position: 'absolute', top: '60px', right: '16px', background: 'var(--bg-card)',
                    borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden', zIndex: 10, minWidth: '150px',
                  }}>
                    <button onClick={() => { setShowMenu(null); setShowEdit({ ...owner }); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '13px', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Edit size={14} /> Edit
                    </button>
                    {['available', 'busy', 'unavailable'].filter(s => s !== owner.availability_status).map(s => (
                      <button key={s} onClick={() => handleStatusChange(owner.id, s)} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 14px', border: 'none', background: 'transparent',
                        cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: statusConfig[s]?.color, textAlign: 'left',
                      }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        → {statusConfig[s]?.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border-color)' }}>
                      <button onClick={() => { setShowMenu(null); setShowDelete(owner.id); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: '13px', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Phone size={14} /> {owner.phone}</div>
                {owner.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Mail size={14} /> {owner.email}</div>}
                {owner.line_id && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><MessageCircle size={14} /> LINE: {owner.line_id}</div>}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{owner.properties?.length || 0} properties</span>
                <button onClick={e => { e.stopPropagation(); setPermSent(false); setShowPermission(owner); }} style={{
                  padding: '5px 12px', borderRadius: '6px', border: 'none', background: 'rgba(6,78,59,0.08)', color: '#064E3B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,78,59,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,78,59,0.08)'}>
                  Send Permission
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* === MODALS === */}

      {/* Add Owner */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Owner" subtitle="Create a new property owner contact">
        {renderOwnerForm(form, setForm, handleAdd, 'Add Owner')}
      </Modal>

      {/* Edit Owner */}
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Owner" subtitle={showEdit?.name}>
        {showEdit && renderOwnerForm(showEdit, setShowEdit, handleEdit, 'Save Changes')}
      </Modal>

      {/* View Detail */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.name || ''} subtitle="Owner Details" width={480}>
        {showDetail && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #064E3B, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px', fontWeight: 700 }}>{showDetail.name.charAt(0)}</div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>{showDetail.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  {(() => { const s = statusConfig[showDetail.availability_status]; const I = s.icon; return <><I size={14} style={{ color: s.color }} /><span style={{ fontSize: '13px', color: s.color, fontWeight: 500 }}>{s.label}</span></>; })()}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {[
                { icon: Phone, label: 'Phone', value: showDetail.phone, action: () => { window.open(`tel:${showDetail.phone}`); toast('Calling...', 'info'); } },
                showDetail.email && { icon: Mail, label: 'Email', value: showDetail.email, action: () => { window.open(`mailto:${showDetail.email}`); toast('Opening email client...', 'info'); } },
                showDetail.line_id && { icon: MessageCircle, label: 'LINE', value: showDetail.line_id, action: () => toast('Opening LINE...', 'info') },
              ].filter(Boolean).map((item, i) => (
                <button key={i} onClick={item.action} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px',
                  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s',
                }} onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                  <item.icon size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                </button>
              ))}
            </div>
            {showDetail.notes && (
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Notes</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{showDetail.notes}</div>
              </div>
            )}
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{showDetail.properties?.length || 0} linked properties</div>
            <div style={f.footer}>
              <button style={f.btnPrimary} onClick={() => { setShowDetail(null); setShowEdit({ ...showDetail }); }}><Edit size={16} /> Edit</button>
              <button style={f.btnSecondary} onClick={() => { setShowDetail(null); setPermSent(false); setShowPermission(showDetail); }}><Send size={16} /> Send Permission</button>
            </div>
          </>
        )}
      </Modal>

      {/* Send Permission */}
      <Modal open={!!showPermission} onClose={() => { setShowPermission(null); setPermSent(false); }} title="Send Permission Link" subtitle={`To: ${showPermission?.name}`} width={460}>
        {showPermission && (
          <>
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Generated Permission Link</div>
              <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, wordBreak: 'break-all' }}>
                https://brebox.app/verify/{Math.random().toString(36).substring(2, 10)}
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              This link will be sent via WhatsApp/SMS to <strong>{showPermission.name}</strong> ({showPermission.phone}).
              When they click <strong>YES</strong>, the property will be unlocked automatically.
            </p>
            {permSent ? (
              <div style={{ padding: '14px', background: 'rgba(16,185,129,0.06)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>Permission Link Sent!</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Waiting for owner approval...</div>
                </div>
              </div>
            ) : (
              <button style={f.btnPrimary} onClick={handleSendPermission} disabled={permSending}>
                {permSending ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><Send size={16} /> Send via WhatsApp/SMS</>}
              </button>
            )}
          </>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Remove Owner" width={400}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Are you sure? This will remove the owner and unlink all properties.</p>
        <div style={f.footer}>
          <button style={{ ...f.btnDanger, flex: 1, padding: '12px', borderRadius: '10px' }} onClick={handleDelete}><Trash2 size={14} /> Remove</button>
          <button style={{ ...f.btnSecondary, flex: 1 }} onClick={() => setShowDelete(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
