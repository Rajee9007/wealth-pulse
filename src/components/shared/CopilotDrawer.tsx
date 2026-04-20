import React, { useState } from 'react';
import { 
  X, Sparkles, MessageSquare, Phone, TrendingUp, RefreshCw, 
  CheckCircle, XCircle, Calendar, Clock, ChevronRight, Mail, MessageCircle
} from 'lucide-react';
import { type Client, type Segment, formatCurrency } from '../../data/mockData';

export type OutcomeType = 'Interested' | 'Follow-up' | 'Not Interested';

export const SEG_COLORS: Record<Segment, string> = {
  Risk: '#f43f5e', Opportunity: '#10b981', Underperforming: '#f59e0b',
};

export const ACTION_ICONS: Record<string, React.ElementType> = {
  Risk: Phone, Opportunity: TrendingUp, Underperforming: RefreshCw,
};

/* ─── AI Conversation guides ──────────────────── */
export const CONVERSATION_GUIDES: Record<string, { topic: string; point: string }[]> = {
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

export const AI_INSIGHTS: Record<string, string[]> = {
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

/* ─── Copilot Drawer ─────────────────────────────────────────────────── */
export default function CopilotDrawer({ client, onClose }: {
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

          {/* Quick Contact Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <a 
              href={`mailto:${client.email}?subject=Portfolio Update: WealthPulse`}
              title={client.email}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 10, background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: 12,
                fontWeight: 700, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
            >
              <Mail size={14} /> Email
            </a>
            <a 
              href={`https://wa.me/${client.phone.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 10, background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 12,
                fontWeight: 700, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
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
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Strategy Focus Badge */}
            <div style={{
              position: 'absolute', top: 12, right: 12,
              fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 4,
              background: client.urgencyScore > 80 ? 'rgba(244,63,94,0.15)' : 'rgba(148,163,184,0.15)',
              color: client.urgencyScore > 80 ? '#f43f5e' : 'var(--text-muted)',
              border: `1px solid ${client.urgencyScore > 80 ? 'rgba(244,63,94,0.3)' : 'rgba(148,163,184,0.3)'}`,
              textTransform: 'uppercase', letterSpacing: 0.5
            }}>
              {client.reason.toLowerCase().includes('financial need') ? 'Maintenance' 
                : client.segment === 'Opportunity' ? 'Growth Focus' 
                : 'Lapse Prevention'}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
              Why this client now
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4, paddingRight: 80 }}>
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
