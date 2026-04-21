import { useState, useMemo, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import { 
  MOCK_CLIENTS, formatCurrency, SEG_COLORS, 
  CONVERSATION_GUIDES, MOCK_ACTIVITY_LOGS 
} from '../data/mockData';
import type { Client } from '../data/mockData';
import { 
  Phone, Clock, CheckCircle, XCircle, Calendar, 
  ChevronRight, AlertTriangle, MessageSquare, 
  Search, RotateCcw, Sparkles, Zap, Brain, Activity,
  Info, CornerRightDown, ExternalLink
} from 'lucide-react';

type OutcomeType = 'Interested' | 'Not Interested' | 'Follow-up';

interface Outcome { clientId: string; result: OutcomeType; note: string; timestamp: string; }

function PriorityRow({ client, rank, selected, onClick }: {
  client: Client; rank: number; selected: boolean; onClick: () => void;
}) {
  const color = SEG_COLORS[client.segment] || '#3b82f6';
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
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.id} · {formatCurrency(client.aum)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color,
          background: `${color}15`, padding: '2px 8px', borderRadius: 20,
        }}>⚡{client.urgencyScore}</div>
        <ChevronRight size={14} color="var(--text-muted)" />
      </div>
    </div>
  );
}

export default function CopilotPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [workflowMode, setWorkflowMode] = useState<'prep' | 'ongoing'>('prep');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Filtered priority list
  const masterPriorityList = useMemo(() => 
    [...MOCK_CLIENTS].sort((a, b) => b.aumPotential - a.aumPotential),
  []);

  const filteredList = useMemo(() => {
    if (!searchTerm) return masterPriorityList;
    const s = searchTerm.toLowerCase();
    return masterPriorityList.filter(c => 
      c.name.toLowerCase().includes(s) || c.id.toLowerCase().includes(s)
    );
  }, [searchTerm, masterPriorityList]);

  const [selected, setSelected] = useState<Client>(masterPriorityList[0]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [outcomeFor, setOutcomeFor] = useState<OutcomeType | null>(null);
  const [outcomeNote, setOutcomeNote] = useState('');
  const [savedOutcome, setSavedOutcome] = useState<Outcome | null>(null);

  const guide = CONVERSATION_GUIDES[selected.segment] || [];
  const color = SEG_COLORS[selected.segment] || '#3b82f6';
  const existingOutcome = outcomes.find(o => o.clientId === selected.id);
  const clientLogs = MOCK_ACTIVITY_LOGS[selected.id] || [];

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => setIsRegenerating(false), 1200);
  };

  function logOutcome() {
    if (!outcomeFor) return;
    const o: Outcome = { 
      clientId: selected.id, result: outcomeFor, note: outcomeNote, 
      timestamp: new Date().toLocaleDateString() 
    };
    setOutcomes(prev => [...prev.filter(p => p.clientId !== selected.id), o]);
    setSavedOutcome(o);
    setOutcomeNote('');
    setOutcomeFor(null);
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
                onClick={() => { setSelected(c); setSavedOutcome(null); setOutcomeFor(null); setWorkflowMode('prep'); }}
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
              {/* Strategic Brief Card */}
              <div className="glass-card" style={{ 
                padding: 24, background: `linear-gradient(135deg, ${color}10 0%, var(--bg-card) 100%)`, 
                borderColor: `${color}30`, position: 'relative', overflow: 'hidden' 
              }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{selected.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        {selected.goalTag} Profile · {selected.riskProfile} Risk Appetite
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: 11, padding: '4px 12px', borderRadius: 20, 
                      background: color, color: '#fff', fontWeight: 800, textTransform: 'uppercase'
                    }}>
                      {selected.segment}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                    {[
                      { label: 'AUM', value: formatCurrency(selected.aum), icon: Wallet },
                      { label: 'Potential', value: formatCurrency(selected.aumPotential), icon: TrendingUp },
                      { label: 'Returns', value: `${selected.returns}%`, icon: Activity },
                      { label: 'Urgency', value: selected.urgencyScore, icon: Zap },
                    ].map((m, i) => (
                      <div key={i} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <m.icon size={10} /> {m.label}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: i === 1 ? color : 'var(--text-primary)' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: `1px solid ${color}20` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Sparkles size={16} color={color} />
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>AI Synthesis</div>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {isRegenerating ? 'Analyzing portfolio data...' : selected.reason}
                    </div>
                  </div>
                </div>
              </div>

              {/* Talking Points & Scripts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="glass-card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <CornerRightDown size={16} color={color} />
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Priority Points</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selected.talkingPoints.map((pt, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{pt}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <MessageSquare size={16} color="var(--accent-blue)" />
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Conversation Guide</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {guide.map((g, i) => (
                      <div key={i} style={{ padding: '8px 12px', borderBottom: i < guide.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', marginBottom: 4 }}>{g.topic}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{g.point}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, flex: 1 }}>
              {/* Ongoing Call Interface */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="glass-card" style={{ flex: 1, padding: 24, background: 'rgba(244, 63, 94, 0.03)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <div className="animate-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-rose)' }} />
                    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>Live Call Transcription</div>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>02:45 Session</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 12, fontSize: 14, color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: 11, display: 'block', marginBottom: 4 }}>CLIENT SAID:</span>
                      "I'm worried about the current inflation and how it might impact my child's education corpus in the next 5 years."
                    </div>
                    <div style={{ padding: 14, background: `${color}15`, borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', border: `2px solid ${color}40`, marginLeft: 20 }}>
                      <span style={{ fontWeight: 800, color, fontSize: 11, display: 'block', marginBottom: 4 }}>COPILOT RECOMMENDS:</span>
                      Acknowledge the concern. Suggest rebalancing ₹2L from liquid to Gold BeES or Inflation-indexed bonds to hedge against sticky inflation.
                    </div>
                  </div>

                  <div style={{ marginTop: 32 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12 }}>ADVISOR NOTES</div>
                    <textarea 
                      value={outcomeNote}
                      onChange={e => setOutcomeNote(e.target.value)}
                      placeholder="Type call insights here..."
                      style={{ 
                        width: '100%', height: 150, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                        borderRadius: 12, padding: 16, color: 'var(--text-primary)', fontSize: 14, outline: 'none', resize: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Outcome Logger in Side (Repurposed for Live) */}
                <div className="glass-card" style={{ padding: 24 }}>
                   <div style={{ display: 'flex', gap: 12 }}>
                      {(['Interested', 'Not Interested', 'Follow-up'] as OutcomeType[]).map(ot => (
                        <button key={ot} onClick={() => setOutcomeFor(ot)} style={{
                          flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
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
              </div>

              {/* Side Stats in Live Mode */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                 <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16 }}>PORTFOLIO QUICK-VIEW</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AUM Allocation</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>65% Equity</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pending SIPs</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-amber)' }}>None</span>
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
