import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import {
  MOCK_CLIENTS, ADVISOR_PERFORMANCE, MONTHLY_TREND,
  formatCurrency, calcPossibility, getBadge,
} from '../data/mockData';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Target, ArrowRight,
  ChevronRight, Phone, RefreshCw,
  ShieldAlert, Sparkles, BarChart3, Wallet, Crosshair, Lightbulb,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── KPI Card ────────────────────────────────────────────────────────────────
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

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  readonly active?: boolean;
  readonly payload?: { name: string; color: string; value: number }[];
  readonly label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-glow)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const perf = ADVISOR_PERFORMANCE;
  const possibility = calcPossibility(MOCK_CLIENTS);
  const badge = getBadge(perf.possibilityAchievement);
  const totalAum = MOCK_CLIENTS.reduce((s, c) => s + c.aum, 0);

  const atRisk = MOCK_CLIENTS.filter(c => c.segment === 'Risk').length;
  const oppo   = MOCK_CLIENTS.filter(c => c.segment === 'Opportunity').length;
  const under  = MOCK_CLIENTS.filter(c => c.segment === 'Underperforming').length;

  const topClients = [...MOCK_CLIENTS]
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 4);

  const [chartTab, setChartTab] = useState<'line' | 'bar'>('bar');

  const segCards = [
    { icon: ShieldAlert, label: 'At Risk', sub: 'Churn / Dormant', value: atRisk, color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', weight: '0.3x in possibility' },
    { icon: Sparkles,    label: 'Opportunity', sub: 'Ready to Invest', value: oppo, color: '#10b981', bg: 'rgba(16,185,129,0.08)', weight: '0.6x in possibility' },
    { icon: TrendingDown, label: 'Underperforming', sub: 'High Potential', value: under, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', weight: '0.5x in possibility' },
  ];

  return (
    <AppShell title="Dashboard" subtitle="">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 28, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
            Good morning, Rajesh 👋
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -1, lineHeight: 1.15 }}>
            You can drive{' '}
            <span style={{ color: '#10b981' }}>{formatCurrency(possibility)}</span>{' '}
            this month
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Based on {MOCK_CLIENTS.length} active clients across opportunity, risk and underperforming segments.
          </div>
        </div>

        {/* Badge pill */}
        <div style={{
          background: `${badge.bg}`, border: `1px solid ${badge.color}40`,
          borderRadius: 14, padding: '14px 20px', minWidth: 160, textAlign: 'right',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Current Badge
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: badge.color }}>{badge.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Score {perf.score}</div>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        <KpiCard label="Possibility (AUM)" value={formatCurrency(possibility)} sub="Weighted across segments" color="#8b5cf6" icon={Lightbulb} />
        <KpiCard label="Target" value={formatCurrency(perf.target)} sub="100% of possibility" color="#3b82f6" icon={Crosshair} />
        <KpiCard label="Actual MTD" value={formatCurrency(perf.actual)} sub={`${perf.targetAchievement}% of target · ${perf.possibilityAchievement.toFixed(0)}% of possibility`} color="#10b981" icon={BarChart3} />
        <KpiCard label="Total AUM" value={formatCurrency(totalAum)} sub={`${MOCK_CLIENTS.length} clients`} color="#f59e0b" icon={Wallet} />
      </div>

      {/* ── Performance vs Target bar ─────────────────────────────── */}
      <div className="glass-card" style={{ padding: '18px 24px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Performance vs Target</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Live tracking · {perf.targetAchievement}% achieved
            </div>
          </div>
          <button
            onClick={() => navigate('/performance')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#3b82f6', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            Details <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ position: 'relative', height: 10, background: 'rgba(59,130,246,0.1)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${Math.min(perf.targetAchievement, 100)}%`,
            background: 'linear-gradient(90deg, #10b981, #3b82f6)',
            borderRadius: 99, transition: 'width 0.8s ease',
          }} />
          {/* 70% min target marker */}
          <div style={{
            position: 'absolute', left: '70%', top: 0, bottom: 0,
            width: 2, background: 'rgba(255,255,255,0.3)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>0</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>70% min target</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatCurrency(perf.target)}</span>
        </div>
      </div>

      {/* ── Portfolio Health Segmentation ────────────────────────── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Portfolio Health Segmentation</div>
          <button
            onClick={() => navigate('/portfolio-health')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            All clients <ArrowRight size={14} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {segCards.map(s => (
            <div
              key={s.label}
              className="glass-card"
              onClick={() => navigate('/portfolio-health')}
              style={{ padding: '20px 22px', cursor: 'pointer', background: s.bg, position: 'relative', overflow: 'hidden' }}
            >
              {/* Icon — top right, borderless with glow */}
              <div style={{
                position: 'absolute', top: 14, right: 16,
                width: 69, height: 69, borderRadius: 14,
                background: `radial-gradient(circle at 60% 40%, ${s.color}22 0%, transparent 75%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0.9,
              }}>
                <s.icon size={40} color={s.color} strokeWidth={1.5} />
              </div>
              {/* Count + labels */}
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {s.value}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.color, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{s.sub}</div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 600, color: s.color,
                background: `${s.color}12`, padding: '3px 8px', borderRadius: 20,
              }}>Weight {s.weight}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AUM Trend Chart (Line + Bar tabs) ────────────────────── */}
      <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            AUM Trend — Last 6 Months
          </div>
          {/* Tab switcher */}
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
          <ComposedChart data={MONTHLY_TREND} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={7} barCategoryGap="10%">
            <defs>
              <linearGradient id="gradActualBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="gradPossBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,132,255,0.08)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 12 }}
              iconType="circle"
              iconSize={8}
            />

            {chartTab === 'bar' ? (
              <>
                <Bar dataKey="possibility" name="Possibility" fill="url(#gradPossBar)" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="actual" name="Actual" fill="url(#gradActualBar)" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="target" name="Target" fill="rgba(16,185,129,0.4)" radius={[4, 4, 0, 0]} barSize={18} />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="possibility" name="Possibility" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: '#8b5cf6' }} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1d4ed8' }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 3, fill: '#10b981' }} />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Copilot Priority Today ───────────────────────────────── */}
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
          {topClients.map(c => {
            const color = c.segment === 'Risk' ? '#f43f5e' : c.segment === 'Opportunity' ? '#10b981' : '#f59e0b';
            const segLabel = c.segment === 'Risk' ? '🔴 At Risk' : c.segment === 'Opportunity' ? '🟢 Opportunity' : '🟡 Underperforming';
            const ActionIcon = c.segment === 'Risk' ? Phone : c.segment === 'Opportunity' ? TrendingUp : RefreshCw;
            const initials = c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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
                {/* Avatar */}
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
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, padding: '2px 8px', borderRadius: 20 }}>
                      Priority {c.urgencyScore}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                    <span style={{ fontSize: 10, color, fontWeight: 600 }}>{segLabel}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, color: 'var(--text-muted)', fontSize: 11 }}>
                    <ActionIcon size={11} />
                    <span>{c.action}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Stats Row ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 22 }}>
        {[
          { label: 'Total Clients', value: String(MOCK_CLIENTS.length), color: '#3b82f6', icon: Users },
          { label: 'Commission Possibility', value: formatCurrency(perf.possibilityCommission), color: '#10b981', icon: Sparkles },
          { label: 'Possibility Achievement', value: `${perf.possibilityAchievement.toFixed(1)}%`, color: '#f59e0b', icon: Target },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${s.color}18`, border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
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
