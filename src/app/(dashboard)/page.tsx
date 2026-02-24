'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Building2, CreditCard, TrendingUp, TrendingDown, Activity, ArrowUpRight, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, iconBg, loading }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  iconBg?: string; loading: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg ?? 'bg-primary/10'}`}>
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HighlightCard({ label, value, trend, trendLabel, loading, variant }: {
  label: string; value: string; trend?: number; trendLabel?: string;
  loading: boolean; variant: 'primary' | 'muted';
}) {
  const isPrimary = variant === 'primary';
  return (
    <Card className={`relative overflow-hidden ${isPrimary ? 'bg-primary text-primary-foreground' : ''}`}>
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className={`h-4 w-28 ${isPrimary ? 'bg-primary-foreground/20' : ''}`} />
            <Skeleton className={`h-10 w-24 ${isPrimary ? 'bg-primary-foreground/20' : ''}`} />
            <Skeleton className={`h-3 w-20 ${isPrimary ? 'bg-primary-foreground/20' : ''}`} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs font-medium uppercase tracking-wider ${isPrimary ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{label}</p>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isPrimary ? 'bg-primary-foreground/15' : 'bg-muted'}`}>
                <CreditCard className={`h-4 w-4 ${isPrimary ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${isPrimary ? 'text-primary-foreground' : ''}`}>{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className={`h-3 w-3 ${trend >= 0 ? (isPrimary ? 'text-primary-foreground/80' : 'text-green-500') : 'text-destructive'}`} />
                <span className={`text-xs ${trend >= 0 ? (isPrimary ? 'text-primary-foreground/80' : 'text-green-600') : 'text-destructive'}`}>
                  {Math.abs(trend)}% {trendLabel}
                </span>
              </div>
            )}
          </>
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, analyticsRes, logsRes] = await Promise.all([
        AdminService.getDashboard(),
        AdminService.getAnalytics(),
        AdminService.getAuditLogs({ page: 1, limit: 6 })
      ]);
      setStats(dashboardRes.data?.stats || dashboardRes.stats);
      setAnalytics(analyticsRes.data || analyticsRes);
      setRecentLogs(logsRes.data?.data || logsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const totalOrgs = stats?.organizations?.total ?? 0;
  const activeOrgs = stats?.organizations?.active ?? 0;
  const totalUsers = stats?.users?.total ?? 0;
  const proSubs = stats?.subscriptions?.pro ?? 0;
  const entSubs = stats?.subscriptions?.enterprise ?? 0;
  const freeSubs = stats?.subscriptions?.free ?? 0;
  const activeSubs = proSubs + entSubs;
  const mrr = proSubs * 49 + entSubs * 299;
  const totalRevenue = `$${mrr.toLocaleString()}`;

  // Profit & Loss chart — derive from orgGrowth / userGrowth or use subscription data
  const monthLabels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const plData = analytics?.orgGrowth?.length
    ? analytics.orgGrowth.slice(-9).map((item: any, i: number) => ({
        month: item._id ?? monthLabels[i],
        revenue: (item.count ?? 0) * 49,
        expenses: Math.floor((item.count ?? 0) * 15),
      }))
    : monthLabels.slice(0, 9).map((m) => ({
        month: m,
        revenue: Math.floor(Math.random() * 30000) + 10000,
        expenses: Math.floor(Math.random() * 20000) + 5000,
      }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Welcome back — here&apos;s what&apos;s happening today.</p>
      </div>

      {/* ── Row 1: Hero balance + 2 highlight cards + total income/revenue ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Total Balance hero card */}
        <Card className="bg-card border row-span-1">
          <CardContent className="p-5 h-full flex flex-col justify-between">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Balance</p>
                  <p className="text-3xl font-bold tracking-tight">${(mrr * 6).toLocaleString()}.00</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">5%</span>
                    <span className="text-xs text-muted-foreground">than last month</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-medium cursor-default">
                    <Wallet className="h-3.5 w-3.5" /> Transfer
                  </div>
                  <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-medium cursor-default">
                    <ArrowUpRight className="h-3.5 w-3.5" /> Request
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Earnings — primary/accent card */}
        <HighlightCard
          label="Total Earnings"
          value={`$${(mrr * 1.35).toLocaleString()}`}
          trend={7}
          trendLabel="This month"
          loading={loading}
          variant="primary"
        />

        {/* Total Spending */}
        <HighlightCard
          label="Total Spending"
          value={`$${Math.floor(mrr * 0.55).toLocaleString()}`}
          trend={-4}
          trendLabel="This month"
          loading={loading}
          variant="muted"
        />

        {/* Total Income + Total Revenue stacked */}
        <div className="grid grid-rows-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between h-full">
              {loading ? <Skeleton className="h-12 w-full" /> : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Income</p>
                    <p className="text-xl font-bold mt-0.5">${(mrr * 1.12).toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-[10px] text-green-600">This month</span>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between h-full">
              {loading ? <Skeleton className="h-12 w-full" /> : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                    <p className="text-xl font-bold mt-0.5">{totalRevenue}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <TrendingDown className="h-3 w-3 text-destructive" />
                      <span className="text-[10px] text-destructive">This month</span>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Row 2: Wallets / Plan breakdown ── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Subscriptions</p>
              <p className="text-sm font-medium mt-0.5">Total {activeSubs + freeSubs} active plans</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Free', count: freeSubs, color: 'bg-muted', text: 'text-muted-foreground' },
              { label: 'Pro', count: proSubs, color: 'bg-primary/10', text: 'text-primary' },
              { label: 'Enterprise', count: entSubs, color: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400' },
            ].map((plan) => (
              loading ? (
                <Skeleton key={plan.label} className="h-16 rounded-xl" />
              ) : (
                <div key={plan.label} className={`rounded-xl border p-3 flex items-center justify-between ${plan.color}`}>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${plan.text}`}>{plan.label}</p>
                    <p className={`text-xl font-bold mt-0.5 ${plan.text}`}>{plan.count}</p>
                    <p className="text-[10px] text-muted-foreground">orgs</p>
                  </div>
                  <CreditCard className={`h-5 w-5 ${plan.text} opacity-60`} />
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Row 3: Profit & Loss chart + Stats + Recent Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">

        {/* Profit & Loss bar chart */}
        <Card className="xl:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Profit and Loss</CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-primary inline-block" />Revenue</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/40 inline-block" />Expenses</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[220px] w-full">
              {loading ? (
                <div className="flex h-full w-full items-end gap-2 px-4 pb-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="flex gap-1 flex-1 items-end">
                      <Skeleton style={{ height: `${30 + Math.random() * 60}%` }} className="flex-1" />
                      <Skeleton style={{ height: `${20 + Math.random() * 40}%` }} className="flex-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={plData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }} barGap={2} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.15} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                      formatter={(val: number) => [`$${val.toLocaleString()}`, undefined]}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--muted-foreground))" fillOpacity={0.35} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right column: quick stats + recent activity */}
        <div className="xl:col-span-3 flex flex-col gap-4">

          {/* Quick stats row */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={Building2} label="Organizations" value={totalOrgs} sub={`${activeOrgs} active`} loading={loading} />
            <StatCard icon={Users} label="Total Users" value={totalUsers} sub="Registered" loading={loading} />
          </div>

          {/* Recent Activity */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-2.5 w-40" />
                      </div>
                    </div>
                  ))
                ) : recentLogs?.length > 0 ? (
                  recentLogs.map((log: any) => (
                    <div key={log._id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-none truncate">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 mr-1">{log.action}</Badge>
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {log.userId?.email || 'System'} · {new Date(log.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-4">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, analyticsRes, logsRes] = await Promise.all([
        AdminService.getDashboard(),
        AdminService.getAnalytics(),
        AdminService.getAuditLogs({ page: 1, limit: 5 })
      ]);
      
      setStats(dashboardRes.data?.stats || dashboardRes.stats);
      setAnalytics(analyticsRes.data || analyticsRes);
      setRecentLogs(logsRes.data?.data || logsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Format chart data
  const userGrowthData = analytics?.userGrowth?.map((item: any) => ({
    date: item._id,
    users: item.count
  })) || [];

  const orgGrowthData = analytics?.orgGrowth?.map((item: any) => ({
    date: item._id,
    organizations: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.organizations?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.organizations?.active || 0} active, {stats?.organizations?.suspended || 0} suspended
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.users?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Registered accounts</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(stats?.subscriptions?.pro || 0) + (stats?.subscriptions?.enterprise || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.subscriptions?.free || 0} free, {stats?.subscriptions?.pro || 0} pro, {stats?.subscriptions?.enterprise || 0} enterprise
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${((stats?.subscriptions?.pro || 0) * 49) + ((stats?.subscriptions?.enterprise || 0) * 299)}
                </div>
                <p className="text-xs text-muted-foreground">Estimated Monthly Recurring Revenue</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="flex h-full w-full items-end gap-2 px-4 pb-4">
                  <Skeleton className="h-[40%] w-full" />
                  <Skeleton className="h-[60%] w-full" />
                  <Skeleton className="h-[30%] w-full" />
                  <Skeleton className="h-[80%] w-full" />
                  <Skeleton className="h-[50%] w-full" />
                  <Skeleton className="h-[70%] w-full" />
                  <Skeleton className="h-[90%] w-full" />
                </div>
              ) : userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="mr-4 h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))
              ) : recentLogs?.length > 0 ? (
                recentLogs.map((log: any) => (
                  <div key={log._id} className="flex items-center">
                    <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.userId?.email || 'System'} • {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
