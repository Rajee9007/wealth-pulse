import AppShell from '../components/layout/AppShell';
import { ADVISOR_PERFORMANCE, MONTHLY_TREND, formatCurrency, calcScore } from '../data/mockData';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function GaugeBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value.toFixed(1)}%</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

export default function PerformancePage() {
  const perf = ADVISOR_PERFORMANCE;
  const score = calcScore(perf.actual, perf.possibilityAum);

  const radialData = [
    { name: 'Score', value: score, fill: '#3b82f6' },
  ];

  return (
    <AppShell title="Performance Engine" subtitle="Track actual vs target vs possibility">
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Actual AUM', value: formatCurrency(perf.actual), color: '#3b82f6' },
          { label: 'Target', value: formatCurrency(perf.target), color: '#10b981' },
          { label: 'Possibility AUM', value: formatCurrency(perf.possibilityAum), color: '#8b5cf6' },
          { label: 'Performance Score', value: `${score}`, color: '#f59e0b' },
        ].map(c => (
          <div key={c.label} className="glass-card" style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20, marginBottom: 24 }}>
        {/* Radial Score */}
        <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Performance Score</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>100 × log₁₀(1 + Actual / Possibility)</div>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'var(--bg-primary)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#3b82f6', letterSpacing: -2, marginTop: -20 }}>{score}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>out of 100+</div>
        </div>

        {/* Achievement bars */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>Achievement Analysis</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <GaugeBar value={perf.targetAchievement} max={150} color="#10b981" label="Target Achievement %" />
            <GaugeBar value={perf.possibilityAchievement} max={150} color="#3b82f6" label="Possibility Achievement %" />
          </div>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Actual / Target', num: perf.actual, den: perf.target, color: '#10b981' },
              { label: 'Actual / Possibility', num: perf.actual, den: perf.possibilityAum, color: '#3b82f6' },
            ].map(r => (
              <div key={r.label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
                background: `${r.color}10`, border: `1px solid ${r.color}20`, borderRadius: 8,
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>
                  {formatCurrency(r.num)} / {formatCurrency(r.den)} = {((r.num / r.den) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly trend bars */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Monthly AUM Comparison</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MONTHLY_TREND} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,132,255,0.08)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="target" name="Target" fill="#10b98160" radius={[4,4,0,0]} />
            <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="possibility" name="Possibility" fill="#8b5cf660" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AppShell>
  );
}
