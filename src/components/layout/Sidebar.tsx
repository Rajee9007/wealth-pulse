import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PieChart, Zap, Target, BarChart3,
  Award, Users, Bot, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',                label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/portfolio-health', label: 'Portfolio Health', icon: PieChart },
  { path: '/possibility',      label: 'Possibility',      icon: Zap },
  { path: '/targets',          label: 'Targets',           icon: Target },
  { path: '/performance',      label: 'Performance',       icon: BarChart3 },
  { path: '/badge',            label: 'Badge System',      icon: Award },
  { path: '/clients',          label: 'Clients',           icon: Users },
  { path: '/copilot',          label: 'Copilot',           icon: Bot },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800,
          }}>W</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>WealthPulse</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>Advisor Copilot</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <Icon className="icon" />
              <span style={{ flex: 1 }}>{label}</span>
              {isActive && <ChevronRight size={14} />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer badge */}
      <div style={{
        marginTop: 24, padding: '12px 14px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 12,
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Advisor</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Rajesh Kumar</div>
        <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>🚀 Elite Badge</div>
      </div>
    </aside>
  );
}
