import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Zap, Target, BarChart3,
  Award, Users, Bot, ChevronRight, Rocket, Cpu,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',                label: 'Dashboard',         icon: LayoutDashboard },
  { path: '/clients',         label: 'Clients',            icon: Users },
  { path: '/targets',         label: 'Targets',            icon: Target },
  { path: '/performance',     label: 'Performance',        icon: BarChart3 },
  { path: '/badge',           label: 'Badge System',       icon: Award },
  { path: '/copilot',         label: 'Copilot',            icon: Bot },
  { path: '/zero-touch',      label: 'Zero Touch Agent',   icon: Cpu },
  { path: '/possibility',     label: 'Possibility',        icon: Zap },
  { path: '/playbooks',       label: 'Playbooks',          icon: Rocket },
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

      {/* Profile strip */}
      <div style={{
        marginTop: 24, padding: '10px 12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f620, #8b5cf620)',
          border: '1.5px solid #3b82f660',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: '#3b82f6',
        }}>
          RK
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Rajesh Kumar
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Advisor</div>
        </div>
      </div>

    </aside>
  );
}
