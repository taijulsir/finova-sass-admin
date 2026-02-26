// ── Types for /admin/subscriptions endpoints ──────────────────────────────

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type PaymentProvider = 'STRIPE' | 'MANUAL' | 'PAYPAL' | 'OTHER';
export type SubscriptionCreatedBy = 'ADMIN' | 'SELF' | 'SYSTEM';
export type SubscriptionChangeType =
  | 'UPGRADE'
  | 'DOWNGRADE'
  | 'CANCEL'
  | 'RENEWAL'
  | 'TRIAL_START'
  | 'TRIAL_EXTEND'
  | 'REACTIVATION'
  | 'MANUAL_OVERRIDE';

export interface SubscriptionOrg {
  _id: string;
  name: string;
  organizationId: string;
  logo?: string;
  status?: string;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  price?: number;
  yearlyPrice?: number;
}

/**
 * Shape returned by GET /admin/subscriptions (aggregation with org+plan join)
 */
export interface SubscriptionRow {
  _id: string;
  organizationId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  renewalDate?: string;
  trialEndDate?: string;
  isTrial: boolean;
  paymentProvider?: PaymentProvider;
  paymentReferenceId?: string;
  createdBy: SubscriptionCreatedBy;
  cancelledAt?: string;
  cancelReason?: string;
  isActive: boolean;
  startDate?: string;
  createdAt: string;
  updatedAt?: string;
  org: SubscriptionOrg;
  plan: SubscriptionPlan;
}

export interface SubscriptionKpi {
  active: number;
  trial: number;
  pastDue: number;
  expired: number;
  canceled: number;
  mrr: number;
}

export interface SubscriptionHistoryItem {
  _id: string;
  subscriptionId: string;
  organizationId: string;
  previousPlanId?: { _id: string; name: string; price?: number } | null;
  newPlanId?: { _id: string; name: string; price?: number } | null;
  changeType: SubscriptionChangeType;
  changedBy?: { _id: string; name: string; email: string; avatar?: string } | null;
  reason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
