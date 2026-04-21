import { useState, useEffect, useRef } from 'react';
import AppShell from '../components/layout/AppShell';
import { useData } from '../context/DataContext';
import type { Client, Segment } from '../types/client.types';
import { formatCurrency } from '../data/mockData';
import {
  Phone, TrendingUp, RefreshCw, ChevronUp, ChevronDown,
  Search, X, MessageSquare, CheckCircle, XCircle, Calendar,
  Clock, Sparkles, ChevronRight,
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import CopilotDrawer, { SEG_COLORS, ACTION_ICONS } from '../components/shared/CopilotDrawer';
import type { OutcomeType } from '../components/shared/CopilotDrawer';

/* ─── Types ──────────────────────────────────────────────────────────── */
type SortKey = 'name' | 'aum_inr_cr' | 'urgency_score' | 'aum_potential_inr_cr' | 'ytd_return_pct';

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
  const { clients } = useData();
  const [segFilter, setSegFilter] = useState<Segment | 'All'>('All');
  const [searchQ,   setSearchQ]   = useState('');
  const [sortKey,   setSortKey]   = useState<SortKey>('aum_potential_inr_cr');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('desc');
  const [copilotClient, setCopilotClient] = useState<Client | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();
  const segmentParam = searchParams.get('segment');

  useEffect(() => {
    if (segmentParam) {
      setSegFilter(segmentParam as Segment | 'All');
    }
  }, [segmentParam]);

  // Infinite Scroll Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 20);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [segFilter, searchQ]); // Reset observer if filters change

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(20);
  }, [segFilter, searchQ]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = clients
    .filter(c => segFilter === 'All' || c.profile.segment === segFilter)
    .filter(c => c.name.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a, b) => {
      let av: number | string = 0; let bv: number | string = 0;
      if (sortKey === 'name') { av = a.name; bv = b.name; }
      else { av = a.profile[sortKey] as number; bv = b.profile[sortKey] as number; }
      
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  const displayClients = filtered.slice(0, visibleCount);

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
          {(['All', 'Opportunity', 'Underperforming', 'Risk', 'Stable'] as (Segment | 'All')[]).map(s => (
            <button
              key={s}
              onClick={() => setSegFilter(s)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: segFilter === s ? (s === 'All' ? '#3b82f6' : SEG_COLORS[s]) : 'var(--bg-card)',
                color: segFilter === s ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
              }}
            >
              {s === 'Risk' ? '🔴 At Risk' : s === 'Opportunity' ? '🟢 Opportunity' : s === 'Underperforming' ? '🟡 Underperforming' : s === 'Stable' ? '🔵 Stable' : '🌐 All'}
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
              <th style={thStyle('aum_inr_cr', sortKey)} onClick={() => handleSort('aum_inr_cr')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>AUM <SortIcon k="aum_inr_cr" sortKey={sortKey} sortDir={sortDir} /></span></th>
              <th style={thStyle('aum_potential_inr_cr', sortKey)} onClick={() => handleSort('aum_potential_inr_cr')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Expected Δ <SortIcon k="aum_potential_inr_cr" sortKey={sortKey} sortDir={sortDir} /></span></th>
              <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left' }}>Reason</th>
              <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayClients.map((c, i) => {
              const color = SEG_COLORS[c.profile.segment];
              const ActionIcon = ACTION_ICONS[c.profile.segment];
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
                        <Link 
                          to={`/clients/${c.id}`}
                          style={{ 
                            fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', 
                            textDecoration: 'none', transition: 'color 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        >
                          {c.name}
                        </Link>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.profile.last_contacted} · {c.profile.sip_active ? '🟢 SIP Active' : '🔴 SIP Paused'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Segment */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                      background: `${color}15`, color, border: `1px solid ${color}30`,
                    }}>
                      {c.profile.segment === 'Risk' ? '🔴 At Risk' : c.profile.segment === 'Opportunity' ? '🟢 Opportunity' : c.profile.segment === 'Underperforming' ? '🟡 Underperforming' : '🔵 Stable'}
                    </span>
                  </td>

                  {/* AUM */}
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
                    {formatCurrency(c.profile.aum_inr_cr * 10_000_000)}
                  </td>

                  {/* Expected Δ */}
                  <td style={{ padding: '14px 16px', fontWeight: 700, color, fontSize: 13 }}>
                    +{formatCurrency(c.profile.aum_potential_inr_cr * 10_000_000)}
                  </td>

                  {/* Reason */}
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)', maxWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ActionIcon size={13} color={color} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.profile.reason}</span>
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

      {/* Sentinel / Loader */}
      {visibleCount < filtered.length && (
        <div 
          ref={loaderRef}
          style={{ 
            padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
          }}
        >
          <div className="shimmer" style={{ width: '80%', height: 40, borderRadius: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            Loading more clients ({visibleCount} of {filtered.length})
          </div>
        </div>
      )}

      {/* Copilot Drawer */}
      {copilotClient && (
        <CopilotDrawer client={copilotClient} onClose={() => setCopilotClient(null)} />
      )}
    </AppShell>
  );
}
