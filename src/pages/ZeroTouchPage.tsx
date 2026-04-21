import { useState, useEffect, useCallback } from 'react';
import AppShell from '../components/layout/AppShell';
import {
  Cpu, Zap, CheckCircle, Clock, Send, Loader2,
  BarChart3, Activity, Target, ChevronRight, FileText,
  XCircle, RefreshCw, AlertTriangle, Package, List,
  ArrowUpRight, CreditCard, Shield, Search,
} from 'lucide-react';

const BASE = 'https://zero-touch-api.onrender.com';

/* ─── Types ──────────────────────────────────────── */
interface TicketRequest {
  ticket_key: string;
  summary: string;
  description?: string;
  customer_id?: string;
  status?: string;
  ground_truth_root_cause?: string;
}

interface TicketResponse {
  ticket_key: string;
  diagnosis: string;
  root_cause: string;
  confidence: number;
  action_taken: string;
  customer_response: string;
  status: string;
}

interface MetricsResponse {
  total_processed: number;
  correct_diagnoses: number;
  accuracy: number;
  accuracy_basis: string;
  evaluated_tickets: number;
  auto_resolved: number;
  escalated: number;
  avg_time: number;
  root_causes: Record<string, number>;
  per_root_cause_accuracy: Record<string, unknown>;
  recent_tickets: Record<string, unknown>[];
}

interface Job {
  job_id: string;
  status: string;
  total: number;
  completed: number;
  results?: TicketResponse[];
}

type ActiveTab = 'single' | 'batch' | 'lookup';

/* ─── Helpers ─────────────────────────────────────── */
const confidence_color = (c: number) =>
  c >= 0.8 ? 'var(--accent-emerald)' : c >= 0.5 ? 'var(--accent-amber)' : '#f43f5e';

const STATUS_COLORS: Record<string, string> = {
  Auto_Resolved: 'var(--accent-emerald)',
  Resolved:      'var(--accent-emerald)',
  Escalated:     '#f43f5e',
  Open:          'var(--accent-amber)',
  Processing:    'var(--accent-blue)',
};

const SAMPLE_TICKETS: TicketRequest[] = [
  { ticket_key: 'PAY-1023', summary: 'UPI payment failed but amount debited' },
  { ticket_key: 'MAN-445',  summary: 'SIP mandate not getting activated' },
  { ticket_key: 'KYC-312',  summary: 'KYC rejected without clear reason' },
  { ticket_key: 'TXN-889',  summary: 'NEFT transfer delayed beyond 2 hours' },
  { ticket_key: 'PAY-1045', summary: 'Duplicate payment charged for SIP installment' },
  { ticket_key: 'ACT-201',  summary: 'Account temporarily locked after multiple failed PIN attempts' },
];

const BATCH_PRESETS: TicketRequest[] = [
  { ticket_key: 'PAY-1023', summary: 'UPI payment failed but amount debited' },
  { ticket_key: 'MAN-445',  summary: 'SIP mandate not getting activated' },
  { ticket_key: 'KYC-312',  summary: 'KYC rejected without clear reason' },
];

/* ─── Stat Card ──────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, color, delta }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string; delta?: string;
}) {
  return (
    <div className="glass-card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} color={color} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
        </div>
        {delta && <span style={{ fontSize: 10, background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{delta}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ─── Result Block ───────────────────────────────── */
function ResultBlock({ result, accent = '#6366f1' }: { result: TicketResponse; accent?: string }) {
  const statusColor = STATUS_COLORS[result.status] || 'var(--text-muted)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{result.ticket_key}</span>
        <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 20, background: `${statusColor}20`, color: statusColor, fontWeight: 700, border: `1px solid ${statusColor}40` }}>
          {result.status.replace(/_/g, ' ')}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, width: 80, height: 5, background: 'var(--bg-primary)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${result.confidence * 100}%`, background: confidence_color(result.confidence), borderRadius: 99, transition: 'width 0.8s' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: confidence_color(result.confidence) }}>
            {(result.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      {[
        { label: 'Diagnosis',        value: result.diagnosis,         color: accent },
        { label: 'Root Cause',       value: result.root_cause,        color: 'var(--accent-amber)' },
        { label: 'Action Taken',     value: result.action_taken,      color: 'var(--accent-emerald)' },
        { label: 'Customer Response',value: result.customer_response, color: 'var(--accent-blue)' },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── ZeroTouchPage ──────────────────────────────── */
export default function ZeroTouchPage() {
  const [metrics, setMetrics]               = useState<MetricsResponse | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsRefreshing, setMetricsRefreshing] = useState(false);
  const [activeTab, setActiveTab]           = useState<ActiveTab>('single');

  // ── Single ticket
  const [form, setForm]       = useState<TicketRequest>({ ticket_key: '', summary: '', description: '', customer_id: '' });
  const [processing, setProcessing] = useState(false);
  const [result, setResult]   = useState<TicketResponse | null>(null);
  const [error, setError]     = useState<string | null>(null);

  // ── Process-by-key
  const [byKey, setByKey]     = useState('');
  const [byKeyLoading, setByKeyLoading] = useState(false);
  const [byKeyResult, setByKeyResult]   = useState<TicketResponse | null>(null);
  const [byKeyError, setByKeyError]     = useState<string | null>(null);

  // ── Batch
  const [batchTickets, setBatchTickets]   = useState<TicketRequest[]>(BATCH_PRESETS);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchJob, setBatchJob]           = useState<Job | null>(null);
  const [batchError, setBatchError]       = useState<string | null>(null);
  const [pollingJobId, setPollingJobId]   = useState<string | null>(null);

  // ── Lookup
  const [lookupType, setLookupType]   = useState<'jira' | 'txn' | 'mandate' | 'logs'>('jira');
  const [lookupKey, setLookupKey]     = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult]   = useState<Record<string, unknown> | null>(null);
  const [lookupError, setLookupError]     = useState<string | null>(null);

  // ── Load metrics
  const loadMetrics = useCallback(async (refresh = false) => {
    if (refresh) setMetricsRefreshing(true);
    else setMetricsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/metrics`);
      if (res.ok) setMetrics(await res.json());
    } catch { /* cold start */ }
    finally {
      setMetricsLoading(false);
      setMetricsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  // ── Poll batch job
  useEffect(() => {
    if (!pollingJobId) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${BASE}/api/jobs/${pollingJobId}`);
        if (res.ok) {
          const job = await res.json();
          setBatchJob(job);
          if (job.status === 'completed' || job.status === 'failed') {
            clearInterval(id);
            setPollingJobId(null);
            loadMetrics(true);
          }
        }
      } catch { clearInterval(id); setPollingJobId(null); }
    }, 2000);
    return () => clearInterval(id);
  }, [pollingJobId, loadMetrics]);

  // ── Single ticket submit
  async function handleSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ticket_key.trim() || !form.summary.trim()) return;
    setProcessing(true); setResult(null); setError(null);
    try {
      const res = await fetch(`${BASE}/api/process-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_key: form.ticket_key.trim(),
          summary: form.summary.trim(),
          description: form.description?.trim() || undefined,
          customer_id: form.customer_id?.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      setResult(await res.json());
      loadMetrics(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setProcessing(false); }
  }

  // ── Process by key
  async function handleByKey(e: React.FormEvent) {
    e.preventDefault();
    if (!byKey.trim()) return;
    setByKeyLoading(true); setByKeyResult(null); setByKeyError(null);
    try {
      const res = await fetch(`${BASE}/api/process-by-key/${byKey.trim()}`, { method: 'POST' });
      if (!res.ok) throw new Error(`Ticket not found or API ${res.status}`);
      setByKeyResult(await res.json());
      loadMetrics(true);
    } catch (err) { setByKeyError(err instanceof Error ? err.message : 'Failed'); }
    finally { setByKeyLoading(false); }
  }

  // ── Batch submit
  async function handleBatch() {
    if (batchTickets.length === 0) return;
    setBatchProcessing(true); setBatchJob(null); setBatchError(null);
    try {
      const res = await fetch(`${BASE}/api/process-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickets: batchTickets }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setBatchJob(data);
      setPollingJobId(data.job_id);
    } catch (err) { setBatchError(err instanceof Error ? err.message : 'Failed'); }
    finally { setBatchProcessing(false); }
  }

  // ── Lookup
  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!lookupKey.trim()) return;
    setLookupLoading(true); setLookupResult(null); setLookupError(null);
    const urls: Record<string, string> = {
      jira:    `${BASE}/api/jira/${lookupKey}`,
      txn:     `${BASE}/api/transactions/${lookupKey}`,
      mandate: `${BASE}/api/mandates/${lookupKey}`,
      logs:    `${BASE}/api/logs/${lookupKey}`,
    };
    try {
      const res = await fetch(urls[lookupType]);
      if (!res.ok) throw new Error(`Not found (${res.status})`);
      setLookupResult(await res.json());
    } catch (err) { setLookupError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLookupLoading(false); }
  }

  // ── Add batch row
  function addBatchRow() {
    setBatchTickets(prev => [...prev, { ticket_key: '', summary: '' }]);
  }
  function updateBatchRow(i: number, field: keyof TicketRequest, val: string) {
    setBatchTickets(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  }
  function removeBatchRow(i: number) {
    setBatchTickets(prev => prev.filter((_, idx) => idx !== i));
  }

  const rootCauses = metrics?.root_causes && Object.keys(metrics.root_causes).length > 0
    ? metrics.root_causes
    : null;
  const rcTotal = rootCauses ? Object.values(rootCauses).reduce((a, b) => a + b, 0) : 0;
  const RC_COLORS = ['#6366f1', 'var(--accent-emerald)', 'var(--accent-amber)', '#8b5cf6', '#f43f5e', 'var(--accent-blue)'];

  const TABS: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'single', label: 'Single Ticket',  icon: Send },
    { id: 'batch',  label: 'Batch Process',  icon: Package },
    { id: 'lookup', label: 'Data Lookup',    icon: Search },
  ];

  return (
    <AppShell title="Zero Touch Agent" subtitle="AI-powered autonomous fintech ticket resolution">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Header ────────────────────────────────── */}
        <div className="glass-card" style={{
          padding: '20px 26px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.06) 100%)',
          borderColor: 'rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
              <Cpu size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)' }}>Zero Touch Resolution Engine</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Autonomous AI diagnosis · Batch processing · Real-time job tracking · Jira integration
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {['Auto-Resolve', 'AI Diagnosis', 'Batch Jobs', 'Jira Sync'].map(b => (
              <span key={b} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontWeight: 700, border: '1px solid rgba(99,102,241,0.2)' }}>{b}</span>
            ))}
            <button
              onClick={() => loadMetrics(true)}
              disabled={metricsRefreshing}
              style={{ marginLeft: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700 }}
            >
              <RefreshCw size={12} className={metricsRefreshing ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Metrics KPIs ──────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {metricsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ padding: 20, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={18} className="animate-spin" color="var(--accent-blue)" />
              </div>
            ))
          ) : metrics ? (
            <>
              <StatCard label="Total Processed" value={metrics.total_processed}  sub="All-time tickets"         icon={FileText}      color="#6366f1" />
              <StatCard label="Auto Resolved"   value={metrics.auto_resolved}    sub="No human touch"          icon={CheckCircle}   color="var(--accent-emerald)" />
              <StatCard label="Escalated"       value={metrics.escalated}        sub="Human review needed"     icon={AlertTriangle} color="#f43f5e" />
              <StatCard label="Accuracy"        value={`${(metrics.accuracy * 100).toFixed(1)}%`} sub={`${metrics.evaluated_tickets} evaluated`} icon={Target} color="var(--accent-amber)" />
              <StatCard label="Avg. Time"       value={`${metrics.avg_time?.toFixed(1) ?? '—'}s`} sub="Resolution speed"  icon={Clock}         color="#8b5cf6" />
            </>
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ padding: 20, height: 96, opacity: 0.5 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>—</div>
                <div style={{ fontSize: 24, color: 'var(--text-muted)' }}>—</div>
              </div>
            ))
          )}
        </div>

        {/* ── Tabs ──────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                background: activeTab === id ? '#6366f1' : 'var(--bg-card)',
                color: activeTab === id ? '#fff' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Single Ticket ────────────────────── */}
        {activeTab === 'single' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Zap size={15} color="#6366f1" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Process Ticket</span>
              </div>

              {/* Quick samples */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Quick Samples</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SAMPLE_TICKETS.map(s => (
                    <button key={s.ticket_key} onClick={() => { setForm({ ...s, description: '', customer_id: '' }); setResult(null); setError(null); }}
                      style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: form.ticket_key === s.ticket_key ? 'rgba(99,102,241,0.2)' : 'var(--bg-primary)', border: `1px solid ${form.ticket_key === s.ticket_key ? '#6366f1' : 'var(--border-subtle)'}`, color: form.ticket_key === s.ticket_key ? '#a5b4fc' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
                      {s.ticket_key}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSingle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {([
                  { key: 'ticket_key' as const, label: 'Ticket Key *', ph: 'e.g. PAY-1023' },
                  { key: 'summary'    as const, label: 'Summary *',    ph: 'Brief issue description' },
                  { key: 'customer_id'as const, label: 'Customer ID',  ph: 'e.g. CUST-789 (optional)' },
                ] as { key: keyof TicketRequest; label: string; ph: string }[]).map(({ key, label, ph }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
                    <input type="text" value={(form[key] as string) || ''} placeholder={ph}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Description</label>
                  <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed context (optional)" rows={3}
                    style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={processing || !form.ticket_key.trim() || !form.summary.trim()}
                  style={{ padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #10b981)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (processing || !form.ticket_key.trim() || !form.summary.trim()) ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                  {processing ? <><Loader2 size={15} className="animate-spin" /> Processing...</> : <><Send size={15} /> Run AI Diagnosis</>}
                </button>
              </form>

              {/* Process by key (shortcut) */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>Or Process Existing Jira Ticket</div>
                <form onSubmit={handleByKey} style={{ display: 'flex', gap: 8 }}>
                  <input type="text" value={byKey} onChange={e => setByKey(e.target.value)} placeholder="Jira key e.g. PAY-1023"
                    style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '9px 13px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                  <button type="submit" disabled={byKeyLoading || !byKey.trim()}
                    style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, opacity: (byKeyLoading || !byKey.trim()) ? 0.5 : 1 }}>
                    {byKeyLoading ? <Loader2 size={13} className="animate-spin" /> : <ArrowUpRight size={13} />}
                    {byKeyLoading ? 'Fetching…' : 'Process'}
                  </button>
                </form>
                {byKeyError && <div style={{ marginTop: 10, padding: 12, background: 'rgba(244,63,94,0.08)', borderRadius: 10, fontSize: 12, color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}>{byKeyError}</div>}
              </div>
            </div>

            {/* Result panel — fixed height with scroll */}
            <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexShrink: 0 }}>
                <Activity size={15} color="var(--accent-emerald)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Diagnosis Result</span>
                {(result || byKeyResult) && !processing && !byKeyLoading && (
                  <button
                    onClick={() => { setResult(null); setByKeyResult(null); setError(null); setByKeyError(null); }}
                    style={{ marginLeft: 'auto', fontSize: 10, padding: '3px 9px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
                  >Clear</button>
                )}
              </div>

              {/* Scrollable content area */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {(processing || byKeyLoading) && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '50px 20px' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Cpu size={24} color="#6366f1" className="animate-pulse" />
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
                      AI agent is analyzing the ticket…<br />
                      <span style={{ fontSize: 12 }}>Scanning transaction logs, mandate status, and root cause patterns</span>
                    </div>
                  </div>
                )}

                {(error || byKeyError) && !processing && !byKeyLoading && (
                  <div style={{ padding: 16, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 12, display: 'flex', gap: 12 }}>
                    <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f43f5e', marginBottom: 4 }}>Processing Failed</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{error || byKeyError}</div>
                    </div>
                  </div>
                )}

                {!processing && !byKeyLoading && !error && !byKeyError && !(result || byKeyResult) && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '50px 20px', opacity: 0.4 }}>
                    <Cpu size={38} color="var(--text-muted)" />
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>Submit a ticket to see AI diagnosis, root cause, and customer response</div>
                  </div>
                )}

                {result && !processing && (
                  <ResultBlock result={result} />
                )}

                {byKeyResult && !byKeyLoading && (
                  <>
                    {result && <div style={{ height: 1, background: 'var(--border-subtle)', margin: '16px 0' }} />}
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>Via Jira Key</div>
                    <ResultBlock result={byKeyResult} />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Batch Process ────────────────────── */}
        {activeTab === 'batch' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={15} color="#8b5cf6" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Batch Tickets ({batchTickets.length})</span>
                </div>
                <button onClick={addBatchRow}
                  style={{ fontSize: 11, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                  + Add Row
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18, maxHeight: 360, overflowY: 'auto' }}>
                {batchTickets.map((t, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, alignItems: 'center' }}>
                    <input value={t.ticket_key} onChange={e => updateBatchRow(i, 'ticket_key', e.target.value)} placeholder="Key"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
                    <input value={t.summary} onChange={e => updateBatchRow(i, 'summary', e.target.value)} placeholder="Summary"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
                    <button onClick={() => removeBatchRow(i)}
                      style={{ background: 'rgba(244,63,94,0.1)', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#f43f5e' }}>
                      <XCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {batchError && <div style={{ padding: 12, background: 'rgba(244,63,94,0.08)', borderRadius: 10, border: '1px solid rgba(244,63,94,0.2)', fontSize: 12, color: '#f43f5e', marginBottom: 14 }}>{batchError}</div>}

              <button onClick={handleBatch} disabled={batchProcessing || batchTickets.length === 0 || !!pollingJobId}
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (batchProcessing || batchTickets.length === 0 || !!pollingJobId) ? 0.5 : 1 }}>
                {batchProcessing ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : pollingJobId ? <><Loader2 size={15} className="animate-spin" /> Processing job…</> : <><Package size={15} /> Run Batch Job</>}
              </button>
            </div>

            {/* Job Status */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <List size={15} color="#8b5cf6" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Status</span>
                {pollingJobId && <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '2px 8px', borderRadius: 20, fontWeight: 700, marginLeft: 'auto' }}>Live polling every 2s</span>}
              </div>

              {!batchJob && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 20px', opacity: 0.4 }}>
                  <Package size={40} color="var(--text-muted)" />
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>Submit a batch to see job progress here</div>
                </div>
              )}

              {batchJob && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Job ID',    value: batchJob.job_id },
                      { label: 'Status',    value: batchJob.status },
                      { label: 'Progress',  value: `${batchJob.completed ?? 0}/${batchJob.total ?? batchTickets.length}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div>
                    <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${((batchJob.completed ?? 0) / (batchJob.total ?? batchTickets.length)) * 100}%`, background: 'linear-gradient(90deg, #8b5cf6, #6366f1)', borderRadius: 99, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                  {/* Results */}
                  {batchJob.results && batchJob.results.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
                      {batchJob.results.map((r, i) => (
                        <div key={i} style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                          <ResultBlock result={r} accent="#8b5cf6" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Data Lookup ──────────────────────── */}
        {activeTab === 'lookup' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Search size={15} color="var(--accent-blue)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Lookup</span>
              </div>

              {/* Lookup type tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
                {([
                  { id: 'jira',    label: 'Jira Ticket', icon: FileText },
                  { id: 'txn',     label: 'Transaction',  icon: CreditCard },
                  { id: 'mandate', label: 'Mandate',      icon: Shield },
                  { id: 'logs',    label: 'Event Logs',   icon: List },
                ] as { id: typeof lookupType; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => { setLookupType(id); setLookupResult(null); setLookupError(null); setLookupKey(''); }}
                    style={{ flex: 1, padding: '7px 6px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, background: lookupType === id ? 'rgba(59,130,246,0.2)' : 'var(--bg-primary)', color: lookupType === id ? 'var(--accent-blue)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' }}>
                    <Icon size={11} /> {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleLookup} style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={lookupKey} onChange={e => setLookupKey(e.target.value)}
                  placeholder={{
                    jira: 'Ticket key e.g. PAY-1023',
                    txn:  'Transaction ID',
                    mandate: 'Mandate ID',
                    logs: 'Transaction ID',
                  }[lookupType]}
                  style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                />
                <button type="submit" disabled={lookupLoading || !lookupKey.trim()}
                  style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--accent-blue)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, opacity: (lookupLoading || !lookupKey.trim()) ? 0.5 : 1 }}>
                  {lookupLoading ? <Loader2 size={13} className="animate-spin" /> : <ChevronRight size={13} />}
                  {lookupLoading ? 'Fetching…' : 'Fetch'}
                </button>
              </form>
            </div>

            {/* Lookup result */}
            <div className="glass-card" style={{ padding: 24, minHeight: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Activity size={15} color="var(--accent-blue)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Result</span>
              </div>

              {lookupLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 20 }}>
                  <Loader2 size={18} className="animate-spin" color="var(--accent-blue)" />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Fetching data…</span>
                </div>
              )}

              {lookupError && (
                <div style={{ padding: 14, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, fontSize: 13, color: '#f43f5e' }}>{lookupError}</div>
              )}

              {!lookupLoading && !lookupError && !lookupResult && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                  Select a lookup type and enter an ID above
                </div>
              )}

              {lookupResult && !lookupLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                  {Object.entries(lookupResult).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)', minWidth: 120, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{key.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Bottom row: Root Causes + Recent Tickets ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Root Cause Distribution */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <BarChart3 size={15} color="#8b5cf6" />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Root Cause Distribution</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(rootCauses
                ? Object.entries(rootCauses).sort(([, a], [, b]) => b - a).map(([cause, count], i) => ({ label: cause, pct: rcTotal > 0 ? Math.round((count / rcTotal) * 100) : 0, col: RC_COLORS[i % RC_COLORS.length] }))
                : [
                    { label: 'Bank Gateway Timeout',      pct: 34, col: '#6366f1' },
                    { label: 'Mandate Registration Fail', pct: 24, col: 'var(--accent-emerald)' },
                    { label: 'Insufficient Funds',        pct: 18, col: 'var(--accent-amber)' },
                    { label: 'KYC Mismatch',              pct: 14, col: '#8b5cf6' },
                    { label: 'Network Timeout',           pct: 10, col: 'var(--accent-blue)' },
                  ]
              ).map(({ label, pct, col }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                    <span style={{ color: col, fontWeight: 800 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 99, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
              {!rootCauses && <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>Sample data — updates after tickets are processed</div>}
            </div>
          </div>

          {/* Recent Tickets Feed */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Activity size={15} color="var(--accent-emerald)" />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Tickets</span>
              {metrics?.recent_tickets && metrics.recent_tickets.length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                  {metrics.recent_tickets.length} records
                </span>
              )}
            </div>

            {metrics?.recent_tickets && metrics.recent_tickets.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
                {metrics.recent_tickets.map((t, i) => {
                  const status = (t.status as string) || 'Open';
                  const statusCol = STATUS_COLORS[status] || 'var(--text-muted)';
                  const conf = t.confidence as number | undefined;
                  return (
                    <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{(t.ticket_key as string) || `#${i + 1}`}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {conf !== undefined && <span style={{ fontSize: 11, fontWeight: 700, color: confidence_color(conf) }}>{(conf * 100).toFixed(0)}%</span>}
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: `${statusCol}20`, color: statusCol, fontWeight: 700 }}>{status.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                      {t.root_cause ? <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Root cause: <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{t.root_cause as string}</span></div> : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'PAY-1019', status: 'Auto_Resolved', rc: 'Bank Gateway Timeout',      conf: 0.92 },
                  { key: 'MAN-441',  status: 'Escalated',     rc: 'Mandate Registration Failure', conf: 0.61 },
                  { key: 'KYC-308',  status: 'Auto_Resolved', rc: 'KYC Document Mismatch',     conf: 0.87 },
                ].map(({ key, status, rc, conf }) => {
                  const col = STATUS_COLORS[status];
                  return (
                    <div key={key} style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-subtle)', opacity: 0.7 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{key}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: confidence_color(conf) }}>{(conf * 100).toFixed(0)}%</span>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: `${col}20`, color: col, fontWeight: 700 }}>{status.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Root cause: <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{rc}</span></div>
                    </div>
                  );
                })}
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>Sample data — live feed appears after first ticket is processed</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
