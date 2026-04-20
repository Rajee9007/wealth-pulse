import AppShell from '../components/layout/AppShell';
import { ADVISOR_PERFORMANCE, BADGE_TIERS, getBadge, calcScore, formatCurrency } from '../data/mockData';
import { CheckCircle } from 'lucide-react';

export default function BadgePage() {
  const perf        = ADVISOR_PERFORMANCE;
  const pct         = perf.possibilityAchievement;
  const targetPct   = perf.targetAchievement;
  const badge       = getBadge(pct);
  const emoji       = badge.label.split(' ')[0];
  const badgeName   = badge.label.split(' ').slice(1).join(' ');
  const score       = calcScore(perf.actual, perf.possibilityAum);

  const antiGaming = [
    { rule: 'Target ≥ 70% of possibility',        pass: perf.target >= perf.possibilityAum * 0.7 },
    { rule: 'Minimum 5 active clients in pipeline', pass: true },
    { rule: 'Consistent activity across the month', pass: true },
  ];

  return (
    <AppShell title="Performance & Badges" subtitle="Live tracking, score, and gamified badge progression.">

      {/* ── Hero: Current Badge + Score + KPIs ─────────────────────── */}
      <div style={{
        borderRadius: 20, padding: '32px 36px', marginBottom: 20,
        background: 'linear-gradient(135deg, #0f1f3d 0%, #0e2d2a 60%, #061a16 100%)',
        border: `1px solid ${badge.color}35`,
        boxShadow: `0 0 48px ${badge.color}18`,
        display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: 40, alignItems: 'center',
      }}>
        {/* Badge identity */}
        <div>
          <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 10 }}>{emoji}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: badge.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Current Badge</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', letterSpacing: -0.5 }}>{badgeName}</div>
        </div>

        {/* Performance Score */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Performance Score</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: badge.color, letterSpacing: -2, lineHeight: 1, marginBottom: 6 }}>{score.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>100 × log₁₀(1 + actual / possibility)</div>
        </div>

        {/* KPI rows */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 40, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 180 }}>
          {[
            { label: 'Actual MTD',  value: formatCurrency(perf.actual) },
            { label: 'Target',      value: formatCurrency(perf.target) },
            { label: 'Possibility', value: formatCurrency(perf.possibilityAum) },
          ].map(k => (
            <div key={k.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{k.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{k.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Achievement bars ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Target Achievement', sub: 'Actual / Target', value: Math.min(targetPct, 200), display: `${targetPct.toFixed(1)}%`, color: '#10b981' },
          { label: 'Possibility Achievement', sub: 'Actual / Possibility', value: Math.min(pct, 200), display: `${pct.toFixed(1)}%`, color: badge.color },
        ].map(bar => (
          <div key={bar.label} className="glass-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{bar.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{bar.sub}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: bar.color }}>{bar.display}</div>
            </div>
            <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99, background: bar.color,
                width: `${Math.min(bar.value, 100)}%`,
                boxShadow: `0 0 8px ${bar.color}60`,
                transition: 'width 1s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Badge Ladder (horizontal) ──────────────────────────────── */}
      <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <span style={{ fontSize: 16 }}>🏆</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Badge Ladder</span>
        </div>

        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {BADGE_TIERS.map((tier, i) => {
            const tierEmoji = tier.label.split(' ')[0];
            const tierName  = tier.label.split(' ').slice(1).join(' ');
            const isActive  = badge.label === tier.label;
            const isPast    = pct >= tier.max;
            const maxLabel  = tier.max === Infinity ? '∞%' : `${tier.max}%`;

            return (
              <div
                key={i}
                style={{
                  flex: '0 0 auto', minWidth: 100,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '14px 12px', borderRadius: 14,
                  background:  isActive ? `${tier.color}20` : isPast ? `${tier.color}08` : 'var(--bg-primary)',
                  border:      `1px solid ${isActive ? tier.color + '60' : isPast ? tier.color + '25' : 'var(--border-subtle)'}`,
                  boxShadow:   isActive ? `0 0 20px ${tier.color}30` : 'none',
                  transition:  'all 0.2s',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
                    fontSize: 9, fontWeight: 800, color: tier.color,
                    background: `${tier.color}20`, border: `1px solid ${tier.color}50`,
                    padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: 0.5,
                  }}>YOU</div>
                )}
                <div style={{ fontSize: 28, marginBottom: 6, opacity: isPast || isActive ? 1 : 0.35 }}>{tierEmoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? tier.color : isPast ? 'var(--text-secondary)' : 'var(--text-muted)', textAlign: 'center', marginBottom: 3 }}>
                  {tierName}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
                  {tier.min}–{maxLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Anti-Gaming Checks ────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Anti-Gaming Checks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {antiGaming.map(ag => (
            <div key={ag.rule} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={16} color="#10b981" strokeWidth={2} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ag.rule}</span>
            </div>
          ))}
        </div>
      </div>

    </AppShell>
  );
}
