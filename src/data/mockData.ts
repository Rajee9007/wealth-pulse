// Mock data for WealthPulse Advisor Copilot

export type Segment = 'Risk' | 'Opportunity' | 'Underperforming' | 'Stable';

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
  email: string;
  phone: string;
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

export const CURATED_CLIENTS: Client[] = [
  {
    id: 'C001', name: 'Arjun Mehta', segment: 'Risk',
    aum: 480000, aumPotential: 80000, commissionPotential: 3200,
    sipActive: false, lastActivity: '2026-02-28', lastContacted: '2026-04-01',
    urgencyScore: 95, action: 'Reactivate SIP',
    reason: 'SIP paused 52 days. High-value long-term investor missing growth cycle.',
    talkingPoints: ['SIP paused 52 days', 'Goal corpus at risk', 'Compound growth being lost'],
    goalTag: 'Retirement', riskProfile: 'Moderate', returns: 6.2,
    email: 'arjun.mehta@example.com', phone: '+919876543210',
  },
  {
    id: 'C002', name: 'Priya Sharma', segment: 'Opportunity',
    aum: 720000, aumPotential: 150000, commissionPotential: 6000,
    sipActive: true, lastActivity: '2026-04-18', lastContacted: '2026-04-15',
    urgencyScore: 92, action: 'Upsell SIP',
    reason: '₹2L idle savings detected. High investment possibility.',
    talkingPoints: ['Idle savings ₹2L detected', 'Portfolio doing well', 'Suggest SIP top-up ₹5,000/mo'],
    goalTag: 'Child Education', riskProfile: 'Aggressive', returns: 14.5,
    email: 'priya.sharma@example.com', phone: '+919988776655',
  },
  {
    id: 'C003', name: 'Ramesh Iyer', segment: 'Underperforming',
    aum: 1200000, aumPotential: 200000, commissionPotential: 8000,
    sipActive: true, lastActivity: '2026-04-10', lastContacted: '2026-03-25',
    urgencyScore: 75, action: 'Rebalance Portfolio',
    reason: 'Underperforming strategy. ₹20L AUM at risk of goal mismatch.',
    talkingPoints: ['High AUM but returns 5.1% vs benchmark 11%', 'Sector over-concentration risk', 'Switch from underperforming fund to hybrid fund'],
    goalTag: 'Wealth Building', riskProfile: 'Moderate', returns: 5.1,
    email: 'ramesh.iyer@example.com', phone: '+919123456789',
  },
  {
    id: 'C004', name: 'Kavita Nair', segment: 'Risk',
    aum: 320000, aumPotential: 50000, commissionPotential: 2000,
    sipActive: false, lastActivity: '2026-03-05', lastContacted: '2026-04-05',
    urgencyScore: 89, action: 'Re-engagement Call',
    reason: 'No transactions in 46 days, AUM declining',
    talkingPoints: ['No transactions in 46 days', 'AUM declining trend', 'Offer pause instead of stop'],
    goalTag: 'Home Purchase', riskProfile: 'Conservative', returns: 4.8,
    email: 'kavita.nair@example.com', phone: '+919000011122',
  },
  {
    id: 'C005', name: 'Suresh Pillai', segment: 'Opportunity',
    aum: 560000, aumPotential: 120000, commissionPotential: 4800,
    sipActive: true, lastActivity: '2026-04-19', lastContacted: '2026-04-10',
    urgencyScore: 72, action: 'Lump Sum Deployment',
    reason: 'Bonus credited, ₹1.5L parked in liquid',
    talkingPoints: ['₹1.5L idle in savings', 'Consistent investor', 'Present lump sum opportunity'],
    goalTag: 'Retirement', riskProfile: 'Moderate', returns: 12.3,
    email: 'suresh.pillai@example.com', phone: '+919222233344',
  },
  {
    id: 'C006', name: 'Deepa Krishnan', segment: 'Underperforming',
    aum: 850000, aumPotential: 130000, commissionPotential: 5200,
    sipActive: true, lastActivity: '2026-04-08', lastContacted: '2026-03-30',
    urgencyScore: 81, action: 'Portfolio Optimization',
    reason: 'High AUM, 70% in debt during bull run',
    talkingPoints: ['Poor allocation — 70% in debt, 30% equity', 'Risk appetite mismatch', 'Propose equity rebalancing'],
    goalTag: 'Wealth Building', riskProfile: 'Aggressive', returns: 6.8,
    email: 'deepa.k@example.com', phone: '+919555566677',
  },
  {
    id: 'C007', name: 'Vijay Anand', segment: 'Risk',
    aum: 200000, aumPotential: 30000, commissionPotential: 1200,
    sipActive: false, lastActivity: '2026-01-20', lastContacted: '2026-02-15',
    urgencyScore: 32, action: 'Financial Need Review',
    reason: 'Full redemption for house purchase (Financial Need). Unavoidable.',
    talkingPoints: ['Review house goal progress', 'Discuss tax implications', 'Maintenance call only'],
    goalTag: 'Tax Saving', riskProfile: 'Conservative', returns: 3.2,
    email: 'vijay.anand@example.com', phone: '+919888877766',
  },
  {
    id: 'C008', name: 'Ananya Bose', segment: 'Opportunity',
    aum: 430000, aumPotential: 90000, commissionPotential: 3600,
    sipActive: true, lastActivity: '2026-04-17', lastContacted: '2026-04-12',
    urgencyScore: 68, action: 'Goal-based Upsell',
    reason: 'Child education goal in 8 years, SIP insufficient',
    talkingPoints: ['Child education goal in 8 years', 'Current SIP insufficient for goal', 'Suggest SIP increase ₹3,000/mo'],
    goalTag: 'Child Education', riskProfile: 'Moderate', returns: 13.1,
    email: 'ananya.bose@example.com', phone: '+919777788899',
  },
  {
    id: 'C009', name: 'Vikram Joshi', segment: 'Stable',
    aum: 1500000, aumPotential: 20000, commissionPotential: 800,
    sipActive: true, lastActivity: '2026-04-10', lastContacted: '2026-03-20',
    urgencyScore: 15, action: 'Anniversary Review',
    reason: 'Portfolio on track. 12% CAGR vs 10% goal.',
    talkingPoints: ['Goals on track', 'Consistent 12% returns', 'Maintain current allocation'],
    goalTag: 'Retirement', riskProfile: 'Moderate', returns: 12.1,
    email: 'vikram.j@example.com', phone: '+919666655544',
  },
  {
    id: 'C010', name: 'Meera Deshmukh', segment: 'Stable',
    aum: 950000, aumPotential: 15000, commissionPotential: 600,
    sipActive: true, lastActivity: '2026-04-12', lastContacted: '2026-03-15',
    urgencyScore: 12, action: 'Client Satisfaction Call',
    reason: 'High satisfaction, consistent SIP activity.',
    talkingPoints: ['Consistent investor', 'Portfolio resilience check', 'Collect feedback'],
    goalTag: 'Wealth Building', riskProfile: 'Conservative', returns: 8.5,
    email: 'meera.d@example.com', phone: '+919444433322',
  },
  {
    id: 'C011', name: 'Zoya Khan', segment: 'Stable',
    aum: 2200000, aumPotential: 0, commissionPotential: 0,
    sipActive: true, lastActivity: '2026-04-20', lastContacted: '2026-04-05',
    urgencyScore: 5, action: 'Portfolio Maintenance',
    reason: 'Strong performance, Aggressive profile matched.',
    talkingPoints: ['18% CAGR over 3 years', 'High engagement', 'No action required'],
    goalTag: 'Wealth Building', riskProfile: 'Aggressive', returns: 18.2,
    email: 'zoya.k@example.com', phone: '+919333322211',
  },
];

// --- Generation Engine for 100+ Clients ---
const FIRST_NAMES = ['Aarav', 'Ishaan', 'Vihaan', 'Aditya', 'Siddharth', 'Rahul', 'Nandini', 'Kiara', 'Diya', 'Riya', 'Ansh', 'Aryan', 'Kabir', 'Myra', 'Zoya', 'Advait', 'Atharv', 'Shanaya', 'Hridhaan', 'Kavya'];
const LAST_NAMES = ['Kapoor', 'Singh', 'Reddy', 'Patel', 'Goel', 'Malhotra', 'Chatterjee', 'Verma', 'Dubey', 'Saxena', 'Desai', 'Banerjee', 'Nayar', 'Shetty', 'Venkatesh', 'Jain', 'Mehta', 'Gupta', 'Shah', 'Rao'];
const GOAL_TAGS = ['Retirement', 'Child Education', 'Wealth Building', 'Home Purchase', 'Tax Saving'];
const RISK_PROFILES: ('Conservative' | 'Moderate' | 'Aggressive')[] = ['Conservative', 'Moderate', 'Aggressive'];

function generateMockClients(count: number): Client[] {
  const generated: Client[] = [];
  const segments: Segment[] = ['Opportunity', 'Underperforming', 'Risk', 'Stable'];
  
  for (let i = 0; i < count; i++) {
    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const seg = segments[Math.floor(Math.random() * segments.length)];
    const aum = Math.floor(Math.random() * 5000000) + 100000;
    const pot = Math.floor(Math.random() * 500000);
    const returns = +(Math.random() * 15 + 2).toFixed(1);
    const urgency = Math.floor(Math.random() * 100);

    generated.push({
      id: `GEN-${i}`,
      name: `${fn} ${ln}`,
      segment: seg,
      aum,
      aumPotential: pot,
      commissionPotential: Math.round(pot * 0.04),
      sipActive: Math.random() > 0.3,
      lastActivity: '2026-04-15',
      lastContacted: '2026-04-01',
      urgencyScore: urgency,
      action: seg === 'Opportunity' ? 'Upsell SIP' : seg === 'Risk' ? 'Retention Call' : seg === 'Underperforming' ? 'Rebalance' : 'Maintenance',
      reason: `Automated insight for ${fn}. Potential growth of ${pot / 100000}L.`,
      talkingPoints: [`Portfolio returns at ${returns}%`, 'Goal tracking active', 'Consistent SIP history'],
      goalTag: GOAL_TAGS[Math.floor(Math.random() * GOAL_TAGS.length)],
      riskProfile: RISK_PROFILES[Math.floor(Math.random() * RISK_PROFILES.length)],
      returns,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      phone: `+91 ${Math.floor(8000000000 + Math.random() * 2000000000)}`,
    });
  }
  return generated;
}

export const MOCK_CLIENTS: Client[] = [
  ...CURATED_CLIENTS,
  ...generateMockClients(100)
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

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'growth', title: 'Idle Cash Detected',
    message: 'Arjun Mehta has ₹5.2L idle in savings. Possible upsell to Moderate SIP.',
    time: '2 min ago', unread: true, relatedClientId: 'C001'
  },
  {
    id: 'n2', type: 'risk', title: 'Urgent Rebalance',
    message: 'Zoya Khan\'s portfolio is 18% off target allocation due to equity rallies.',
    time: '1 hour ago', unread: true, relatedClientId: 'C011'
  },
  {
    id: 'n3', type: 'success', title: 'SIP Reactivated',
    message: 'Priya Sharma successfully resumed her ₹5,000 monthly SIP.',
    time: '3 hours ago', unread: true, relatedClientId: 'C002'
  },
  {
    id: 'n4', type: 'insight', title: 'Segment Performance',
    message: 'Your "Stable" portfolio segment is currently beating the benchmark by 2.4%.',
    time: '5 hours ago', unread: false
  },
  {
    id: 'n5', type: 'growth', title: 'High Potential Harvest',
    message: 'Ananya Bose has reached a 15.2% return milestone. Suggest top-up.',
    time: 'Yesterday', unread: false, relatedClientId: 'C008'
  },
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
  const stable = clients.filter(c => c.segment === 'Stable').reduce((s,c) => s + c.aumPotential, 0);
  return Math.round(opp * 0.6 + risk * 0.3 + under * 0.5 + stable * 0.1);
}

export function calcScore(actual: number, possibility: number): number {
  return Math.min(100, Math.round((actual / possibility) * 100));
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
