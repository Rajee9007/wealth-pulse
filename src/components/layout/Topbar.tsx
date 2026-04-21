import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Sun, Moon, Settings, LogOut, ChevronDown, User } from 'lucide-react';
import { 
  MOCK_NOTIFICATIONS, ADVISOR_PERFORMANCE, 
  BADGE_TIERS, getBadge 
} from '../../data/mockData';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationDrawer from '../shared/NotificationDrawer';
import { SEG_COLORS } from '../shared/CopilotDrawer';
import { formatCurrency } from '../../data/mockData';

interface TopbarProps {
  readonly title: string;
  readonly subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { clients } = useData();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeCopilotClient, setActiveCopilotClient] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchResults = searchQuery.trim().length > 0 
    ? clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const notifications = MOCK_NOTIFICATIONS;
  const unreadNotifications = notifications.filter(n => n.unread).length;

  const perf  = ADVISOR_PERFORMANCE;
  const badge = getBadge(perf.possibilityAchievement);
  const tierIdx  = BADGE_TIERS.findIndex(t => t.label === badge.label);
  const nextTier = BADGE_TIERS[tierIdx + 1];
  const tierMax  = nextTier ? nextTier.min : badge.max;
  const pct = tierMax === Infinity
    ? 100
    : Math.min(100, Math.round(((perf.possibilityAchievement - badge.min) / Math.max(tierMax - badge.min, 1)) * 100));

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      position: 'relative',
      zIndex: 50,
    }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Search */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 10, padding: '8px 14px',
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              placeholder="Search by client name..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 13, width: 220, transition: 'width 0.2s',
              }}
            />
          </div>
          
          {showSearch && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 12px)', left: 0, width: 340,
              background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              overflow: 'hidden', padding: 12, zIndex: 100,
            }}>
              {searchQuery.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center' }}>
                  <Search size={24} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Search your network</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Type a name to quickly pull up their 360 profile.</div>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8, padding: '0 8px' }}>
                    Top Matches
                  </div>
                  {searchResults.slice(0, 5).map(c => (
                    <div 
                      key={c.id}
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery('');
                        navigate(`/clients/${c.id}`);
                      }}
                      style={{
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: `${SEG_COLORS[c.profile.segment as keyof typeof SEG_COLORS]}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        border: `1px solid ${SEG_COLORS[c.profile.segment as keyof typeof SEG_COLORS]}40`,
                        fontSize: 12, fontWeight: 800, color: SEG_COLORS[c.profile.segment as keyof typeof SEG_COLORS]
                      }}>
                        {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.profile.segment}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)' }}>{formatCurrency(c.profile.aum_inr_cr * 10000000)}</div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ padding: '24px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No clients found</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try searching with a different name.</div>
                </div>
              )}
            </div>
          )}
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
        <div 
          onClick={() => setShowNotifications(true)}
          style={{ position: 'relative', cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bell size={20} color="var(--text-secondary)" />
          {unreadNotifications > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#f43f5e', color: '#fff',
              fontSize: 10, fontWeight: 700, borderRadius: '50%',
              width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 8px rgba(244,63,94,0.5)',
              border: '2px solid var(--bg-secondary)',
            }}>{unreadNotifications}</span>
          )}
        </div>

        {/* Profile avatar + dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 12, padding: '6px 10px 6px 6px',
              transition: 'border-color 0.2s',
            }}
          >
            {/* Avatar with badge ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: `linear-gradient(135deg, ${badge.color}33, ${badge.color}66)`,
                border: `2px solid ${badge.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: badge.color,
                boxShadow: `0 0 10px ${badge.color}44`,
              }}>
                RK
              </div>
              {/* Badge emoji overlay */}
              <div style={{
                position: 'absolute', bottom: -3, right: -4,
                fontSize: 13, lineHeight: 1,
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
              }}>
                {badge.label.split(' ')[0]}
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Rajesh Kumar</div>
              <div style={{ fontSize: 10, color: badge.color, fontWeight: 600 }}>
                {badge.label.split(' ').slice(1).join(' ')}
              </div>
            </div>
            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 272,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              zIndex: 999,
              animation: 'fadeIn 0.15s ease',
            }}>

              {/* Profile header */}
              <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${badge.color}33, ${badge.color}66)`,
                      border: `2.5px solid ${badge.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 17, fontWeight: 800, color: badge.color,
                      boxShadow: `0 0 16px ${badge.color}55`,
                    }}>
                      RK
                    </div>
                    <div style={{
                      position: 'absolute', bottom: -2, right: -5,
                      fontSize: 16, lineHeight: 1,
                      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
                    }}>
                      {badge.label.split(' ')[0]}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Rajesh Kumar</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Advisor · April 2026</div>
                  </div>
                </div>
              </div>

              {/* Badge info card */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Advisor Badge
                </div>

                <div style={{
                  background: `${badge.color}10`,
                  border: `1px solid ${badge.color}30`,
                  borderRadius: 12, padding: '11px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22 }}>{badge.label.split(' ')[0]}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: badge.color, lineHeight: 1.1 }}>
                          {badge.label.split(' ').slice(1).join(' ')}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tier {tierIdx + 1} of {BADGE_TIERS.length}</div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: badge.color,
                      background: `${badge.color}20`, padding: '3px 9px', borderRadius: 20,
                      border: `1px solid ${badge.color}35`,
                    }}>
                      {perf.possibilityAchievement.toFixed(1)}%
                    </div>
                  </div>

                  {/* Tier progress bar */}
                  <div style={{ height: 5, background: `${badge.color}18`, borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: `linear-gradient(90deg, ${badge.color}70, ${badge.color})`,
                      borderRadius: 99,
                      boxShadow: `0 0 6px ${badge.color}88`,
                    }} />
                  </div>

                  {nextTier && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{pct}% to next tier</span>
                      <span style={{ fontSize: 10, color: nextTier.color, fontWeight: 600 }}>
                        Next: {nextTier.label} @ {nextTier.min}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action items */}
              <div style={{ padding: '8px 8px' }}>
                {[
                  { icon: Settings, label: 'Settings', sub: 'Preferences & account' },
                  { icon: LogOut, label: 'Log out', sub: 'End your session', danger: true },
                ].map(({ icon: Icon, label, sub, danger }) => (
                  <button
                    key={label}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'transparent', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: danger ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} color={danger ? '#f43f5e' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: danger ? '#f43f5e' : 'var(--text-primary)' }}>{label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Drawer */}
      {showNotifications && (
        <NotificationDrawer 
          onClose={() => setShowNotifications(false)} 
          onOpenCopilot={(id) => {
            const client = clients.find(c => c.id === id);
            if (client) {
              setActiveCopilotClient(client);
              setShowNotifications(false);
            }
          }}
        />
      )}

      {/* Global AI Copilot (triggered from notifications) */}
      {activeCopilotClient && (
        <CopilotDrawer 
          client={activeCopilotClient} 
          onClose={() => setActiveCopilotClient(null)} 
        />
      )}
    </header>
  );
}
