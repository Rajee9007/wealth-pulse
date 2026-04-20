import AppShell from '../components/layout/AppShell';
import { ADVISOR_PERFORMANCE, MONTHLY_TREND, formatCurrency, calcScore } from '../data/mockData';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Target, Zap, Activity } from 'lucide-react';

export default function PerformancePage() {
  const perf = ADVISOR_PERFORMANCE;
  const score = calcScore(perf.actual, perf.possibilityAum);

  const radialData = [
    { name: 'Score', value: score, fill: '#10b981' },
  ];

  return (
    <AppShell title="Performance Intelligence" subtitle="Deep dive into your monthly achievements and historical trends.">
      
      {/* ── KPI Grid ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Actual AUM',       value: formatCurrency(perf.actual),         icon: TrendingUp, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Target AUM',       value: formatCurrency(perf.target),         icon: Target,     color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Possibility AUM',  value: formatCurrency(perf.possibilityAum), icon: Zap,        color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
          { label: 'Performance Score',value: score.toString(),                    icon: Activity,   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
        ].map(k => (
          <div key={k.label} className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: k.bg, border: `1px solid ${k.color}30` 
            }}>
              <k.icon size={24} color={k.color} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -0.5 }}>{k.value}</div>
            </div>
            {/* Subtle glow background */}
            <div style={{ position: 'absolute', right: -20, bottom: -20, width: 80, height: 80, background: k.color, opacity: 0.05, filter: 'blur(30px)', borderRadius: '50%' }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: 20, marginBottom: 20 }}>
        
        {/* ── Score & Achievement Overview ────────────────────────── */}
        <div className="glass-card" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Current Period Execution</div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative' }}>
            <div style={{ width: 220, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="75%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={12} background={{ fill: 'var(--bg-primary)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#10b981', letterSpacing: -2, lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Score</div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'flex-end' }}>
            {[
              { label: 'Target Achievement', value: perf.targetAchievement, suffix: '%', color: '#10b981' },
              { label: 'Possibility Harvested', value: perf.possibilityAchievement, suffix: '%', color: '#8b5cf6' },
            ].map(bar => (
              <div key={bar.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{bar.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: bar.color }}>{bar.value.toFixed(1)}{bar.suffix}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', width: `${Math.min(bar.value, 150)}%`, background: bar.color, 
                    borderRadius: 99, boxShadow: `0 0 10px ${bar.color}60` 
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Monthly Trend Chart ────────────────────────────────── */}
        <div className="glass-card" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>6-Month Growth Trajectory</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Actual execution vs target expectations and total market possibility.</div>
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Target', color: '#10b981' },
                { label: 'Actual', color: '#3b82f6' },
                { label: 'Possibility', color: '#8b5cf6' },
              ].map(leg => (
                <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: leg.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{leg.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ flex: 1, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_TREND} barGap={4} barCategoryGap="25%" margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: 'var(--border-subtle)' }} tickLine={false} tickMargin={12} />
                <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
                <Tooltip 
                  formatter={(v: number, name: string) => [formatCurrency(v), name]} 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 12, fontSize: 13, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 700, padding: '2px 0' }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}
                  cursor={{ fill: 'var(--bg-primary)', opacity: 0.4 }}
                />
                <Bar dataKey="target" name="Target" fill="url(#colorTarget)" radius={[6,6,0,0]} />
                <Bar dataKey="actual" name="Actual" fill="url(#colorActual)" radius={[6,6,0,0]} />
                <Bar dataKey="possibility" name="Possibility" fill="url(#colorPoss)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
{/* ── Key Insights ────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px 32px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Intelligence & Insights</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { tag: 'Momentum',  text: 'Actual MTD performance is tracking 12.5% ahead of the 6-month historical average.', color: '#3b82f6' },
            { tag: 'Efficiency', text: 'Target achievement reached 120% this month, the highest execution rate this quarter.', color: '#10b981' },
            { tag: 'Opportunity',text: 'Possibility harvest gap remains at 15.3%. Prioritize high AUM-potential clients to close this gap.', color: '#8b5cf6' },
          ].map(insight => (
            <div key={insight.tag} style={{ display: 'flex', gap: 12, padding: '16px', background: `${insight.color}08`, border: `1px solid ${insight.color}25`, borderRadius: 12 }}>
              <div style={{ width: 4, borderRadius: 4, background: insight.color, alignSelf: 'stretch' }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: insight.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{insight.tag}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{insight.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
