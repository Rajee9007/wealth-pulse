// ─── DataContext.tsx ───────────────────────────────────────────────────────────
// Central data provider — loads all data once, exposes via useData() hook
// Swap service calls for real fetch() when backend is ready

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import {
  initClients, getClientById, getClients, getClientHoldings,
  getPortfolioHistory, getActivityLogs, addActivityLog, getFamilyMembers,
  type ClientFilters, type ClientListResult, type ActivityLog,
} from '../services/clientService';

import {
  getDashboardSummary, getPossibility, getNudges, getNotifications,
  markNotificationRead, markAllNotificationsRead, MONTHLY_TREND,
  type DashboardSummary, type Notification, type Nudge, type PossibilityResult,
} from '../services/dashboardService';

import {
  getAdvisorProfile, getAdvisorPerformance, getTargets, updateTargets,
  BADGE_TIERS, getBadgeForPct,
  type AdvisorProfile, type AdvisorPerformance, type Targets, type BadgeTier,
} from '../services/advisorService';

import { getPlaybooks, getPlaybookClients, type Playbook } from '../services/playbookService';

// ─── Context shape ────────────────────────────────────────────────────────────

interface DataContextValue {
  // Clients
  clients: Client[];
  clientsResult: ClientListResult;
  fetchClients: (filters?: ClientFilters) => void;
  getClient: (id: string) => Client | undefined;
  getHoldings: ReturnType<typeof getClientHoldings> extends infer R ? (id: string) => R : never;
  getHistory: ReturnType<typeof getPortfolioHistory> extends infer R ? (id: string) => R : never;
  getLogs: (id: string) => ActivityLog[];
  addLog: (id: string, log: Omit<ActivityLog, 'id'>) => ActivityLog;
  getFamily: ReturnType<typeof getFamilyMembers> extends infer R ? (id: string) => R : never;

  // Dashboard
  dashboardSummary: DashboardSummary;
  monthlyTrend: typeof MONTHLY_TREND;
  nudges: Nudge[];
  possibility: PossibilityResult;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;

  // Advisor
  advisor: AdvisorProfile;
  performance: AdvisorPerformance;
  targets: Targets;
  saveTargets: (patch: Partial<Targets>) => void;
  badgeTiers: BadgeTier[];
  getBadge: typeof getBadgeForPct;

  // Playbooks
  playbooks: Playbook[];
  getPlaybookClients: typeof getPlaybookClients;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  /* ── async init — try live API, fallback to JSON ── */
  useEffect(() => {
    initClients().then(() => {
      setClientsResult(getClients({ limit: 50 }));
      setDashboardSummary(getDashboardSummary());
      setPossibility(getPossibility());
      setNudges(getNudges());
      setPerformance(getAdvisorPerformance());
    });
  }, []);

  /* ── clients ── */
  const [clientsResult, setClientsResult] = useState<ClientListResult>(() =>
    getClients({ limit: 50 }),
  );

  const fetchClients = useCallback((filters: ClientFilters = {}) => {
    setClientsResult(getClients({ limit: 50, ...filters }));
  }, []);

  /* ── dashboard — recompute after API data loads ── */
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>(() => getDashboardSummary());
  const [possibility, setPossibility]           = useState<PossibilityResult>(() => getPossibility());
  const [nudges, setNudges]                     = useState<Nudge[]>(() => getNudges());

  /* ── notifications ── */
  const [notifications, setNotifications] = useState<Notification[]>(() => getNotifications());

  const unreadCount = notifications.filter(n => n.unread).length;

  const markRead = useCallback((id: string) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
  }, []);

  const markAllRead = useCallback(() => {
    markAllNotificationsRead();
    setNotifications(getNotifications());
  }, []);

  /* ── advisor ── */
  const [advisor]     = useState<AdvisorProfile>(() => getAdvisorProfile());
  const [performance, setPerformance] = useState<AdvisorPerformance>(() => getAdvisorPerformance());
  const [targets, setTargetsState] = useState<Targets>(() => getTargets());

  const saveTargets = useCallback((patch: Partial<Targets>) => {
    setTargetsState(updateTargets(patch));
    setPerformance(getAdvisorPerformance());
  }, []);

  /* ── playbooks ── */
  const [playbooks] = useState<Playbook[]>(() => getPlaybooks());

  const value: DataContextValue = {
    // clients
    clients: clientsResult.clients,
    clientsResult,
    fetchClients,
    getClient:   getClientById,
    getHoldings: getClientHoldings,
    getHistory:  getPortfolioHistory,
    getLogs:     getActivityLogs,
    addLog:      addActivityLog,
    getFamily:   getFamilyMembers,

    // dashboard
    dashboardSummary,
    monthlyTrend: MONTHLY_TREND,
    nudges,
    possibility,

    // notifications
    notifications,
    unreadCount,
    markRead,
    markAllRead,

    // advisor
    advisor,
    performance,
    targets,
    saveTargets,
    badgeTiers: BADGE_TIERS,
    getBadge:   getBadgeForPct,

    // playbooks
    playbooks,
    getPlaybookClients,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
