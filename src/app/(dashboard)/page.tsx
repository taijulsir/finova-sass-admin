'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users, Building2, CreditCard, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, Plus, FileText,
  UserPlus, BarChart2, RefreshCw, CheckCircle2, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon, label, value, sub, trend, trendUp, loading,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; trend?: string; trendUp?: boolean; loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold tracking-tight truncate">{value}</p>
              {trend ? (
                <div className="flex items-center gap-1">
                  {trendUp
                    ? <ArrowUpRight className="h-3 w-3 text-green-500 shrink-0" />
                    : <ArrowDownRight className="h-3 w-3 text-destructive shrink-0" />}
                  <span className={`text-[11px] font-medium ${trendUp ? 'text-green-600' : 'text-destructive'}`}>{trend}</span>
                </div>
              ) : sub ? (
                <p className="text-[11px] text-muted-foreground">{sub}</p>
              ) : null}
            </div>
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-4.5 w-4.5 text-primary" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, analyticsRes, logsRes] = await Promise.all([
        AdminService.getDashboard(),
        AdminService.getAnalytics(),
        AdminService.getAuditLogs({ page: 1, limit: 8 }),
      ]);
      setStats(dashboardRes.data?.stats || dashboardRes.stats);
      setAnalytics(analyticsRes.data || analyticsRes);
      setRecentLogs(logsRes.data?.data || logsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const totalOrgs   = stats?.organizations?.total    ?? 0;
  const activeOrgs  = stats?.organizations?.active   ?? 0;
  const totalUsers  = stats?.users?.total            ?? 0;
  const proSubs     = stats?.subscriptions?.pro      ?? 0;
  const entSubs     = stats?.subscriptions?.enterprise ?? 0;
  const freeSubs    = stats?.subscriptions?.free     ?? 0;
  const mrr         = proSubs * 49 + entSubs * 299;

  const earnings  = mrr * 1.35;
  const spending  = mrr * 0.55;
  const income    = mrr * 1.12;
  const balance   = mrr * 6;

  const monthLabels = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  const plData = analytics?.orgGrowth?.length
    ? analytics.orgGrowth.slice(-9).map((item: any, i: number) => ({
        month: item._id ?? monthLabels[i],
        revenue:  (item.count ?? 0) * 49,
        expenses: Math.floor((item.count ?? 0) * 15),
      }))
    : monthLabels.slice(0, 9).map((m, i) => ({
        month: m,
        revenue:  [28, 22, 35, 30, 45, 38, 42, 36, 50][i] * 500,
        expenses: [14, 10, 18, 12, 20, 16, 19, 14, 22][i] * 500,
      }));

  const quickActions = [
    { icon: UserPlus,  label: 'Invite User',       href: '/users'         },
    { icon: Plus,      label: 'New Organization',  href: '/organizations' },
    { icon: FileText,  label: 'View Audit Log',    href: '/audit'         },
    { icon: BarChart2, label: 'Analytics',          href: '/analytics'     },
  ];

  const planSummary = [
    { label: 'Free',       count: freeSubs, color: 'bg-muted text-muted-foreground',                              dot: 'bg-muted-foreground' },
    { label: 'Pro',        count: proSubs,  color: 'bg-primary/10 text-primary',                                  dot: 'bg-primary'          },
    { label: 'Enterprise', count: entSubs,  color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400', dot: 'bg-amber-500' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6 max-w-[1600px] mx-auto">

        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back — here&apos;s your platform overview.</p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ROW 1  |  Left: Balance hero (span 1)  |  Right: 2×2 stat grid (span 3)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── LEFT: Total Balance hero card ── */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardContent className="p-6 flex flex-col flex-1 justify-between gap-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-3 w-20" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                    <Skeleton className="h-8 flex-1 rounded-lg" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Total Balance
                    </p>
                    <p className="text-4xl font-bold tracking-tight">
                      ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-green-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">5%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Create
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                      <RefreshCw className="h-3.5 w-3.5" /> Refresh
                    </button>
                  </div>

                  {/* Plan summary strip */}
                  <div className="border-t pt-4 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      Plan Breakdown
                    </p>
                    {planSummary.map((p) => (
                      <div key={p.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                          <span className="text-xs text-muted-foreground">{p.label}</span>
                        </div>
                        <span className="text-xs font-semibold">{p.count} orgs</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── RIGHT: 2×2 metric grid ── */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-6">

            {/* Total Earnings — primary accent */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-5">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 bg-primary-foreground/20" />
                    <Skeleton className="h-9 w-28 bg-primary-foreground/20" />
                    <Skeleton className="h-3 w-16 bg-primary-foreground/20" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/70">
                        Total Earnings
                      </p>
                      <div className="h-8 w-8 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                      ${earnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="h-3 w-3 text-primary-foreground/80" />
                      <span className="text-[11px] text-primary-foreground/80 font-medium">7% this month</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total Spending */}
            <MetricCard
              icon={TrendingDown}
              label="Total Spending"
              value={`$${spending.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              trend="4.8% this month"
              trendUp={false}
              loading={loading}
            />

            {/* Total Income */}
            <MetricCard
              icon={BarChart2}
              label="Total Income"
              value={`$${income.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              trend="2.1% this month"
              trendUp={true}
              loading={loading}
            />

            {/* Total Revenue (MRR) */}
            <MetricCard
              icon={CreditCard}
              label="Total Revenue"
              value={`$${mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              sub="Monthly Recurring"
              loading={loading}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ROW 2  |  Quick Actions  +  Monthly Overview stats
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex items-center gap-3 rounded-xl border bg-muted/40 hover:bg-muted px-4 py-3 text-left transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Monthly Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))
              ) : (
                <>
                  {[
                    { icon: Building2,    label: 'Organizations', value: totalOrgs,  sub: `${activeOrgs} active`,          color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'    },
                    { icon: Users,        label: 'Total Users',   value: totalUsers, sub: 'Registered',                    color: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400' },
                    { icon: CheckCircle2, label: 'Active Plans',  value: proSubs + entSubs, sub: `${freeSubs} on free`, color: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'   },
                    { icon: Clock,        label: 'Pending Invites', value: '—',      sub: 'Awaiting signup',               color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'  },
                  ].map(({ icon: Icon, label, value, sub, color }) => (
                    <div key={label} className="rounded-xl border p-3 flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${color.split(' ').slice(0,2).join(' ')}`}>
                        <Icon className={`h-4 w-4 ${color.split(' ').slice(2).join(' ')}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
                        <p className="text-sm font-bold leading-tight">{value}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ROW 3  |  Profit & Loss chart (5 cols)  |  Recent Activity (3 cols)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-8 gap-6">

          {/* ── Profit & Loss chart ── */}
          <Card className="xl:col-span-5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Income Analytics</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Revenue vs expenses over time</p>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-primary inline-block" />
                    Revenue
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/40 inline-block" />
                    Expenses
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pl-2 pr-4">
              <div className="h-56 w-full">
                {loading ? (
                  <div className="flex h-full w-full items-end gap-2 px-4 pb-4">
                    {[60, 45, 70, 55, 80, 65, 75, 50, 85].map((h, i) => (
                      <div key={i} className="flex gap-0.5 flex-1 items-end">
                        <Skeleton style={{ height: `${h}%` }} className="flex-1" />
                        <Skeleton style={{ height: `${h * 0.5}%` }} className="flex-1" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={plData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={3} barCategoryGap="28%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.12} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={40} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                        formatter={(val: number) => [`$${val.toLocaleString()}`, undefined]}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                      />
                      <Bar dataKey="revenue"  name="Revenue"  fill="hsl(var(--primary))"                radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--muted-foreground))" fillOpacity={0.35} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Recent Activity ── */}
          <Card className="xl:col-span-3 flex flex-col">
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5">{recentLogs.length} events</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="overflow-y-auto h-full max-h-64 px-6 pb-4">
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-2.5 w-44" />
                        </div>
                        <Skeleton className="h-3 w-10 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : recentLogs.length > 0 ? (
                  <div className="space-y-1">
                    {recentLogs.map((log: any, idx: number) => (
                      <div
                        key={log._id}
                        className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Activity className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight truncate">{log.action?.replace(/_/g, ' ')}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {log.userId?.email || 'System'}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

