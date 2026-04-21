// ─── mockData.ts ──────────────────────────────────────────────────────────────
// Static non-client data: advisor performance, badge tiers, notifications,
// playbooks, conversation guides, trend data, utility helpers.
//
// Client data source: mock_clients_reference.json → clientService.ts
// MOCK_CLIENTS is a compatibility shim — pages migrate to useData() gradually.
// ─────────────────────────────────────────────────────────────────────────────

import { getAllClients } from '../services/clientService';

export type Segment = 'Risk' | 'Opportunity' | 'Underperforming' | 'Stable';

// ─── Compatibility shim ───────────────────────────────────────────────────────
// Maps nested profile schema → old flat schema so existing pages compile.
// Data comes from mock_clients_reference.json (single source of truth).

export interface Client {
  id: string; name: string; segment: Segment;
  aum: number; aumPotential: number; commissionPotential: number;
  sipActive: boolean; lastActivity: string; lastContacted: string;
  urgencyScore: number; action: string; reason: string;
  talkingPoints: string[]; goalTag: string;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  returns: number; email: string; phone: string;
  equityAllocation: number; debtAllocation: number; goldAllocation: number;
  wealthScore: number; netProfit: number;
}

export const MOCK_CLIENTS: Client[] = getAllClients().map(c => ({
  id:                 c.id,
  name:               c.name,
  segment:            c.profile.segment,
  aum:                +(c.profile.aum_inr_cr * 10_000_000).toFixed(0),
  aumPotential:       +(c.profile.aum_potential_inr_cr * 10_000_000).toFixed(0),
  commissionPotential: c.profile.commission_potential_inr,
  sipActive:          c.profile.sip_active,
  lastActivity:       c.profile.last_activity,
  lastContacted:      c.profile.last_contacted,
  urgencyScore:       c.profile.urgency_score,
  action:             c.profile.action,
  reason:             c.profile.reason,
  talkingPoints:      c.profile.flags,
  goalTag:            c.profile.goal_tag,
  riskProfile:        c.profile.risk_profile,
  returns:            c.profile.ytd_return_pct,
  email:              c.profile.email,
  phone:              c.profile.phone,
  equityAllocation:   Math.round(c.profile.allocation.equity * 100),
  debtAllocation:     Math.round(c.profile.allocation.debt * 100),
  goldAllocation:     Math.round(c.profile.allocation.alternatives * 100),
  wealthScore:        c.profile.wealth_score,
  netProfit:          +(c.profile.net_profit_inr_cr * 10_000_000).toFixed(0),
}));

export function calcPossibility(clients: Client[]): number {
  return Math.round(
    clients.filter(c => c.segment === 'Opportunity').reduce((s, c) => s + c.aumPotential, 0) * 0.6 +
    clients.filter(c => c.segment === 'Risk').reduce((s, c) => s + c.aumPotential, 0) * 0.3 +
    clients.filter(c => c.segment === 'Underperforming').reduce((s, c) => s + c.aumPotential, 0) * 0.5 +
    clients.filter(c => c.segment === 'Stable').reduce((s, c) => s + c.aumPotential, 0) * 0.1,
  );
}


export const SEG_COLORS: Record<Segment, string> = {
  Risk: '#f43f5e', Opportunity: '#10b981', Underperforming: '#f59e0b', Stable: '#3b82f6',
};

export const CONVERSATION_GUIDES: Record<Segment, { topic: string; point: string }[]> = {
  Risk: [
    { topic: 'Open with empathy',   point: '"We noticed your SIP paused / no recent activity. Just checking in to understand if everything is okay."' },
    { topic: 'Understand reason',   point: 'Was it a cash flow issue, or are you reconsidering your investment goals?' },
    { topic: 'Offer alternatives',  point: 'Suggest: Lower SIP amount, pause vs stop difference, switch to liquid fund temporarily.' },
  ],
  Opportunity: [
    { topic: 'Acknowledge performance', point: '"Your portfolio is doing well. You\'ve been consistent — great job!"' },
    { topic: 'Identify idle money',     point: '"We noticed significant idle savings. It could be working harder for you."' },
    { topic: 'Soft close',             point: '"Shall I set up a top-up starting this month?"' },
  ],
  Underperforming: [
    { topic: 'Start with review',    point: '"Let\'s take a look at how your portfolio has been performing overall."' },
    { topic: 'Highlight gaps',       point: 'Show specific funds lagging benchmark or category peers.' },
    { topic: 'Propose rebalancing',  point: 'Suggest: Switch from underperforming fund → better alternative.' },
  ],
  Stable: [
    { topic: 'The Good News',     point: '"Your portfolio is performing exactly as planned. You are on track for your goal."' },
    { topic: 'Goal Check',        point: '"Have any of your life goals changed? Retirement, child education, or home purchase?"' },
    { topic: 'Request Referrals', point: '"Since you are happy with the results, do you have friends or family who could benefit from this?"' },
  ],
};

// ─── Supporting types ─────────────────────────────────────────────────────────

export interface Holding {
  id: string;
  name: string;
  category: 'Equity' | 'Debt' | 'Gold';
  value: number;
  pnl: number;
  pnlPct: number;
}

export interface ActivityLog {
  id: string;
  date: string;
  type: string;
  details: string;
  status: 'Success' | 'Follow-up' | 'Pending';
}

export interface PortfolioHistory {
  date: string;
  aum: number;
}

export interface FamilyLink {
  id: string;
  name: string;
  relation: string;
  aum: number;
  segment: Segment;
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  targetSegment: Segment;
  impactLabel: string;
  successRate: number;
  iconType: 'rocket' | 'shield' | 'zap' | 'crown';
  color: string;
}

export interface Notification {
  id: string;
  type: 'growth' | 'risk' | 'success' | 'insight';
  title: string;
  message: string;
  time: string;
  unread: boolean;
  relatedClientId?: string;
}

export interface AdvisorPerformance {
  month: string;
  actual: number;
  target: number;
  possibilityAum: number;
  possibilityCommission: number;
  score: number;
  badge: string;
  targetAchievement: number;
  possibilityAchievement: number;
}

// ─── Advisor performance ──────────────────────────────────────────────────────

export const ADVISOR_PERFORMANCE: AdvisorPerformance = {
  month: 'April 2026',
  actual: 720000,
  target: 600000,
  possibilityAum: 850000,
  possibilityCommission: 34000,
  score: 82,
  badge: 'Elite',
  targetAchievement: 120,
  possibilityAchievement: 84.7,
};

// ─── Badge tiers (keyed on possibilityAchievement %) ─────────────────────────

export const BADGE_TIERS = [
  { label: '⚠️ At Risk',  min: 0,    max: 70,       color: '#f43f5e', bg: 'rgba(244,63,94,0.12)'   },
  { label: '👍 Stable',   min: 70,   max: 100,      color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  { label: '🔥 Strong',   min: 100,  max: 150,      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  { label: '🚀 Elite',    min: 150,  max: 300,      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  { label: '💎 Ultra',    min: 300,  max: 600,      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  { label: '🧠 Master',   min: 600,  max: 1000,     color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  { label: '👑 Legend',   min: 1000, max: Infinity, color: '#f8fafc', bg: 'rgba(248,250,252,0.12)' },
];

// ─── Monthly trend ────────────────────────────────────────────────────────────

export const MONTHLY_TREND = [
  { month: 'Nov', actual: 420000, target: 400000, possibility: 500000 },
  { month: 'Dec', actual: 510000, target: 450000, possibility: 560000 },
  { month: 'Jan', actual: 480000, target: 480000, possibility: 530000 },
  { month: 'Feb', actual: 590000, target: 520000, possibility: 640000 },
  { month: 'Mar', actual: 660000, target: 570000, possibility: 740000 },
  { month: 'Apr', actual: 720000, target: 600000, possibility: 850000 },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'growth',  title: 'Idle Cash Detected',    message: 'Arjun Mehta has ₹5.2L idle in savings. Possible upsell to Moderate SIP.',                 time: '2 min ago',   unread: true,  relatedClientId: 'W001' },
  { id: 'n2', type: 'risk',    title: 'Urgent Rebalance',       message: "Zoya Khan's portfolio is 18% off target allocation due to equity rallies.",                  time: '1 hour ago',  unread: true,  relatedClientId: 'W010' },
  { id: 'n3', type: 'success', title: 'SIP Reactivated',        message: 'Priya Sharma successfully resumed her ₹5,000 monthly SIP.',                                  time: '3 hours ago', unread: true,  relatedClientId: 'W002' },
  { id: 'n4', type: 'insight', title: 'Segment Performance',    message: 'Your Stable portfolio segment is currently beating the benchmark by 2.4%.',                   time: '5 hours ago', unread: false                          },
  { id: 'n5', type: 'growth',  title: 'High Potential Harvest', message: 'Ananya Bose has reached a 15.2% return milestone. Suggest top-up.',                          time: 'Yesterday',   unread: false, relatedClientId: 'W008' },
  { id: 'n6', type: 'risk',    title: 'KYC Expiry Alert',       message: "Karan Mehrotra's KYC update has been pending since Nov 2025 — SIP blocked.",                 time: 'Yesterday',   unread: false, relatedClientId: 'W029' },
];

// ─── Playbooks ────────────────────────────────────────────────────────────────

export const MOCK_PLAYBOOKS: Playbook[] = [
  { id: 'p1', title: 'SIP Top-up Blitz',   description: 'Target high-potential Opportunity clients with significant idle cash reserves.',     targetSegment: 'Opportunity',    impactLabel: '₹52L Potential',    successRate: 85, iconType: 'rocket', color: '#10b981' },
  { id: 'p2', title: 'Retention Shield',    description: 'Automated nudge sequence for clients with paused SIPs or low engagement.',           targetSegment: 'Risk',           impactLabel: '₹12L At Risk',      successRate: 64, iconType: 'shield', color: '#f43f5e' },
  { id: 'p3', title: 'Equity Alpha Wave',   description: 'Identify Underperforming portfolios and propose switches to high-alpha funds.',       targetSegment: 'Underperforming', impactLabel: '₹28L Optimization', successRate: 72, iconType: 'zap',    color: '#f59e0b' },
  { id: 'p4', title: 'Referral Harvest',    description: 'Request high-value referrals from your top-performing Stable clients.',               targetSegment: 'Stable',         impactLabel: '5+ Qualified Leads',successRate: 45, iconType: 'crown',  color: '#3b82f6' },
];

// ─── Nudges ───────────────────────────────────────────────────────────────────

export const NUDGES = [
  { id: 'N1', type: 'risk',   message: '3 At-Risk clients not contacted in 7+ days', count: 3 },
  { id: 'N2', type: 'oppo',   message: '2 Opportunity clients have idle funds available', count: 2 },
  { id: 'N3', type: 'target', message: 'Target achievement at 120% — keep pushing!', count: 0 },
];

// ─── Utility functions ────────────────────────────────────────────────────────

export function calcScore(actual: number, possibility: number): number {
  return Math.min(100, Math.round((actual / possibility) * 100));
}

export function getBadge(possibilityPct: number) {
  return BADGE_TIERS.find(t => possibilityPct >= t.min && possibilityPct < t.max) ?? BADGE_TIERS.at(-1)!;
}

export function formatCurrency(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`;
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(1)} K`;
  return `₹${n}`;
}

// ─── Per-client sub-resource stubs (used by Client360Page until migrated) ─────

export const MOCK_HOLDINGS: Record<string, Holding[]> = {
  W001: [
    { id: 'h1', name: 'SBI Bluechip Fund',         category: 'Equity', value: 250000, pnl: 45000,  pnlPct: 18.0 },
    { id: 'h2', name: 'HDFC Midcap Opportunity',    category: 'Equity', value: 150000, pnl: 12000,  pnlPct: 8.0  },
    { id: 'h3', name: 'ICICI Prudential Liquid',    category: 'Debt',   value: 80000,  pnl: 2000,   pnlPct: 2.5  },
  ],
  W002: [
    { id: 'h4', name: 'Mirae Asset Large Cap',      category: 'Equity', value: 400000, pnl: 85000,  pnlPct: 21.2 },
    { id: 'h5', name: 'Axis Small Cap Fund',         category: 'Equity', value: 220000, pnl: 35000,  pnlPct: 15.9 },
    { id: 'h6', name: 'Nippon India Gold BeES',      category: 'Gold',   value: 100000, pnl: 14000,  pnlPct: 14.0 },
  ],
  W007: [
    { id: 'h7', name: 'UTI Nifty 50 Index',         category: 'Equity', value: 1000000, pnl: 320000, pnlPct: 32.0 },
    { id: 'h8', name: 'Tata Digital India Fund',     category: 'Equity', value: 500000,  pnl: 130000, pnlPct: 26.0 },
  ],
};

export const MOCK_HISTORY: Record<string, PortfolioHistory[]> = {
  W001: [
    { date: '2025-11', aum: 4100000 }, { date: '2025-12', aum: 4350000 },
    { date: '2026-01', aum: 4280000 }, { date: '2026-02', aum: 4500000 },
    { date: '2026-03', aum: 4680000 }, { date: '2026-04', aum: 4800000 },
  ],
  W002: [
    { date: '2025-11', aum: 6300000 }, { date: '2025-12', aum: 6550000 },
    { date: '2026-01', aum: 6700000 }, { date: '2026-02', aum: 6900000 },
    { date: '2026-03', aum: 7050000 }, { date: '2026-04', aum: 7200000 },
  ],
};

export const MOCK_FAMILY: Record<string, FamilyLink[]> = {
  W001: [
    { id: 'F001', name: 'Anita Mehta', relation: 'Spouse', aum: 2500000, segment: 'Stable'     },
    { id: 'F002', name: 'Rohan Mehta', relation: 'Son',    aum: 500000,  segment: 'Opportunity' },
  ],
  W008: [
    { id: 'F003', name: 'Sanjay Bose', relation: 'Spouse', aum: 8900000, segment: 'Stable' },
  ],
};

export const MOCK_ACTIVITY_LOGS: Record<string, ActivityLog[]> = {
  W001: [
    { id: 'l1', date: '2026-04-12', type: 'Call',     details: 'Discussed SIP reactivation and market cycle benefits.', status: 'Success'   },
    { id: 'l2', date: '2026-03-20', type: 'Email',    details: 'Sent portfolio performance report for Q1 2026.',         status: 'Success'   },
    { id: 'l3', date: '2026-02-15', type: 'WhatsApp', details: 'Follow-up on paused SIP reason.',                        status: 'Follow-up' },
  ],
  W002: [
    { id: 'l4', date: '2026-04-15', type: 'Call',     details: 'Confirmed SIP top-up of ₹5,000 starting next month.',  status: 'Success' },
  ],
  W007: [
    { id: 'l5', date: '2026-03-20', type: 'Call',     details: 'Annual review completed. Client happy with 12%+ CAGR.', status: 'Success' },
  ],
};
