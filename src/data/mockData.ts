// Mock data for WealthPulse Advisor Copilot

export type Segment = 'Risk' | 'Opportunity' | 'Underperforming';

export interface Client {
  id: string;
  name: string;
  segment: Segment;
  aum: number;
  aumPotential: number;
  commissionPotential: number;
  sipActive: boolean;
  lastActivity: string;  // ISO date
  lastContacted: string; // ISO date
  urgencyScore: number;
  action: string;
  reason: string;
  talkingPoints: string[];
  goalTag: string;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  returns: number; // %
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

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'C001', name: 'Arjun Mehta', segment: 'Risk',
    aum: 480000, aumPotential: 80000, commissionPotential: 3200,
    sipActive: false, lastActivity: '2026-02-28', lastContacted: '2026-04-01',
    urgencyScore: 94, action: 'Reactivate SIP',
    reason: 'SIP paused 52 days ago, AUM down 6%',
    talkingPoints: ['SIP paused 52 days', 'Goal corpus at risk', 'Offer lower SIP amount'],
    goalTag: 'Retirement', riskProfile: 'Moderate', returns: 6.2,
  },
  {
    id: 'C002', name: 'Priya Sharma', segment: 'Opportunity',
    aum: 720000, aumPotential: 150000, commissionPotential: 6000,
    sipActive: true, lastActivity: '2026-04-18', lastContacted: '2026-04-15',
    urgencyScore: 78, action: 'Upsell SIP',
    reason: '₹2L idle in savings, salary hike detected',
    talkingPoints: ['Idle savings ₹2L detected', 'Portfolio doing well', 'Suggest SIP top-up ₹5,000/mo'],
    goalTag: 'Child Education', riskProfile: 'Aggressive', returns: 14.5,
  },
  {
    id: 'C003', name: 'Ramesh Iyer', segment: 'Underperforming',
    aum: 1200000, aumPotential: 200000, commissionPotential: 8000,
    sipActive: true, lastActivity: '2026-04-10', lastContacted: '2026-03-25',
    urgencyScore: 85, action: 'Rebalance Portfolio',
    reason: '60% in sector fund, 3yr CAGR 4.2%',
    talkingPoints: ['High AUM but returns 5.1% vs benchmark 11%', 'Sector over-concentration risk', 'Switch from underperforming fund to hybrid fund'],
    goalTag: 'Wealth Building', riskProfile: 'Moderate', returns: 5.1,
  },
  {
    id: 'C004', name: 'Kavita Nair', segment: 'Risk',
    aum: 320000, aumPotential: 50000, commissionPotential: 2000,
    sipActive: false, lastActivity: '2026-03-05', lastContacted: '2026-04-05',
    urgencyScore: 89, action: 'Re-engagement Call',
    reason: 'No transactions in 46 days, AUM declining',
    talkingPoints: ['No transactions in 46 days', 'AUM declining trend', 'Offer pause instead of stop'],
    goalTag: 'Home Purchase', riskProfile: 'Conservative', returns: 4.8,
  },
  {
    id: 'C005', name: 'Suresh Pillai', segment: 'Opportunity',
    aum: 560000, aumPotential: 120000, commissionPotential: 4800,
    sipActive: true, lastActivity: '2026-04-19', lastContacted: '2026-04-10',
    urgencyScore: 72, action: 'Lump Sum Deployment',
    reason: 'Bonus credited, ₹1.5L parked in liquid',
    talkingPoints: ['₹1.5L idle in savings', 'Consistent investor', 'Present lump sum opportunity'],
    goalTag: 'Retirement', riskProfile: 'Moderate', returns: 12.3,
  },
  {
    id: 'C006', name: 'Deepa Krishnan', segment: 'Underperforming',
    aum: 850000, aumPotential: 130000, commissionPotential: 5200,
    sipActive: true, lastActivity: '2026-04-08', lastContacted: '2026-03-30',
    urgencyScore: 81, action: 'Portfolio Optimization',
    reason: 'High AUM, 70% in debt during bull run',
    talkingPoints: ['Poor allocation — 70% in debt, 30% equity', 'Risk appetite mismatch', 'Propose equity rebalancing'],
    goalTag: 'Wealth Building', riskProfile: 'Aggressive', returns: 6.8,
  },
  {
    id: 'C007', name: 'Vijay Anand', segment: 'Risk',
    aum: 200000, aumPotential: 30000, commissionPotential: 1200,
    sipActive: false, lastActivity: '2026-01-20', lastContacted: '2026-02-15',
    urgencyScore: 97, action: 'Urgent Re-engagement',
    reason: '90+ days inactive, likely considering redemption',
    talkingPoints: ['90+ days inactive', 'Likely considering redemption', 'Emergency re-engagement call required'],
    goalTag: 'Tax Saving', riskProfile: 'Conservative', returns: 3.2,
  },
  {
    id: 'C008', name: 'Ananya Bose', segment: 'Opportunity',
    aum: 430000, aumPotential: 90000, commissionPotential: 3600,
    sipActive: true, lastActivity: '2026-04-17', lastContacted: '2026-04-12',
    urgencyScore: 68, action: 'Goal-based Upsell',
    reason: 'Child education goal in 8 years, SIP insufficient',
    talkingPoints: ['Child education goal in 8 years', 'Current SIP insufficient for goal', 'Suggest SIP increase ₹3,000/mo'],
    goalTag: 'Child Education', riskProfile: 'Moderate', returns: 13.1,
  },
];

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

// Badge tiers keyed on Possibility Achievement % (actual / possibility * 100)
export const BADGE_TIERS = [
  { label: '⚠️ At Risk',  min: 0,    max: 70,   color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
  { label: '👍 Stable',   min: 70,   max: 100,  color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  { label: '🔥 Strong',   min: 100,  max: 150,  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { label: '🚀 Elite',    min: 150,  max: 300,  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { label: '💎 Ultra',    min: 300,  max: 600,  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { label: '🧠 Master',   min: 600,  max: 1000, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { label: '👑 Legend',   min: 1000, max: Infinity, color: '#f8fafc', bg: 'rgba(248,250,252,0.12)' },
];

export const MONTHLY_TREND = [
  { month: 'Nov', actual: 420000, target: 400000, possibility: 500000 },
  { month: 'Dec', actual: 510000, target: 450000, possibility: 560000 },
  { month: 'Jan', actual: 480000, target: 480000, possibility: 530000 },
  { month: 'Feb', actual: 590000, target: 520000, possibility: 640000 },
  { month: 'Mar', actual: 660000, target: 570000, possibility: 740000 },
  { month: 'Apr', actual: 720000, target: 600000, possibility: 850000 },
];

export const NUDGES = [
  { id: 'N1', type: 'risk',   message: '3 At-Risk clients not contacted in 7+ days', count: 3 },
  { id: 'N2', type: 'oppo',   message: '2 Opportunity clients have idle funds available', count: 2 },
  { id: 'N3', type: 'target', message: 'Target achievement at 120% — keep pushing!', count: 0 },
];

// Utility calculations
export function calcPossibility(clients: Client[]) {
  const opp   = clients.filter(c => c.segment === 'Opportunity').reduce((s,c) => s + c.aumPotential, 0);
  const risk  = clients.filter(c => c.segment === 'Risk').reduce((s,c) => s + c.aumPotential, 0);
  const under = clients.filter(c => c.segment === 'Underperforming').reduce((s,c) => s + c.aumPotential, 0);
  return Math.round(opp * 0.6 + risk * 0.3 + under * 0.5);
}

export function calcScore(actual: number, possibility: number): number {
  return Math.round(100 * Math.log10(1 + actual / possibility));
}

/** Pass possibilityAchievement % (e.g. 84.7 for 84.7%) */
export function getBadge(possibilityPct: number) {
  return BADGE_TIERS.find(t => possibilityPct >= t.min && possibilityPct < t.max) ?? BADGE_TIERS.at(-1)!;
}

export function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}
