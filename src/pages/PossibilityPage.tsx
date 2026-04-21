import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../data/mockData';
import type { Client } from '../types/client.types';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  Zap, Coins, Target, Sparkles, Brain, Code, 
  ArrowRight, TrendingUp, ShieldAlert,
  TrendingDown, CheckCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import CopilotDrawer from '../components/shared/CopilotDrawer';


export default function PossibilityPage() {
  const navigate = useNavigate();
  const [copilotClient, setCopilotClient] = useState<Client | null>(null);
  const { clients, possibility } = useData();

  const oppData   = possibility.breakdown.find(b => b.segment === 'Opportunity')!;
  const underData = possibility.breakdown.find(b => b.segment === 'Underperforming')!;
  const riskData  = possibility.breakdown.find(b => b.segment === 'Risk')!;
  const stableData = possibility.breakdown.find(b => b.segment === 'Stable')!;

  const oppAum   = oppData.potential_aum_inr_cr * 10_000_000;
  const riskAum  = riskData.potential_aum_inr_cr * 10_000_000;
  const underAum = underData.potential_aum_inr_cr * 10_000_000;
  const stableAum = stableData.potential_aum_inr_cr * 10_000_000;

  const oppWeighted   = Math.round(oppData.weighted_inr_cr * 10_000_000);
  const riskWeighted  = Math.round(riskData.weighted_inr_cr * 10_000_000);
  const underWeighted = Math.round(underData.weighted_inr_cr * 10_000_000);
  const stableWeighted = Math.round(stableData.weighted_inr_cr * 10_000_000);
  
  const totalPossibility = possibility.total_possibility_inr_cr * 10_000_000;
  const commPossibility = Math.round(totalPossibility * 0.04);

  const topPotentialClients = [...clients]
    .sort((a,b) => b.profile.aum_potential_inr_cr - a.profile.aum_potential_inr_cr)
    .slice(0, 5);

  const pieData = [
    { name: 'Opportunity', value: oppWeighted, color: '#10b981' },
    { name: 'Underperf.',  value: underWeighted, color: '#f59e0b' },
    { name: 'At Risk',     value: riskWeighted,  color: '#f43f5e' },
    { name: 'Stable',      value: stableWeighted > 0 ? stableWeighted : 1, color: '#3b82f6' },
  ];

  const barData = [
    { name: 'Opportunity', raw: oppAum,  weighted: oppWeighted, fill: '#10b981' },
    { name: 'Underperf.',  raw: underAum,weighted: underWeighted, fill: '#f59e0b' },
    { name: 'At Risk',     raw: riskAum, weighted: riskWeighted, fill: '#f43f5e' },
    { name: 'Stable',      raw: stableAum, weighted: stableWeighted, fill: '#3b82f6' },
  ];

  return (
    <AppShell title="Possibility Engine" subtitle="Predictive AUM growth potential and weighted harvesting strategy.">
      
      {/* ── Top Scoreboard ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 24 }}>
        {[
          { label: 'Total AUM Possibility', value: formatCurrency(totalPossibility), sub: 'Next 30-day potential', icon: Zap, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Est. Commission Harvest', value: formatCurrency(commPossibility), sub: 'Based on 4% yield avg', icon: Coins, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
        ].map(k => (
          <div key={k.label} className="glass-card" style={{ padding: '32px 36px', display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: k.bg, border: `1px solid ${k.color}30`, position: 'relative', zIndex: 2
            }}>
              <k.icon size={32} color={k.color} />
            </div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -1 }}>{k.value}</div>
              <div style={{ fontSize: 12, color: k.color, fontWeight: 600, marginTop: 4 }}>{k.sub}</div>
            </div>
            {/* Glow background */}
            <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, background: k.color, opacity: 0.05, filter: 'blur(60px)', borderRadius: '50%' }} />
          </div>
        ))}
      </div>

      {/* ── Segmentation Breakdown ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { seg: 'Opportunity', icon: Sparkles, count: oppData.clients, raw: oppAum, weighted: oppWeighted, weight: '60', color: '#10b981' },
          { seg: 'Underperforming', icon:TrendingDown, count: underData.clients, raw: underAum, weighted: underWeighted, weight: '50', color: '#f59e0b' },
          { seg: 'At Risk', icon: ShieldAlert, count: riskData.clients, raw: riskAum, weighted: riskWeighted, weight: '30', color: '#f43f5e' },
          { seg: 'Stable', icon: CheckCircle, count: stableData.clients, raw: stableAum, weighted: stableWeighted, weight: '10', color: '#3b82f6' },
        ].map(item => (
          <div key={item.seg} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                <item.icon size={20} color={item.color} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.seg}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.count} high-impact clients</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Unweighted Potential</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>{formatCurrency(item.raw)}</div>
            
            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Weighted (Possibility)</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: item.color, background: `${item.color}15`, padding: '2px 8px', borderRadius: 20 }}>{item.weight}% prob.</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: item.color }}>{formatCurrency(item.weighted)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Analytics Grid ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, marginBottom: 24 }}>
        {/* Pie Chart: Mix */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Brain size={16} color="#8b5cf6" />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Possibility Mix</div>
          </div>
          <div style={{ height: 260, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none', zIndex: 1
            }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>
                {formatCurrency(pieData.reduce((s, d) => s + d.value, 0))}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Total</div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="glass-card" style={{ padding: '10px 14px', border: '1px solid var(--border-glow)' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: data.color, marginBottom: 4 }}>{data.name}</div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{formatCurrency(data.value)}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

          </div>
          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Raw vs Weighted */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <TrendingUp size={16} color="#3b82f6" />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Harvesting Gap Analysis (Raw vs Weighted)</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barGap={12} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tickFormatter={v => `₹${v/1000}k`} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card" style={{ padding: '12px 14px', border: '1px solid var(--border-glow)', minWidth: 160 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{label}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {payload.map((p: any) => (
                            <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{p.name}</span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(p.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="raw" name="Raw Potential" fill="rgba(255,255,255,0.1)" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="weighted" name="Weighted Possibility" radius={[6, 6, 0, 0]} barSize={24}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Raw Potential</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Weighted Possibility</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Growth Engines ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={16} color="#f59e0b" />
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Top Growth Candidates (High Potential)</div>
            </div>
            <button onClick={() => navigate('/clients')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all clients <ArrowRight size={14} />
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Segment</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Potential Δ</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {topPotentialClients.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td style={{ padding: '14px 14px' }}>
                    <Link 
                      to={`/clients/${c.id}`}
                      style={{ 
                        fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', 
                        textDecoration: 'none', transition: 'color 0.2s',
                        display: 'block'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    >
                      {c.name}
                    </Link>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.profile.goal_tag}</div>
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <span style={{ 
                      fontSize: 10, padding: '2px 8px', borderRadius: 4, 
                      background: c.profile.segment === 'Opportunity' ? 'rgba(16,185,129,0.1)' 
                        : c.profile.segment === 'Risk' ? 'rgba(244,63,94,0.1)' 
                        : c.profile.segment === 'Stable' ? 'rgba(59,130,246,0.1)'
                        : 'rgba(245,158,11,0.1)', 
                      color: c.profile.segment === 'Opportunity' ? '#10b981' 
                        : c.profile.segment === 'Risk' ? '#f43f5e' 
                        : c.profile.segment === 'Stable' ? '#3b82f6'
                        : '#f59e0b', 
                      fontWeight: 700 
                    }}>
                      {c.profile.segment === 'Risk' ? '🔴 At Risk' : c.profile.segment === 'Opportunity' ? '🟢 Opportunity' : c.profile.segment === 'Underperforming' ? '🟡 Underperforming' : '🔵 Stable'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 14px', textAlign: 'right', fontWeight: 700, color: '#10b981', fontSize: 13 }}>
                    +{formatCurrency(c.profile.aum_potential_inr_cr * 10_000_000)}
                  </td>
                  <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                    <button
                      onClick={() => setCopilotClient(c)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                        color: '#a5b4fc',
                        fontSize: 11, fontWeight: 700,
                        border: '1px solid rgba(99,102,241,0.3)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Sparkles size={11} />
                      Copilot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Engine Logic Banner */}
        <div className="glass-card" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Code size={16} color="#8b5cf6" />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Engine Logic Configuration</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Opportunity Potential', val: '× 0.60', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
              { label: 'Underperforming Potential', val: '× 0.50', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
              { label: 'At Risk Potential', val: '× 0.30', color: '#f43f5e', bg: 'rgba(244,63,94,0.08)' },
            ].map(calc => (
              <div key={calc.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', borderRadius: 10, background: calc.bg,
                border: `1px solid ${calc.color}30`
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{calc.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{calc.val}</span>
              </div>
            ))}
            <div style={{ 
              marginTop: 6, paddingTop: 12, borderTop: '1px dashed var(--border-subtle)', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6' }}>Final Weighted Possibility</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>∑ Sum of Components</span>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Weights represent historically verified conversation-to-conversion probability per segment.
          </div>
        </div>
      </div>

      {copilotClient && (
        <CopilotDrawer client={copilotClient} onClose={() => setCopilotClient(null)} />
      )}
    </AppShell>
  );
}
