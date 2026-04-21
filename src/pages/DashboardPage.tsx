import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { useData } from '../context/DataContext';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Target, ArrowRight,
  ChevronRight, Phone, RefreshCw,
  ShieldAlert, Sparkles, BarChart3, Wallet, Crosshair, Lightbulb, CheckCircle,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(v: number): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000)      return `₹${(v / 1_000).toFixed(0)}K`;
  return `₹${v}`;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon: Icon }: {
  readonly label: string; readonly value: string; readonly sub: string;
  readonly color: string; readonly icon: React.ElementType;
}) {
  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: -1 }}>{value}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}18`, border: `1px solid ${color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dashboardSummary, monthlyTrend, performance, advisor, possibility } = useData();

  const { total_aum_inr_cr, segment_counts, top_clients, active_sips, total_clients } = dashboardSummary;
  const possibilityInr = possibility.total_possibility_inr_cr * 10_000_000;

  const [chartTab, setChartTab] = useState<'line' | 'bar'>('bar');

  // Map monthlyTrend keys for recharts
  const chartData = monthlyTrend.map(m => ({
    month:       m.month,
    target:      m.target_inr,
    actual:      m.actual_inr,
    possibility: m.possibility_inr,
  }));

  const segCards = [
    { icon: Sparkles,     label: 'Opportunity',    sub: 'Ready to Invest',  value: segment_counts.Opportunity,    color: '#10b981', bg: 'rgba(16,185,129,0.08)',  weight: '0.6x · Priority 1' },
    { icon: TrendingDown, label: 'Underperforming', sub: 'High Potential',   value: segment_counts.Underperforming, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  weight: '0.5x · Priority 2' },
    { icon: ShieldAlert,  label: 'At Risk',         sub: 'Churn / Dormant',  value: segment_counts.Risk,            color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',   weight: '0.3x · Priority 3' },
    { icon: CheckCircle,  label: 'Stable',          sub: 'Good Portfolio',   value: segment_counts.Stable,          color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  weight: '0.1x · Least Priority' },
  ];

  // Performance bar math
  const ceiling    = Math.max(performance.actual_inr, performance.target_inr) * 1.15;
  const actualPct  = (performance.actual_inr / ceiling) * 100;
  const targetPct  = (performance.target_inr / ceiling) * 100;
  const minTgtPct  = (performance.target_inr * 0.70 / ceiling) * 100;
  const isOver     = performance.actual_inr >= performance.target_inr;
  const barColor   = isOver
    ? 'linear-gradient(90deg, #10b981, #34d399)'
    : 'linear-gradient(90deg, #3b82f6, #60a5fa)';

  return (
    <AppShell title="Dashboard" subtitle="">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
          Good morning, {advisor.name.split(' ')[0]} 👋
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -1, lineHeight: 1.15 }}>
          You can drive{' '}
          <span style={{ color: '#10b981' }}>{formatCurrency(possibilityInr)}</span>{' '}
          this month
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          Based on {total_clients} active clients across opportunity, risk and underperforming segments.
        </div>
      </div>

      {/* ── KPI Row ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        <KpiCard
          label="Possibility (AUM)"
          value={formatCurrency(possibilityInr)}
          sub="Weighted across segments"
          color="#8b5cf6"
          icon={Lightbulb}
        />
        <KpiCard
          label="Target"
          value={formatCurrency(performance.target_inr)}
          sub="Monthly AUM target"
          color="#3b82f6"
          icon={Crosshair}
        />
        <KpiCard
          label="Actual MTD"
          value={formatCurrency(performance.actual_inr)}
          sub={`${performance.target_achievement_pct}% of target · ${performance.possibility_achievement_pct.toFixed(0)}% of possibility`}
          color="#10b981"
          icon={BarChart3}
        />
        <KpiCard
          label="Total AUM"
          value={`₹${total_aum_inr_cr.toFixed(1)}Cr`}
          sub={`${total_clients} clients · ${active_sips} active SIPs`}
          color="#f59e0b"
          icon={Wallet}
        />
      </div>

      {/* ── Performance vs Target bar ───────────────────────────── */}
      <div className="glass-card" style={{ padding: '18px 24px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Performance vs Target</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Live tracking ·{' '}
              <span style={{ color: isOver ? '#10b981' : '#3b82f6', fontWeight: 600 }}>
                {performance.target_achievement_pct}% of target
              </span>
              {isOver && <span style={{ color: '#10b981', fontWeight: 700 }}> · Overperforming 🎯</span>}
            </div>
          </div>
          <button
            onClick={() => navigate('/performance')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            Details <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: 8 }}>
          <div style={{ position: 'relative', height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'visible' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${actualPct}%`,
              background: barColor,
              borderRadius: 99,
              boxShadow: isOver ? '0 0 12px rgba(16,185,129,0.5)' : '0 0 8px rgba(59,130,246,0.4)',
              transition: 'width 0.8s ease',
            }} />
            <div style={{ position: 'absolute', left: `${minTgtPct}%`, top: -3, bottom: -3, width: 1.5, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', left: `${targetPct}%`, top: -6, bottom: -6, width: 2.5, background: '#f59e0b', boxShadow: '0 0 6px rgba(245,158,11,0.7)' }} />
          </div>
          <div style={{
            position: 'absolute',
            left: `${Math.min(actualPct, 92)}%`,
            top: -22,
            transform: 'translateX(-50%)',
            fontSize: 10, fontWeight: 700,
            color: isOver ? '#10b981' : '#60a5fa',
            whiteSpace: 'nowrap',
          }}>
            {formatCurrency(performance.actual_inr)}
          </div>
        </div>

        <div style={{ display: 'flex', position: 'relative', height: 22, marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>₹0</span>
          <span style={{ position: 'absolute', left: `${minTgtPct}%`, transform: 'translateX(-50%)', fontSize: 10, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>70% min</span>
          <span style={{ position: 'absolute', left: `${targetPct}%`, transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>
            🎯 Target {formatCurrency(performance.target_inr)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 4, borderRadius: 99, background: isOver ? '#10b981' : '#3b82f6' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Actual MTD</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 3, height: 12, borderRadius: 1, background: '#f59e0b' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 2, height: 12, borderRadius: 1, background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Min target (70%)</span>
          </div>
        </div>
      </div>

      {/* ── Portfolio Health Segmentation ────────────────────────── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Portfolio Health Segmentation</div>
          <button
            onClick={() => navigate('/clients')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            All clients <ArrowRight size={14} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {segCards.map(s => (
            <div
              key={s.label}
              className="glass-card"
              onClick={() => navigate(`/clients?segment=${s.label === 'At Risk' ? 'Risk' : s.label}`)}
              style={{ padding: '20px 22px', cursor: 'pointer', background: s.bg, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{
                position: 'absolute', top: 14, right: 16,
                width: 69, height: 69, borderRadius: 14,
                background: `radial-gradient(circle at 60% 40%, ${s.color}22 0%, transparent 75%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9,
              }}>
                <s.icon size={40} color={s.color} strokeWidth={1.5} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.color, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{s.sub}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: s.color, background: `${s.color}12`, padding: '3px 8px', borderRadius: 20 }}>
                Weight {s.weight}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AUM Trend Chart ───────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            AUM Trend — Last 6 Months
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
            {(['bar', 'line'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setChartTab(tab)}
                style={{
                  padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: chartTab === tab ? 'rgba(59,130,246,0.3)' : 'transparent',
                  color: chartTab === tab ? '#60a5fa' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                {tab === 'bar' ? '▌▌ Bar' : '〜 Line'}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={4} barCategoryGap="10%">
            <defs>
              <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="colorPoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,132,255,0.08)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="glass-card" style={{ padding: '12px 16px', border: '1px solid var(--border-glow)', background: 'var(--bg-card)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', borderRadius: 12 }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>{label}</div>
                    {payload.map((entry: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                        <div style={{ width: 10, height: 10, background: entry.color ?? entry.fill, borderRadius: 2 }} />
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{entry.name}</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(entry.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }}
              cursor={{ fill: 'var(--bg-primary)', opacity: 0.4 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 12 }} iconType="circle" iconSize={8} />

            {chartTab === 'bar' ? (
              <>
                <Bar dataKey="target"      name="Target"      fill="url(#colorTarget)" radius={[6,6,0,0]} barSize={24} />
                <Bar dataKey="actual"      name="Actual"      fill="url(#colorActual)" radius={[6,6,0,0]} barSize={24} />
                <Bar dataKey="possibility" name="Possibility" fill="url(#colorPoss)"   radius={[6,6,0,0]} barSize={24} />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="target"      name="Target"      stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 3, fill: '#10b981' }} />
                <Line type="monotone" dataKey="actual"      name="Actual"      stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1d4ed8' }} />
                <Line type="monotone" dataKey="possibility" name="Possibility" stroke="#8b5cf6" strokeWidth={2}   strokeDasharray="5 4" dot={{ r: 3, fill: '#8b5cf6' }} />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Copilot Priority Today ────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Copilot Priority Today</span>
          </div>
          <button
            onClick={() => navigate('/copilot')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            Open Copilot <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {top_clients.map(c => {
            const color     = c.profile.segment === 'Risk' ? '#f43f5e' : c.profile.segment === 'Opportunity' ? '#10b981' : '#f59e0b';
            const segLabel  = c.profile.segment === 'Risk' ? '🔴 At Risk' : c.profile.segment === 'Opportunity' ? '🟢 Opportunity' : '🟡 Underperforming';
            const ActionIcon = c.profile.segment === 'Risk' ? Phone : c.profile.segment === 'Opportunity' ? TrendingUp : RefreshCw;
            const initials  = c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div
                key={c.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'border-color 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/copilot')}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${color}20`, border: `1px solid ${color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color,
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link
                      to={`/clients/${c.id}`}
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#3b82f6')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    >
                      {c.name}
                    </Link>
                    <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, padding: '2px 8px', borderRadius: 20 }}>
                      Priority {c.profile.urgency_score}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                    <span style={{ fontSize: 10, color, fontWeight: 600 }}>{segLabel}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, color: 'var(--text-muted)', fontSize: 11 }}>
                    <ActionIcon size={11} />
                    <span>{c.profile.action}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Stats Row ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 22 }}>
        {[
          { label: 'Total Clients',            value: String(total_clients),                                    color: '#3b82f6', icon: Users    },
          { label: 'Commission Possibility',   value: formatCurrency(performance.possibility_commission_inr),   color: '#10b981', icon: Sparkles },
          { label: 'Possibility Achievement',  value: `${performance.possibility_achievement_pct.toFixed(1)}%`, color: '#f59e0b', icon: Target   },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
