"use client";

import { PageHeader } from "@/components/ui-system/layout/PageHeader";
import { StatsCard } from "@/components/ui-system/layout/StatsCard";
import { SectionCard } from "@/components/ui-system/layout/SectionCard";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { 
  Building2, 
  CreditCard, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { PrimaryButton } from "@/components/ui-system/buttons/PrimaryButton";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const data = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 2000 },
  { name: "Apr", revenue: 2780 },
  { name: "May", revenue: 1890 },
  { name: "Jun", revenue: 2390 },
  { name: "Jul", revenue: 3490 },
];

const recentActivity = [
  { id: 1, org: "Acme Corp", plan: "Enterprise", status: "Active", date: "2 mins ago" },
  { id: 2, org: "Global Tech", plan: "Pro", status: "Suspended", date: "1 hour ago" },
  { id: 3, org: "Nexus AI", plan: "Starter", status: "Active", date: "3 hours ago" },
  { id: 4, org: "Starlight", plan: "Enterprise", status: "Active", date: "5 hours ago" },
];

const columns = [
  { header: "Organization", accessorKey: "org" },
  { header: "Plan", accessorKey: "plan", cell: (row: any) => <Badge variant="outline" className="rounded-lg">{row.plan}</Badge> },
  { 
    header: "Status", 
    accessorKey: "status",
    cell: (row: any) => (
      <Badge className={cn(
        "rounded-lg",
        row.status === "Active" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-destructive/10 text-destructive hover:bg-destructive/20"
      )}>
        {row.status}
      </Badge>
    )
  },
  { header: "Time", accessorKey: "date", className: "text-muted-foreground text-sm" },
];

import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Welcome back, Admin" 
        description="Here is what's happening on your platform today."
        actions={
          <PrimaryButton iconLeft={<TrendingUp className="h-4 w-4" />}>
            Generate Report
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Organizations" 
          value="1,284" 
          icon={Building2} 
          trend={{ value: 12, isUp: true }}
          delay={0.1}
        />
        <StatsCard 
          title="Active Subscriptions" 
          value="942" 
          icon={CreditCard} 
          trend={{ value: 8, isUp: true }}
          delay={0.2}
        />
        <StatsCard 
          title="Platform Users" 
          value="12,543" 
          icon={Users} 
          trend={{ value: 15, isUp: true }}
          delay={0.3}
        />
        <StatsCard 
          title="Suspended Orgs" 
          value="24" 
          icon={AlertTriangle} 
          trend={{ value: 2, isUp: false }}
          delay={0.4}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <SectionCard 
          title="Revenue Overview" 
          description="Monthly recurring revenue across all organizations."
          className="lg:col-span-4"
        >
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--card)", 
                    borderColor: "var(--border)",
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard 
          title="Recent Activity" 
          description="Latest changes across organizations."
          className="lg:col-span-3"
          contentClassName="p-0"
        >
          <DataTable 
            columns={columns} 
            data={recentActivity} 
            className="border-0 rounded-none shadow-none"
          />
          <div className="p-4 border-t border-muted">
            <PrimaryButton variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5" iconRight={<ArrowUpRight className="h-4 w-4" />}>
              View All Activity
            </PrimaryButton>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
