import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { MOCK_CLIENTS, formatCurrency } from '../data/mockData';
import type { Segment, Client } from '../data/mockData';
import { Phone, TrendingUp, RefreshCw, ChevronUp, ChevronDown, Search } from 'lucide-react';

const SEG_COLORS: Record<Segment, string> = {
  Risk: '#f43f5e', Opportunity: '#10b981', Underperforming: '#f59e0b',
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  Risk: Phone, Opportunity: TrendingUp, Underperforming: RefreshCw,
};

type SortKey = keyof Pick<Client, 'name' | 'aum' | 'urgencyScore' | 'returns'>;

function SortIcon({ k, sortKey, sortDir }: { readonly k: SortKey; readonly sortKey: SortKey; readonly sortDir: 'asc' | 'desc' }) {
  if (sortKey !== k) return null;
  return sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />;
}

function thStyle(k: SortKey, sortKey: SortKey): React.CSSProperties {
  return {
    padding: '12px 16px', textAlign: 'left' as const, fontSize: 12, fontWeight: 600,
    color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
    background: sortKey === k ? 'rgba(59,130,246,0.05)' : 'transparent',
  };
}

export default function ClientsPage() {
  const [segFilter, setSegFilter] = useState<Segment | 'All'>('All');
  const [searchQ, setSearchQ] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('urgencyScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = MOCK_CLIENTS
    .filter(c => segFilter === 'All' || c.segment === segFilter)
    .filter(c => c.name.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });



  return (
    <AppShell title="Clients" subtitle="All clients with segmentation, AUM and recommended actions">
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 10, padding: '8px 14px', flex: '0 0 220px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search client name..."
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13, width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['All', 'Risk', 'Opportunity', 'Underperforming'] as (Segment | 'All')[]).map(s => (
            <button
              key={s}
              onClick={() => setSegFilter(s)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: segFilter === s ? (s === 'All' ? '#3b82f6' : SEG_COLORS[s]) : 'var(--bg-card)',
                color: segFilter === s ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
              }}
            >{s === 'Risk' ? '🔴 At Risk' : s === 'Opportunity' ? '🟢 Opportunity' : s === 'Underperforming' ? '🟡 Underperforming' : '🌐 All'}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={thStyle('name', sortKey)} onClick={() => handleSort('name')}>Client <SortIcon k="name" sortKey={sortKey} sortDir={sortDir} /></th>
              <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left' }}>Segment</th>
              <th style={thStyle('aum', sortKey)} onClick={() => handleSort('aum')}>AUM <SortIcon k="aum" sortKey={sortKey} sortDir={sortDir} /></th>
              <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left' }}>Potential</th>
              <th style={thStyle('returns', sortKey)} onClick={() => handleSort('returns')}>Returns <SortIcon k="returns" sortKey={sortKey} sortDir={sortDir} /></th>
              <th style={thStyle('urgencyScore', sortKey)} onClick={() => handleSort('urgencyScore')}>Urgency <SortIcon k="urgencyScore" sortKey={sortKey} sortDir={sortDir} /></th>
              <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left' }}>SIP</th>
              <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const color = SEG_COLORS[c.segment];
              const ActionIcon = ACTION_ICONS[c.segment];
              return (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.id} · {c.goalTag}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                      background: `${color}15`, color, border: `1px solid ${color}30`,
                    }}>{c.segment === 'Risk' ? '🔴 At Risk' : c.segment === 'Opportunity' ? '🟢 Opportunity' : '🟡 Underperforming'}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{formatCurrency(c.aum)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color, fontSize: 13 }}>{formatCurrency(c.aumPotential)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: c.returns < 8 ? '#f43f5e' : '#10b981', fontSize: 13 }}>{c.returns}%</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 800,
                      background: c.urgencyScore > 90 ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
                      color: c.urgencyScore > 90 ? '#f43f5e' : '#f59e0b',
                    }}>{c.urgencyScore}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 9px', borderRadius: 20,
                      background: c.sipActive ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                      color: c.sipActive ? '#10b981' : '#f43f5e', fontWeight: 600,
                    }}>{c.sipActive ? '● Active' : '● Paused'}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color, fontWeight: 500 }}>
                      <ActionIcon size={13} /> {c.action}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
