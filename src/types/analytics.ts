// ── Analytics API Response Types ────────────────────────────────────────────

export interface AnalyticsOverview {
  mrr: number;
  mrrChange: number;
  activeSubscriptions: number;
  activeSubsChange: number;
  totalOrganizations: number;
  orgChange: number;
  totalUsers: number;
  userChange: number;
  trialSubscriptions: number;
  trialConversionRate: number;
  churnRate: number;
  arpu: number;
  newOrgs: number;
  newUsers: number;
  period: { start: string; end: string };
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  newSubscriptions: number;
}

export interface MRRTrendPoint {
  month: string;
  count: number;
}

export interface RevenueTrendData {
  revenueTrend: RevenueTrendPoint[];
  mrrTrend: MRRTrendPoint[];
}

export interface RevenueByPlanItem {
  plan: string;
  subscriptions: number;
  mrr: number;
}

export interface SubscriptionStatusStat {
  status: string;
  count: number;
  color: string;
}

export interface NewVsCanceledPoint {
  month: string;
  newSubs: number;
  canceled: number;
}

export interface PlanDistributionItem {
  plan: string;
  count: number;
  color: string;
}

export interface SubscriptionStatsData {
  statusStats: SubscriptionStatusStat[];
  newVsCanceled: NewVsCanceledPoint[];
  planDistribution: PlanDistributionItem[];
}

export interface OrgGrowthPoint {
  month: string;
  newOrgs: number;
  totalOrgs: number;
}

export interface TopOrgItem {
  organization: string;
  mrr: number;
  plan: string;
}

export interface OrgGrowthData {
  growth: OrgGrowthPoint[];
  topOrgs: TopOrgItem[];
}

export interface UserGrowthPoint {
  month: string;
  newUsers: number;
  totalUsers: number;
}

export interface RoleDistributionItem {
  role: string;
  count: number;
  color: string;
}

export interface UserGrowthData {
  growth: UserGrowthPoint[];
  roleDistribution: RoleDistributionItem[];
}

export interface ChurnTrendPoint {
  month: string;
  churned: number;
  churnRate: number;
}

export interface ChurnData {
  churnTrend: ChurnTrendPoint[];
}

// ── Date Range Types ────────────────────────────────────────────────────────

export interface DateRange {
  from: Date;
  to: Date;
}

export type DateRangePreset = '7d' | '30d' | '90d' | '6m' | '12m' | 'custom';
