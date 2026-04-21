import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MOCK_HISTORY, MOCK_FAMILY, 
  MOCK_HOLDINGS, MOCK_ACTIVITY_LOGS,
  formatCurrency, SEG_COLORS
} from '../data/mockData';
import { useData } from '../context/DataContext';
import AppShell from '../components/layout/AppShell';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, 
  Legend, CartesianGrid, BarChart, Bar
} from 'recharts';
import { 
  ArrowLeft, Phone, Mail, MessageCircle, 
  TrendingUp, Shield, Target, Users, 
  Zap, Clock, Calendar, ChevronRight, Sparkles,
  BarChart3, Wallet, Activity, Heart, Info
} from 'lucide-react';

const FALLBACK_COLOR = '#94a3b8';

export default function Client360Page() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'holdings' | 'performance' | 'engagement'>('overview');
  
  const rawClient = clients.find(c => c.id === id);

  if (!rawClient) return (
    <AppShell title="Client Not Found">
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Client record not found.</h2>
        <Link to="/clients" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Back to Clients</Link>
      </div>
    </AppShell>
  );

  const client = {
    ...rawClient,
    segment: rawClient.profile.segment,
    aum: +(rawClient.profile.aum_inr_cr * 10_000_000).toFixed(0),
    aumPotential: +(rawClient.profile.aum_potential_inr_cr * 10_000_000).toFixed(0),
    returns: rawClient.profile.ytd_return_pct,
    wealthScore: rawClient.profile.wealth_score,
    netProfit: +(rawClient.profile.net_profit_inr_cr * 10_000_000).toFixed(0),
    goalTag: rawClient.profile.goal_tag,
    riskProfile: rawClient.profile.risk_profile,
    action: rawClient.profile.action,
    reason: rawClient.profile.reason,
    email: rawClient.profile.email,
    phone: rawClient.profile.phone,
    equityAllocation: Math.round(rawClient.profile.allocation.equity * 100),
    debtAllocation: Math.round(rawClient.profile.allocation.debt * 100),
    goldAllocation: Math.round(rawClient.profile.allocation.alternatives * 100),
  };

  const history = MOCK_HISTORY[client.id] || MOCK_HISTORY.C001 || [];
  const family = MOCK_FAMILY[client.id] || [];
  const holdings = MOCK_HOLDINGS[client.id] || [];
  const logs = MOCK_ACTIVITY_LOGS[client.id] || [];
  const color = SEG_COLORS[client.segment] || FALLBACK_COLOR;

  const allocationData = [
    { name: 'Equity', value: Number(client.equityAllocation || 65), color: 'var(--accent-emerald)' },
    { name: 'Debt',   value: Number(client.debtAllocation   || 25), color: 'var(--accent-blue)' },
    { name: 'Gold',   value: Number(client.goldAllocation   || 10), color: 'var(--accent-amber)' },
  ];

  return (
    <AppShell title="Client 360" subtitle="Portfolio Intelligence Hub">
      <div style={{ marginBottom: 24 }}>
        <Link 
          to="/clients"
          style={{ 
            color: 'var(--text-muted)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 6, 
            fontSize: 13, marginBottom: 20, fontWeight: 600,
            width: 'fit-content'
          }}
        >
          <ArrowLeft size={14} /> Portfolio Universe
        </Link>

        {/* Premium Hero Header */}
        <div className="glass-card" style={{ 
          padding: '32px 40px',
          background: `linear-gradient(135deg, ${color}15 0%, var(--bg-card) 100%)`,
          borderLeft: `6px solid ${color}`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Accent */}
          <div style={{ 
            position: 'absolute', top: -100, right: -100, width: 400, height: 400,
            background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{
                  width: 90, height: 90, borderRadius: 24,
                  background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                  border: `2px solid ${color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, fontWeight: 900, color,
                  boxShadow: `0 12px 30px ${color}20`,
                }}>
                  {client.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>{client.name}</h1>
                    <span style={{ 
                      fontSize: 11, padding: '4px 14px', borderRadius: 30, 
                      background: color, color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      {client.segment}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Info size={14} /> {client.id}</span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={14} /> {client.riskProfile} Risk</span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> {client.email}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <a href={`mailto:${client.email}`} className="sidebar-link" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '10px 20px' }}>
                  <Mail size={18} /> Contact
                </a>
                <button 
                  onClick={() => navigate('/copilot')}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', 
                    borderRadius: 12, background: color, color: '#fff', border: 'none',
                    fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 20px ${color}40`
                  }}
                >
                  <Sparkles size={18} /> Open Copilot
                </button>
              </div>
            </div>

            {/* Quick KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, marginTop: 40, borderTop: '1px solid var(--border-subtle)', paddingTop: 32 }}>
              {[
                { label: 'Total AUM', value: formatCurrency(client.aum), sub: 'Client Net Worth', icon: Wallet, color: 'var(--text-primary)' },
                { label: 'Returns (CAGR)', value: `${client.returns}%`, sub: 'Above Benchmark', icon: TrendingUp, color: 'var(--accent-emerald)' },
                { label: 'Wealth Score', value: `${client.wealthScore}/100`, sub: client.wealthScore > 80 ? 'Excellent' : 'Good', icon: Target, color: client.wealthScore > 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' },
                { label: 'Active Profit', value: formatCurrency(client.netProfit), sub: 'Realized & Unr.', icon: BarChart3, color: 'var(--accent-blue-light)' },
              ].map((kpi, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <kpi.icon size={20} color={kpi.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 2 }}>{kpi.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{kpi.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{kpi.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 32, marginTop: 32, borderBottom: '1px solid var(--border-subtle)', padding: '0 8px' }}>
          {(['overview', 'holdings', 'performance', 'engagement'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '12px 0 16px',
                fontSize: 14, fontWeight: 700, color: activeTab === tab ? color : 'var(--text-muted)',
                cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {tab}
              {activeTab === tab && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '3px 3px 0 0' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: 24 }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            {/* Overview Left: Allocation & Goals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Allocation Pie */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <BarChart3 size={16} color="var(--accent-blue-light)" />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Asset Mix</h3>
                  </div>
                  <div style={{ height: 220, width: '100%', minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocationData}
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                          animationDuration={1000}
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Goals Progress */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Target size={16} color="var(--accent-violet)" />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Goal Pulse</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {[
                      { label: client.goalTag || 'Retirement', progress: 68, color: 'var(--accent-violet)', target: '₹2.5Cr' },
                      { label: 'Emergency Fund', progress: 92, color: 'var(--accent-emerald)', target: '₹12L' },
                      { label: 'Annual Vacation', progress: 45, color: 'var(--accent-blue)', target: '₹5L' },
                    ].map(g => (
                      <div key={g.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{g.label}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.progress}% of {g.target}</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', width: `${g.progress}%`, 
                            background: `linear-gradient(90deg, ${g.color}80, ${g.color})`, 
                            borderRadius: 99, transition: 'width 1s ease-out'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Intelligence Banner */}
              <div className="glass-card" style={{ padding: 20, background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={24} color="#3b82f6" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>Next Best Action: {client.action}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{client.reason}</div>
                </div>
                <ChevronRight size={20} color="var(--text-muted)" />
              </div>
            </div>

            {/* Overview Right: Family & Activity Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <Users size={16} color="var(--text-muted)" />
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Household</h3>
                </div>
                {family.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {family.map(f => (
                      <Link 
                        key={f.id}
                        to={`/clients/${f.id}`}
                        style={{ 
                          padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 12, 
                          cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(255,255,255,0.01)',
                          textDecoration: 'none', display: 'block'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{f.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.relation}</div>
                          </div>
                          <ChevronRight size={14} color="var(--text-muted)" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No linked accounts found.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'holdings' && (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Asset Mapping</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Value</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>P&L Analysis</th>
                </tr>
              </thead>
              <tbody>
                {holdings.length > 0 ? holdings.map((h, i) => (
                  <tr key={h.id} style={{ borderBottom: i < holdings.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{h.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>ID: {h.id}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 6,
                        background: h.category === 'Equity' ? 'rgba(16,185,129,0.1)' : h.category === 'Debt' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                        color: h.category === 'Equity' ? '#10b981' : h.category === 'Debt' ? '#3b82f6' : '#f59e0b'
                      }}>
                        {h.category}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(h.value)}</div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: h.pnl >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                        {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {h.pnlPct > 0 ? '↑' : '↓'} {Math.abs(h.pnlPct)}%
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ padding: 100, textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Activity size={32} style={{ marginBottom: 16, opacity: 0.3 }} />
                      <div style={{ fontSize: 14 }}>No detailed holdings data found.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'performance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="glass-card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Portfolio Trajectory</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Growth analysis with AI-modeled forecast</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>1Y Returns</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-emerald)' }}>+14.2%</div>
                  </div>
                </div>
              </div>
              <div style={{ height: 400, width: '100%', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="trajColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} tickLine={false} 
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                    />
                    <Area 
                      type="monotone" dataKey="aum" 
                      stroke={color} strokeWidth={4} fillOpacity={1} fill="url(#trajColor)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <Activity size={20} color="var(--accent-blue-light)" />
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Interaction Logs</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {logs.length > 0 ? logs.map((log, i) => (
                <div key={log.id} style={{ display: 'flex', gap: 24, position: 'relative' }}>
                  <div style={{ 
                    width: 2, background: 'var(--border-subtle)', 
                    position: 'absolute', top: 40, bottom: -40, left: 24,
                    display: i === logs.length - 1 ? 'none' : 'block'
                  }} />
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 14, background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', flexShrink: 0, zIndex: 1 
                  }}>
                    {log.type === 'Call' ? <Phone size={18} color={color} /> : <Mail size={18} color={color} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 48 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{log.type}: {log.details.split(' ').slice(0, 4).join(' ')}...</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{log.date}</div>
                      </div>
                      <span style={{ 
                        fontSize: 10, fontWeight: 900, padding: '4px 12px', borderRadius: 30,
                        background: log.status === 'Success' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: log.status === 'Success' ? '#10b981' : '#f59e0b',
                        border: `1px solid ${log.status === 'Success' ? '#10b98140' : '#f59e0b40'}`
                      }}>
                        {log.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{log.details}</p>
                  </div>
                </div>
              )) : (
                <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No engagement logs available for this period.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

