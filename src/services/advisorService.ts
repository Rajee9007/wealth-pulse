// ─── advisorService.ts ────────────────────────────────────────────────────────
// Business logic for Advisor profile, performance, badge, and targets

import { getAllClients } from './clientService';
import { getPossibility } from './dashboardService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdvisorProfile {
  id: string;
  name: string;
  email: string;
  avatar_initials: string;
  branch: string;
}

export interface AdvisorPerformance {
  month: string;
  actual_inr: number;
  target_inr: number;
  possibility_aum_inr: number;
  possibility_commission_inr: number;
  performance_score: number;
  badge: string;
  target_achievement_pct: number;
  possibility_achievement_pct: number;
  evaluated_clients: number;
  active_sips: number;
  total_aum_inr_cr: number;
  previous_actual_inr: number;
  previous_target_inr: number;
}

export interface BadgeTier {
  label: string;
  min_pct: number;
  max_pct: number | null;
  color: string;
  emoji: string;
}

export interface Targets {
  aum_target_inr: number;
  aum_actual_inr: number;
  commission_target_inr: number;
  commission_actual_inr: number;
  new_sip_target: number;
  new_sip_actual: number;
  new_client_target: number;
  new_client_actual: number;
  period: string;
}

// ─── Advisor Profile (static — from auth/me in real backend) ─────────────────

export const ADVISOR_PROFILE: AdvisorProfile = {
  id:              'RM001',
  name:            'Rajesh Kumar',
  email:           'rajesh.kumar@wealthpulse.in',
  avatar_initials: 'RK',
  branch:          'Mumbai – Bandra West',
};

export function getAdvisorProfile(): AdvisorProfile {
  return ADVISOR_PROFILE;
}

// ─── Performance (computed from clients + static target data) ─────────────────

export function getAdvisorPerformance(): AdvisorPerformance {
  const clients      = getAllClients();
  const total_aum    = +clients.reduce((s, c) => s + c.profile.aum_inr_cr, 0).toFixed(2);
  const active_sips  = clients.filter(c => c.profile.sip_active).length;
  const poss         = getPossibility();
  
  // Use current targets from storage
  const t = getTargets();
  const actual_inr   = t.aum_actual_inr;
  const target_inr   = t.aum_target_inr;
  const possibility  = poss.total_possibility_inr_cr * 10_000_000;

  // Previous performance for analysis / badge criteria
  const prevPerfRaw = localStorage.getItem('wealthpulse_prev_perf');
  const prevPerf = prevPerfRaw ? JSON.parse(prevPerfRaw) : { actual: 28200000, target: 26000000 };

  const target_pct      = target_inr > 0 ? +(actual_inr / target_inr * 100).toFixed(1) : 0;
  const poss_pct        = possibility > 0 ? +(actual_inr / possibility * 100).toFixed(1) : 0;
  
  // Badge based on PREVIOUS achievement
  const prev_pct = prevPerf.target > 0 ? +(prevPerf.actual / prevPerf.target * 100).toFixed(1) : 0;
  const badgeTier = getBadgeForPct(prev_pct).label;

  return {
    month:                      t.period,
    actual_inr,
    target_inr,
    possibility_aum_inr:        possibility,
    possibility_commission_inr: 34000,
    performance_score:          Math.min(100, Math.round(target_pct * 0.7 + poss_pct * 0.3)),
    badge:                      badgeTier,
    target_achievement_pct:     target_pct,
    possibility_achievement_pct: poss_pct,
    evaluated_clients:          clients.length,
    active_sips,
    total_aum_inr_cr:           total_aum,
    previous_actual_inr:        prevPerf.actual,
    previous_target_inr:        prevPerf.target,
  };
}

// ─── Badge tiers ──────────────────────────────────────────────────────────────

export const BADGE_TIERS: BadgeTier[] = [
  { label: 'At Risk',  min_pct: 0,    max_pct: 70,   color: '#f43f5e', emoji: '⚠️' },
  { label: 'Stable',   min_pct: 70,   max_pct: 100,  color: '#94a3b8', emoji: '👍' },
  { label: 'Strong',   min_pct: 100,  max_pct: 150,  color: '#f59e0b', emoji: '🔥' },
  { label: 'Elite',    min_pct: 150,  max_pct: 300,  color: '#3b82f6', emoji: '🚀' },
  { label: 'Ultra',    min_pct: 300,  max_pct: 600,  color: '#8b5cf6', emoji: '💎' },
  { label: 'Master',   min_pct: 600,  max_pct: 1000, color: '#10b981', emoji: '🧠' },
  { label: 'Legend',   min_pct: 1000, max_pct: null, color: '#f8fafc', emoji: '👑' },
];

export function getBadgeForScore(score: number): string {
  // score here is performance_score 0-100; map proportionally to pct
  const pct = score * 1.2; // rough mapping to make 82 → ~98% ≈ "Stable"
  const tier = BADGE_TIERS.slice().reverse().find(t => pct >= t.min_pct);
  return tier?.label ?? 'At Risk';
}

export function getBadgeForPct(pct: number): BadgeTier {
  return BADGE_TIERS.slice().reverse().find(t => pct >= t.min_pct) ?? BADGE_TIERS[0];
}

// ─── Targets ──────────────────────────────────────────────────────────────────

function getDefaultTargets(): Targets {
  // Base default target on doable possibility if clients are loaded
  const poss = getPossibility();
  const default_target = poss.total_possibility_inr_cr > 0 
    ? Math.round(poss.total_possibility_inr_cr * 10_000_000 * 0.8) 
    : 30000000;

  return {
    aum_target_inr:       default_target,
    aum_actual_inr:       Math.round(default_target * 0.70),
    commission_target_inr: Math.round(default_target * 0.04),
    commission_actual_inr: Math.round(default_target * 0.04 * 0.70),
    new_sip_target:       15,
    new_sip_actual:       11,
    new_client_target:    5,
    new_client_actual:    3,
    period:               'April 2026',
  };
}

export function getTargets(): Targets {
  try {
    const raw = localStorage.getItem('wealthpulse_targets');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load targets from localStorage', e);
  }
  return getDefaultTargets();
}

export function updateTargets(patch: Partial<Targets>): Targets {
  const current = getTargets();
  const updated = { ...current, ...patch };
  localStorage.setItem('wealthpulse_targets', JSON.stringify(updated));
  return updated;
}
