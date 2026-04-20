import { Bell, Search, Sun, Moon } from 'lucide-react';
import { NUDGES } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';

interface TopbarProps {
  readonly title: string;
  readonly subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const urgentCount = NUDGES.filter(n => n.type === 'risk').reduce((s, n) => s + n.count, 0);
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      height: 72,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
    }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 10, padding: '8px 14px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            placeholder="Search clients..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 13, width: 160,
            }}
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          {theme === 'dark'
            ? <Sun size={16} color="var(--accent-amber)" />
            : <Moon size={16} color="var(--accent-violet)" />
          }
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="var(--text-secondary)" />
          {urgentCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#f43f5e', color: '#fff',
              fontSize: 10, fontWeight: 700, borderRadius: '50%',
              width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{urgentCount}</span>
          )}
        </div>

        {/* Date */}
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {new Date('2026-04-20').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>
    </header>
  );
}
