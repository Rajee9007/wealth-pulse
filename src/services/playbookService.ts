// ─── playbookService.ts ───────────────────────────────────────────────────────
// Business logic for Playbooks page

import { getAllClients } from './clientService';
import type { Client } from '../types/client.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Playbook {
  id: string;
  title: string;
  description: string;
  target_segment: string;
  impact_label: string;
  success_rate: number;
  icon_type: 'rocket' | 'shield' | 'zap' | 'crown';
  color: string;
  eligible_client_ids: string[];
}

// ─── Playbook definitions ─────────────────────────────────────────────────────

export const PLAYBOOKS: Playbook[] = [
  {
    id:                   'p1',
    title:                'SIP Top-up Blitz',
    description:          'Target high-potential Opportunity clients with significant idle cash reserves.',
    target_segment:       'Opportunity',
    impact_label:         '₹52L Potential',
    success_rate:         85,
    icon_type:            'rocket',
    color:                '#10b981',
    eligible_client_ids:  ['W002', 'W005', 'W008', 'W013', 'W017', 'W022', 'W027', 'W032'],
  },
  {
    id:                   'p2',
    title:                'Retention Shield',
    description:          'Automated nudge sequence for clients with paused SIPs or low engagement.',
    target_segment:       'Risk',
    impact_label:         '₹12L At Risk',
    success_rate:         64,
    icon_type:            'shield',
    color:                '#f43f5e',
    eligible_client_ids:  ['W001', 'W004', 'W012', 'W021', 'W029', 'W037', 'W039', 'W047', 'W049'],
  },
  {
    id:                   'p3',
    title:                'Equity Alpha Wave',
    description:          'Identify Underperforming portfolios and propose switches to high-alpha funds.',
    target_segment:       'Underperforming',
    impact_label:         '₹28L Optimization',
    success_rate:         72,
    icon_type:            'zap',
    color:                '#f59e0b',
    eligible_client_ids:  ['W003', 'W006', 'W016', 'W018', 'W020', 'W024', 'W026', 'W031', 'W035', 'W045'],
  },
  {
    id:                   'p4',
    title:                'Referral Harvest',
    description:          'Request high-value referrals from your top-performing Stable clients.',
    target_segment:       'Stable',
    impact_label:         '5+ Qualified Leads',
    success_rate:         45,
    icon_type:            'crown',
    color:                '#3b82f6',
    eligible_client_ids:  ['W007', 'W009', 'W010', 'W014', 'W023', 'W028', 'W033', 'W038', 'W040', 'W042', 'W046', 'W048', 'W050'],
  },
];

export function getPlaybooks(): Playbook[] {
  return PLAYBOOKS;
}

export function getPlaybookById(id: string): Playbook | undefined {
  return PLAYBOOKS.find(p => p.id === id);
}

// ─── Get eligible clients for a playbook (computed from client data) ──────────

export function getPlaybookClients(playbookId: string): Client[] {
  const playbook = getPlaybookById(playbookId);
  if (!playbook) return [];
  const all = getAllClients();
  const idSet = new Set(playbook.eligible_client_ids);
  return all.filter(c => idSet.has(c.id));
}
