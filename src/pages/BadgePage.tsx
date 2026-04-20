import AppShell from '../components/layout/AppShell';
import { ADVISOR_PERFORMANCE, BADGE_TIERS, getBadge } from '../data/mockData';
import { Shield } from 'lucide-react';

export default function BadgePage() {
  const perf = ADVISOR_PERFORMANCE;
  const pct = perf.possibilityAchievement;
  const badge = getBadge(pct);

  return (
    <AppShell title="Badge System" subtitle="Gamified performance recognition based on possibility achievement">
      {/* Current Badge Hero */}
      <div style={{
        marginBottom: 28, padding: '36px', borderRadius: 20, textAlign: 'center',
        background: `linear-gradient(135deg, ${badge.bg}, rgba(0,0,0,0))`,
        border: `2px solid ${badge.color}50`,
        boxShadow: `0 0 40px ${badge.color}25`,
      }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{badge.label.split(' ')[0]}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: badge.color, letterSpacing: -0.5, marginBottom: 6 }}>
          {badge.label}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          Current badge — {pct.toFixed(1)}% possibility achievement
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', display: 'inline-block', padding: '6px 18px', borderRadius: 20 }}>
          April 2026 · Advisor: Rajesh Kumar
        </div>
      </div>

      {/* Badge Progression */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Badge Progression</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {BADGE_TIERS.map((tier, i) => {
            const isActive = badge.label === tier.label;
            const maxLabel = tier.max === Infinity ? '∞' : `${tier.max}%`;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px', borderRadius: 12,
                background: isActive ? `${tier.color}15` : 'var(--bg-card)',
                border: `1px solid ${isActive ? tier.color : 'var(--border-subtle)'}40`,
                position: 'relative', overflow: 'hidden',
                boxShadow: isActive ? `0 0 20px ${tier.color}20` : 'none',
              }}>
                {isActive && (
                  <div style={{
                    position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 11, fontWeight: 700, color: tier.color, background: `${tier.color}20`,
                    padding: '3px 10px', borderRadius: 20, border: `1px solid ${tier.color}40`,
                  }}>CURRENT ✓</div>
                )}
                <div style={{ fontSize: 28 }}>{tier.label.split(' ')[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? tier.color : 'var(--text-primary)' }}>
                    {tier.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {tier.min}% – {maxLabel} possibility achievement
                  </div>
                </div>
                <div style={{
                  width: 120, height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3, background: tier.color,
                    width: isActive ? `${Math.min(100, ((pct - tier.min) / (tier.max - tier.min)) * 100)}%` : pct > tier.max ? '100%' : '0%',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anti-Gaming Rules */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Shield size={18} color="#f59e0b" />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Anti-Gaming Rules</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { rule: 'Target ≥ 70% of Possibility', status: true, desc: 'Current target meets minimum threshold' },
            { rule: 'Min Client Threshold', status: true, desc: '8 active clients (min 5 required)' },
            { rule: 'Consistent Activity', status: true, desc: '15+ days of activity this month' },
          ].map(r => (
            <div key={r.rule} style={{
              padding: '14px 16px', borderRadius: 10,
              background: r.status ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
              border: `1px solid ${r.status ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: r.status ? '#10b981' : '#f43f5e', marginBottom: 4 }}>
                {r.status ? '✅' : '❌'} {r.rule}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
