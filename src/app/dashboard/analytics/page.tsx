"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui-system/layout/PageHeader";
import { SectionCard } from "@/components/ui-system/layout/SectionCard";
import { StatsCard } from "@/components/ui-system/layout/StatsCard";
import { 
  Building2, 
  TrendingUp, 
  PieChart as PieIcon,
  Download
} from "lucide-react";
import { PrimaryButton } from "@/components/ui-system/buttons/PrimaryButton";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

const revenueData = [
  { month: "Sep", revenue: 42000 },
  { month: "Oct", revenue: 48000 },
  { month: "Nov", revenue: 52000 },
  { month: "Dec", revenue: 61000 },
  { month: "Jan", revenue: 68000 },
  { month: "Feb", revenue: 75000 },
];

const growthData = [
  { month: "Sep", orgs: 400 },
  { month: "Oct", orgs: 450 },
  { month: "Nov", orgs: 580 },
  { month: "Dec", orgs: 720 },
  { month: "Jan", orgs: 940 },
  { month: "Feb", orgs: 1284 },
];

const distributionData = [
  { name: "Starter", value: 300, color: "var(--primary)" },
  { name: "Pro", value: 500, color: "oklch(0.65 0.1 180)" },
  { name: "Enterprise", value: 200, color: "oklch(0.75 0.08 195)" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Analytics" 
        description="Deep dive into platform performance and growth metrics."
        breadcrumbs={[{ label: "Analytics" }]}
        actions={
          <PrimaryButton variant="outline" iconLeft={<Download className="h-4 w-4" />}>
            Export Reports
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Monthly Recurring Revenue" value="$75,240" icon={TrendingUp} trend={{ value: 10, isUp: true }} />
        <StatsCard title="New Signups (Last 30d)" value="+124" icon={Building2} trend={{ value: 24, isUp: true }} />
        <StatsCard title="Customer Churn" value="1.2%" icon={PieIcon} trend={{ value: 0.5, isUp: false }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Revenue Growth" description="Monthly revenue trajectory for current fiscal year.">
          <div className="h-[300px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Organization Growth" description="Cumulative number of active organizations.">
          <div className="h-[300px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orgs" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Subscription Distribution" description="Breakdown of organizations by subscription tier." className="lg:col-span-2">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-[300px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4 px-4">
              {distributionData.map((tier) => (
                <div key={tier.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="text-sm font-medium">{tier.name}</span>
                  </div>
                  <span className="text-sm font-bold">{tier.value} Orgs</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
