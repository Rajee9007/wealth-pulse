import AppShell from '../components/layout/AppShell';
import { MOCK_CLIENTS, formatCurrency, calcPossibility } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PossibilityPage() {
  const clients = MOCK_CLIENTS;
  const opp   = clients.filter(c => c.segment === 'Opportunity');
  const risk  = clients.filter(c => c.segment === 'Risk');
  const under = clients.filter(c => c.segment === 'Underperforming');

  const oppAum   = opp.reduce((s,c) => s + c.aumPotential, 0);
  const riskAum  = risk.reduce((s,c) => s + c.aumPotential, 0);
  const underAum = under.reduce((s,c) => s + c.aumPotential, 0);

  const oppWeighted   = Math.round(oppAum * 0.6);
  const riskWeighted  = Math.round(riskAum * 0.3);
  const underWeighted = Math.round(underAum * 0.5);
  const totalPossibility = calcPossibility(clients);

  const commPossibility = Math.round(totalPossibility * 0.04);

  const chartData = [
    { name: 'Opportunity\n(×0.6)', raw: oppAum, weighted: oppWeighted, fill: '#10b981' },
    { name: 'Risk\n(×0.3)', raw: riskAum, weighted: riskWeighted, fill: '#f43f5e' },
    { name: 'Underperforming\n(×0.5)', raw: underAum, weighted: underWeighted, fill: '#f59e0b' },
  ];

  return (
    <AppShell title="Possibility Engine" subtitle="Weighted opportunity calculation for AUM & Commission">
      {/* Formula banner */}
      <div style={{
        marginBottom: 24, padding: '16px 24px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
        border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14,
        fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8,
      }}>
        <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Possibility</span> = (Opportunity × 0.6) + (Risk × 0.3) + (Underperforming × 0.5)
      </div>

      {/* Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { seg: 'Opportunity', count: opp.length, raw: oppAum, weighted: oppWeighted, weight: '0.6', color: '#10b981' },
          { seg: 'At Risk', count: risk.length, raw: riskAum, weighted: riskWeighted, weight: '0.3', color: '#f43f5e' },
          { seg: 'Underperforming', count: under.length, raw: underAum, weighted: underWeighted, weight: '0.5', color: '#f59e0b' },
        ].map(item => (
          <div key={item.seg} className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.seg}</div>
              <div style={{
                fontSize: 12, padding: '3px 10px', borderRadius: 20,
                background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}30`,
              }}>×{item.weight} weight</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{item.count} clients · Raw AUM Potential</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(item.raw)}</div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: `${item.color}10`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Weighted Contribution</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{formatCurrency(item.weighted)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div className="glass-card" style={{
          padding: 28, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
          border: '1px solid rgba(59,130,246,0.3)',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Total AUM Possibility</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: '#3b82f6', letterSpacing: -1 }}>{formatCurrency(totalPossibility)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {formatCurrency(oppWeighted)} + {formatCurrency(riskWeighted)} + {formatCurrency(underWeighted)}
          </div>
        </div>
        <div className="glass-card" style={{
          padding: 28, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))',
          border: '1px solid rgba(16,185,129,0.3)',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Commission Possibility</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: '#10b981', letterSpacing: -1 }}>{formatCurrency(commPossibility)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>~4% of AUM Possibility (estimate)</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Raw vs Weighted Contribution by Segment</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,132,255,0.08)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 8, fontSize: 12 }} />
            {chartData.map(d => (
              <Bar key={d.name} dataKey="raw" name="Raw" fill={`${d.fill}60`} radius={[4,4,0,0]} />
            ))}
            <Bar dataKey="weighted" name="Weighted" fill="transparent" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AppShell>
  );
}
