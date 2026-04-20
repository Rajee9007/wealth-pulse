import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { MOCK_CLIENTS, formatCurrency } from '../data/mockData';
import type { Client } from '../data/mockData';
import { Phone, Clock, CheckCircle, XCircle, Calendar, ChevronRight, AlertTriangle, MessageSquare } from 'lucide-react';

const CONVERSATION_GUIDES: Record<string, { topic: string; point: string }[]> = {
  Risk: [
    { topic: 'Open with empathy', point: '"We noticed your SIP paused / no recent activity. Just checking in to understand if everything is okay."' },
    { topic: 'Understand reason', point: 'Ask: "Was it a cash flow issue, or are you reconsidering your investment goals?"' },
    { topic: 'Educate on impact', point: 'Show: SIP break impact on goal corpus with numbers.' },
    { topic: 'Offer alternatives', point: 'Suggest: Lower SIP amount, pause vs stop difference, switch to liquid fund temporarily.' },
    { topic: 'Reactivate commitment', point: 'Ask: "Can we restart at a lower amount to keep momentum?"' },
    { topic: 'Set follow-up', point: 'Book next call / reminder in 7 days.' },
  ],
  Opportunity: [
    { topic: 'Acknowledge investment', point: '"Your portfolio is doing well. You\'ve been consistent — great job!"' },
    { topic: 'Identify idle money', point: '"We noticed you have significant idle savings. It could be working harder for you."' },
    { topic: 'Discuss goal alignment', point: 'Ask: "Do you have any upcoming goals — child education, home, retirement?"' },
    { topic: 'Present opportunity', point: 'Suggest: SIP top-up, new equity/hybrid fund, lump sum deployment.' },
    { topic: 'Show projection', point: 'Show corpus growth with extra monthly investment over Y years.' },
    { topic: 'Soft close', point: '"Shall I set up a top-up starting this month?"' },
  ],
  Underperforming: [
    { topic: 'Start with review', point: '"Let\'s take a look at how your portfolio has been performing overall."' },
    { topic: 'Highlight underperformance', point: 'Show specific funds lagging benchmark or category peers.' },
    { topic: 'Explain root cause', point: 'Sector concentration, poor allocation, outdated fund choice.' },
    { topic: 'Propose rebalancing', point: 'Suggest: Switch from underperforming fund → better alternative.' },
    { topic: 'Risk profile check', point: '"Has your risk appetite changed since we last spoke?"' },
    { topic: 'Get buy-in', point: '"I\'d recommend moving from Fund A to Fund B. Want me to process this?"' },
  ],
};

type OutcomeType = 'Interested' | 'Not Interested' | 'Follow-up';

interface Outcome { clientId: string; result: OutcomeType; note: string; }

const SEG_COLORS: Record<string, string> = {
  Risk: '#f43f5e', Opportunity: '#10b981', Underperforming: '#f59e0b',
};

function PriorityRow({ client, rank, selected, onClick }: {
  client: Client; rank: number; selected: boolean; onClick: () => void;
}) {
  const color = SEG_COLORS[client.segment];
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
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.action} · {formatCurrency(client.aum)}</div>
      </div>
      <div style={{ display: 'flex', flex: 'column', alignItems: 'flex-end', gap: 4 }}>
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
  const priorityList = [...MOCK_CLIENTS].sort((a, b) => b.aumPotential - a.aumPotential);
  const [selected, setSelected] = useState<Client>(priorityList[0]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [outcomeFor, setOutcomeFor] = useState<OutcomeType | null>(null);
  const [outcomeNote, setOutcomeNote] = useState('');
  const [savedOutcome, setSavedOutcome] = useState<Outcome | null>(null);

  const guide = CONVERSATION_GUIDES[selected.segment as keyof typeof CONVERSATION_GUIDES];
  const color = SEG_COLORS[selected.segment];
  const existingOutcome = outcomes.find(o => o.clientId === selected.id);

  function logOutcome() {
    if (!outcomeFor) return;
    const o: Outcome = { clientId: selected.id, result: outcomeFor, note: outcomeNote };
    setOutcomes(prev => [...prev.filter(p => p.clientId !== selected.id), o]);
    setSavedOutcome(o);
    setOutcomeNote('');
    setOutcomeFor(null);
  }

  return (
    <AppShell title="Advisor Copilot" subtitle="Priority list · Conversation script · Outcome logging">
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 200px)', minHeight: 600 }}>
        {/* Priority Panel */}
        <div className="glass-card" style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Priority List</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {priorityList.map((c, i) => (
              <PriorityRow
                key={c.id}
                client={c}
                rank={i + 1}
                selected={selected.id === c.id}
                onClick={() => { setSelected(c); setSavedOutcome(null); setOutcomeFor(null); }}
              />
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {/* Meeting Prep Card */}
          <div className="glass-card" style={{ padding: 22, background: `${color}08`, borderColor: `${color}30` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {selected.id} · {selected.goalTag} · {selected.riskProfile} Risk
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: `${color}20`, color, border: `1px solid ${color}30`, fontWeight: 600 }}>
                  {selected.segment === 'Risk' ? '🔴 At Risk' : selected.segment === 'Opportunity' ? '🟢 Opportunity' : '🟡 Underperforming'}
                </span>
                <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', fontWeight: 700 }}>
                  ⚡ Urgency {selected.urgencyScore}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'AUM', value: formatCurrency(selected.aum), color: 'var(--text-primary)' },
                { label: 'Potential', value: formatCurrency(selected.aumPotential), color },
                { label: 'Returns', value: `${selected.returns}%`, color: selected.returns < 8 ? '#f43f5e' : '#10b981' },
                { label: 'Last Contact', value: selected.lastContacted, color: 'var(--text-secondary)' },
              ].map(m => (
                <div key={m.label} style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Recommended Action</div>
              <div style={{ fontSize: 13, fontWeight: 600, color }}>{selected.action}</div>
            </div>
          </div>

          {/* Conversation Script */}
          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MessageSquare size={16} color="#3b82f6" />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Conversation Script</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selected.talkingPoints.map((pt, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '10px 14px',
                  background: 'var(--bg-primary)', borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, background: `${color}20`, color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{pt}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Full Conversation Guide</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {guide.map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                    <span style={{ color, fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>
                    <span style={{ color: 'var(--text-muted)', minWidth: 140 }}>{g.topic}</span>
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', flex: 1 }}>{g.point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outcome Logger */}
          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Phone size={16} color="#10b981" />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Log Call Outcome</div>
              {existingOutcome && !savedOutcome && (
                <span style={{ fontSize: 11, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 20, marginLeft: 'auto' }}>
                  Logged: {existingOutcome.result}
                </span>
              )}
            </div>

            {savedOutcome ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle size={20} color="#10b981" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>Outcome logged: {savedOutcome.result}</div>
                  {savedOutcome.note && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{savedOutcome.note}</div>}
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  {(['Interested', 'Not Interested', 'Follow-up'] as OutcomeType[]).map(ot => (
                    <button
                      key={ot}
                      onClick={() => setOutcomeFor(ot)}
                      style={{
                        padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                        background: outcomeFor === ot
                          ? (ot === 'Interested' ? '#10b981' : ot === 'Not Interested' ? '#f43f5e' : '#3b82f6')
                          : 'var(--bg-primary)',
                        color: outcomeFor === ot ? '#fff' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      {ot === 'Interested' ? <CheckCircle size={14} /> : ot === 'Not Interested' ? <XCircle size={14} /> : <Calendar size={14} />}
                      {ot}
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
                    borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
                <button
                  onClick={logOutcome}
                  disabled={!outcomeFor}
                  style={{
                    marginTop: 12, padding: '10px 24px', borderRadius: 10, border: 'none', cursor: outcomeFor ? 'pointer' : 'not-allowed',
                    background: outcomeFor ? 'linear-gradient(135deg, #10b981, #3b82f6)' : 'var(--bg-card)',
                    color: outcomeFor ? '#fff' : 'var(--text-muted)', fontSize: 14, fontWeight: 600,
                    opacity: outcomeFor ? 1 : 0.6, transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={15} /> Log Outcome
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
