
import { 
  X, Bell, Zap, ShieldAlert, CheckCircle, Brain, 
  ChevronRight, Sparkles, Clock, Check
} from 'lucide-react';
import { MOCK_NOTIFICATIONS, type Notification } from '../../data/mockData';

interface NotificationDrawerProps {
  onClose: () => void;
  onOpenCopilot: (clientId: string) => void;
}

export default function NotificationDrawer({ onClose, onOpenCopilot }: NotificationDrawerProps) {
  const notifications = MOCK_NOTIFICATIONS;
  const unreadCount = notifications.filter(n => n.unread).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'growth': return <Zap size={16} color="#10b981" />;
      case 'risk': return <ShieldAlert size={16} color="#f43f5e" />;
      case 'success': return <CheckCircle size={16} color="#3b82f6" />;
      case 'insight': return <Brain size={16} color="#8b5cf6" />;
      default: return <Bell size={16} color="#94a3b8" />;
    }
  };

  const getTypeStyle = (type: Notification['type']) => {
    switch (type) {
      case 'growth': return { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Growth Opportunity' };
      case 'risk': return { bg: 'rgba(244,63,94,0.1)', color: '#f43f5e', label: 'Risk Alert' };
      case 'success': return { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', label: 'Success' };
      case 'insight': return { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', label: 'Strategy Insight' };
      default: return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', label: 'Update' };
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          zIndex: 200, animation: 'fadeIn 0.2s ease',
        }} 
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
        zIndex: 201, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        boxShadow: '-24px 0 80px rgba(0,0,0,0.5)',
        animation: 'slideInRight 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bell size={20} color="#3b82f6" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Notifications</h2>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase' }}>
                  {unreadCount} Unread Alerts
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} color="var(--text-muted)" />
            </button>
          </div>
          
          <button style={{
            width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.2s'
          }}>
            <Check size={14} /> Mark all as read
          </button>
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, padding: '12px' }}>
          {notifications.map((n) => {
            const style = getTypeStyle(n.type);
            return (
              <div 
                key={n.id}
                style={{
                  padding: '16px', borderRadius: 16, marginBottom: 12,
                  background: n.unread ? 'rgba(59,130,246,0.04)' : 'transparent',
                  border: `1px solid ${n.unread ? 'rgba(59,130,246,0.15)' : 'var(--border-subtle)'}`,
                  position: 'relative', transition: 'all 0.2s'
                }}
              >
                {n.unread && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 8, height: 8, borderRadius: '50%', background: '#3b82f6',
                    boxShadow: '0 0 8px rgba(59,130,246,0.6)'
                  }} />
                )}

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {getIcon(n.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: style.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {style.label}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-muted)', fontSize: 10 }}>
                        <Clock size={10} /> {n.time}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                      {n.message}
                    </div>

                    {n.relatedClientId && (
                      <button 
                        onClick={() => onOpenCopilot(n.relatedClientId!)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.3)',
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                          color: '#a5b4fc', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Sparkles size={11} /> Open Copilot <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            <Brain size={14} /> 
            <span>AI is constantly monitoring for growth opportunities.</span>
          </div>
        </div>
      </div>
    </>
  );
}
