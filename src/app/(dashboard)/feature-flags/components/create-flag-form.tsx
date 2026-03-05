"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AdminService } from "@/services/admin.service";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  enabledGlobal: z.boolean().default(false),
  perOrganizationEnabled: z.boolean().default(false),
});

interface CreateFlagFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any; // Add initialData prop
}

export function CreateFlagForm({ onSuccess, onCancel, initialData }: CreateFlagFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      enabledGlobal: false,
      perOrganizationEnabled: false,
    },
  });

  // Handle initialData for editing
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        enabledGlobal: initialData.enabledGlobal || false,
        perOrganizationEnabled: initialData.perOrganizationEnabled || false,
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: any) {
    setLoading(true);
    try {
        if (initialData) {
            await AdminService.updateFeatureFlag(initialData._id, values);
            toast.success("Feature flag updated successfully");
        } else {
            await AdminService.createFeatureFlag(values);
            toast.success("Feature flag created successfully");
        }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${initialData ? 'update' : 'create'} feature flag`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature Name</FormLabel>
              <FormControl>
                <Input placeholder="AI Assistant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Briefly describe what this feature does" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4 pt-2">
            <FormField
              control={form.control}
              name="enabledGlobal"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Global</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="perOrganizationEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Per-Org</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update Flag" : "Create Flag"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
