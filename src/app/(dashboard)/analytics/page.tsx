'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminService } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  Building2,
  CreditCard,
  Activity,
  UserCheck,
  RefreshCw,
  Target,
} from 'lucide-react';
import type {
  AnalyticsOverview,
  RevenueTrendData,
  RevenueByPlanItem,
  SubscriptionStatsData,
  OrgGrowthData,
  UserGrowthData,
  ChurnData,
  DateRangePreset,
} from '@/types/analytics';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatMoney(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function getPresetDates(preset: DateRangePreset): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  switch (preset) {
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    case '6m':
      start.setMonth(end.getMonth() - 6);
      break;
    case '12m':
    default:
      start.setMonth(end.getMonth() - 11);
      break;
  }
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

// ── Metric Card ────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  loading?: boolean;
  accent?: string;
}

function MetricCard({ title, value, change, changeLabel, icon, loading, accent = 'text-primary' }: MetricCardProps) {
  const isPositive = (change ?? 0) > 0;
  const isZero = (change ?? 0) === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {loading ? (
          <Skeleton className="h-4 w-28" />
        ) : (
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        )}
        <div className={`${accent} opacity-70`}>{icon}</div>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          <>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {isZero ? (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                ) : isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={isPositive ? 'text-green-600 dark:text-green-400' : isZero ? '' : 'text-red-600 dark:text-red-400'}>
                  {isPositive ? '+' : ''}{change}%
                </span>
                <span>{changeLabel ?? 'vs last period'}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Chart Skeleton ─────────────────────────────────────────────────────────

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full animate-pulse rounded-lg bg-muted/30" style={{ height }} />
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground mb-1">{formatMonth(label)}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [preset, setPreset] = useState<DateRangePreset>('12m');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData | null>(null);
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlanItem[]>([]);
  const [subStats, setSubStats] = useState<SubscriptionStatsData | null>(null);
  const [orgGrowth, setOrgGrowth] = useState<OrgGrowthData | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData | null>(null);
  const [churnData, setChurnData] = useState<ChurnData | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { startDate, endDate } = getPresetDates(preset);
    try {
      const [ov, rt, rbp, ss, og, ug, ch] = await Promise.all([
        AdminService.getAnalyticsOverview(startDate, endDate),
        AdminService.getRevenueTrend(startDate, endDate),
        AdminService.getRevenueByPlan(),
        AdminService.getSubscriptionStats(startDate, endDate),
        AdminService.getOrgGrowth(startDate, endDate),
        AdminService.getUserGrowth(startDate, endDate),
        AdminService.getChurnAnalysis(startDate, endDate),
      ]);
      setOverview(ov);
      setRevenueTrend(rt);
      setRevenueByPlan(rbp?.plans ?? []);
      setSubStats(ss);
      setOrgGrowth(og);
      setUserGrowth(ug);
      setChurnData(ch);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [preset, refreshKey]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const presetLabels: Record<DateRangePreset, string> = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '6m': 'Last 6 months',
    '12m': 'Last 12 months',
    'custom': 'Custom',
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            SaaS growth, revenue, and retention intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={preset} onValueChange={(v) => setPreset(v as DateRangePreset)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(presetLabels) as DateRangePreset[])
                .filter((k) => k !== 'custom')
                .map((k) => (
                  <SelectItem key={k} value={k}>
                    {presetLabels[k]}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={loading ? '—' : formatMoney(overview?.mrr ?? 0)}
          change={overview?.mrrChange}
          icon={<DollarSign className="h-4 w-4" />}
          loading={loading}
          accent="text-emerald-500"
        />
        <MetricCard
          title="Active Subscriptions"
          value={loading ? '—' : formatNumber(overview?.activeSubscriptions ?? 0)}
          change={overview?.activeSubsChange}
          icon={<CreditCard className="h-4 w-4" />}
          loading={loading}
          accent="text-blue-500"
        />
        <MetricCard
          title="Total Organizations"
          value={loading ? '—' : formatNumber(overview?.totalOrganizations ?? 0)}
          change={overview?.orgChange}
          changeLabel="new this period"
          icon={<Building2 className="h-4 w-4" />}
          loading={loading}
          accent="text-violet-500"
        />
        <MetricCard
          title="Total Users"
          value={loading ? '—' : formatNumber(overview?.totalUsers ?? 0)}
          change={overview?.userChange}
          changeLabel="new this period"
          icon={<Users className="h-4 w-4" />}
          loading={loading}
          accent="text-orange-500"
        />
        <MetricCard
          title="Trial Subscriptions"
          value={loading ? '—' : formatNumber(overview?.trialSubscriptions ?? 0)}
          icon={<Activity className="h-4 w-4" />}
          loading={loading}
          accent="text-sky-500"
        />
        <MetricCard
          title="Trial Conversion Rate"
          value={loading ? '—' : `${overview?.trialConversionRate ?? 0}%`}
          icon={<Target className="h-4 w-4" />}
          loading={loading}
          accent="text-teal-500"
        />
        <MetricCard
          title="Churn Rate"
          value={loading ? '—' : `${overview?.churnRate ?? 0}%`}
          icon={<TrendingDown className="h-4 w-4" />}
          loading={loading}
          accent="text-red-500"
        />
        <MetricCard
          title="ARPU"
          value={loading ? '—' : formatMoney(overview?.arpu ?? 0)}
          icon={<UserCheck className="h-4 w-4" />}
          loading={loading}
          accent="text-amber-500"
        />
      </div>

      {/* ── Revenue Trend ── */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue and new subscriptions over time</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton height={280} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueTrend?.revenueTrend ?? []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="_id" tickFormatter={formatMonth} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tickFormatter={(v) => formatMoney(v)} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip content={<CustomTooltip formatter={formatMoney} />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#6366f1"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="newSubscriptions"
                  name="New Subs"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  yAxisId={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Revenue by Plan + Subscription Status ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>MRR contribution per subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={250} />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueByPlan} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => formatMoney(v)} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="plan" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip content={<CustomTooltip formatter={formatMoney} />} />
                  <Bar dataKey="mrr" name="MRR" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Current distribution of subscription states</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-6">
            {loading ? (
              <ChartSkeleton height={250} />
            ) : (
              <>
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie
                      data={subStats?.statusStats ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="count"
                      nameKey="status"
                    >
                      {(subStats?.statusStats ?? []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 text-sm">
                  {(subStats?.statusStats ?? []).map((s) => (
                    <div key={s.status} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-muted-foreground capitalize">{s.status.toLowerCase()}</span>
                      <span className="font-semibold ml-auto pl-4">{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── New vs Canceled Subscriptions ── */}
      <Card>
        <CardHeader>
          <CardTitle>New vs. Canceled Subscriptions</CardTitle>
          <CardDescription>Monthly acquisition and churn comparison</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton height={260} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subStats?.newVsCanceled ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="newSubs" name="New" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="canceled" name="Canceled" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Org Growth + Top Orgs ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Growth</CardTitle>
            <CardDescription>New and cumulative organizations over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={250} />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={orgGrowth?.growth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="newOrgs" name="New Orgs" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="totalOrgs" name="Total Orgs" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Organizations by MRR</CardTitle>
            <CardDescription>Highest-revenue organizations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={250} />
            ) : (
              <div className="space-y-2">
                {(orgGrowth?.topOrgs ?? []).slice(0, 8).map((org, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                      <span className="truncate text-sm font-medium">{org.organization}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge variant="secondary" className="text-xs">{org.plan}</Badge>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 w-16 text-right">
                        {formatMoney(org.mrr)}/mo
                      </span>
                    </div>
                  </div>
                ))}
                {(orgGrowth?.topOrgs ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── User Growth + Role Distribution ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations and platform totals</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={250} />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={userGrowth?.growth ?? []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="totalUsers" name="Total Users" stroke="#f59e0b" fill="url(#colorUsers)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="newUsers" name="New Users" stroke="#ef4444" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>Platform user breakdown by global role</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-6">
            {loading ? (
              <ChartSkeleton height={250} />
            ) : (
              <>
                <ResponsiveContainer width="55%" height={210}>
                  <PieChart>
                    <Pie
                      data={userGrowth?.roleDistribution ?? []}
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      dataKey="count"
                      nameKey="role"
                    >
                      {(userGrowth?.roleDistribution ?? []).map((entry, index) => (
                        <Cell key={`role-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name: any) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 text-sm">
                  {(userGrowth?.roleDistribution ?? []).map((r) => (
                    <div key={r.role} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="text-muted-foreground capitalize">{r.role.replace(/_/g, ' ').toLowerCase()}</span>
                      <span className="font-semibold ml-auto pl-4">{r.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Plan Distribution ── */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>Active subscription distribution across plans</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton height={260} />
          ) : (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="45%" height={240}>
                <PieChart>
                  <Pie
                    data={subStats?.planDistribution ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="plan"
                  >
                    {(subStats?.planDistribution ?? []).map((entry, index) => (
                      <Cell key={`plan-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={subStats?.planDistribution ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="plan" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Subscriptions" radius={[4, 4, 0, 0]}>
                      {(subStats?.planDistribution ?? []).map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Churn Analysis ── */}
      <Card>
        <CardHeader>
          <CardTitle>Churn Analysis</CardTitle>
          <CardDescription>Monthly churn count and churn rate trend</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton height={260} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={churnData?.churnTrend ?? []}>
                <defs>
                  <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl text-sm">
                        <p className="font-semibold mb-1">{formatMonth(label)}</p>
                        {payload.map((entry: any, i: number) => (
                          <p key={i} style={{ color: entry.color }}>
                            {entry.name}: {entry.name === 'Churn Rate' ? `${entry.value}%` : entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="churned"
                  name="Churned"
                  stroke="#ef4444"
                  fill="url(#colorChurn)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="churnRate"
                  name="Churn Rate"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
        </Card>
    </div>
  );
}
