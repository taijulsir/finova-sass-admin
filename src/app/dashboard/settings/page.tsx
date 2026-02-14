"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui-system/layout/PageHeader";
import { SectionCard } from "@/components/ui-system/layout/SectionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShortTextInput } from "@/components/ui-system/inputs/ShortTextInput";
import { SelectInput } from "@/components/ui-system/inputs/SelectInput";
import { PrimaryButton } from "@/components/ui-system/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/ui-system/buttons/SecondaryButton";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Ticket, Settings2, ShieldCheck, CreditCard, Trash2 } from "lucide-react";
import { toast } from "sonner";

const coupons = [
  { id: 1, code: "WELCOME50", discount: "50%", type: "Percentage", expiry: "2024-12-31" },
  { id: 2, code: "ENTERPRISE20", discount: "20%", type: "Percentage", expiry: "2024-10-15" },
  { id: 3, code: "FIXED100", discount: "$100", type: "Fixed Amount", expiry: "2024-06-30" },
];

export default function SettingsPage() {
  const couponColumns = [
    { header: "Coupon Code", accessorKey: "code", className: "font-mono font-bold text-primary" },
    { header: "Discount", accessorKey: "discount" },
    { header: "Type", accessorKey: "type" },
    { header: "Expiry Date", accessorKey: "expiry", className: "text-muted-foreground" },
    { 
      header: "Actions", 
      accessorKey: "actions",
      cell: () => (
        <SecondaryButton size="icon-sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </SecondaryButton>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Settings" 
        description="Configure platform defaults, security, and coupon management."
        breadcrumbs={[{ label: "Settings" }]}
      />

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-12 mb-8">
          <TabsTrigger value="platform" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Settings2 className="h-4 w-4 mr-2" /> Platform
          </TabsTrigger>
          <TabsTrigger value="coupons" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Ticket className="h-4 w-4 mr-2" /> Coupons
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CreditCard className="h-4 w-4 mr-2" /> Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          <SectionCard title="Default Plan Configuration" description="Set settings for new organizations created on the platform.">
            <div className="grid gap-6 md:grid-cols-2 mt-4 max-w-2xl">
              <SelectInput 
                label="Default New User Plan"
                options={[
                  { label: "Starter", value: "starter" },
                  { label: "Pro", value: "pro" },
                  { label: "Enterprise", value: "enterprise" },
                ]}
              />
              <ShortTextInput label="Trial Period (Days)" type="number" defaultValue="14" />
              <div className="md:col-span-2">
                <PrimaryButton onClick={() => toast.success("Platform settings saved")}>
                  Save Platform Defaults
                </PrimaryButton>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Security Toggles" description="Platform-wide security and access controls.">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-muted">
                <div>
                  <p className="font-semibold text-sm">Require 2FA for Super Admins</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Force all platform admins to use two-factor authentication.</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-primary flex items-center px-1">
                  <div className="h-4 w-4 rounded-full bg-white ml-auto" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-muted">
                <div>
                  <p className="font-semibold text-sm">Self-Service Registration</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Allow organizations to sign up without an invitation.</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-muted flex items-center px-1">
                  <div className="h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <SectionCard 
            title="Coupon Management" 
            description="Create and manage discount codes for subscriptions."
            actions={
              <PrimaryButton size="sm" iconLeft={<Ticket className="h-4 w-4" />}>
                Create Coupon
              </PrimaryButton>
            }
          >
            <div className="mt-6">
              <DataTable columns={couponColumns} data={coupons} />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <SectionCard title="Billing Provider Configuration" description="Manage your integration with Stripe (UI Only).">
            <div className="p-12 text-center rounded-2xl border border-dashed border-muted">
              <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Stripe integration is currently in READ-ONLY mode for Super Admins.</p>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
