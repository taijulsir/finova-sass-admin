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
  RefreshCcw, AlertCircle, AlertTriangle, ShieldAlert,
  Ticket, Wallet, Banknote, Undo2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon, label, value, sub, trend, trendUp, loading, className = "",
  iconContainerClass = "bg-primary/10", iconClass = "text-primary"
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; trend?: string; trendUp?: boolean; loading: boolean;
  className?: string; iconContainerClass?: string; iconClass?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-3">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-1">
            <div className="space-y-0.5 min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground truncate">{label}</p>
              <p className="text-lg font-bold tracking-tight truncate">{value}</p>
              {trend ? (
                <div className="flex items-center gap-1 mt-0.5">
                  {trendUp
                    ? <ArrowUpRight className="h-2.5 w-2.5 text-green-500 shrink-0" />
                    : <ArrowDownRight className="h-2.5 w-2.5 text-destructive shrink-0" />}
                  <span className={`text-[9px] font-medium ${trendUp ? 'text-green-600' : 'text-destructive'}`}>{trend}</span>
                </div>
              ) : sub ? (
                <p className="text-[9px] text-muted-foreground truncate mt-0.5">{sub}</p>
              ) : null}
            </div>
            <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${iconContainerClass}`}>
              <Icon className={`h-3 w-3 ${iconClass}`} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revenueRange, setRevenueRange] = useState('12m');

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate new unified API
      const [dashboardRes, analyticsRes, logsRes] = await Promise.all([
        AdminService.getDashboard().catch(() => ({ data: { stats: {} } })),
        AdminService.getAnalytics().catch(() => ({ data: {} })),
        AdminService.getAuditLogs({ page: 1, limit: 10 }).catch(() => ({ data: { data: [] } })),
      ]);
      
      const stats = dashboardRes.data?.stats || dashboardRes.stats || {};
      const analytics = analyticsRes.data || analyticsRes || {};
      const logs = logsRes.data?.data || logsRes.data || [];

      // Generate realistic mock data for charts
      const monthLabels = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
      const revenueTrend = monthLabels.map((m, i) => ({
        month: m,
        revenue:  [28, 22, 35, 30, 45, 38, 42, 36, 50, 60, 55, 65][i] * 500,
        expenses: [14, 10, 18, 12, 20, 16, 19, 14, 22, 25, 20, 28][i] * 500,
      }));
      const revenueMonthly = revenueTrend;
      
      setData({
        kpis: {
          balance: 145000,
          revenue: 284500,
          mrr: 24320,
          earnings: 32450,
          spending: 8130,
          refunds: 450,
          pendingPayouts: 1200,
          activeSubscriptions: 142
        },
        revenueTrend: revenueTrend,
        revenueMonthly: revenueMonthly,
        subscriptionDistribution: [
          { name: 'Free', value: 45, color: 'hsl(var(--muted-foreground))' },
          { name: 'Starter', value: 20, color: '#3b82f6' },
          { name: 'Pro', value: 50, color: 'hsl(var(--primary))' },
          { name: 'Enterprise', value: 15, color: '#f59e0b' },
        ],
        recentActivity: logs.length ? logs : [
          { id: 1, action: 'User login', details: 'john@example.com', createdAt: new Date().toISOString() },
          { id: 2, action: 'Plan upgrade', details: 'Acme Corp to Pro', createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: 3, action: 'Organization created', details: 'Globex Inc', createdAt: new Date(Date.now() - 7200000).toISOString() },
          { id: 4, action: 'Subscription started', details: 'Starter plan', createdAt: new Date(Date.now() - 14400000).toISOString() },
        ],
        systemAlerts: [
          { id: 1, type: 'error', message: 'Failed payment from Org #1042', time: '10m ago' },
          { id: 2, type: 'warning', message: 'Subscription expiring for Acme Corp', time: '1h ago' },
          { id: 3, type: 'info', message: '3 pending support tickets in queue', time: '2h ago' },
        ],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!data && !loading) return null;

  const kpis = data?.kpis || {};
  const revTrendData = data?.revenueTrend || [];
  const subsDistData = data?.subscriptionDistribution || [];
  const monthlyRevData = data?.revenueMonthly || [];

  return (
    <div className="h-full overflow-y-auto bg-muted/20">
      <div className="space-y-4 p-4 lg:p-6 max-w-full mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Platform Dashboard</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Comprehensive overview of platform operations and financials.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchDashboardData} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border bg-background hover:bg-muted transition-colors">
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* 1️⃣ ROW 1: COMPACT KPI CARDS (8 cards, 2 rows of 4 on desktop, fits 12 columns by default) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          <MetricCard icon={Wallet} label="Total Balance" value={`$${kpis.balance?.toLocaleString() || 0}`} trend="+5.2% this month" trendUp={true} loading={loading} className="bg-primary text-primary-foreground [&_p]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70" iconContainerClass="bg-primary-foreground/15" iconClass="text-primary-foreground" />
          <MetricCard icon={Banknote} label="Total Revenue" value={`$${kpis.revenue?.toLocaleString() || 0}`} trend="+12.4% this month" trendUp={true} loading={loading} />
          <MetricCard icon={CreditCard} label="MRR" value={`$${kpis.mrr?.toLocaleString() || 0}`} trend="+7.4% this month" trendUp={true} loading={loading} />
          <MetricCard icon={TrendingUp} label="Total Earnings" value={`$${kpis.earnings?.toLocaleString() || 0}`} trend="+8.1% this month" trendUp={true} loading={loading} />
          <MetricCard icon={TrendingDown} label="Total Spending" value={`$${kpis.spending?.toLocaleString() || 0}`} trend="-2.1% this month" trendUp={true} loading={loading} />
          <MetricCard icon={Undo2} label="Refunds" value={`$${kpis.refunds?.toLocaleString() || 0}`} sub="This Month" loading={loading} />
          <MetricCard icon={Clock} label="Pending Payouts" value={`$${kpis.pendingPayouts?.toLocaleString() || 0}`} sub="Awaiting transfer" loading={loading} />
          <MetricCard icon={CheckCircle2} label="Active Subscriptions" value={kpis.activeSubscriptions || 0} trend="+3 new this week" trendUp={true} loading={loading} />
        </div>

        {/* 2️⃣ ROW 2: MULTI ANALYTICS CHARTS (Left: 6, Middle: 3, Right: 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Chart 1 — Revenue Trend (6 columns) */}
          <Card className="col-span-1 lg:col-span-6 flex flex-col">
            <CardHeader className="p-3 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-semibold">Revenue Trend</CardTitle>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Revenue vs Expenses</p>
                </div>
                <Select value={revenueRange} onValueChange={setRevenueRange}>
                  <SelectTrigger className="h-7 w-28 text-[10px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="12m">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-2 px-3 pb-3 flex-1 h-50">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revTrendData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '6px', fontSize: 10 }} />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Chart 2 — Subscription Distribution (3 columns) */}
          <Card className="col-span-1 lg:col-span-3 flex flex-col">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-xs font-semibold">Plan Distribution</CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active subscriptions by tier</p>
            </CardHeader>
            <CardContent className="pt-2 px-3 pb-3 flex-1 h-50 flex flex-col">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie data={subsDistData} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                          {subsDistData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '6px', fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 px-1">
                    {subsDistData.map((d: any) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-medium leading-none">{d.name}</span>
                          <span className="text-[9px] text-muted-foreground mt-0.5">{d.value} orgs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Chart 3 — Monthly Revenue (3 columns) */}
          <Card className="col-span-1 lg:col-span-3 flex flex-col">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-xs font-semibold">Monthly Revenue</CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">Trailing 12 months</p>
            </CardHeader>
            <CardContent className="pt-2 px-3 pb-3 flex-1 h-50">
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '6px', fontSize: 10 }} />
                    <Bar dataKey="revenue" name="Revenue" fill="url(#barGradient)" radius={[3, 3, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3️⃣ ROW 3: ACTIVITY FEED & SYSTEM ALERTS (Left: 6, Right: 6 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Recent Activity Feed (6 columns) */}
          <Card className="col-span-1 lg:col-span-6 flex flex-col">
            <CardHeader className="p-3 pb-2 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold">Recent Activity</CardTitle>
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                  <Activity className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="overflow-y-auto max-h-45">
                {loading ? (
                  <div className="p-3 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : data?.recentActivity?.length ? (
                  <div className="divide-y divide-border/50">
                    {data.recentActivity.map((log: any, i: number) => (
                      <div key={i} className="px-3 py-2 flex items-center gap-2.5 hover:bg-muted/50 transition-colors">
                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Activity className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{log.action?.replace(/_/g, ' ') || 'System Action'}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{log.userId?.email || log.details || 'System automatically performed this action.'}</p>
                        </div>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-[11px] text-muted-foreground">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Alerts (6 columns) */}
          <Card className="col-span-1 lg:col-span-6 flex flex-col">
            <CardHeader className="p-3 pb-2 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold">System Alerts</CardTitle>
                <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 items-center">{(data?.systemAlerts?.length || 0)} active</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="overflow-y-auto max-h-45">
                {loading ? (
                  <div className="p-3 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : data?.systemAlerts?.length ? (
                  <div className="divide-y divide-border/50">
                    {data.systemAlerts.map((alert: any, i: number) => {
                      const isError = alert.type === 'error';
                      const isWarning = alert.type === 'warning';
                      const Icon = isError ? AlertCircle : isWarning ? AlertTriangle : AlertCircle;
                      
                      return (
                        <div key={alert.id || i} className="px-3 py-2 flex items-center gap-2.5 hover:bg-muted/50 transition-colors">
                          <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                            isError ? 'bg-destructive/10 text-destructive' : 
                            isWarning ? 'bg-amber-500/10 text-amber-500' : 
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                            <p className="text-[11px] font-medium truncate">{alert.message}</p>
                            <Badge variant="outline" className={`text-[8px] uppercase px-1 py-0 h-3 border-transparent shrink-0 ${
                              isError ? 'bg-destructive/10 text-destructive' : 
                              isWarning ? 'bg-amber-500/10 text-amber-500' : 
                              'bg-blue-500/10 text-blue-500'
                            }`}>{alert.type}</Badge>
                          </div>
                          <span className="text-[9px] text-muted-foreground whitespace-nowrap w-12 text-right">{alert.time}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-[11px] text-muted-foreground">All systems optimal</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}


