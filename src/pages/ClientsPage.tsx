import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import { MOCK_CLIENTS, formatCurrency } from '../data/mockData';
import type { Segment, Client } from '../data/mockData';
import {
  Phone, TrendingUp, RefreshCw, ChevronUp, ChevronDown,
  Search, X, MessageSquare, CheckCircle, XCircle, Calendar,
  Clock, Sparkles, ChevronRight,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import CopilotDrawer, { SEG_COLORS, ACTION_ICONS } from '../components/shared/CopilotDrawer';
import type { OutcomeType } from '../components/shared/CopilotDrawer';

/* ─── Types ──────────────────────────────────────────────────────────── */
type SortKey = keyof Pick<Client, 'name' | 'aum' | 'urgencyScore' | 'aumPotential' | 'returns'>;

function SortIcon({ k, sortKey, sortDir }: {
  readonly k: SortKey; readonly sortKey: SortKey; readonly sortDir: 'asc' | 'desc';
}) {
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



/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function ClientsPage() {
  const [segFilter, setSegFilter] = useState<Segment | 'All'>('All');
  const [searchQ,   setSearchQ]   = useState('');
  const [sortKey,   setSortKey]   = useState<SortKey>('aumPotential');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('desc');
  const [copilotClient, setCopilotClient] = useState<Client | null>(null);

  const [searchParams] = useSearchParams();
  const segmentParam = searchParams.get('segment');

  useEffect(() => {
    if (segmentParam) {
      setSegFilter(segmentParam as Segment | 'All');
    }
  }, [segmentParam]);

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
    <AppShell title="Clients" subtitle="Portfolio health and recommended actions per client.">
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 10, padding: '8px 14px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search client name..."
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13, width: 180 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['All', 'Opportunity', 'Underperforming', 'Risk'] as (Segment | 'All')[]).map(s => (
            <button
              key={s}
              onClick={() => setSegFilter(s)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: segFilter === s ? (s === 'All' ? '#3b82f6' : SEG_COLORS[s]) : 'var(--bg-card)',
                color: segFilter === s ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
              }}
            >
              {s === 'Risk' ? '🔴 At Risk' : s === 'Opportunity' ? '🟢 Opportunity' : s === 'Underperforming' ? '🟡 Underperforming' : '🌐 All'}
            </button>
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
              <th style={thStyle('name', sortKey)} onClick={() => handleSort('name')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Client <SortIcon k="name" sortKey={sortKey} sortDir={sortDir} /></span></th>
              <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left' }}>Segment</th>
              <th style={thStyle('aum', sortKey)} onClick={() => handleSort('aum')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>AUM <SortIcon k="aum" sortKey={sortKey} sortDir={sortDir} /></span></th>
              <th style={thStyle('aumPotential', sortKey)} onClick={() => handleSort('aumPotential')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Expected Δ <SortIcon k="aumPotential" sortKey={sortKey} sortDir={sortDir} /></span></th>
              <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left' }}>Reason</th>
              <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const color = SEG_COLORS[c.segment];
              const ActionIcon = ACTION_ICONS[c.segment];
              const isSelected = copilotClient?.id === c.id;
              return (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    background: isSelected ? `${color}08` : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'; }}
                >
                  {/* Client */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: `${color}20`, border: `1.5px solid ${color}50`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, color,
                      }}>
                        {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.lastContacted} · {c.sipActive ? '🟢 SIP Active' : '🔴 SIP Paused'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Segment */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                      background: `${color}15`, color, border: `1px solid ${color}30`,
                    }}>
                      {c.segment === 'Risk' ? '🔴 At Risk' : c.segment === 'Opportunity' ? '🟢 Opportunity' : '🟡 Underperforming'}
                    </span>
                  </td>

                  {/* AUM */}
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
                    {formatCurrency(c.aum)}
                  </td>

                  {/* Expected Δ */}
                  <td style={{ padding: '14px 16px', fontWeight: 700, color, fontSize: 13 }}>
                    +{formatCurrency(c.aumPotential)}
                  </td>

                  {/* Reason */}
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)', maxWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ActionIcon size={13} color={color} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.reason}</span>
                    </div>
                  </td>

                  {/* Open Copilot button */}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setCopilotClient(isSelected ? null : c)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                        background: isSelected
                          ? `${color}25`
                          : 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                        color: isSelected ? color : '#a5b4fc',
                        fontSize: 12, fontWeight: 700,
                        border: `1px solid ${isSelected ? color : 'rgba(99,102,241,0.3)'}`,
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? `0 0 10px ${color}30` : 'none',
                      }}
                    >
                      <Sparkles size={13} />
                      {isSelected ? 'Close' : 'Copilot'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Copilot Drawer */}
      {copilotClient && (
        <CopilotDrawer client={copilotClient} onClose={() => setCopilotClient(null)} />
      )}
    </AppShell>
  );
}
