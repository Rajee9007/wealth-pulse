import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../data/mockData';
import { CheckCircle, XCircle, Zap, Shield, Rocket, Target } from 'lucide-react';

type Preset = 'Conservative' | 'Optimal' | 'Aggressive';

interface PresetCard {
  key: Preset;
  icon: typeof Shield;
  label: string;
  tagline: string;
  pct: number;
  color: string;
  bg: string;
}

const PRESETS: PresetCard[] = [
  {
    key: 'Conservative', icon: Shield, label: 'Conservative', tagline: 'Safer, easier to beat',
    pct: 0.70, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)',
  },
  {
    key: 'Optimal', icon: Zap, label: 'Optimal', tagline: 'Match the possibility',
    pct: 1.00, color: '#10b981', bg: 'rgba(16,185,129,0.08)',
  },
  {
    key: 'Aggressive', icon: Rocket, label: 'Aggressive', tagline: 'Stretch goal',
    pct: 1.20, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',
  },
];

export default function TargetsPage() {
  const { possibility: possResult, targets, saveTargets, performance } = useData();
  const possibility   = possResult.total_possibility_inr_cr * 10_000_000;
  const minAllowed    = Math.round(possibility * 0.70);
  const maxSlider     = Math.round(possibility * 1.50);

  const [preset, setPreset] = useState<Preset | null>(() => {
    if (targets.aum_target_inr > 0 && possibility > 0) {
      const match = PRESETS.find(p => Math.abs(targets.aum_target_inr - Math.round(possibility * p.pct)) <= 10);
      if (match) return match.key;
      return null;
    }
    return 'Optimal';
  });
  
  const [sliderVal, setSliderVal] = useState(() => 
    targets.aum_target_inr > 0 ? targets.aum_target_inr : Math.round(possibility * 1.00)
  );

  const [saved,      setSaved]      = useState(false);
  const [confirmed,  setConfirmed]  = useState(false);

  // Current effective target
  const currentTarget = preset
    ? Math.round(possibility * PRESETS.find(p => p.key === preset)!.pct)
    : sliderVal;

  const isValid   = currentTarget >= minAllowed;
  const pctOfPoss = Math.round((currentTarget / possibility) * 100);

  function selectPreset(p: Preset) {
    setPreset(p);
    setSliderVal(Math.round(possibility * PRESETS.find(x => x.key === p)!.pct));
    setSaved(false); setConfirmed(false);
  }

  function handleSlider(v: number) {
    setPreset(null);
    setSliderVal(v);
    setSaved(false); setConfirmed(false);
  }

  function handleConfirm() {
    if (isValid) {
      setConfirmed(true);
      setSaved(false);
      saveTargets({
        aum_target_inr: currentTarget,
        commission_target_inr: Math.round(currentTarget * 0.04)
      });
    } else {
      setSaved(true);
      setConfirmed(false);
    }
  }

  return (
    <AppShell
      title="Set Monthly Target"
      subtitle={`Your possibility this month is ${formatCurrency(possibility)}. Targets must be at least 70% (${formatCurrency(minAllowed)}).`}
    >
      {/* ── Preset Cards ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {PRESETS.map(p => {
          const amount    = Math.round(possibility * p.pct);
          const isActive  = preset === p.key;
          return (
            <div
              key={p.key}
              className="glass-card"
              onClick={() => selectPreset(p.key)}
              style={{
                padding: '24px 28px', cursor: 'pointer',
                background:   isActive ? p.bg : 'var(--bg-card)',
                border:       `1px solid ${isActive ? p.color + '60' : 'var(--border-subtle)'}`,
                boxShadow:    isActive ? `0 0 24px ${p.color}20` : undefined,
                transition:   'all 0.2s',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Active glow chip */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: 12, right: 14,
                  fontSize: 10, fontWeight: 700, color: p.color,
                  background: `${p.color}18`, border: `1px solid ${p.color}40`,
                  padding: '2px 8px', borderRadius: 20, letterSpacing: 0.5,
                }}>SELECTED</div>
              )}

              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 14,
                background: `${p.color}15`, border: `1px solid ${p.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <p.icon size={20} color={p.color} strokeWidth={1.8} />
              </div>

              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{p.tagline}</div>

              <div style={{ fontSize: 26, fontWeight: 900, color: p.color, letterSpacing: -0.5 }}>
                {formatCurrency(amount)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.pct * 100}% of possibility</div>
            </div>
          );
        })}
      </div>

      {/* ── Custom Slider ─────────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Custom target</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Pick any value ≥ 70% of possibility</div>
          </div>
          <button
            onClick={() => { setPreset(null); setSaved(false); setConfirmed(false); }}
            style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              background:  preset === null ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
              border:      preset === null ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--border-subtle)',
              color:       preset === null ? '#60a5fa' : 'var(--text-muted)',
              transition: 'all 0.18s',
            }}
          >Use custom</button>
        </div>

        {/* Slider track */}
        <div style={{ position: 'relative', height: 32, marginBottom: 12, display: 'flex', alignItems: 'center' }}>
          {/* Track Background */}
          <div style={{ 
            position: 'absolute', width: '100%', height: 6, 
            background: 'rgba(255,255,255,0.06)', borderRadius: 99 
          }} />

          {/* Min (70%) and Optimal (100%) Markers */}
          <div style={{ position: 'absolute', left: '0%', height: 12, width: 1.5, background: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
          <div style={{ 
            position: 'absolute', left: `${((possibility - minAllowed) / (maxSlider - minAllowed)) * 100}%`, 
            height: 12, width: 2.5, background: '#f59e0b', 
            boxShadow: '0 0 8px rgba(245,158,11,0.5)', borderRadius: 1 
          }} />

          {/* Progress Fill */}
          <div style={{ 
            position: 'absolute', 
            width: `${((currentTarget - minAllowed) / (maxSlider - minAllowed)) * 100}%`, 
            height: 6, 
            background: 'linear-gradient(90deg, #10b981, #34d399)', 
            borderRadius: 99, 
            boxShadow: '0 0 10px rgba(16,185,129,0.4)',
            transition: 'width 0.1s ease-out'
          }} />

          {/* Actual Range Input (Hidden styling, handle interactions) */}
          <input
            type="range"
            min={minAllowed}
            max={maxSlider}
            step={10000}
            value={currentTarget}
            onChange={e => handleSlider(Number(e.target.value))}
            style={{ 
              position: 'absolute', width: '100%', height: 32, 
              opacity: 0, cursor: 'pointer', zIndex: 10 
            }}
          />

          {/* Custom Thumb */}
          <div style={{
            position: 'absolute',
            left: `${((currentTarget - minAllowed) / (maxSlider - minAllowed)) * 100}%`,
            width: 18, height: 18, borderRadius: '50%',
            background: '#fff', border: '3px solid #10b981',
            boxShadow: '0 0 12px rgba(16,185,129,0.6)',
            transform: 'translateX(-50%)',
            pointerEvents: 'none', zIndex: 5,
            transition: 'left 0.1s ease-out'
          }} />
        </div>

        {/* Marker Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, position: 'relative', height: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>MIN (70%)</span>
          <span style={{ 
            position: 'absolute', 
            left: `${((possibility - minAllowed) / (maxSlider - minAllowed)) * 100}%`, 
            transform: 'translateX(-50%)',
            fontSize: 10, fontWeight: 800, color: '#f59e0b'
          }}>OPTIMAL (100%)</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>MAX (150%)</span>
        </div>

        {/* Slider + number input row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>₹</span>
          <input
            type="number"
            value={preset
              ? Math.round(possibility * PRESETS.find(p => p.key === preset)!.pct)
              : sliderVal}
            onChange={e => handleSlider(Number(e.target.value))}
            style={{
              width: 120, background: 'var(--bg-primary)',
              border: `1px solid ${preset === null && !isValid ? 'rgba(244,63,94,0.5)' : 'var(--border-subtle)'}`,
              borderRadius: 8, padding: '8px 12px', fontSize: 15,
              color: 'var(--text-primary)', outline: 'none', fontWeight: 700, textAlign: 'right',
            }}
          />
        </div>
      </div>

      {/* ── Summary Bar ──────────────────────────────────────────────── */}
      <div className="glass-card" style={{
        padding: '20px 28px',
        background: isValid ? 'rgba(16,185,129,0.05)' : 'rgba(244,63,94,0.05)',
        border:     `1px solid ${isValid ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
        marginBottom: 20,
      }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 18 }}>
          {[
            { label: 'Possibility',       value: formatCurrency(possibility),   color: '#8b5cf6' },
            { label: 'Selected Target',   value: formatCurrency(currentTarget), sub: `${pctOfPoss}% of possibility`, color: isValid ? '#10b981' : '#f43f5e' },
            { label: 'Minimum Required',  value: formatCurrency(minAllowed),    color: '#f59e0b' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: item.color, letterSpacing: -0.5 }}>{item.value}</div>
              {item.sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>}
            </div>
          ))}
        </div>

        {/* Validation / success message */}
        {confirmed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            fontSize: 13, fontWeight: 600, color: '#10b981',
          }}>
            <CheckCircle size={16} /> Target accepted. Anti-gaming check passed.
          </div>
        )}
        {saved && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            fontSize: 13, fontWeight: 600, color: '#f43f5e',
          }}>
            <XCircle size={16} /> Target rejected — minimum is {formatCurrency(minAllowed)} (70% of possibility)
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleConfirm}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: isValid
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #f43f5e, #e11d48)',
            color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: 0.3,
            boxShadow: isValid ? '0 4px 16px rgba(16,185,129,0.35)' : '0 4px 16px rgba(244,63,94,0.3)',
            transition: 'all 0.2s',
          }}
        >
          <Target size={16} />
          {confirmed ? 'Update Target' : 'Confirm Target'}
        </button>
      </div>

      {/* ── Previous Target reference ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>Previous target:</span>
        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{formatCurrency(performance.previous_target_inr)}</span>
        <span>·</span>
        <span>{Math.round((performance.previous_target_inr / possibility) * 100)}% of current possibility</span>
      </div>
    </AppShell>
  );
}
