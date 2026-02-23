'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { Building2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, [search, page]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getOrganizations(page, 10, search);
      setOrganizations(response.data?.data || response.data || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await AdminService.createOrganization({ name: newOrgName });
      toast.success("Organization created successfully");
      setIsAddModalOpen(false);
      setNewOrgName('');
      fetchOrganizations(); // Refetch list
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage all registered organizations.</p>
        </div>
        
        <Button className="shadow" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Organization
        </Button>
        
        <Modal
          title="Add Organization"
          description="Create a new organization workspace."
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        >
          <form onSubmit={handleAddOrganization}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search organizations..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground bg-muted/50 font-medium">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations?.map((org) => (
                  <tr key={org._id} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">{org.name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="p-4 capitalize">{org.plan}</td>
                    <td className="p-4">{org.ownerId?.email || 'N/A'}</td>
                    <td className="p-4">{new Date(org.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    </td>
                  </tr>
                ))}
                {organizations?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No organizations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
