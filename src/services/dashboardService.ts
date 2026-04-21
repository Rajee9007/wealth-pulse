// ─── dashboardService.ts ───────────────────────────────────────────────────────
// Business logic for Dashboard, Possibility, Notifications, Nudges

import { getAllClients } from './clientService';
import type { Client } from '../types/client.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SegmentCounts {
  Risk: number;
  Opportunity: number;
  Underperforming: number;
  Stable: number;
}

export interface DashboardSummary {
  total_aum_inr_cr: number;
  possibility_aum_inr_cr: number;
  total_clients: number;
  active_sips: number;
  segment_counts: SegmentCounts;
  top_clients: Client[];         // top 5 by urgency_score
}

export interface MonthlyTrendPoint {
  month: string;
  actual_inr: number;
  target_inr: number;
  possibility_inr: number;
  score: number;
  badge: string;
}

export interface Nudge {
  id: string;
  type: 'risk' | 'oppo' | 'target';
  message: string;
  count: number;
}

export interface Notification {
  id: string;
  type: 'growth' | 'risk' | 'success' | 'insight';
  title: string;
  message: string;
  time: string;
  unread: boolean;
  related_client_id: string | null;
}

export interface PossibilityBreakdown {
  segment: string;
  clients: number;
  potential_aum_inr_cr: number;
  weighted_inr_cr: number;
  weight: number;
}

// ─── Weights ──────────────────────────────────────────────────────────────────

const SEG_WEIGHTS = {
  Opportunity:    0.6,
  Underperforming: 0.5,
  Risk:           0.3,
  Stable:         0.1,
} as const;

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export function getDashboardSummary(): DashboardSummary {
  const clients = getAllClients();

  const total_aum_inr_cr = +clients
    .reduce((s, c) => s + c.profile.aum_inr_cr, 0)
    .toFixed(2);

  const possibility_aum_inr_cr = +clients
    .reduce((s, c) => s + c.profile.aum_potential_inr_cr * SEG_WEIGHTS[c.profile.segment], 0)
    .toFixed(2);

  const segment_counts: SegmentCounts = { Risk: 0, Opportunity: 0, Underperforming: 0, Stable: 0 };
  clients.forEach(c => segment_counts[c.profile.segment]++);

  const top_clients = [...clients]
    .sort((a, b) => b.profile.urgency_score - a.profile.urgency_score)
    .slice(0, 5);

  const active_sips = clients.filter(c => c.profile.sip_active).length;

  return { total_aum_inr_cr, possibility_aum_inr_cr, total_clients: clients.length, active_sips, segment_counts, top_clients };
}

// ─── Monthly Trend (static — will come from advisor's book in real backend) ────

export const MONTHLY_TREND: MonthlyTrendPoint[] = [
  { month: 'Nov', actual_inr: 420000, target_inr: 400000, possibility_inr: 500000, score: 65, badge: 'Stable' },
  { month: 'Dec', actual_inr: 510000, target_inr: 450000, possibility_inr: 560000, score: 70, badge: 'Strong' },
  { month: 'Jan', actual_inr: 480000, target_inr: 480000, possibility_inr: 530000, score: 68, badge: 'Stable' },
  { month: 'Feb', actual_inr: 590000, target_inr: 520000, possibility_inr: 640000, score: 76, badge: 'Strong' },
  { month: 'Mar', actual_inr: 660000, target_inr: 570000, possibility_inr: 740000, score: 80, badge: 'Elite'  },
  { month: 'Apr', actual_inr: 720000, target_inr: 600000, possibility_inr: 850000, score: 82, badge: 'Elite'  },
];

// ─── Nudges (computed from live client data) ───────────────────────────────────

export function getNudges(): Nudge[] {
  const clients = getAllClients();
  const now = new Date();

  const staleRisk = clients.filter(c => {
    if (c.profile.segment !== 'Risk') return false;
    const last = new Date(c.profile.last_contacted);
    return (now.getTime() - last.getTime()) / 86400000 > 7;
  }).length;

  const idleOppo = clients.filter(c =>
    c.profile.segment === 'Opportunity' && c.profile.aum_potential_inr_cr > 0.05,
  ).length;

  return [
    { id: 'N1', type: 'risk',   message: `${staleRisk} At-Risk clients not contacted in 7+ days`, count: staleRisk },
    { id: 'N2', type: 'oppo',   message: `${idleOppo} Opportunity clients have idle funds available`, count: idleOppo },
    { id: 'N3', type: 'target', message: 'Target achievement at 120% — keep pushing!', count: 0 },
  ];
}

// ─── Notifications ─────────────────────────────────────────────────────────────

let _notifications: Notification[] = [
  { id: 'n1', type: 'growth',  title: 'Idle Cash Detected',     message: 'Arjun Mehta has ₹5.2L idle in savings. Possible upsell to Moderate SIP.', time: '2 min ago',   unread: true,  related_client_id: 'W001' },
  { id: 'n2', type: 'risk',    title: 'Urgent Rebalance',        message: "Zoya Khan's portfolio is 18% off target allocation due to equity rallies.",  time: '1 hour ago',  unread: true,  related_client_id: 'W010' },
  { id: 'n3', type: 'success', title: 'SIP Reactivated',         message: 'Priya Sharma successfully resumed her ₹5,000 monthly SIP.',                 time: '3 hours ago', unread: true,  related_client_id: 'W002' },
  { id: 'n4', type: 'insight', title: 'Segment Performance',     message: 'Your Stable portfolio segment is currently beating the benchmark by 2.4%.',  time: '5 hours ago', unread: false, related_client_id: null   },
  { id: 'n5', type: 'growth',  title: 'High Potential Harvest',  message: 'Ananya Bose has reached a 15.2% return milestone. Suggest top-up.',         time: 'Yesterday',   unread: false, related_client_id: 'W008' },
  { id: 'n6', type: 'risk',    title: 'KYC Expiry Alert',        message: "Karan Mehrotra's KYC update has been pending since Nov 2025 — SIP blocked.", time: 'Yesterday',   unread: false, related_client_id: 'W029' },
];

export function getNotifications(): Notification[] { return _notifications; }
export function getUnreadCount(): number { return _notifications.filter(n => n.unread).length; }

export function markNotificationRead(id: string): void {
  _notifications = _notifications.map(n => n.id === id ? { ...n, unread: false } : n);
}

export function markAllNotificationsRead(): void {
  _notifications = _notifications.map(n => ({ ...n, unread: false }));
}

// ─── Possibility Engine ───────────────────────────────────────────────────────

export interface PossibilityResult {
  total_possibility_inr_cr: number;
  breakdown: PossibilityBreakdown[];
}

export function getPossibility(): PossibilityResult {
  const clients = getAllClients();
  const segments = ['Opportunity', 'Underperforming', 'Risk', 'Stable'] as const;

  let total = 0;
  const breakdown: PossibilityBreakdown[] = segments.map(seg => {
    const segClients = clients.filter(c => c.profile.segment === seg);
    const potential  = segClients.reduce((s, c) => s + c.profile.aum_potential_inr_cr, 0);
    const weight     = SEG_WEIGHTS[seg];
    const weighted   = +(potential * weight).toFixed(2);
    total += weighted;
    return {
      segment:              seg,
      clients:              segClients.length,
      potential_aum_inr_cr: +potential.toFixed(2),
      weighted_inr_cr:      weighted,
      weight,
    };
  });

  return { total_possibility_inr_cr: +total.toFixed(2), breakdown };
}
