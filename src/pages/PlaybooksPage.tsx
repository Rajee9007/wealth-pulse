import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { MOCK_PLAYBOOKS, MOCK_CLIENTS, formatCurrency, type Playbook, type Client } from '../data/mockData';
import { 
  Rocket, Shield, Zap, Crown,
  Users, ArrowRight, MessageSquare, 
  Send, CheckCircle, X, Sparkles, LayoutGrid
} from 'lucide-react';

const ICON_MAP = {
  rocket: Rocket,
  shield: Shield,
  zap: Zap,
  crown: Crown,
};

export default function PlaybooksPage() {
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter clients for the selected playbook
  const targetClients = selectedPlaybook 
    ? MOCK_CLIENTS.filter(c => c.segment === selectedPlaybook.targetSegment)
    : [];

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedPlaybook(null);
      }, 3000);
    }, 2000);
  };

  return (
    <AppShell title="Growth Playbooks" subtitle="Execute high-impact bulk strategies across your client segments.">
      {!selectedPlaybook ? (
        /* Gallery View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {MOCK_PLAYBOOKS.map((p) => {
            const Icon = ICON_MAP[p.iconType];
            return (
              <div 
                key={p.id}
                onClick={() => setSelectedPlaybook(p)}
                className="glass-card"
                style={{ 
                  padding: '24px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1.5px solid var(--border-subtle)', position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = `${p.color}60`;
                  e.currentTarget.style.boxShadow = `0 12px 40px ${p.color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Decorative background glow */}
                <div style={{
                  position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                  background: p.color, opacity: 0.1, filter: 'blur(30px)', borderRadius: '50%'
                }} />

                <div style={{ 
                  width: 48, height: 48, borderRadius: 12, background: `${p.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                  border: `1px solid ${p.color}40`
                }}>
                  <Icon size={24} color={p.color} />
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20, height: 40, overflow: 'hidden' }}>
                    {p.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div style={{ 
                    padding: '4px 10px', borderRadius: 20, background: `${p.color}15`, 
                    color: p.color, fontSize: 11, fontWeight: 700, border: `1px solid ${p.color}30`
                  }}>
                    {p.impactLabel}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                    <Users size={14} /> {MOCK_CLIENTS.filter(c => c.segment === p.targetSegment).length} targets
                  </div>
                </div>

                <div style={{ 
                    marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, 
                    color: p.color, fontSize: 13, fontWeight: 700 
                }}>
                    Start Playbook <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Execution View */
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <button 
            onClick={() => setSelectedPlaybook(null)}
            style={{ 
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 20, fontWeight: 600
            }}
          >
            <X size={14} /> Back to Gallery
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 24 }}>
            {/* Playbook Sidebar */}
            <div>
              <div className="glass-card" style={{ padding: 24, border: `1.5px solid ${selectedPlaybook.color}40` }}>
                <div style={{ 
                  width: 56, height: 56, borderRadius: 14, background: `${selectedPlaybook.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                  border: `1px solid ${selectedPlaybook.color}40`
                }}>
                  {(() => {
                    const Icon = ICON_MAP[selectedPlaybook.iconType];
                    return <Icon size={28} color={selectedPlaybook.color} />;
                  })()}
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 10 }}>{selectedPlaybook.title}</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                  {selectedPlaybook.description}
                </p>

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid var(--border-subtle)', marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
                    Campaign Potential
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: selectedPlaybook.color, marginBottom: 4 }}>
                    {selectedPlaybook.impactLabel}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Estimated conversion: {selectedPlaybook.successRate}%</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-primary)' }}>
                    <MessageSquare size={16} color="var(--text-muted)" />
                    <span>WhatsApp Nudge Template</span>
                  </div>
                  <div style={{ 
                    fontSize: 12, color: 'var(--text-secondary)', padding: 12, 
                    background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-subtle)',
                    lineHeight: 1.5, opacity: 0.8
                  }}>
                    "Hi [Client Name], I've identified a growth opportunity for your [Goal] portfolio. We have ₹[Potential] in idle funds that could be working harder..."
                  </div>
                </div>

                <button 
                  onClick={handleLaunch}
                  disabled={isLaunching || isSuccess}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                    background: isSuccess ? '#10b981' : `linear-gradient(135deg, ${selectedPlaybook.color}, ${selectedPlaybook.color}dd)`,
                    color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    marginTop: 32, transition: 'all 0.2s',
                    boxShadow: `0 8px 24px ${selectedPlaybook.color}40`
                  }}
                >
                  {isLaunching ? (
                    <>Launching Campaign...</>
                  ) : isSuccess ? (
                    <><CheckCircle size={20} /> Success!</>
                  ) : (
                    <><Send size={18} /> Launch Playbook Now</>
                  )}
                </button>
              </div>
            </div>

            {/* Client List */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Target Clients</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{targetClients.length} clients in {selectedPlaybook.targetSegment} segment</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 12, border: '1px solid var(--border-subtle)' }}>
                  <LayoutGrid size={14} /> Total Impact: <span style={{ fontWeight: 800, color: selectedPlaybook.color }}>{formatCurrency(targetClients.reduce((s, c) => s + c.aumPotential, 0))}</span>
                </div>
              </div>

              <div style={{ overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Client</th>
                      <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current AUM</th>
                      <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Potential Δ</th>
                      <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targetClients.map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: i < targetClients.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.goalTag}</div>
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: 13, color: 'var(--text-secondary)' }}>{formatCurrency(c.aum)}</td>
                        <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: selectedPlaybook.color }}>
                          +{formatCurrency(c.aumPotential)}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                          <input type="checkbox" defaultChecked style={{ width: 18, height: 18, cursor: 'pointer' }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Success Overlay */}
          {isSuccess && (
            <div style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              padding: '40px 80px', background: 'var(--bg-secondary)', border: '2px solid #10b981',
              borderRadius: 24, boxShadow: '0 32px 120px rgba(0,0,0,0.8)', zIndex: 1000,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <div style={{ 
                  width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Sparkles size={40} color="#10b981" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>Campaign Launched!</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{targetClients.length} clients have been nudged via AI-optimized strategy.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
