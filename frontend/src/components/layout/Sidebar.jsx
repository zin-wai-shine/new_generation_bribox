import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Image, MapPin,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/properties', icon: Building2, label: 'Properties' },
  { path: '/owners', icon: Users, label: 'Owners' },
  { path: '/image-lab', icon: Image, label: 'Image Lab' },
  { path: '/map', icon: MapPin, label: 'Map History' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '260px',
        background: 'var(--bg-sidebar)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        minHeight: '72px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #10b981, #34d399)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={20} color="white" />
        </div>
        {!collapsed && (
          <span style={{
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            whiteSpace: 'nowrap',
          }}>
            Brebox
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));

          return (
            <NavLink
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px 16px' : '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
                background: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-sidebar-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && label}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px',
                  height: '20px',
                  borderRadius: '0 3px 3px 0',
                  background: '#10b981',
                }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          margin: '12px 8px',
          padding: '10px',
          border: 'none',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.06)',
          color: 'var(--text-sidebar)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        {!collapsed && <span style={{ fontSize: '13px' }}>Collapse</span>}
      </button>
    </aside>
  );
}
