// ─── clientService.ts ─────────────────────────────────────────────────────────
//
// DATA SOURCE (priority order):
//   1. Live API → copilotApi.fetchClients()  (https://rmtalkingcopilot.vercel.app/api/clients)
//   2. Fallback → mock_clients_reference.json
//
// Call initClients() once at app startup (DataContext). All subsequent
// calls to getAllClients() / getClients() use the in-memory cache.
// ─────────────────────────────────────────────────────────────────────────────

import type { Client, Segment, KycStatus } from '../types/client.types';
import rawData from '../data/mock_clients_reference.json';

// ─── JSON fallback pool (50 curated clients) ──────────────────────────────────
const JSON_CLIENTS: Client[] = (rawData as { clients: Client[] }).clients;

// ─── In-memory runtime cache (populated by initClients) ───────────────────────
let _clients: Client[] = JSON_CLIENTS; // default until async init completes
let _initPromise: Promise<Client[]> | null = null;

// ─── initClients() — called ONCE by DataContext on mount ─────────────────────
export function initClients(): Promise<Client[]> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    _clients = JSON_CLIENTS;
    console.info(`[clientService] Loaded ${_clients.length} clients from JSON`);
    return _clients;
  })();

  return _initPromise;
}


// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientFilters {
  segment?: Segment;
  sip_active?: boolean;
  kyc_status?: KycStatus;
  sortBy?: 'urgency_score' | 'aum_inr_cr' | 'ytd_return_pct' | 'last_activity' | 'name';
  order?: 'asc' | 'desc';
  search?: string;
  page?: number;
  limit?: number;
}

export interface ClientListResult {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
}

export interface Holding {
  id: string;
  name: string;
  type: string;
  value_inr: number;
  pnl_inr: number;
  pnl_pct: number;
  weight: number;
}

export interface PortfolioHistoryPoint {
  date: string;
  aum_inr_cr: number;
}

export interface ActivityLog {
  id: string;
  date: string;
  type: 'Call' | 'Email' | 'WhatsApp' | 'Meeting' | 'Note';
  details: string;
  status: 'Success' | 'Follow-up' | 'Pending';
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  email?: string;
  aum_inr_cr: number;
  segment: Segment;
}

// ─── Client List (GET /api/clients) ───────────────────────────────────────────

export function getClients(filters: ClientFilters = {}): ClientListResult {
  const {
    segment, sip_active, kyc_status,
    sortBy = 'urgency_score', order = 'desc',
    search, page = 1, limit = 50,
  } = filters;

  let result = [..._clients];

  if (segment)                  result = result.filter(c => c.profile.segment === segment);
  if (sip_active !== undefined)  result = result.filter(c => c.profile.sip_active === sip_active);
  if (kyc_status)               result = result.filter(c => c.profile.kyc_status === kyc_status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.profile.email.toLowerCase().includes(q) ||
      c.profile.occupation.toLowerCase().includes(q),
    );
  }

  result.sort((a, b) => {
    let av: number | string, bv: number | string;
    switch (sortBy) {
      case 'urgency_score':   av = a.profile.urgency_score;   bv = b.profile.urgency_score;   break;
      case 'aum_inr_cr':      av = a.profile.aum_inr_cr;      bv = b.profile.aum_inr_cr;      break;
      case 'ytd_return_pct':  av = a.profile.ytd_return_pct;  bv = b.profile.ytd_return_pct;  break;
      case 'last_activity':   av = a.profile.last_activity;   bv = b.profile.last_activity;   break;
      default:                av = a.name;                    bv = b.name;
    }
    if (av < bv) return order === 'asc' ? -1 : 1;
    if (av > bv) return order === 'asc' ?  1 : -1;
    return 0;
  });

  const total = result.length;
  const start = (page - 1) * limit;
  return { clients: result.slice(start, start + limit), total, page, limit };
}

// ─── Single Client (GET /api/clients/:id) ─────────────────────────────────────

export function getClientById(id: string): Client | undefined {
  return _clients.find(c => c.id === id);
}

export function getAllClients(): Client[] {
  return _clients;
}

// ─── Holdings (GET /api/clients/:id/holdings) ─────────────────────────────────
// Derived from top_holdings weights × AUM — real API returns exact values

export function getClientHoldings(id: string): Holding[] {
  const client = getClientById(id);
  if (!client) return [];
  const totalValueInr = client.profile.aum_inr_cr * 10_000_000;
  return client.profile.top_holdings.map((h, i) => {
    const value_inr = Math.round(totalValueInr * h.weight);
    const pnl_pct   = +(client.profile.ytd_return_pct * (0.8 + i * 0.12)).toFixed(1);
    const pnl_inr   = Math.round(value_inr * pnl_pct / 100);
    return { id: `${id}-h${i}`, name: h.name, type: h.type, value_inr, pnl_inr, pnl_pct, weight: h.weight };
  });
}

// ─── Portfolio History (GET /api/clients/:id/portfolio-history) ───────────────
// Back-calculated from current AUM + YTD return — real API returns stored snapshots

export function getPortfolioHistory(id: string): PortfolioHistoryPoint[] {
  const client = getClientById(id);
  if (!client) return [];
  const currentAum  = client.profile.aum_inr_cr;
  const monthlyRate = client.profile.ytd_return_pct / 100 / 12;
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const aum = +(currentAum / Math.pow(1 + monthlyRate, 5 - i)).toFixed(2);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { date: label, aum_inr_cr: aum };
  });
}

// ─── Activity Logs (GET /api/clients/:id/activity-logs) ───────────────────────

const ACTIVITY_LOGS: Record<string, ActivityLog[]> = {
  W001: [
    { id: 'l1', date: '2026-04-12', type: 'Call',     details: 'Discussed SIP reactivation and market cycle benefits. Client agreed to review.', status: 'Success'   },
    { id: 'l2', date: '2026-03-20', type: 'Email',    details: 'Sent portfolio performance report for Q1 2026.', status: 'Success'   },
    { id: 'l3', date: '2026-02-15', type: 'WhatsApp', details: 'Follow-up on paused SIP reason. No response.', status: 'Follow-up' },
  ],
  W002: [
    { id: 'l4', date: '2026-04-15', type: 'Call',  details: 'Confirmed SIP top-up of ₹5,000 starting next month.', status: 'Success' },
    { id: 'l5', date: '2026-03-28', type: 'Email', details: 'Shared fund analysis report for child education goal.', status: 'Success' },
  ],
  W007: [
    { id: 'l6', date: '2026-03-20', type: 'Call',  details: 'Annual review completed. Client happy with 12%+ CAGR. Goals on track.', status: 'Success'   },
    { id: 'l7', date: '2026-01-15', type: 'Email', details: 'Sent year-end portfolio summary and 2026 outlook.', status: 'Success'   },
  ],
  W010: [
    { id: 'l8', date: '2026-04-05', type: 'Call',  details: 'Quarterly review. Client delighted with 18% CAGR. Agreed to refer 2 friends.', status: 'Success' },
    { id: 'l9', date: '2026-01-20', type: 'Email', details: 'Shared premium portfolio report with benchmark outperformance analysis.', status: 'Success' },
  ],
  W012: [
    { id: 'l10', date: '2026-03-18', type: 'Call',     details: 'Retention call — client cited liquidity need. Suggested partial SWP.', status: 'Follow-up' },
    { id: 'l11', date: '2026-02-28', type: 'WhatsApp', details: 'Reminder about investment continuity. No response.', status: 'Pending'   },
  ],
  W014: [
    { id: 'l12', date: '2026-04-02', type: 'Call',  details: 'SWP adequacy review. Client comfortable with ₹45k monthly.', status: 'Success' },
    { id: 'l13', date: '2026-01-10', type: 'Email', details: 'Annual income report. Suggested SWP increase from FY2027.', status: 'Success' },
  ],
};

export function getActivityLogs(id: string): ActivityLog[] {
  if (ACTIVITY_LOGS[id]) return ACTIVITY_LOGS[id];
  const client = getClientById(id);
  if (!client) return [];
  return [{
    id: `${id}-l1`, date: client.profile.last_contacted, type: 'Call',
    details: `Routine check-in with ${client.name}. Discussed portfolio performance.`,
    status: 'Success',
  }];
}

export function addActivityLog(id: string, log: Omit<ActivityLog, 'id'>): ActivityLog {
  const entry: ActivityLog = { ...log, id: `${id}-l${Date.now()}` };
  if (!ACTIVITY_LOGS[id]) ACTIVITY_LOGS[id] = [];
  ACTIVITY_LOGS[id].unshift(entry);
  return entry;
}

// ─── Family (GET /api/clients/:id/family) ─────────────────────────────────────

const FAMILY_DATA: Record<string, FamilyMember[]> = {
  W001:  [
    { id: 'F001', name: 'Anita Mehta',  relation: 'Spouse',   email: 'anita.mehta@example.com',  aum_inr_cr: 0.25, segment: 'Stable'      },
    { id: 'F002', name: 'Rohan Mehta',  relation: 'Son',      email: 'rohan.mehta@example.com',  aum_inr_cr: 0.05, segment: 'Opportunity'  },
  ],
  W008: [{ id: 'F003', name: 'Sanjay Bose',  relation: 'Spouse',   email: 'sanjay.bose@example.com',  aum_inr_cr: 0.89, segment: 'Stable'      }],
  W010: [
    { id: 'F004', name: 'Imran Khan',   relation: 'Spouse',   email: 'imran.khan@example.com',   aum_inr_cr: 1.10, segment: 'Stable'      },
    { id: 'F005', name: 'Sara Khan',    relation: 'Daughter', email: 'sara.khan@example.com',    aum_inr_cr: 0.10, segment: 'Opportunity'  },
  ],
  W014: [{ id: 'F006', name: 'Priya Verma',  relation: 'Spouse',   email: 'priya.verma@example.com',  aum_inr_cr: 2.50, segment: 'Stable'      }],
  W023: [
    { id: 'F007', name: 'Raghav Krishnaswamy', relation: 'Son',      aum_inr_cr: 0.08, segment: 'Opportunity' },
    { id: 'F008', name: 'Meena Krishnaswamy',  relation: 'Daughter', aum_inr_cr: 0.05, segment: 'Opportunity' },
  ],
  W050: [
    { id: 'F009', name: 'Suresh Venkat',  relation: 'Spouse',   aum_inr_cr: 3.20, segment: 'Stable'     },
    { id: 'F010', name: 'Anand Venkat',   relation: 'Son',      aum_inr_cr: 0.45, segment: 'Stable'     },
    { id: 'F011', name: 'Lakshmi Venkat', relation: 'Daughter', aum_inr_cr: 0.30, segment: 'Opportunity' },
  ],
};

export function getFamilyMembers(id: string): FamilyMember[] {
  return FAMILY_DATA[id] ?? [];
}
