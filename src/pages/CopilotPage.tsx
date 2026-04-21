import { useState, useMemo, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import { 
  formatCurrency, SEG_COLORS, 
  CONVERSATION_GUIDES, MOCK_ACTIVITY_LOGS 
} from '../data/mockData';
import { useData } from '../context/DataContext';
import { copilotApi } from '../services/copilotApi';
import type { Client } from '../types/client.types';
import { 
  Phone,  
  ChevronRight, MessageSquare, 
  Search, RotateCcw, Sparkles, Zap, Brain, Activity,
  CornerRightDown,  Wallet,
  Loader2, Send
} from 'lucide-react';

type OutcomeType = 'Interested' | 'Not Interested' | 'Follow-up';

interface Outcome { clientId: string; result: OutcomeType; note: string; timestamp: string; }



function PriorityRow({ client, rank, selected, onClick }: {
  client: Client; rank: number; selected: boolean; onClick: () => void;
}) {
  const color = SEG_COLORS[client.profile.segment] || '#3b82f6';
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
        borderRadius: 12, cursor: 'pointer', marginBottom: 8,
        background: selected ? `${color}12` : 'var(--bg-primary)',
        border: `1px solid ${selected ? color : 'var(--border-subtle)'}40`,
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}20`, color, fontWeight: 800, fontSize: 13, flexShrink: 0,
      }}>#{rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.id} · {formatCurrency(client.profile.aum_inr_cr * 10_000_000)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color,
          background: `${color}15`, padding: '2px 8px', borderRadius: 20,
        }}>⚡{client.profile.urgency_score}</div>
        <ChevronRight size={14} color="var(--text-muted)" />
      </div>
    </div>
  );
}

export default function CopilotPage() {
  const { clients: allClients } = useData();
  // Ensure we sort locally but don't mutate original
  const clients = [...allClients].sort((a,b) => b.profile.aum_potential_inr_cr - a.profile.aum_potential_inr_cr);
  const [searchTerm, setSearchTerm] = useState('');
  const [workflowMode, setWorkflowMode] = useState<'prep' | 'ongoing'>('prep');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Streaming states
  const [aiBrief, setAiBrief] = useState('');
  const [assistResponse, setAssistResponse] = useState('');
  const [isAssisting, setIsAssisting] = useState(false);
  const [question, setQuestion] = useState('');

  // Filtered list
  const filteredList = useMemo(() => {
    if (!searchTerm) return clients;
    const s = searchTerm.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(s) || c.id.toLowerCase().includes(s)
    );
  }, [searchTerm, clients]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => 
    clients.find(c => c.id === selectedId) || clients[0], 
  [clients, selectedId]);

  // Initial brief stream when selection changes
  useEffect(() => {
    if (selected?.id) {
      handleRegenerate();
    }
  }, [selected?.id]);

  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [outcomeFor, setOutcomeFor] = useState<OutcomeType | null>(null);
  const [outcomeNote, setOutcomeNote] = useState('');
  const guide = selected ? (CONVERSATION_GUIDES[selected.profile.segment as keyof typeof CONVERSATION_GUIDES] || []) : [];
  const color = selected ? (SEG_COLORS[selected.profile.segment as keyof typeof SEG_COLORS] || '#3b82f6') : '#3b82f6';
  const clientLogs = selected ? (MOCK_ACTIVITY_LOGS[selected.id] || []) : [];

  const handleRegenerate = () => {
    if (!selected) return;
    setIsRegenerating(true);
    setAiBrief('');
    copilotApi.streamBrief(
      selected.id,
      (chunk) => setAiBrief(prev => prev + chunk),
      () => setIsRegenerating(false)
    );
  };

  const handleAskAI = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selected || !question.trim()) return;
    setIsAssisting(true);
    setAssistResponse('');
    copilotApi.streamAssist(
      selected.id,
      question,
      (chunk) => setAssistResponse(prev => prev + chunk),
      () => {
        setIsAssisting(false);
        setQuestion('');
      }
    );
  };

  function logOutcome() {
    if (!outcomeFor || !selected) return;
    const o: Outcome = { 
      clientId: selected.id, result: outcomeFor, note: outcomeNote, 
      timestamp: new Date().toLocaleDateString() 
    };
    setOutcomes(prev => [...prev.filter(p => p.clientId !== selected.id), o]);
    setSavedOutcome(o);
    setOutcomeNote('');
    setOutcomeFor(null);
  }

  if (loading) {
    return (
      <AppShell title="Advisor Copilot" subtitle="Loading Intelligence Hub...">
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="animate-spin" size={48} color="var(--accent-blue)" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Advisor Copilot" subtitle="AI-driven intelligence for outbound and in-bound engagement">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, height: 'calc(100vh - 200px)', minHeight: 600 }}>
        {/* Priority Panel */}
        <div className="glass-card" style={{ padding: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Zap size={18} color="var(--accent-amber)" fill="var(--accent-amber)40" />
            <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority Flow</div>
          </div>

          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search clients or IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
                borderRadius: 99, padding: '10px 14px 10px 40px', color: 'var(--text-primary)', 
                fontSize: 13, outline: 'none', transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            {filteredList.length > 0 ? filteredList.map((c, i) => (
              <PriorityRow
                key={c.id}
                client={c}
                rank={i + 1}
                selected={selected.id === c.id}
                onClick={() => { setSelectedId(c.id); setAiBrief(''); setAssistResponse(''); setSavedOutcome(null); setOutcomeFor(null); setWorkflowMode('prep'); }}
              />
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                No clients match your search.
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', paddingRight: 4 }}>
          {/* Header & Mode Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => setWorkflowMode('prep')}
                style={{ 
                  padding: '8px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: workflowMode === 'prep' ? color : 'var(--bg-card)',
                  color: workflowMode === 'prep' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <Brain size={16} /> Prep Intelligence
              </button>
              <button 
                onClick={() => setWorkflowMode('ongoing')}
                style={{ 
                  padding: '8px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: workflowMode === 'ongoing' ? 'var(--accent-rose)' : 'var(--bg-card)',
                  color: workflowMode === 'ongoing' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <Phone size={16} /> Go Live
              </button>
            </div>

            <button 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              style={{ 
                background: 'none', border: 'none', color: color, cursor: 'pointer', 
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700,
                opacity: isRegenerating ? 0.5 : 1
              }}
            >
              <RotateCcw size={16} className={isRegenerating ? 'animate-spin' : ''} />
              {isRegenerating ? 'Simulating AI...' : 'Regenerate Brief'}
            </button>
          </div>

          {workflowMode === 'prep' ? (
            <>
              {/* Client Identity Header */}
              <div className="glass-card" style={{ 
                padding: '20px 24px',
                background: `linear-gradient(135deg, ${color}10 0%, var(--bg-card) 100%)`,
                borderColor: `${color}30`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{selected.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                      {selected.profile.goal_tag} · {selected.profile.risk_profile} Risk · ID: {selected.id}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: '4px 14px', borderRadius: 20, background: color, color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {selected.profile.segment}
                  </span>
                </div>
              </div>

              {/* ── SECTION 1: AI Synthesis ─────────────────────── */}
              <div className="glass-card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Sparkles size={16} color={color} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Synthesis</span>
                  {isRegenerating && <Loader2 size={12} className="animate-spin" color={color} style={{ marginLeft: 4 }} />}
                  {!isRegenerating && aiBrief && (
                    <span style={{ fontSize: 10, background: `${color}15`, color, padding: '2px 8px', borderRadius: 20, fontWeight: 700, marginLeft: 'auto' }}>Live Brief</span>
                  )}
                </div>
                <div style={{
                  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75,
                  whiteSpace: 'pre-wrap', padding: '14px 16px',
                  background: `${color}08`, borderRadius: 10, border: `1px solid ${color}20`,
                  minHeight: 64,
                }}>
                  {isRegenerating && !aiBrief
                    ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Generating AI brief for {selected.name}...</span>
                    : (aiBrief || selected.profile.reason)}
                </div>
              </div>

              {/* ── SECTION 2: Portfolio Snapshot ───────────────── */}
              <div className="glass-card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Wallet size={15} color="var(--accent-blue)" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portfolio Snapshot</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { label: 'AUM',         value: formatCurrency(selected.profile.aum_inr_cr * 10_000_000),              color: 'var(--text-primary)', sub: 'Total invested' },
                    { label: 'Potential',   value: `+${formatCurrency(selected.profile.aum_potential_inr_cr * 10_000_000)}`, color,                       sub: 'Opportunity size' },
                    { label: 'Returns',     value: `${selected.profile.ytd_return_pct}%`,                     color: selected.profile.ytd_return_pct >= 10 ? 'var(--accent-emerald)' : selected.profile.ytd_return_pct >= 7 ? 'var(--accent-amber)' : '#f43f5e', sub: 'YTD performance' },
                    { label: 'Urgency',     value: `⚡ ${selected.profile.urgency_score}`,              color: selected.profile.urgency_score >= 80 ? '#f43f5e' : selected.profile.urgency_score >= 60 ? 'var(--accent-amber)' : 'var(--accent-emerald)', sub: 'Priority score' },
                  ].map((m, i) => (
                    <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{m.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Allocation bar */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Allocation Mix</div>
                  <div style={{ display: 'flex', height: 8, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
                    <div style={{ flex: Math.round(selected.profile.allocation.equity * 100) || 65, background: 'var(--accent-emerald)', borderRadius: '4px 0 0 4px' }} title="Equity" />
                    <div style={{ flex: Math.round(selected.profile.allocation.debt * 100) || 25, background: 'var(--accent-blue)' }} title="Debt" />
                    <div style={{ flex: Math.round(selected.profile.allocation.alternatives * 100) || 10, background: 'var(--accent-amber)', borderRadius: '0 4px 4px 0' }} title="Gold" />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                    {[
                      { label: 'Equity', pct: Math.round(selected.profile.allocation.equity * 100) || 65, col: 'var(--accent-emerald)' },
                      { label: 'Debt',   pct: Math.round(selected.profile.allocation.debt * 100)   || 25, col: 'var(--accent-blue)' },
                      { label: 'Gold',   pct: Math.round(selected.profile.allocation.alternatives * 100)   || 10, col: 'var(--accent-amber)' },
                    ].map(a => (
                      <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: a.col }} />
                        {a.label} {a.pct}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── SECTION 3 & 4: Talking Points + Recent Activity ─ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* Talking Points */}
                <div className="glass-card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <CornerRightDown size={15} color={color} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Talking Points</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {selected.profile.flags.length > 0 ? selected.profile.flags.map((pt: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-subtle)', alignItems: 'flex-start' }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{pt}</div>
                      </div>
                    )) : (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>AI is preparing tailored talking points...</div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Activity size={15} color="var(--accent-emerald)" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Activity</span>
                    {clientLogs.length > 0 && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                        {clientLogs.length} log{clientLogs.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {clientLogs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {clientLogs.map((log, i) => (
                        <div key={log.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                          <div style={{ position: 'absolute', top: 28, bottom: 0, left: 10, width: 1, background: 'var(--border-subtle)', display: i === clientLogs.length - 1 ? 'none' : 'block' }} />
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: log.status === 'Success' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', border: `1px solid ${log.status === 'Success' ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: log.status === 'Success' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
                          </div>
                          <div style={{ flex: 1, paddingBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{log.type}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{log.date}</div>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{log.details}</div>
                            <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, padding: '1px 7px', borderRadius: 4, background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>{log.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>No interaction history recorded for this client.</div>
                  )}
                </div>
              </div>

              {/* ── SECTION 5: Conversation Guide ─────────────────── */}
              <div className="glass-card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <MessageSquare size={15} color="var(--accent-blue)" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Conversation Guide</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                    {guide.length} steps
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {guide.map((g: {topic: string; point: string}, i: number) => (
                    <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>{g.topic}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, fontStyle: 'italic' }}>{g.point}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, flex: 1, minHeight: 0 }}>
              {/* Ongoing Call Interface */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0 }}>
                <div className="glass-card" style={{ flex: 1, padding: 24, background: 'rgba(244, 63, 94, 0.03)', borderColor: 'rgba(244, 63, 94, 0.2)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <div className="animate-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-rose)' }} />
                    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>Live Call Transcription</div>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>02:45 Session</span>
                  </div>
                  
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                    <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 12, fontSize: 14, color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: 11, display: 'block', marginBottom: 4 }}>CLIENT SAID:</span>
                      "I'm worried about the current inflation and how it might impact my child's education corpus in the next 5 years."
                    </div>
                    {assistResponse && (
                      <div style={{ padding: 14, background: `${color}15`, borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', border: `2px solid ${color}40`, marginLeft: 20 }}>
                        <span style={{ fontWeight: 800, color, fontSize: 11, display: 'block', marginBottom: 4 }}>COPILOT RECOMMENDS (LIVE):</span>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{assistResponse}</div>
                      </div>
                    )}
                    {!assistResponse && !isAssisting && (
                      <div style={{ padding: 14, background: `${color}15`, borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', border: `2px solid ${color}40`, marginLeft: 20 }}>
                        <span style={{ fontWeight: 800, color, fontSize: 11, display: 'block', marginBottom: 4 }}>SITUATIONAL TIP:</span>
                        Acknowledge the concern. Suggest rebalancing ₹2L from liquid to Gold BeES or Inflation-indexed bonds to hedge against sticky inflation.
                      </div>
                    )}
                    {isAssisting && (
                      <div style={{ padding: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, marginLeft: 20 }}>
                        <Loader2 className="animate-spin" size={14} color={color} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI is analyzing the context...</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAskAI} style={{ display: 'flex', gap: 10, background: 'var(--bg-primary)', padding: '6px 6px 6px 14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                    <input 
                      type="text"
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      placeholder="Ask AI for real-time objection handling..."
                      style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                    />
                    <button 
                      type="submit"
                      disabled={isAssisting || !question.trim()}
                      style={{ 
                        width: 32, height: 32, borderRadius: 8, border: 'none', 
                        background: color, color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'opacity 0.2s', opacity: (isAssisting || !question.trim()) ? 0.5 : 1
                      }}
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>

                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12 }}>ADVISOR PRIVATE NOTES</div>
                  <textarea 
                    value={outcomeNote}
                    onChange={e => setOutcomeNote(e.target.value)}
                    placeholder="Type call insights here... These won't be shared with the client."
                    style={{ 
                      width: '100%', height: 100, background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
                      borderRadius: 12, padding: 16, color: 'var(--text-primary)', fontSize: 14, outline: 'none', resize: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Side Stats in Live Mode */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                   <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 20 }}>LOG CALL OUTCOME</div>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(['Interested', 'Not Interested', 'Follow-up'] as OutcomeType[]).map(ot => (
                        <button key={ot} onClick={() => setOutcomeFor(ot)} style={{
                          flex: '1 1 45%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                          background: outcomeFor === ot ? color : 'var(--bg-primary)',
                          color: outcomeFor === ot ? '#fff' : 'var(--text-secondary)',
                          transition: 'all 0.2s'
                        }}>{ot}</button>
                      ))}
                   </div>
                   <button 
                      onClick={logOutcome} 
                      disabled={!outcomeFor}
                      style={{ 
                        width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, border: 'none',
                        background: outcomeFor ? `linear-gradient(135deg, ${color}, #6366f1)` : 'var(--border-subtle)',
                        color: '#fff', fontWeight: 800, cursor: outcomeFor ? 'pointer' : 'not-allowed',
                        opacity: outcomeFor ? 1 : 0.5
                      }}
                    >
                      Complete & Log Call
                   </button>
                </div>

                <div className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16 }}>PORTFOLIO DATA</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AUM Allocation</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{Math.round(selected.profile.allocation.equity * 100)}% Equity</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pending SIPs</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: selected.profile.sip_active ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                          {selected.profile.sip_active ? 'None' : '1 Paused'}
                        </span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interaction History Section */}
          <div className="glass-card" style={{ padding: 24, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <Activity size={18} color="var(--text-muted)" />
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Copilot Intelligence Archive</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {clientLogs.length > 0 ? clientLogs.map((log, i) => (
                <div key={log.id} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', top: 24, bottom: 0, left: 14, width: 2, 
                    background: 'var(--border-subtle)', display: i === clientLogs.length - 1 ? 'none' : 'block' 
                  }} />
                  <div style={{ 
                    width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', zIndex: 1, flexShrink: 0 
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.status === 'Success' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{log.type} Outcome</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.date}</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{log.details}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                       <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                         Status: {log.status}
                       </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  No historical records for this client.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
