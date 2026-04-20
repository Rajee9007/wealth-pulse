import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { MOCK_CLIENTS, formatCurrency } from '../data/mockData';
import type { Segment, Client } from '../data/mockData';
import {
  Phone, TrendingUp, RefreshCw, ChevronUp, ChevronDown,
  Search, X, MessageSquare, CheckCircle, XCircle, Calendar,
  Clock, Sparkles, ChevronRight,
} from 'lucide-react';

/* ─── Segment helpers ───────────────────────────────────────────────── */
const SEG_COLORS: Record<Segment, string> = {
  Risk: '#f43f5e', Opportunity: '#10b981', Underperforming: '#f59e0b',
};
const ACTION_ICONS: Record<string, React.ElementType> = {
  Risk: Phone, Opportunity: TrendingUp, Underperforming: RefreshCw,
};

/* ─── AI Conversation guides (mirrors CopilotPage) ──────────────────── */
const CONVERSATION_GUIDES: Record<string, { topic: string; point: string }[]> = {
  Risk: [
    { topic: 'Open with empathy',     point: '"We noticed your SIP paused / no recent activity. Just checking in."' },
    { topic: 'Understand reason',      point: 'Ask: "Was it a cash flow issue, or reconsidering your goals?"' },
    { topic: 'Educate on impact',      point: 'Show: SIP break impact on goal corpus with concrete numbers.' },
    { topic: 'Offer alternatives',     point: 'Suggest: Lower SIP, pause vs stop difference, liquid fund temporarily.' },
    { topic: 'Reactivate commitment',  point: 'Ask: "Can we restart at a lower amount to keep momentum?"' },
    { topic: 'Set follow-up',          point: 'Book next call / reminder in 7 days.' },
  ],
  Opportunity: [
    { topic: 'Acknowledge investment', point: '"Your portfolio is doing well. You\'ve been consistent — great job!"' },
    { topic: 'Identify idle money',    point: '"We noticed significant idle savings. It could work harder for you."' },
    { topic: 'Discuss goal alignment', point: 'Ask: "Any upcoming goals — child education, home, retirement?"' },
    { topic: 'Present opportunity',    point: 'Suggest: SIP top-up, new equity/hybrid fund, lump sum deployment.' },
    { topic: 'Show projection',        point: 'Show corpus growth with extra monthly investment over Y years.' },
    { topic: 'Soft close',             point: '"Shall I set up a top-up starting this month?"' },
  ],
  Underperforming: [
    { topic: 'Start with review',      point: '"Let\'s look at how your portfolio has been performing overall."' },
    { topic: 'Highlight underperformance', point: 'Show funds lagging benchmark or category peers.' },
    { topic: 'Explain root cause',     point: 'Sector concentration, poor allocation, outdated fund choice.' },
    { topic: 'Propose rebalancing',    point: 'Suggest: Switch from underperforming fund → better alternative.' },
    { topic: 'Risk profile check',     point: '"Has your risk appetite changed since we last spoke?"' },
    { topic: 'Get buy-in',             point: '"I\'d recommend moving from Fund A to Fund B. Want me to process this?"' },
  ],
};

const AI_INSIGHTS: Record<string, string[]> = {
  Risk: [
    'SIP interruption compounds over time — even 3 months of pause can erode ₹1–2L from goal corpus.',
    'Clients in this segment are 3× more likely to churn if not contacted within 30 days.',
    'A proactive call increases reactivation rate by 68% vs waiting for client to reach out.',
  ],
  Opportunity: [
    'Idle savings in savings account lose ~5% in real terms annually vs equity over 10 years.',
    'Salary-hike months are optimal for top-up pitches — clients are 2× more receptive.',
    'Small SIP top-ups of ₹5–10K/month can add ₹30–50L to 20-year corpus.',
  ],
  Underperforming: [
    'Sector-heavy portfolios underperform diversified funds in 7 out of 10 market cycles.',
    'Rebalancing conversation is best initiated post-quarterly review — client is already primed.',
    'Fund switch framing as "upgrade" (not "loss") improves buy-in by 45%.',
  ],
};

/* ─── Types ──────────────────────────────────────────────────────────── */
type SortKey = keyof Pick<Client, 'name' | 'aum' | 'urgencyScore' | 'aumPotential' | 'returns'>;
type OutcomeType = 'Interested' | 'Follow-up' | 'Not Interested';

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

/* ─── Copilot Drawer ─────────────────────────────────────────────────── */
function CopilotDrawer({ client, onClose }: {
  readonly client: Client; readonly onClose: () => void;
}) {
  const color   = SEG_COLORS[client.segment];
  const guide   = CONVERSATION_GUIDES[client.segment];
  const insights = AI_INSIGHTS[client.segment];
  const segLabel = client.segment === 'Risk' ? '🔴 At Risk'
    : client.segment === 'Opportunity' ? '🟢 Opportunity' : '🟡 Underperforming';

  const [outcomeFor, setOutcomeFor]   = useState<OutcomeType | null>(null);
  const [outcomeNote, setOutcomeNote] = useState('');
  const [savedOutcome, setSavedOutcome] = useState<{ result: OutcomeType; note: string } | null>(null);

  function logOutcome() {
    if (!outcomeFor) return;
    setSavedOutcome({ result: outcomeFor, note: outcomeNote });
    setOutcomeFor(null);
    setOutcomeNote('');
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)', zIndex: 200,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
        background: 'var(--bg-secondary)',
        borderLeft: `2px solid ${color}40`,
        zIndex: 201, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        boxShadow: `-24px 0 80px rgba(0,0,0,0.6)`,
        animation: 'slideInRight 0.25s ease',
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px 16px',
          background: 'var(--bg-secondary)',
          borderBottom: `1px solid ${color}40`,
          borderTop: `3px solid ${color}`,
          flexShrink: 0,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color={color} />
              <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                AI Copilot Analysis
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.07)',
              }}
            >
              <X size={15} color="var(--text-muted)" />
            </button>
          </div>

          {/* Client identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: `${color}20`, border: `2px solid ${color}60`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color,
              boxShadow: `0 0 14px ${color}40`,
            }}>
              {client.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{client.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {client.goalTag} · {client.riskProfile} Risk · {client.lastContacted}
              </div>
            </div>
            <span style={{
              fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 700,
              background: `${color}20`, color, border: `1px solid ${color}35`,
            }}>{segLabel}</span>
          </div>

          {/* KPI mini row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 14 }}>
            {[
              { label: 'AUM',         value: formatCurrency(client.aum),        col: 'var(--text-primary)' },
              { label: 'Potential Δ', value: `+${formatCurrency(client.aumPotential)}`, col: color },
              { label: 'Returns',     value: `${client.returns}%`,              col: client.returns < 8 ? '#f43f5e' : '#10b981' },
              { label: 'Urgency',     value: `⚡${client.urgencyScore}`,          col: client.urgencyScore > 85 ? '#f43f5e' : '#f59e0b' },
            ].map(m => (
              <div key={m.label} style={{
                background: 'var(--bg-card)', borderRadius: 8, padding: '8px 10px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{m.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: m.col }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Why this client */}
          <div style={{
            background: `${color}0d`, border: `1px solid ${color}25`, borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
              Why this client now
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>
              {client.reason}
            </div>
            <div style={{ fontSize: 12, color: color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronRight size={12} /> Suggested: {client.action}
            </div>
          </div>

          {/* AI Insights */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Sparkles size={14} color="#8b5cf6" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>AI Insights</span>
              <span style={{ fontSize: 10, background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>3 signals</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {insights.map((ins, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '10px 12px',
                  background: 'rgba(139,92,246,0.06)', borderRadius: 8,
                  border: '1px solid rgba(139,92,246,0.15)',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, background: 'rgba(139,92,246,0.2)',
                    color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1,
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ins}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Script */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <MessageSquare size={14} color="#3b82f6" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Conversation Script</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {client.talkingPoints.map((pt, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '10px 12px',
                  background: 'var(--bg-card)', borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, background: `${color}20`, color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{pt}</div>
                </div>
              ))}
            </div>

            {/* Full guide */}
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Guide</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {guide.map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                    <span style={{ color, fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
                    <span style={{ color: 'var(--text-secondary)', minWidth: 130, fontWeight: 600 }}>{g.topic}</span>
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', flex: 1 }}>{g.point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log Outcome */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: '16px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <Phone size={14} color="#10b981" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Log Call Outcome</span>
            </div>

            {savedOutcome ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              }}>
                <CheckCircle size={18} color="#10b981" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>Logged: {savedOutcome.result}</div>
                  {savedOutcome.note && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{savedOutcome.note}</div>}
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  {([
                    { ot: 'Interested',    icon: <CheckCircle size={13} />, clr: '#10b981' },
                    { ot: 'Follow-up',     icon: <Calendar size={13} />,    clr: '#3b82f6' },
                    { ot: 'Not Interested',icon: <XCircle size={13} />,     clr: '#f43f5e' },
                  ] as { ot: OutcomeType; icon: React.ReactNode; clr: string }[]).map(({ ot, icon, clr }) => (
                    <button
                      key={ot}
                      onClick={() => setOutcomeFor(ot)}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${outcomeFor === ot ? clr : 'transparent'}`,
                        cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        background: outcomeFor === ot ? `${clr}20` : 'rgba(255,255,255,0.04)',
                        color: outcomeFor === ot ? clr : 'var(--text-secondary)',
                        transition: 'all 0.18s',
                      }}
                    >
                      {icon} {ot}
                    </button>
                  ))}
                </div>
                <textarea
                  value={outcomeNote}
                  onChange={e => setOutcomeNote(e.target.value)}
                  placeholder="Add notes (optional)..."
                  rows={2}
                  style={{
                    width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
                    borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 12,
                    outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={logOutcome}
                  disabled={!outcomeFor}
                  style={{
                    marginTop: 10, width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                    cursor: outcomeFor ? 'pointer' : 'not-allowed',
                    background: outcomeFor ? `linear-gradient(135deg, #10b981, #3b82f6)` : 'rgba(255,255,255,0.04)',
                    color: outcomeFor ? '#fff' : 'var(--text-muted)',
                    fontSize: 13, fontWeight: 700, opacity: outcomeFor ? 1 : 0.5, transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Clock size={14} /> Log Outcome
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function ClientsPage() {
  const [segFilter, setSegFilter] = useState<Segment | 'All'>('All');
  const [searchQ,   setSearchQ]   = useState('');
  const [sortKey,   setSortKey]   = useState<SortKey>('aumPotential');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('desc');
  const [copilotClient, setCopilotClient] = useState<Client | null>(null);

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
