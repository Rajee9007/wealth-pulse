import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { ADVISOR_PERFORMANCE, formatCurrency, calcPossibility, MOCK_CLIENTS } from '../data/mockData';
import { CheckCircle, XCircle, Sliders } from 'lucide-react';

type Strategy = 'Conservative' | 'Optimal' | 'Aggressive' | 'Custom';

const STRATEGIES: { key: Strategy; label: string; pct: number; color: string; desc: string }[] = [
  { key: 'Conservative', label: '🛡️ Conservative', pct: 0.70, color: '#94a3b8', desc: '70% of possibility — safe and achievable' },
  { key: 'Optimal',      label: '✅ Optimal',      pct: 1.00, color: '#10b981', desc: '100% of possibility — aligned with opportunity' },
  { key: 'Aggressive',   label: '🔥 Aggressive',   pct: 1.20, color: '#f59e0b', desc: '120% of possibility — stretch goal' },
  { key: 'Custom',       label: '🎛️ Custom',       pct: 0,    color: '#3b82f6', desc: 'Enter your own target amount' },
];

export default function TargetsPage() {
  const possibility = calcPossibility(MOCK_CLIENTS);
  const [selected, setSelected] = useState<Strategy>('Optimal');
  const [customVal, setCustomVal] = useState(possibility);
  const [saved, setSaved] = useState(false);
  const [rejected, setRejected] = useState(false);

  const currentTarget = selected === 'Custom'
    ? customVal
    : Math.round(possibility * (STRATEGIES.find(s => s.key === selected)!.pct));

  const minAllowed = Math.round(possibility * 0.70);
  const isValid = currentTarget >= minAllowed;

  function handleSave() {
    if (isValid) { setSaved(true); setRejected(false); }
    else          { setRejected(true); setSaved(false); }
  }

  return (
    <AppShell title="Target Module" subtitle="Set your monthly AUM target based on possibility">
      {/* Possibility reference */}
      <div className="glass-card" style={{
        padding: '16px 24px', marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
        border: '1px solid rgba(139,92,246,0.25)',
      }}>
        <div style={{ display: 'flex', gap: 40 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Possibility AUM</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#8b5cf6' }}>{formatCurrency(possibility)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Minimum Target (70%)</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(minAllowed)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Previous Target</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#3b82f6' }}>{formatCurrency(ADVISOR_PERFORMANCE.target)}</div>
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {STRATEGIES.map(s => (
          <div
            key={s.key}
            className="glass-card"
            onClick={() => { setSelected(s.key); setSaved(false); setRejected(false); }}
            style={{
              padding: 20, cursor: 'pointer', textAlign: 'center',
              borderColor: selected === s.key ? `${s.color}60` : undefined,
              background: selected === s.key ? `${s.color}12` : undefined,
              boxShadow: selected === s.key ? `0 0 16px ${s.color}20` : undefined,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{s.desc}</div>
            {s.key !== 'Custom' && (
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatCurrency(Math.round(possibility * s.pct))}
              </div>
            )}
            {s.key === 'Custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: s.color }}>
                <Sliders size={16} /> Enter amount
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Input */}
      {selected === 'Custom' && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Enter Custom Target</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 20, color: 'var(--text-secondary)' }}>₹</span>
            <input
              type="number"
              value={customVal}
              onChange={e => { setCustomVal(Number(e.target.value)); setSaved(false); setRejected(false); }}
              style={{
                background: 'var(--bg-primary)', border: `1px solid ${isValid ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`,
                borderRadius: 10, padding: '10px 16px', fontSize: 20, color: 'var(--text-primary)',
                outline: 'none', fontWeight: 700, width: 240,
              }}
            />
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Min: {formatCurrency(minAllowed)}</div>
          </div>
        </div>
      )}

      {/* Current target preview */}
      <div className="glass-card" style={{
        padding: 24, marginBottom: 20,
        background: isValid ? 'rgba(16,185,129,0.05)' : 'rgba(244,63,94,0.05)',
        border: `1px solid ${isValid ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Selected Target</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: isValid ? '#10b981' : '#f43f5e', letterSpacing: -1 }}>
              {formatCurrency(currentTarget)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {Math.round((currentTarget / possibility) * 100)}% of possibility
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: isValid ? '#10b981' : '#f43f5e' }}>
            {isValid ? <><CheckCircle size={20} /> Valid Target</> : <><XCircle size={20} /> Below Minimum</>}
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        style={{
          padding: '12px 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff',
          fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
          boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
          transition: 'opacity 0.2s',
        }}
      >
        Save Target
      </button>

      {/* Feedback */}
      {saved && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 14 }}>
          <CheckCircle size={18} /> ✅ Target saved successfully — {formatCurrency(currentTarget)}
        </div>
      )}
      {rejected && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#f43f5e', fontSize: 14 }}>
          <XCircle size={18} /> ❌ Target rejected — minimum is {formatCurrency(minAllowed)} (70% of possibility)
        </div>
      )}
    </AppShell>
  );
}
