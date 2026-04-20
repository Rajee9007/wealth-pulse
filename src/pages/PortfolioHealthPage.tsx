import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { MOCK_CLIENTS, formatCurrency } from '../data/mockData';
import type { Client, Segment } from '../data/mockData';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Phone, TrendingUp, RefreshCw, ChevronRight } from 'lucide-react';

const SEG_CONFIG: Record<Segment, { color: string; bg: string; emoji: string; action: string; actionLabel: string; icon: React.ElementType }> = {
  Risk:           { color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', emoji: '🔴', action: 'Reactivate SIP', actionLabel: 'Re-engage', icon: Phone },
  Opportunity:    { color: '#10b981', bg: 'rgba(16,185,129,0.08)', emoji: '🟢', action: 'Upsell / Top-up',  actionLabel: 'Upsell',    icon: TrendingUp },
  Underperforming:{ color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', emoji: '🟡', action: 'Rebalance',        actionLabel: 'Rebalance', icon: RefreshCw },
};

const SEGMENTS: Segment[] = ['Risk', 'Opportunity', 'Underperforming'];

function ClientCard({ client }: { client: Client }) {
  const cfg = SEG_CONFIG[client.segment];
  const ActionIcon = cfg.icon;
  return (
    <div className="glass-card" style={{ padding: 18, cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)'}}>{client.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {client.goalTag} · {client.riskProfile}
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`,
        }}>
          {cfg.emoji} {client.segment}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AUM</div><div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{formatCurrency(client.aum)}</div></div>
        <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Potential</div><div style={{ fontWeight: 700, fontSize: 15, color: cfg.color }}>{formatCurrency(client.aumPotential)}</div></div>
        <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Returns</div><div style={{ fontWeight: 700, fontSize: 15, color: client.returns < 8 ? '#f43f5e' : '#10b981' }}>{client.returns}%</div></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: cfg.color }}>
          <ActionIcon size={13} /> {cfg.action}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Urgency: <span style={{ color: client.urgencyScore > 90 ? '#f43f5e' : '#f59e0b', fontWeight: 600 }}>{client.urgencyScore}</span>
        </div>
      </div>
    </div>
  );
}

const PIE_DATA = SEGMENTS.map(seg => ({
  name: seg,
  value: MOCK_CLIENTS.filter(c => c.segment === seg).length,
  color: SEG_CONFIG[seg].color,
}));

export default function PortfolioHealthPage() {
  const [activeTab, setActiveTab] = useState<Segment | 'All'>('All');
  const filtered = activeTab === 'All' ? MOCK_CLIENTS : MOCK_CLIENTS.filter(c => c.segment === activeTab);

  return (
    <AppShell title="Portfolio Health" subtitle="Client segmentation — identify risks and opportunities">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Pie + Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Client Segments</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {PIE_DATA.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} clients`]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 8, fontSize: 12 }} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {SEGMENTS.map(seg => {
            const clients = MOCK_CLIENTS.filter(c => c.segment === seg);
            const cfg = SEG_CONFIG[seg];
            return (
              <div key={seg} className="glass-card" style={{ padding: '14px 18px', background: cfg.bg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>{cfg.emoji} {seg}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{clients.length} clients</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg AUM: {formatCurrency(clients.reduce((s,c)=>s+c.aum,0)/clients.length)}</div>
                  </div>
                  <ChevronRight size={20} color={cfg.color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Client Cards */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['All', ...SEGMENTS] as (Segment | 'All')[]).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  background: activeTab === t ? (t === 'All' ? '#3b82f6' : SEG_CONFIG[t].color) : 'var(--bg-card)',
                  color: activeTab === t ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {t === 'All' ? '🌐 All' : `${SEG_CONFIG[t].emoji} ${t}`}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {filtered.map(c => <ClientCard key={c.id} client={c} />)}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
