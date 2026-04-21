// ─── Enums ────────────────────────────────────────────────────────────────────

export type Segment     = 'Risk' | 'Opportunity' | 'Underperforming' | 'Stable';
export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive';
export type KycStatus   = 'Completed' | 'Pending' | 'In Progress' | 'Update Required';
export type HoldingType = 'equity_mf' | 'debt_mf' | 'hybrid_mf' | 'gold_etf' | 'equity_etf';
export type GoalTag     = 'Retirement' | 'Child Education' | 'Wealth Building' | 'Home Purchase' | 'Tax Saving';

// ─── Sub-types ────────────────────────────────────────────────────────────────

export interface Allocation {
  cash:         number; // 0–1 fraction
  debt:         number;
  equity:       number;
  alternatives: number;
}

export interface TopHolding {
  name:   string;
  type:   HoldingType;
  weight: number; // 0–1 fraction of portfolio
}

// ─── Core Client Profile ──────────────────────────────────────────────────────

export interface ClientProfile {
  // Identity
  age:        number;
  email:      string;
  phone:      string;
  occupation: string;
  kyc_status: KycStatus;

  // Classification
  segment:      Segment;
  risk_profile: RiskProfile;
  goal_tag:     GoalTag;

  // Advisor intelligence
  action:  string;     // e.g. "Reactivate SIP"
  reason:  string;     // Narrative explanation
  flags:   string[];   // 2–3 key talking points

  // Status
  sip_active:    boolean;
  urgency_score: number; // 0–100

  // Financials
  aum_inr_cr:              number; // AUM in Crores
  aum_potential_inr_cr:    number; // Upsell headroom in Crores
  net_profit_inr_cr:       number; // Can be negative
  commission_potential_inr: number; // In INR
  wealth_score:            number; // 0–100

  // Returns
  ytd_return_pct:    number; // Can be negative
  benchmark_ytd_pct: number;

  // Dates
  last_activity:  string; // ISO YYYY-MM-DD
  last_contacted: string; // ISO YYYY-MM-DD

  // Portfolio
  allocation:   Allocation;
  top_holdings: TopHolding[];
}

// ─── Client (top-level API object) ────────────────────────────────────────────

export interface Client {
  id:      string; // e.g. "W001"
  name:    string;
  profile: ClientProfile;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message: string;
}

export type ClientListResponse   = ApiResponse<Client[]>;
export type ClientDetailResponse = ApiResponse<Client>;
